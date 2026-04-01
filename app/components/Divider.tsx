'use client'

interface DividerProps {
  color?: string
  thickness?: string
  marginY?: string
  className?: string
}

export default function Divider({ color = '#ffffff', thickness = '1px', marginY = '2px', className = '' }: DividerProps) {
  return (
    <div
      className={className}
      style={{
        height: thickness,
        backgroundColor: color,
        margin: `${marginY} 0`,
      }}
    />
  )
}
