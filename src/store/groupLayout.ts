import type { DocNode } from '../fileformat/types'
import {
  GROUP_HEADER_HEIGHT,
  GROUP_MIN_HEIGHT,
  GRID_CELL_WIDTH,
  GRID_CELL_HEIGHT,
  GRID_PADDING,
} from '../canvas/nodes/groupLayoutConstants'

/** Arranges a group's children into a fixed grid based on the group's current width. */
export function layoutGroupChildren(
  children: DocNode[],
  groupWidth: number,
): { positions: Map<string, { x: number; y: number }>; requiredHeight: number } {
  const columns = Math.max(1, Math.floor((groupWidth - GRID_PADDING * 2) / GRID_CELL_WIDTH))
  const positions = new Map<string, { x: number; y: number }>()

  children.forEach((child, i) => {
    const col = i % columns
    const row = Math.floor(i / columns)
    positions.set(child.id, {
      x: GRID_PADDING + col * GRID_CELL_WIDTH,
      y: GROUP_HEADER_HEIGHT + GRID_PADDING + row * GRID_CELL_HEIGHT,
    })
  })

  const rows = children.length === 0 ? 0 : Math.ceil(children.length / columns)
  const requiredHeight = Math.max(
    GROUP_MIN_HEIGHT,
    GROUP_HEADER_HEIGHT + GRID_PADDING * 2 + rows * GRID_CELL_HEIGHT,
  )

  return { positions, requiredHeight }
}

/** Repositions a group's children into the grid and resizes the group to fit. */
export function relayoutGroupNodes(nodes: DocNode[], groupId: string): DocNode[] {
  const group = nodes.find((n) => n.id === groupId)
  if (!group) return nodes

  const children = nodes.filter((n) => n.parentId === groupId)
  const { positions, requiredHeight } = layoutGroupChildren(children, group.width ?? GRID_CELL_WIDTH)

  return nodes.map((n) => {
    if (n.id === groupId) {
      return n.height === requiredHeight ? n : { ...n, height: requiredHeight }
    }
    const pos = positions.get(n.id)
    if (!pos) return n
    return { ...n, position: pos }
  })
}
