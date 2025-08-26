type MiniChartProps = {
  data?: number[]
  stroke?: string
  height?: number
}

export function MiniChart({ data = [10, 14, 12, 18, 22, 20, 26, 24, 30, 28], stroke = '#4FD1C5', height = 56 }: MiniChartProps) {
  const width = 200
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = Math.max(1, max - min)

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((d - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-hidden">
      <defs>
        <linearGradient id="mini-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <polygon
        points={`${points} ${width},${height} 0,${height}`}
        fill="url(#mini-gradient)"
      />
    </svg>
  )
}

export default MiniChart
