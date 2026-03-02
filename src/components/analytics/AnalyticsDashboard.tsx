'use client'
import { useState, useRef, useEffect } from 'react'

const C = {
  accent:    '#C8FF00',
  accentDim: 'rgba(200,255,0,0.12)',
  accentBd:  'rgba(200,255,0,0.28)',
  surface:   'rgba(255,255,255,0.04)',
  border:    'rgba(255,255,255,0.08)',
  text:      '#FFFFFF',
  mid:       'rgba(255,255,255,0.55)',
  dim:       'rgba(255,255,255,0.28)',
  purple:    '#A855F7',
}

const glass: React.CSSProperties = {
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  padding: '18px 20px',
}

type SetEntry = {
  id: string
  log_id: string
  exercise_id: string
  set_number: number
  weight: number
  reps: number
  created_at: string
  exercises: { name: string; muscle_group: string } | null
}

type WorkoutLog = {
  id: string
  template_id: string
  performed_at: string
  workout_templates: { name: string } | null
}

type Exercise = {
  id: string
  name: string
  muscle_group: string
}

type Props = {
  allSets: SetEntry[]
  allLogs: WorkoutLog[]
  exercises: Exercise[]
}

const epley = (weight: number, reps: number) =>
  reps === 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10

export function AnalyticsDashboard({ allSets, allLogs, exercises }: Props) {
  // ── Empty state ──────────────────────────────────────────────────────────────
  if (allSets.length === 0 && allLogs.length === 0) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
        <PageHeader />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: 400, gap: 12, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>📊</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>No data yet</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 280 }}>
            Complete your first workout session to see your analytics here.
            Your progress charts, heatmap, and volume breakdown will appear automatically.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      <PageHeader />
      <SummaryCards allSets={allSets} allLogs={allLogs} />
      <ProgressChart allSets={allSets} exercises={exercises} />
      <ImprovementCards allSets={allSets} />
      <Heatmap allSets={allSets} />
      <WeeklyBar allLogs={allLogs} />
      <BottomRow allSets={allSets} allLogs={allLogs} />
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: C.dim, marginBottom: 8,
      }}>
        Iron Blueprint · Analytics
      </div>
      <h1 style={{
        fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em',
        color: C.text, margin: 0, marginBottom: 4,
      }}>
        Analytics
      </h1>
      <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>
        Your training history at a glance
      </p>
    </div>
  )
}

// ── Section 1: Summary stat cards ────────────────────────────────────────────

