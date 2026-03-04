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
  dimLo:     'rgba(255,255,255,0.18)',
  red:       '#F87171',
  green:     '#4ADE80',
  yellow:    '#FCD34D',
  blue:      '#60A5FA',
}

const glass: React.CSSProperties = {
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  padding: '18px 20px',
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

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

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

export function AnalyticsDashboard({ allSets, allLogs, exercises }: Props) {
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
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 280, lineHeight: 1.6 }}>
            Complete your first workout session to see progress charts and volume breakdown.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      <PageHeader />
      <ExerciseProgressChart allSets={allSets} allLogs={allLogs} exercises={exercises} />
      <WeeklyVolumeByMuscle allSets={allSets} allLogs={allLogs} />
      <RecentSessions allSets={allSets} allLogs={allLogs} />
    </div>
  )
}

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: C.dim, marginBottom: 8,
      }}>
        Iron Blueprint · Analytics
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: C.text, margin: 0, marginBottom: 4 }}>
        Progress
      </h1>
      <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>
        Track hypertrophy, volume, and progressive overload
      </p>
    </div>
  )
}

// ─── SECTION 1: EXERCISE PROGRESS CHART ──────────────────────────────────────

function ExerciseProgressChart({
  allSets, allLogs, exercises,
}: {
  allSets: SetEntry[]
  allLogs: WorkoutLog[]
  exercises: Exercise[]
}) {
  const [selectedExId, setSelectedExId] = useState<string>(exercises[0]?.id ?? '')
  const [timeRange, setTimeRange]       = useState<'1m' | '3m' | '6m' | 'all'>('3m')
  const svgRef   = useRef<SVGSVGElement>(null)
  const [svgW, setSvgW] = useState(600)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => setSvgW(entries[0].contentRect.width))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const cutoff: Date | null = {
    '1m':  new Date(Date.now() - 30  * 86400000),
    '3m':  new Date(Date.now() - 90  * 86400000),
    '6m':  new Date(Date.now() - 180 * 86400000),
    'all': null,
  }[timeRange]

  // log_id → performed_at
  const logDateMap = new Map(allLogs.map(l => [l.id, new Date(l.performed_at)]))

  // Aggregate per session: heaviest set weight + total reps
  const byLog = new Map<string, { date: Date; maxW: number; totalReps: number }>()
  for (const s of allSets) {
    if (s.exercise_id !== selectedExId) continue
    const date = logDateMap.get(s.log_id) ?? new Date(s.created_at)
    if (cutoff && date < cutoff) continue
    const cur = byLog.get(s.log_id)
    if (cur) { cur.maxW = Math.max(cur.maxW, s.weight); cur.totalReps += s.reps }
    else byLog.set(s.log_id, { date, maxW: s.weight, totalReps: s.reps })
  }

  const data = [...byLog.values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(d => ({
      label: d.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      w: d.maxW,
      r: d.totalReps,
    }))

  const selectedEx = exercises.find(e => e.id === selectedExId)
  const H   = 160
  const PAD = { left: 40, right: 44, top: 16, bottom: 28 }
  const innerW = svgW - PAD.left - PAD.right

  const wMin = data.length ? Math.min(...data.map(d => d.w)) * 0.9  : 0
  const wMax = data.length ? Math.max(...data.map(d => d.w)) * 1.10 : 100
  const rMin = data.length ? Math.min(...data.map(d => d.r)) * 0.9  : 0
  const rMax = data.length ? Math.max(...data.map(d => d.r)) * 1.10 : 100

  const toX  = (i: number) => PAD.left + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2)
  const toYW = (v: number) => PAD.top + H - ((v - wMin) / Math.max(wMax - wMin, 0.001)) * H
  const toYR = (v: number) => PAD.top + H - ((v - rMin) / Math.max(rMax - rMin, 0.001)) * H

  const wPts = data.map((d, i) => ({ x: toX(i), y: toYW(d.w), label: d.label, w: d.w }))
  const rPts = data.map((d, i) => ({ x: toX(i), y: toYR(d.r) }))

  const wLine = wPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const rLine = rPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const wArea = data.length > 1
    ? `${wLine} L${wPts[wPts.length - 1].x.toFixed(1)},${(PAD.top + H).toFixed(1)} L${wPts[0].x.toFixed(1)},${(PAD.top + H).toFixed(1)} Z`
    : ''
  const step = Math.max(1, Math.floor(data.length / 5))

  return (
    <div style={{ ...glass, marginBottom: 24 }}>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 4 }}>
            Exercise Progress
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
            {selectedEx?.name ?? 'Select exercise'}
            {selectedEx?.muscle_group && (
              <span style={{ fontSize: 11, fontWeight: 500, color: C.dim, marginLeft: 8 }}>{selectedEx.muscle_group}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={selectedExId}
            onChange={e => setSelectedExId(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 9, padding: '6px 10px', color: '#fff', fontSize: 12, outline: 'none', cursor: 'pointer',
            }}
          >
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id} style={{ background: '#111' }}>{ex.name}</option>
            ))}
          </select>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 9, padding: 2 }}>
            {(['1m', '3m', '6m', 'all'] as const).map(r => (
              <button key={r} type="button" onClick={() => setTimeRange(r)} style={{
                padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                background: timeRange === r ? C.accentDim : 'transparent',
                color:      timeRange === r ? C.accent    : C.dim,
                outline:    timeRange === r ? `1px solid ${C.accentBd}` : 'none',
                transition: 'all 0.15s',
              }}>
                {r === 'all' ? 'All' : r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" /></svg>
          <span style={{ fontSize: 10, color: C.dim }}>Max weight (kg)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke={C.blue} strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" /></svg>
          <span style={{ fontSize: 10, color: C.dim }}>Total reps</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{ height: H + PAD.top + PAD.bottom, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, fontSize: 12, fontStyle: 'italic' }}>
          No sessions logged for this exercise yet
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Left Y labels — weight */}
          <div style={{ position: 'absolute', left: 0, top: PAD.top, height: H, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', width: PAD.left - 4, textAlign: 'right' }}>
            <span style={{ fontSize: 9, color: 'rgba(200,255,0,0.5)', lineHeight: 1 }}>{Math.round(wMax)}kg</span>
            <span style={{ fontSize: 9, color: 'rgba(200,255,0,0.5)', lineHeight: 1 }}>{Math.round(wMin)}kg</span>
          </div>
          {/* Right Y labels — reps */}
          <div style={{ position: 'absolute', right: 0, top: PAD.top, height: H, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', width: PAD.right - 4 }}>
            <span style={{ fontSize: 9, color: 'rgba(96,165,250,0.5)', lineHeight: 1 }}>{Math.round(rMax)}</span>
            <span style={{ fontSize: 9, color: 'rgba(96,165,250,0.5)', lineHeight: 1 }}>{Math.round(rMin)}</span>
          </div>

          <svg ref={svgRef} width="100%" height={H + PAD.top + PAD.bottom} style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id="wAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#C8FF00" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#C8FF00" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map(t => (
              <line key={t}
                x1={PAD.left} y1={PAD.top + H - t * H}
                x2={svgW - PAD.right} y2={PAD.top + H - t * H}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}

            {/* Weight area fill */}
            {data.length > 1 && <path d={wArea} fill="url(#wAreaGrad)" />}

            {/* Reps line (dashed blue) */}
            {data.length > 1 && (
              <path d={rLine} fill="none" stroke={C.blue} strokeWidth="1.5"
                strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
            )}

            {/* Weight line */}
            {data.length > 1 && (
              <path d={wLine} fill="none" stroke={C.accent} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Dots and x-axis labels */}
            {wPts.map((p, i) => {
              const showLabel = i === 0 || i === wPts.length - 1 || i % step === 0
              return (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={4} fill={C.accent} />
                  <circle cx={p.x} cy={p.y} r={8} fill="rgba(200,255,0,0.10)" />
                  {showLabel && (
                    <text x={p.x} y={PAD.top + H + 20} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.28)">
                      {p.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Single data point */}
            {data.length === 1 && (
              <g>
                <circle cx={toX(0)} cy={toYW(data[0].w)} r={5} fill={C.accent} />
                <text x={toX(0)} y={toYW(data[0].w) - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.accent}>
                  {data[0].w}kg
                </text>
                <text x={toX(0)} y={PAD.top + H + 20} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.28)">
                  {data[0].label}
                </text>
              </g>
            )}

            {/* Last value callout */}
            {wPts.length > 1 && (
              <text x={wPts[wPts.length - 1].x} y={wPts[wPts.length - 1].y - 12}
                textAnchor="middle" fontSize="11" fontWeight="700" fill={C.accent}>
                {data[data.length - 1].w}kg
              </text>
            )}
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── SECTION 2: WEEKLY VOLUME BY MUSCLE GROUP ─────────────────────────────────

function WeeklyVolumeByMuscle({ allSets, allLogs }: { allSets: SetEntry[]; allLogs: WorkoutLog[] }) {
  const [viewWeek, setViewWeek] = useState<'current' | 'last'>('current')

  // Week boundaries (Monday → Sunday)
  const now = new Date()
  const dow = now.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const thisMonday = new Date(now)
  thisMonday.setDate(now.getDate() + mondayOffset)
  thisMonday.setHours(0, 0, 0, 0)
  const nextMonday = new Date(thisMonday); nextMonday.setDate(thisMonday.getDate() + 7)
  const lastMonday = new Date(thisMonday); lastMonday.setDate(thisMonday.getDate() - 7)

  const weekStart = viewWeek === 'current' ? thisMonday : lastMonday
  const weekEnd   = viewWeek === 'current' ? nextMonday : thisMonday

  const logDateMap = new Map(allLogs.map(l => [l.id, new Date(l.performed_at)]))

  // Count sets per muscle group in the selected week
  const setsByMuscle: Record<string, number> = {}
  for (const s of allSets) {
    const date = logDateMap.get(s.log_id) ?? new Date(s.created_at)
    if (date < weekStart || date >= weekEnd) continue
    const muscle = s.exercises?.muscle_group ?? 'Unknown'
    setsByMuscle[muscle] = (setsByMuscle[muscle] ?? 0) + 1
  }

  const sorted   = Object.entries(setsByMuscle).sort((a, b) => b[1] - a[1])
  const MAX_SETS = Math.max(25, ...sorted.map(([, v]) => v))

  const H     = 140
  const BAR_W = 44
  const GAP   = 10
  const PAD   = { left: 36, right: 40, top: 20, bottom: 52 }
  const totalW = PAD.left + sorted.length * (BAR_W + GAP) + PAD.right

  const toY  = (v: number) => PAD.top + H - (v / MAX_SETS) * H
  const y10  = toY(10)
  const y20  = toY(20)

  const barColor = (n: number) => n < 10 ? C.red : n <= 20 ? C.green : C.yellow

  return (
    <div style={{ ...glass, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 4 }}>
            Weekly Volume
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Sets by Muscle Group</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
            Hypertrophy target: 10–20 sets per muscle per week
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['current', 'last'] as const).map(w => (
            <button key={w} type="button" onClick={() => setViewWeek(w)} style={{
              padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
              background: viewWeek === w ? C.accentDim : 'rgba(255,255,255,0.05)',
              color:      viewWeek === w ? C.accent    : C.dim,
              outline:    viewWeek === w ? `1px solid ${C.accentBd}` : `1px solid ${C.border}`,
            }}>
              {w === 'current' ? 'This Week' : 'Last Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { color: C.red,    label: '< 10 sets — below MEV' },
          { color: C.green,  label: '10–20 sets — optimal' },
          { color: C.yellow, label: '> 20 sets — exceeds MAV' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 9, color: C.dim }}>{label}</span>
          </div>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: C.dim, fontSize: 12, fontStyle: 'italic' }}>
          No sets logged {viewWeek === 'current' ? 'this' : 'last'} week
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <svg
            width={Math.max(totalW, 300)}
            height={H + PAD.top + PAD.bottom}
            style={{ display: 'block', overflow: 'visible' }}
          >
            {/* Y gridlines + labels */}
            {[0, 5, 10, 15, 20, 25].filter(v => v <= MAX_SETS + 2).map(v => (
              <g key={v}>
                <line x1={PAD.left} y1={toY(v)} x2={totalW - PAD.right + 20} y2={toY(v)}
                  stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <text x={PAD.left - 4} y={toY(v) + 3} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.25)">{v}</text>
              </g>
            ))}

            {/* MEV reference line at 10 */}
            <line x1={PAD.left} y1={y10} x2={totalW - PAD.right + 20} y2={y10}
              stroke={C.green} strokeWidth="1" strokeDasharray="5 4" opacity="0.55" />
            <text x={totalW - PAD.right + 24} y={y10 + 3} fontSize="8" fill={C.green} opacity="0.8">MEV</text>

            {/* MAV reference line at 20 */}
            {MAX_SETS >= 20 && (
              <>
                <line x1={PAD.left} y1={y20} x2={totalW - PAD.right + 20} y2={y20}
                  stroke={C.yellow} strokeWidth="1" strokeDasharray="5 4" opacity="0.55" />
                <text x={totalW - PAD.right + 24} y={y20 + 3} fontSize="8" fill={C.yellow} opacity="0.8">MAV</text>
              </>
            )}

            {/* Bars */}
            {sorted.map(([muscle, sets], i) => {
              const x     = PAD.left + i * (BAR_W + GAP) + GAP / 2
              const bh    = (sets / MAX_SETS) * H
              const y     = PAD.top + H - bh
              const color = barColor(sets)
              const label = muscle.length > 11 ? muscle.slice(0, 10) + '…' : muscle

              return (
                <g key={muscle}>
                  <rect x={x} y={y} width={BAR_W} height={Math.max(bh, 2)} rx={5} fill={color} opacity="0.82" />
                  <text x={x + BAR_W / 2} y={y - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
                    {sets}
                  </text>
                  <text
                    x={x + BAR_W / 2} y={PAD.top + H + 14}
                    textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.45)"
                    transform={`rotate(-40, ${x + BAR_W / 2}, ${PAD.top + H + 14})`}
                  >
                    {label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── SECTION 3: RECENT SESSIONS ───────────────────────────────────────────────

function RecentSessions({ allSets, allLogs }: { allSets: SetEntry[]; allLogs: WorkoutLog[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Index sets by log_id
  const setsByLog = new Map<string, SetEntry[]>()
  for (const s of allSets) {
    if (!setsByLog.has(s.log_id)) setsByLog.set(s.log_id, [])
    setsByLog.get(s.log_id)!.push(s)
  }

  // Group logs by template oldest→newest for prev-session comparison
  const logsByTemplate = new Map<string, WorkoutLog[]>()
  for (const log of [...allLogs].reverse()) {
    const arr = logsByTemplate.get(log.template_id)
    if (arr) arr.push(log)
    else logsByTemplate.set(log.template_id, [log])
  }

  const getPrevLog = (log: WorkoutLog): WorkoutLog | null => {
    const arr = logsByTemplate.get(log.template_id) ?? []
    const idx = arr.findIndex(l => l.id === log.id)
    return idx > 0 ? arr[idx - 1] : null
  }

  return (
    <div style={glass}>
      <div style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: C.dim, marginBottom: 16,
      }}>
        Recent Sessions
      </div>

      {allLogs.length === 0 ? (
        <div style={{ fontSize: 12, color: C.dim, fontStyle: 'italic' }}>No sessions logged yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allLogs.slice(0, 8).map(log => {
            const isExpanded  = expandedId === log.id
            const sessionSets = setsByLog.get(log.id) ?? []
            const prevLog     = getPrevLog(log)
            const prevSets    = prevLog ? (setsByLog.get(prevLog.id) ?? []) : []
            const totalVol    = sessionSets.reduce((s, r) => s + r.weight * r.reps, 0)
            const date        = new Date(log.performed_at)

            // Group current session sets by exercise
            const exMap = new Map<string, { name: string; muscle: string | null; sets: SetEntry[] }>()
            for (const s of sessionSets) {
              const name   = s.exercises?.name         ?? 'Unknown'
              const muscle = s.exercises?.muscle_group ?? null
              if (!exMap.has(s.exercise_id)) exMap.set(s.exercise_id, { name, muscle, sets: [] })
              exMap.get(s.exercise_id)!.sets.push(s)
            }

            // Previous session: max weight per exercise for comparison
            const prevMaxW = new Map<string, number>()
            for (const s of prevSets) {
              prevMaxW.set(s.exercise_id, Math.max(prevMaxW.get(s.exercise_id) ?? 0, s.weight))
            }

            return (
              <div key={log.id} style={{
                borderRadius: 14,
                background: isExpanded ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isExpanded ? 'rgba(200,255,0,0.20)' : 'rgba(255,255,255,0.07)'}`,
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}>
                {/* Session header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                      {log.workout_templates?.name ?? 'Session'}
                    </div>
                    <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>
                      {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 6 }}>
                    <div style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>
                      {sessionSets.length} sets
                    </div>
                    {totalVol > 0 && (
                      <div style={{ fontSize: 10, color: C.dim, marginTop: 1 }}>
                        {Math.round(totalVol).toLocaleString()} kg vol
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 12, color: C.dim, flexShrink: 0, display: 'block',
                    transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                    transform: isExpanded ? 'rotate(180deg)' : 'none',
                  }}>▾</span>
                </button>

                {/* Expanded exercise detail */}
                {isExpanded && (
                  <div style={{ padding: '0 16px 16px' }}>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[...exMap.entries()].map(([exId, { name, muscle, sets }]) => {
                        const sortedSets = [...sets].sort((a, b) => (a.set_number ?? 0) - (b.set_number ?? 0))
                        const exVol      = sets.reduce((s, r) => s + r.weight * r.reps, 0)
                        const maxW       = Math.max(...sets.map(s => s.weight))
                        const prevMax    = prevMaxW.get(exId)
                        const delta      = prevMax !== undefined ? maxW - prevMax : null

                        return (
                          <div key={exId}>
                            {/* Exercise header row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: C.mid }}>{name}</span>
                                {muscle && (
                                  <span style={{ fontSize: 10, color: C.dimLo, marginLeft: 6 }}>{muscle}</span>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                {delta !== null && (
                                  <span style={{
                                    fontSize: 10, fontWeight: 700,
                                    color: delta > 0 ? C.green : delta < 0 ? C.red : C.dim,
                                  }}>
                                    {delta > 0 ? `↑ +${delta}kg` : delta < 0 ? `↓ ${delta}kg` : '= same'} vs last
                                  </span>
                                )}
                                <span style={{ fontSize: 10, color: C.dimLo }}>
                                  {Math.round(exVol).toLocaleString()} kg vol
                                </span>
                              </div>
                            </div>

                            {/* Individual sets */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginLeft: 8 }}>
                              {sortedSets.map((s, idx) => (
                                <div key={s.id} style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  padding: '4px 10px', borderRadius: 7,
                                  background: 'rgba(255,255,255,0.025)',
                                }}>
                                  <span style={{ fontSize: 9, color: C.dimLo, width: 32, flexShrink: 0 }}>
                                    Set {s.set_number ?? idx + 1}
                                  </span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{s.weight}kg</span>
                                  <span style={{ fontSize: 10, color: C.dim }}>×</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{s.reps} reps</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
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
