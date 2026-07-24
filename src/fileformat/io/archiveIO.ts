import { createDatabase, openDatabase } from '../sqlite/db'
import { writeMeta, readMeta } from '../sqlite/repository/metaRepo'
import { writeSheets, readSheets } from '../sqlite/repository/sheetsRepo'
import { writeNodes, readNodes } from '../sqlite/repository/nodesRepo'
import { writeEdges, readEdges } from '../sqlite/repository/edgesRepo'
import { writeKbFolders, readKbFolders, writeKbPages, readKbPages } from '../sqlite/repository/kbRepo'
import { buildArchive, readArchive, textFile, readText, type ArchiveFiles } from '../zip/archive'
import { buildManifest, parseManifest, isSupportedFormatVersion } from '../zip/manifest'
import { getAllAssets, extensionForMime, mimeForExtension, registerAsset, pruneAssets } from '../../assets-runtime/assetStore'
import { migrateLegacyKbFolderPaths } from './kbFolderMigration'
import type { DocumentState, DocNode, DocEdge, KbPage } from '../types'

export class UnsupportedFormatError extends Error {}
export class CorruptArchiveError extends Error {}

const nodeMarkdownPath = (nodeId: string) => `markdown/nodes/${nodeId}.md`
const edgeMarkdownPath = (edgeId: string) => `markdown/edges/${edgeId}.md`
const kbMarkdownPath = (pageId: string) => `markdown/kb/${pageId}.md`
const ASSET_PATH_PATTERN = /^assets\/images\/([^/.]+)\.([^/.]+)$/
const ASSET_URL_PATTERN = /asset:\/\/([\w-]+)/g

/** Every asset id actually referenced by the document — icons/logos plus any `asset://` used in markdown. */
function collectReferencedAssetIds(nodes: DocNode[], edges: DocEdge[], kbPages: KbPage[]): Set<string> {
  const ids = new Set<string>()
  const scanText = (text?: string) => {
    if (!text) return
    for (const m of text.matchAll(ASSET_URL_PATTERN)) ids.add(m[1])
  }

  for (const node of nodes) {
    if (node.type === 'device' && node.data.iconAssetId) ids.add(node.data.iconAssetId)
    if (node.type === 'group_header' && node.data.logoAssetId) ids.add(node.data.logoAssetId)
    scanText(node.description)
  }
  for (const edge of edges) scanText(edge.description)
  for (const page of kbPages) scanText(page.content)

  return ids
}

export async function buildArchiveBytes(state: DocumentState): Promise<Uint8Array> {
  const db = await createDatabase()
  writeMeta(db, { docId: state.docId, docTitle: state.docTitle })
  writeSheets(db, state.sheets)

  const allNodes = Object.values(state.nodesBySheet).flat()
  const allEdges = Object.values(state.edgesBySheet).flat()
  writeNodes(db, allNodes)
  writeEdges(db, allEdges)
  writeKbFolders(db, state.kbFolders)
  writeKbPages(db, state.kbPages)

  const dbBytes = db.export()
  db.close()

  const files: ArchiveFiles = {
    'manifest.json': textFile(JSON.stringify(buildManifest(state.docId), null, 2)),
    'data.sqlite': dbBytes,
  }
  for (const node of allNodes) {
    if (node.description) files[nodeMarkdownPath(node.id)] = textFile(node.description)
  }
  for (const edge of allEdges) {
    if (edge.description) files[edgeMarkdownPath(edge.id)] = textFile(edge.description)
  }
  for (const page of state.kbPages) {
    if (page.content) files[kbMarkdownPath(page.id)] = textFile(page.content)
  }

  // Only embed (and keep in memory) assets the document actually still
  // references — otherwise every removed/replaced logo lingers in the
  // archive forever.
  const referencedAssetIds = collectReferencedAssetIds(allNodes, allEdges, state.kbPages)
  for (const [id, blob] of getAllAssets()) {
    if (!referencedAssetIds.has(id)) continue
    const ext = extensionForMime(blob.type)
    files[`assets/images/${id}.${ext}`] = new Uint8Array(await blob.arrayBuffer())
  }
  pruneAssets(referencedAssetIds)

  return buildArchive(files)
}

export async function parseArchiveBytes(bytes: Uint8Array): Promise<DocumentState> {
  let files: ArchiveFiles
  try {
    files = readArchive(bytes)
  } catch {
    throw new CorruptArchiveError('This file is not a valid .ond archive (failed to unzip).')
  }

  const manifestBytes = files['manifest.json']
  if (!manifestBytes) {
    throw new CorruptArchiveError('This file is not a valid .ond archive (missing manifest.json).')
  }
  const manifest = parseManifest(manifestBytes)
  if (!isSupportedFormatVersion(manifest.formatVersion)) {
    throw new UnsupportedFormatError(
      `This file was created with a newer/unsupported format version (v${manifest.formatVersion}). Update the app to open it.`,
    )
  }

  const dbBytes = files['data.sqlite']
  if (!dbBytes) {
    throw new CorruptArchiveError('This file is not a valid .ond archive (missing data.sqlite).')
  }

  const db = await openDatabase(dbBytes)
  const meta = readMeta(db)
  const sheets = readSheets(db)
  const nodes = readNodes(db)
  const edges = readEdges(db)
  const kbFoldersRaw = readKbFolders(db)
  const { pages: kbPagesRaw, legacyFolderPaths } = readKbPages(db)
  db.close()

  const { pages: kbPages, folders: kbFolders } = migrateLegacyKbFolderPaths(
    kbPagesRaw,
    kbFoldersRaw,
    legacyFolderPaths,
  )

  for (const node of nodes) {
    const mdBytes = files[nodeMarkdownPath(node.id)]
    if (mdBytes) node.description = readText(mdBytes)
  }
  for (const edge of edges) {
    const mdBytes = files[edgeMarkdownPath(edge.id)]
    if (mdBytes) edge.description = readText(mdBytes)
  }
  for (const page of kbPages) {
    const mdBytes = files[kbMarkdownPath(page.id)]
    if (mdBytes) page.content = readText(mdBytes)
  }

  for (const [path, bytes] of Object.entries(files)) {
    const match = ASSET_PATH_PATTERN.exec(path)
    if (!match) continue
    const [, assetId, ext] = match
    registerAsset(new Blob([bytes], { type: mimeForExtension(ext) }), assetId)
  }

  const nodesBySheet: Record<string, DocNode[]> = {}
  const edgesBySheet: Record<string, DocEdge[]> = {}
  for (const sheet of sheets) {
    nodesBySheet[sheet.id] = []
    edgesBySheet[sheet.id] = []
  }
  for (const node of nodes) (nodesBySheet[node.sheetId] ??= []).push(node)
  for (const edge of edges) (edgesBySheet[edge.sheetId] ??= []).push(edge)

  return {
    docId: meta.docId,
    docTitle: meta.docTitle,
    sheets,
    nodesBySheet,
    edgesBySheet,
    kbPages,
    kbFolders,
  }
}