function SummaryCards({ allSets, allLogs }: { allSets: SetEntry[]; allLogs: WorkoutLog[] }) {
  const totalSessions = allLogs.length
  const totalSets     = allSets.length
  const avgSetsPerSession = totalSets > 0 && totalSessions > 0
    ? Math.round(totalSets / totalSessions) : 0

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const todayDay = new Date().getDay()
  const daysTrainedThisWeek = new Set(
    allLogs
      .filter(log => new Date(log.performed_at) >= startOfWeek)
      .map(log => new Date(log.performed_at).getDay())
  )

  const stats = [
    { label: 'Sessions Logged',    value: totalSessions },
    { label: 'Total Sets',         value: totalSets },
    { label: 'Avg Sets / Session', value: avgSetsPerSession },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 24,
    }}>
      {stats.map(({ label, value }) => (
        <div key={label} style={glass}>
          <div style={{
            fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em',
            color: C.accent, lineHeight: 1,
          }}>
            {value}
          </div>
          <div style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
            marginTop: 8,
          }}>
            {label}
          </div>
        </div>
      ))}

      {/* Days trained this week — 7-dot display */}
      <div style={{
        backdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '18px 20px',
      }}>
        <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', color: C.accent, lineHeight: 1 }}>
          {daysTrainedThisWeek.size}
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>/7</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 8, marginBottom: 10 }}>
          Days This Week
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['S','M','T','W','T','F','S'].map((label, dayIdx) => {
            const trained = daysTrainedThisWeek.has(dayIdx)
            const isToday = dayIdx === todayDay
            return (
              <div key={dayIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: trained ? '#C8FF00' : 'rgba(255,255,255,0.07)',
                  border: isToday ? '1.5px solid rgba(200,255,0,0.4)' : '1.5px solid transparent',
                }} />
                <span style={{ fontSize: 8, color: isToday ? C.accent : 'rgba(255,255,255,0.25)', fontWeight: isToday ? 700 : 400 }}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Section 2: Progressive overload SVG chart ─────────────────────────────────

function ProgressChart({ allSets, exercises }: { allSets: SetEntry[]; exercises: Exercise[] }) {
  const [selectedExId, setSelectedExId] = useState<string>(exercises[0]?.id ?? '')
  const [metric, setMetric]             = useState<'1rm' | 'weight'>('1rm')
  const [timeRange, setTimeRange]       = useState<'1m' | '3m' | '6m' | 'all'>('3m')
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgWidth, setSvgWidth] = useState(600)

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      setSvgWidth(entries[0].contentRect.width)
    })
    if (svgRef.current) obs.observe(svgRef.current)
    return () => obs.disconnect()
  }, [])

  const cutoffs: Record<string, Date | null> = {
    '1m':  new Date(Date.now() - 30  * 24 * 60 * 60 * 1000),
    '3m':  new Date(Date.now() - 90  * 24 * 60 * 60 * 1000),
    '6m':  new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    'all': null,
  }
  const cutoff = cutoffs[timeRange]

  const chartData = allSets
    .filter(s => s.exercise_id === selectedExId && (!cutoff || new Date(s.created_at) >= cutoff))
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc, s) => {
      const date  = new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      const value = metric === '1rm' ? epley(s.weight, s.reps) : s.weight
      const existing = acc.find(d => d.date === date)
      if (existing) {
        existing.value = Math.max(existing.value, value)
      } else {
        acc.push({ date, value })
      }
      return acc
    }, [] as { date: string; value: number }[])

  const hasData = chartData.length >= 2
  const min = hasData ? Math.min(...chartData.map(d => d.value)) * 0.95 : 0
  const max = hasData ? Math.max(...chartData.map(d => d.value)) * 1.05 : 100
  const H   = 140
  const PAD = { left: 4, right: 16, top: 10, bottom: 24 }

  const toX = (i: number) =>
    PAD.left + (i / Math.max(chartData.length - 1, 1)) * (svgWidth - PAD.left - PAD.right)
  const toY = (v: number) =>
    PAD.top + H - ((v - min) / Math.max(max - min, 0.001)) * H

  const points = chartData.map((d, i) => ({ x: toX(i), y: toY(d.value), ...d }))
  const pathD  = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD  = hasData
    ? `${pathD} L${points[points.length - 1].x.toFixed(1)},${(PAD.top + H).toFixed(1)} L${points[0].x.toFixed(1)},${(PAD.top + H).toFixed(1)} Z`
    : ''
  const step = Math.max(1, Math.floor(chartData.length / 6))

  return (
    <div style={{ ...glass, marginBottom: 24 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 4 }}>
            Progressive Overload
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
            {exercises.find(e => e.id === selectedExId)?.name ?? 'Select exercise'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Exercise selector */}
          <select
            value={selectedExId}
            onChange={e => setSelectedExId(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 9, padding: '6px 10px',
              color: '#fff', fontSize: 12, outline: 'none', cursor: 'pointer',
            }}
          >
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id} style={{ background: '#111' }}>{ex.name}</option>
            ))}
          </select>
          {/* Time range toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 9, padding: 2 }}>
            {(['1m', '3m', '6m', 'all'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                style={{
                  padding: '5px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  background: timeRange === r ? C.accentDim : 'transparent',
                  color:      timeRange === r ? C.accent    : C.dim,
                  outline:    timeRange === r ? `1px solid ${C.accentBd}` : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {r === 'all' ? 'All' : r.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Metric toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 9, padding: 2 }}>
            {(['1rm', 'weight'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                style={{
                  padding: '5px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  background: metric === m ? C.accentDim : 'transparent',
                  color:      metric === m ? C.accent    : C.dim,
                  outline:    metric === m ? `1px solid ${C.accentBd}` : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {m === '1rm' ? 'Est. 1RM' : 'Max Weight'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG chart */}
      {chartData.length === 0 ? (
        <div style={{ height: H + PAD.top + PAD.bottom, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, fontSize: 12, fontStyle: 'italic' }}>
          No sets logged for this exercise yet
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Y-axis labels (external) */}
          {hasData && (
            <div style={{ position: 'absolute', left: 0, top: PAD.top, height: H, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', lineHeight: 1 }}>{Math.round(max)}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', lineHeight: 1 }}>{Math.round(min)}</span>
            </div>
          )}
          <svg
            ref={svgRef}
            width="100%"
            height={H + PAD.top + PAD.bottom}
            style={{ overflow: 'visible', display: 'block' }}
          >
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#C8FF00" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#C8FF00" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Y-axis gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => {
              const y = PAD.top + H - t * H
              return (
                <line key={t} x1={PAD.left} y1={y} x2={svgWidth - PAD.right} y2={y}
                  stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              )
            })}

            {/* Area fill */}
            {hasData && <path d={areaD} fill="url(#chartFill)" />}

            {/* Line */}
            {hasData && (
              <path d={pathD} fill="none" stroke="#C8FF00" strokeWidth="2"
                strokeLinejoin="round" strokeLinecap="round" />
            )}

            {/* Dots + x-axis labels */}
            {points.map((p, i) => {
              const showLabel = i === 0 || i === points.length - 1 || i % step === 0
              return (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#C8FF00" />
                  <circle cx={p.x} cy={p.y} r="6" fill="rgba(200,255,0,0.15)" />
                  {showLabel && (
                    <text x={p.x} y={H + 14} textAnchor="middle"
                      fontSize="8" fill="rgba(255,255,255,0.28)">{p.date}</text>
                  )}
                </g>
              )
            })}

            {/* Last value label */}
            {points.length > 0 && (
              <text
                x={points[points.length - 1].x}
                y={points[points.length - 1].y - 10}
                textAnchor="middle"
                fontSize="10" fontWeight="700" fill="#C8FF00"
              >
                {chartData[chartData.length - 1].value}kg
              </text>
            )}
          </svg>
        </div>
      )}
    </div>
  )
}

