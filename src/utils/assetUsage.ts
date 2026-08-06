import type { DocNode, DocEdge, KbPage } from '../fileformat/types'

const ASSET_URL_PATTERN = /asset:\/\/([\w-]+)/g

/** Maps each referenced asset id to a human-readable list of where it's used. */
export function collectAssetUsage(
  nodesBySheet: Record<string, DocNode[]>,
  edgesBySheet: Record<string, DocEdge[]>,
  kbPages: KbPage[],
): Map<string, string[]> {
  const usage = new Map<string, string[]>()
  const add = (id: string, label: string) => {
    const list = usage.get(id)
    if (list) list.push(label)
    else usage.set(id, [label])
  }
  const scanText = (text: string | undefined, label: string) => {
    if (!text) return
    for (const m of text.matchAll(ASSET_URL_PATTERN)) add(m[1], label)
  }

  for (const nodes of Object.values(nodesBySheet)) {
    for (const node of nodes) {
      if (node.type === 'device' && node.data.iconAssetId) add(node.data.iconAssetId, `Device "${node.label}" logo`)
      if (node.type === 'group_header' && node.data.logoAssetId) add(node.data.logoAssetId, `Group "${node.label}" logo`)
      scanText(node.description, `"${node.label}" description`)
    }
  }
  for (const edges of Object.values(edgesBySheet)) {
    for (const edge of edges) scanText(edge.description, `Connection "${edge.label || 'Unnamed'}" description`)
  }
  for (const page of kbPages) scanText(page.content, `KB page "${page.title}"`)

  return usage
}
