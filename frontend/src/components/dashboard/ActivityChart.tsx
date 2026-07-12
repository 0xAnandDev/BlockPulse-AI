import { useMemo, useRef, useState } from 'react'
import { ACTIVITY_CHART_DATA } from '../../lib/mock/chartData'

const WIDTH = 600
const HEIGHT = 180
const PAD_X = 8
const PAD_Y = 16

export default function ActivityChart() {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const { linePoints, areaPath, points, maxValue } = useMemo(() => {
    const values = ACTIVITY_CHART_DATA.map((d) => d.value)
    const max = Math.max(...values)
    const min = 0
    const innerWidth = WIDTH - PAD_X * 2
    const innerHeight = HEIGHT - PAD_Y * 2
    const step = innerWidth / (ACTIVITY_CHART_DATA.length - 1)

    const pts = ACTIVITY_CHART_DATA.map((d, i) => {
      const x = PAD_X + i * step
      const y = PAD_Y + innerHeight - ((d.value - min) / (max - min || 1)) * innerHeight
      return { x, y, ...d }
    })

    const line = pts.map((p) => `${p.x},${p.y}`).join(' ')
    const area = `M${pts[0].x},${HEIGHT - PAD_Y} L${pts.map((p) => `${p.x},${p.y}`).join(' L')} L${pts[pts.length - 1].x},${HEIGHT - PAD_Y} Z`

    return { linePoints: line, areaPath: area, points: pts, maxValue: max }
  }, [])

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const relativeX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDist = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setHoverIndex(closest)
  }

  const active = hoverIndex != null ? points[hoverIndex] : null

  return (
    <div className="panel rounded-2xl p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="kicker mb-1">Activity graph</p>
          <h2 className="display-title text-lg font-bold text-[var(--ink)]">Transactions monitored</h2>
        </div>
        <p className="text-xs text-[var(--ink-faint)]">Last 24 hours</p>
      </div>

      <div className="relative mt-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none"
          role="img"
          aria-label="Transactions monitored over the last 24 hours"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((frac) => (
            <line
              key={frac}
              x1={PAD_X}
              x2={WIDTH - PAD_X}
              y1={PAD_Y + (HEIGHT - PAD_Y * 2) * frac}
              y2={PAD_Y + (HEIGHT - PAD_Y * 2) * frac}
              stroke="var(--line)"
              strokeWidth="1"
            />
          ))}

          <path d={areaPath} fill="url(#activity-fill)" />
          <polyline
            points={linePoints}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {active && (
            <>
              <line
                x1={active.x}
                x2={active.x}
                y1={PAD_Y}
                y2={HEIGHT - PAD_Y}
                stroke="var(--line-strong)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle cx={active.x} cy={active.y} r="4" fill="var(--cyan)" stroke="var(--bg)" strokeWidth="2" />
            </>
          )}
        </svg>

        {active && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs shadow-lg"
            style={{
              left: `${(active.x / WIDTH) * 100}%`,
              top: `${(active.y / HEIGHT) * 100 - 4}%`,
            }}
          >
            <p className="font-semibold text-[var(--ink)]">{active.value} txns</p>
            <p className="text-[var(--ink-faint)]">{active.label}</p>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-[var(--ink-faint)]">Peak: {maxValue} transactions monitored in a single window</p>
    </div>
  )
}