// ── Section 2b: Best & Worst improvement trendlines ──────────────────────────

type ImprovementDatum = {
  exerciseId: string
  name: string
  pct: number
  first1rm: number
  last1rm: number
  trendData: { date: string; value: number }[]
}

function ImprovementCards({ allSets }: { allSets: SetEntry[] }) {
  const setsByExercise = allSets.reduce((acc, s) => {
    if (!acc[s.exercise_id]) acc[s.exercise_id] = []
    acc[s.exercise_id].push(s)
    return acc
  }, {} as Record<string, SetEntry[]>)

  const epleyRaw = (w: number, r: number) => r === 1 ? w : w * (1 + r / 30)

  const improvements: ImprovementDatum[] = Object.entries(setsByExercise)
    .map(([exerciseId, sets]) => {
      const sorted = [...sets].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      const days = [...new Set(sorted.map(s => new Date(s.created_at).toLocaleDateString('en-CA')))]
      if (days.length < 2) return null

      const firstDaySets = sorted.filter(s => s.created_at.startsWith(days[0]))
      const lastDaySets  = sorted.filter(s => s.created_at.startsWith(days[days.length - 1]))

      const first1rm = Math.max(...firstDaySets.map(s => epleyRaw(s.weight, s.reps)))
      const last1rm  = Math.max(...lastDaySets.map(s  => epleyRaw(s.weight, s.reps)))
      if (first1rm === 0) return null

      const pct = ((last1rm - first1rm) / first1rm) * 100
      const name = sets.find(s => s.exercises?.name)?.exercises?.name ?? 'Unknown'

      const trendData = days.map(day => {
        const daySets = sorted.filter(s => s.created_at.startsWith(day))
        return {
          date:  new Date(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          value: Math.max(...daySets.map(s => epleyRaw(s.weight, s.reps))),
        }
      })

      return { exerciseId, name, pct, first1rm, last1rm, trendData }
    })
    .filter((x): x is ImprovementDatum => x !== null)
    .sort((a, b) => b.pct - a.pct)

  const best  = improvements[0]  ?? null
  const worst = improvements[improvements.length - 1] ?? null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
      <ImprovementCard label="Most Improved" data={best}  color="#C8FF00" icon="↑" />
      <ImprovementCard label="Needs Work"    data={worst} color="#F87171" icon="↓" />
    </div>
  )
}

