import { Handle, Position } from '@xyflow/react'

const HANDLE_POSITIONS = [Position.Top, Position.Right, Position.Bottom, Position.Left]

/** Source + target connection handles on all four sides, shared by every connectable node type. */
export function NodeHandles() {
  return (
    <>
      {HANDLE_POSITIONS.flatMap((pos) => [
        <Handle key={`${pos}-source`} id={`${pos}-source`} type="source" position={pos} />,
        <Handle key={`${pos}-target`} id={`${pos}-target`} type="target" position={pos} />,
      ])}
    </>
  )
}
