import type { CSSProperties } from 'react'
import { Handle, Position } from '@xyflow/react'

interface NodeHandlesProps {
  width?: number
  height?: number
  /**
   * Controls visual/interactive visibility only — handles always stay
   * mounted so React Flow can keep computing paths for edges already
   * connected to them. Unmounting a connected handle makes React Flow
   * silently stop rendering that edge's path entirely.
   */
  visible?: boolean
}

/** Size (px) along an edge below which a node only gets a single, centered connection point. */
const MIN_SIZE_FOR_EXTRA_HANDLE = 220
/** Additional px per extra connection point beyond the second. */
const HANDLE_SPACING = 80
/** Hard cap so a very large node doesn't end up with an unwieldy row of handles. */
const MAX_HANDLES_PER_SIDE = 5

const DEFAULT_WIDTH = 180
const DEFAULT_HEIGHT = 113

function slotCount(size: number): number {
  if (size < MIN_SIZE_FOR_EXTRA_HANDLE) return 1
  return Math.min(MAX_HANDLES_PER_SIDE, 2 + Math.floor((size - MIN_SIZE_FOR_EXTRA_HANDLE) / HANDLE_SPACING))
}

// A single centered handle keeps the exact `${position}-source`/`-target` ids
// nodes have always used, so every edge saved before resizing existed keeps
// resolving correctly. Only once a node is resized large enough for more than
// one handle on a side do the indexed ids (`${position}-source-0`, ...) come
// into play — ids no pre-existing document could ever reference.
function side(position: Position, count: number, visibilityStyle: CSSProperties) {
  if (count <= 1) {
    return [
      <Handle key={`${position}-source`} id={`${position}-source`} type="source" position={position} style={visibilityStyle} />,
      <Handle key={`${position}-target`} id={`${position}-target`} type="target" position={position} style={visibilityStyle} />,
    ]
  }
  return Array.from({ length: count }).flatMap((_, i) => {
    const offset = `${((i + 1) / (count + 1)) * 100}%`
    const style = {
      ...visibilityStyle,
      ...(position === Position.Top || position === Position.Bottom ? { left: offset } : { top: offset }),
    }
    const sourceId = `${position}-source-${i}`
    const targetId = `${position}-target-${i}`
    return [
      <Handle key={sourceId} id={sourceId} type="source" position={position} style={style} />,
      <Handle key={targetId} id={targetId} type="target" position={position} style={style} />,
    ]
  })
}

/**
 * Source + target connection handles on all four sides, shared by every
 * connectable node type. The number of handles along the top/bottom edges
 * scales with the node's width, and along the left/right edges with its
 * height — so a narrow-but-tall node ends up with a single handle on top
 * and bottom but several spaced down each side, and vice versa.
 */
export function NodeHandles({ width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, visible = true }: NodeHandlesProps) {
  const horizontalSlots = slotCount(width)
  const verticalSlots = slotCount(height)
  const visibilityStyle: CSSProperties = visible ? {} : { opacity: 0, pointerEvents: 'none' }

  return (
    <>
      {side(Position.Top, horizontalSlots, visibilityStyle)}
      {side(Position.Bottom, horizontalSlots, visibilityStyle)}
      {side(Position.Left, verticalSlots, visibilityStyle)}
      {side(Position.Right, verticalSlots, visibilityStyle)}
    </>
  )
}