function ImprovementCard({ label, data, color, icon }: {
  label: string
  data: ImprovementDatum | null
  color: string
  icon: string
}) {
  if (!data) return (
    <div style={{
      backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180,
    }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
        Need 2+ sessions to show improvement
      </span>
    </div>
  )

  const { name, pct, first1rm, last1rm, trendData } = data
  const isPositive = pct >= 0
  const displayPct = `${isPositive ? '+' : ''}${pct.toFixed(1)}%`

  const W = 280, H = 80
  const values = trendData.map(d => d.value)
  const vMin = Math.min(...values) * 0.97
  const vMax = Math.max(...values) * 1.03
  const toX  = (i: number) => trendData.length < 2 ? W / 2 : (i / (trendData.length - 1)) * W
  const toY  = (v: number) => H - ((v - vMin) / (vMax - vMin || 1)) * H * 0.85 - 4

  const pointsStr  = trendData.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ')
  const areaPoints = `0,${H} ${pointsStr} ${W},${H}`

  return (
    <div style={{
      backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
            {icon} {label}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', color, lineHeight: 1 }}>
            {displayPct}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            {Math.round(first1rm)}kg → {Math.round(last1rm)}kg est. 1RM
          </div>
        </div>
      </div>

      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none" style={{ marginTop: 8, display: 'block' }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {trendData.length > 1 && (
          <>
            <polygon points={areaPoints} fill={`url(#grad-${label})`} />
            <polyline points={pointsStr} fill="none"
              stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {trendData.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.value)} r={3} fill={color} opacity={0.9} />
        ))}
        {trendData.length > 1 && (
          <>
            <text x={4} y={H} fontSize={8} fill="rgba(255,255,255,0.3)"
              fontFamily="SF Mono, monospace">{trendData[0].date}</text>
            <text x={W - 4} y={H} fontSize={8} fill="rgba(255,255,255,0.3)"
              textAnchor="end" fontFamily="SF Mono, monospace">
              {trendData[trendData.length - 1].date}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

// ── Section 3: Training heatmap ───────────────────────────────────────────────

function Heatmap({ allSets }: { allSets: SetEntry[] }) {
  const today = new Date()
  const days  = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (83 - i))
    return d.toLocaleDateString('en-CA')
  })

  const setsByDay = allSets.reduce((acc, s) => {
    const day = new Date(s.created_at).toLocaleDateString('en-CA')
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const maxSets = Math.max(1, ...Object.values(setsByDay))

  // Split into 12 columns of 7
  const weeks: string[][] = []
  for (let w = 0; w < 12; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7))
  }

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div style={{ ...glass, marginBottom: 24 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 14 }}>
        Training Heatmap · Last 12 Weeks
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
        {/* Day labels column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 18 }}>
          {DAY_LABELS.map(d => (
            <div key={d} style={{ height: 14, fontSize: 9, color: C.dim, whiteSpace: 'nowrap', lineHeight: '14px' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, wi) => {
          const firstDayOfWeek = new Date(week[0])
          const monthLabel = firstDayOfWeek.toLocaleDateString('en-GB', { month: 'short' })
          const showMonth = wi === 0 || new Date(weeks[wi - 1][0]).getMonth() !== firstDayOfWeek.getMonth()
          return (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Month label */}
              <div style={{ height: 14, fontSize: 9, color: C.dim, whiteSpace: 'nowrap' }}>
                {showMonth ? monthLabel : ''}
              </div>
              {/* Day cells */}
              {week.map(day => {
                const count = setsByDay[day] ?? 0
                const opacity = count > 0 ? 0.15 + (count / maxSets) * 0.85 : 0
                return (
                  <div
                    key={day}
                    title={`${day}: ${count} set${count !== 1 ? 's' : ''}`}
                    style={{
                      width: 14, height: 14, borderRadius: 3,
                      background: count > 0
                        ? `rgba(200,255,0,${opacity.toFixed(2)})`
                        : 'rgba(255,255,255,0.05)',
                      cursor: 'default',
                      flexShrink: 0,
                    }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
        <span style={{ fontSize: 9, color: C.dim }}>Less</span>
        {[0.05, 0.30, 0.55, 0.75, 1.0].map(o => (
          <div key={o} style={{
            width: 12, height: 12, borderRadius: 2,
            background: o < 0.10 ? 'rgba(255,255,255,0.05)' : `rgba(200,255,0,${o})`,
          }} />
        ))}
        <span style={{ fontSize: 9, color: C.dim }}>More</span>
      </div>
    </div>
  )
}

// ── Section 3b: Sessions per week bar chart ───────────────────────────────────

function getISOWeek(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNum = 1 + Math.round(
    ((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7
  )
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function WeeklyBar({ allLogs }: { allLogs: WorkoutLog[] }) {
  const weeklyGoal = 4

  const weekLabels = Array.from({ length: 8 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    return {
      key:   getISOWeek(d),
      label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    }
  }).reverse()

  const sessionsByWeek = allLogs.reduce((acc, log) => {
    const key = getISOWeek(new Date(log.performed_at))
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{
      backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
      padding: 20, marginBottom: 24,
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
        Sessions per week
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
        Goal: {weeklyGoal} sessions/week
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
        {weekLabels.map(({ key, label }) => {
          const count   = sessionsByWeek[key] ?? 0
          const hitGoal = count >= weeklyGoal
          const heightPct = Math.min(count / weeklyGoal, 1) * 100

          return (
            <div key={key} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end',
            }}>
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700,
                  color: hitGoal ? '#C8FF00' : 'rgba(255,255,255,0.5)' }}>{count}</span>
              )}
              <div style={{
                width: '100%', borderRadius: 5,
                height: `${Math.max(heightPct, count > 0 ? 8 : 3)}%`,
                background: hitGoal
                  ? '#C8FF00'
                  : count > 0
                    ? 'rgba(200,255,0,0.35)'
                    : 'rgba(255,255,255,0.07)',
                transition: 'height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                minHeight: count > 0 ? 8 : 3,
              }} />
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)',
                textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <div style={{ width: 24, height: 2, background: '#C8FF00', borderRadius: 99 }} />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
          Full bar = {weeklyGoal} sessions (goal met)
        </span>
      </div>
    </div>
  )
}

// ── Section 4: Volume by muscle + Recent sessions ─────────────────────────────

function BottomRow({ allSets, allLogs }: { allSets: SetEntry[]; allLogs: WorkoutLog[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <VolumeByMuscle allSets={allSets} />
      <RecentSessions allSets={allSets} allLogs={allLogs} />
    </div>
  )
}

function VolumeByMuscle({ allSets }: { allSets: SetEntry[] }) {
  const volumeByMuscle = allSets.reduce((acc, s) => {
    const muscle = s.exercises?.muscle_group ?? 'Unknown'
    acc[muscle] = (acc[muscle] || 0) + (s.weight * s.reps)
    return acc
  }, {} as Record<string, number>)

  const sorted = Object.entries(volumeByMuscle)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const maxVol = sorted[0]?.[1] ?? 1

  return (
    <div style={glass}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 16 }}>
        Volume by Muscle Group
      </div>
      {sorted.length === 0 ? (
        <div style={{ fontSize: 12, color: C.dim, fontStyle: 'italic' }}>No data</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map(([muscle, vol]) => (
            <div key={muscle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{muscle}</span>
                <span style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>
                  {Math.round(vol).toLocaleString()} kg
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.07)' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${(vol / maxVol) * 100}%`,
                  background: 'linear-gradient(90deg, #C8FF00, rgba(200,255,0,0.5))',
                  transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RecentSessions({ allSets, allLogs }: { allSets: SetEntry[]; allLogs: WorkoutLog[] }) {
  return (
    <div style={glass}>
      <div style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: C.dim, marginBottom: 16,
      }}>
        Recent Sessions
      </div>
      {allLogs.length === 0 ? (
        <div style={{ fontSize: 12, color: C.dim, fontStyle: 'italic' }}>No sessions yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allLogs.slice(0, 8).map(log => {
            const sessionSets = allSets.filter(s => s.log_id === log.id)
            const totalSets   = sessionSets.length

            const byExercise = sessionSets.reduce((acc, s) => {
              const name = s.exercises?.name ?? 'Unknown'
              if (!acc[name]) acc[name] = { sets: 0, totalVol: 0 }
              acc[name].sets++
              acc[name].totalVol += s.weight * s.reps
              return acc
            }, {} as Record<string, { sets: number; totalVol: number }>)

            const exerciseList = Object.entries(byExercise)
            const totalVol = sessionSets.reduce((sum, s) => sum + s.weight * s.reps, 0)

            return (
              <div key={log.id} style={{
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                {/* Header row */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: exerciseList.length > 0 ? 10 : 0,
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                      {log.workout_templates?.name ?? 'Session'}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                      {new Date(log.performed_at).toLocaleDateString('en-GB', {
                        weekday: 'short', day: 'numeric', month: 'short',
                      })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>
                      {totalSets} {totalSets === 1 ? 'set' : 'sets'}
                    </div>
                    {totalVol > 0 && (
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                        {Math.round(totalVol).toLocaleString()} kg vol
                      </div>
                    )}
                  </div>
                </div>

                {/* Exercise breakdown */}
                {exerciseList.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {exerciseList.map(([name, data]) => (
                      <div key={name} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '4px 8px', borderRadius: 7,
                        background: 'rgba(255,255,255,0.03)',
                      }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{name}</span>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                            {data.sets} sets
                          </span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                            {Math.round(data.totalVol).toLocaleString()} kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
