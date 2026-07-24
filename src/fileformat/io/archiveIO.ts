import { createDatabase, openDatabase } from '../sqlite/db'
import { writeMeta, readMeta } from '../sqlite/repository/metaRepo'
import { writeSheets, readSheets } from '../sqlite/repository/sheetsRepo'
import { writeNodes, readNodes } from '../sqlite/repository/nodesRepo'
import { writeEdges, readEdges } from '../sqlite/repository/edgesRepo'
import { writeKbPages, readKbPages } from '../sqlite/repository/kbRepo'
import { buildArchive, readArchive, textFile, readText, type ArchiveFiles } from '../zip/archive'
import { buildManifest, parseManifest, isSupportedFormatVersion } from '../zip/manifest'
import { getAllAssets, extensionForMime, registerAsset } from '../../assets-runtime/assetStore'
import type { DocumentState, DocNode, DocEdge } from '../types'

export class UnsupportedFormatError extends Error {}
export class CorruptArchiveError extends Error {}

const nodeMarkdownPath = (nodeId: string) => `markdown/nodes/${nodeId}.md`
const edgeMarkdownPath = (edgeId: string) => `markdown/edges/${edgeId}.md`
const kbMarkdownPath = (pageId: string) => `markdown/kb/${pageId}.md`
const ASSET_PATH_PATTERN = /^assets\/images\/([^/.]+)\.[^/.]+$/

export async function buildArchiveBytes(state: DocumentState): Promise<Uint8Array> {
  const db = await createDatabase()
  writeMeta(db, { docId: state.docId, docTitle: state.docTitle })
  writeSheets(db, state.sheets)

  const allNodes = Object.values(state.nodesBySheet).flat()
  const allEdges = Object.values(state.edgesBySheet).flat()
  writeNodes(db, allNodes)
  writeEdges(db, allEdges)
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

  for (const [id, blob] of getAllAssets()) {
    const ext = extensionForMime(blob.type)
    files[`assets/images/${id}.${ext}`] = new Uint8Array(await blob.arrayBuffer())
  }

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
  const kbPages = readKbPages(db)
  db.close()

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
    const [, assetId] = match
    registerAsset(new Blob([bytes]), assetId)
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
  }
}
