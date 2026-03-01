'use client'
import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg:           '#000000',
  surface:      'rgba(255,255,255,0.04)',
  surfaceHover: 'rgba(255,255,255,0.07)',
  border:       'rgba(255,255,255,0.08)',
  borderHover:  'rgba(255,255,255,0.16)',
  accent:       '#C8FF00',
  accentDim:    'rgba(200,255,0,0.15)',
  accentGlow:   'rgba(200,255,0,0.08)',
  text:         '#FFFFFF',
  mid:          'rgba(255,255,255,0.55)',
  dim:          'rgba(255,255,255,0.30)',
  red:          '#FF4444',
  blue:         '#4488FF',
  purple:       '#A855F7',
}

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface SetRow { weight: number; reps: number; done: boolean }

interface Exercise {
  id: string
  name: string
  target_muscle_group: string | null
  order_index: number
}

interface Props {
  template: { id: string; name: string; day_number?: number; description?: string }
  exercises: Exercise[]
  lastPerformance: Record<string, { weight: number; reps: number }>
  lastLogDate: string | null
}

// ─── PILL ────────────────────────────────────────────────────────────────────
const Pill = ({ children, color = C.accent }: { children: React.ReactNode; color?: string }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 999,
    background: color === C.accent ? C.accentDim : 'rgba(68,136,255,0.15)',
    color, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }}>{children}</span>
)

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 12, paddingLeft: 4 }}>
    {children}
  </div>
)

// ─── NUTRITION HEADER ─────────────────────────────────────────────────────────
function NutritionHeader({ template }: { template: Props['template'] }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 120); return () => clearTimeout(t) }, [])

  const kcalPct = 1840 / 2850
  const protPct = 142 / 210
  const stepPct = 9200 / 14000

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  function Ring({ pct, color, size = 52, value, unit }: { pct: number; color: string; size?: number; value: string; unit: string }) {
    const r = (size - 8) / 2
    const circ = 2 * Math.PI * r
    const dash = animated ? circ * pct : 0
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.text }}>{Math.round(pct * 100)}%</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{value}</div>
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: '0.04em' }}>{unit}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${C.border}`,
      borderRadius: 20, padding: '20px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      boxShadow: '0 0 0 0.5px rgba(255,255,255,0.04) inset, 0 20px 40px rgba(0,0,0,0.3)',
      marginBottom: 20,
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.dim, marginBottom: 4 }}>{today}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: '-0.03em' }}>Daily Goals</div>
        <div style={{ fontSize: 13, color: C.mid, marginTop: 2 }}>{template.name}</div>
      </div>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <Ring pct={kcalPct} color={C.accent}  value="1,840" unit="/ 2,850 kcal" />
        <Ring pct={protPct} color={C.blue}    value="142g"  unit="/ 210g prot" />
        <Ring pct={stepPct} color={C.purple}  value="9,200" unit="/ 14k steps" />
        <div style={{ width: 1, height: 48, background: C.border }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 2 }}>Remaining</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.accent, letterSpacing: '-0.03em' }}>1,010</div>
          <div style={{ fontSize: 10, color: C.dim }}>kcal left</div>
        </div>
      </div>
    </div>
  )
}

// ─── STEPPER INPUT ────────────────────────────────────────────────────────────
function StepperInput({ label, value, onChange, unit, step = 1, prev }: {
  label: string; value: number; onChange: (v: number) => void
  unit: string; step?: number; prev?: number
}) {
  const dec = () => onChange(parseFloat(Math.max(0, value - step).toFixed(2)))
  const inc = () => onChange(parseFloat((value + step).toFixed(2)))

  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.dim, marginBottom: 6 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        <button type="button" onClick={dec} style={{
          width: 36, height: 40, background: 'transparent', border: 'none', cursor: 'pointer',
          color: C.mid, fontSize: 18, fontWeight: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'all 0.1s',
        }}>−</button>

        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 18, color: C.text, letterSpacing: '-0.02em', userSelect: 'none' }}>
          {value}<span style={{ fontSize: 10, fontWeight: 500, color: C.dim, marginLeft: 2 }}>{unit}</span>
        </div>

        <button type="button" onClick={inc} style={{
          width: 36, height: 40, background: 'transparent', border: 'none', cursor: 'pointer',
          color: C.accent, fontSize: 18, fontWeight: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>+</button>
      </div>
      {prev !== undefined && (
        <div style={{ fontSize: 9, color: C.dim, marginTop: 4, paddingLeft: 2 }}>
          ↑ Last: <span style={{ color: C.mid }}>{prev}{unit}</span>
        </div>
      )}
    </div>
  )
}

// ─── REST TIMER ───────────────────────────────────────────────────────────────
function RestTimer({ exerciseName, setNum, onDismiss }: { exerciseName: string; setNum: number; onDismiss: () => void }) {
  const [sec, setSec] = useState(90)
  const total = 90

  useEffect(() => {
    if (sec <= 0) { onDismiss(); return }
    const t = setTimeout(() => setSec(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [sec, onDismiss])

  const pct = sec / total
  const r = 36, circ = 2 * Math.PI * r

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 100,
      backdropFilter: 'blur(60px) saturate(200%)',
      WebkitBackdropFilter: 'blur(60px) saturate(200%)',
      background: 'rgba(200,255,0,0.10)',
      border: '1px solid rgba(200,255,0,0.25)',
      borderRadius: 20,
      boxShadow: '0 0 40px rgba(200,255,0,0.12), 0 0 80px rgba(200,255,0,0.04), 0 20px 40px rgba(0,0,0,0.5)',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 16,
      animation: 'timerSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <style>{`@keyframes timerSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg width={80} height={80} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
          <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(200,255,0,0.15)" strokeWidth={4} />
          <circle cx={40} cy={40} r={r} fill="none" stroke={C.accent} strokeWidth={4}
            strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: C.accent, letterSpacing: '-0.04em' }}>{sec}</span>
          <span style={{ fontSize: 8, color: C.dim, letterSpacing: '0.1em' }}>REST</span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Rest Timer</div>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>{exerciseName} · Set {setNum}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" onClick={() => setSec(s => s + 15)} style={{
            fontSize: 10, padding: '4px 10px', borderRadius: 6,
            background: 'rgba(255,255,255,0.08)', border: 'none',
            color: C.mid, cursor: 'pointer', fontWeight: 600,
          }}>+15s</button>
          <button type="button" onClick={onDismiss} style={{
            fontSize: 10, padding: '4px 10px', borderRadius: 6,
            background: C.accentDim, border: 'none',
            color: C.accent, cursor: 'pointer', fontWeight: 700,
          }}>Skip →</button>
        </div>
      </div>
    </div>
  )
}

// ─── EXERCISE ROW ─────────────────────────────────────────────────────────────
function ExerciseRow({
  exercise, index, defaultOpen, lastPerf,
  logId, onLogIdCreated, templateId,
  onSetDone,
}: {
  exercise: Exercise; index: number; defaultOpen: boolean
  lastPerf?: { weight: number; reps: number }
  logId: string | null
  onLogIdCreated: (id: string) => void
  templateId: string
  onSetDone: (exerciseName: string, setNum: number) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [sets, setSets] = useState<SetRow[]>([
    { weight: lastPerf?.weight ?? 60, reps: lastPerf?.reps ?? 8, done: false }
  ])
  const [saving, setSaving] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateSet = (i: number, key: keyof SetRow, val: number | boolean) =>
    setSets(s => s.map((x, xi) => xi === i ? { ...x, [key]: val } : x))

  const addSet = () => setSets(s => [...s, { weight: s[s.length - 1].weight, reps: s[s.length - 1].reps, done: false }])

  const markDone = async (i: number) => {
    const set = sets[i]
    if (set.done) { updateSet(i, 'done', false); return }

    setSaving(i)
    setError(null)
    try {
      const supabase = getSupabaseBrowserClient()

      let currentLogId = logId
      if (!currentLogId) {
        const { data: newLog, error: logErr } = await supabase
          .from('workout_logs')
          .insert({ template_id: templateId, performed_at: new Date().toISOString() })
          .select('id').single()
        if (logErr) throw new Error(logErr.message)
        currentLogId = newLog.id
        onLogIdCreated(currentLogId)
      }

      const { error: setErr } = await supabase
        .from('set_entries')
        .insert({ log_id: currentLogId, exercise_id: exercise.id, weight: set.weight, reps: set.reps })
      if (setErr) throw new Error(setErr.message)

      updateSet(i, 'done', true)
      onSetDone(exercise.name, i + 1)
    } catch (err: any) {
      setError(err.message ?? 'Save failed')
    }
    setSaving(null)
  }

  const doneSets = sets.filter(s => s.done).length
  const isPR = lastPerf && sets.some(s => s.done && s.weight > lastPerf.weight)

  return (
    <div style={{
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      background: open ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
      border: `1px solid ${open ? C.borderHover : C.border}`,
      borderRadius: 16, overflow: 'hidden',
      transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: open ? '0 0 0 0.5px rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.3)' : 'none',
    }}>

      {/* ── HEADER ── */}
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
        color: C.text,
      }}>
        {/* Number badge */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: open ? C.accentDim : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(200,255,0,0.3)' : C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800,
          color: open ? C.accent : C.mid,
          transition: 'all 0.2s',
        }}>
          {index + 1}
        </div>

        {/* Name + collapsed meta */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: C.text }}>
            {exercise.name}
          </div>
          {!open && (
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
              {exercise.target_muscle_group ?? ''}
              {lastPerf ? ` · Last: ${lastPerf.weight}kg × ${lastPerf.reps}` : ' · No history'}
              {doneSets > 0 ? ` · ${doneSets}/${sets.length} done` : ''}
            </div>
          )}
        </div>

        {/* PR pill + done dots + chevron */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {isPR && <Pill>PR</Pill>}
          {doneSets > 0 && (
            <div style={{ display: 'flex', gap: 3 }}>
              {sets.map((s, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: s.done ? C.accent : 'rgba(255,255,255,0.15)',
                  boxShadow: s.done ? '0 0 5px rgba(200,255,0,0.5)' : 'none',
                }} />
              ))}
            </div>
          )}
          <span style={{
            fontSize: 10, color: C.dim,
            display: 'block', transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>▾</span>
        </div>
      </button>

      {/* ── BODY ── */}
      <div style={{
        maxHeight: open ? 800 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ padding: '0 18px 18px' }}>

          {/* Meta tags */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {exercise.target_muscle_group && (
              <div style={{ fontSize: 10, color: C.dim, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6 }}>
                Muscle: <span style={{ color: C.mid }}>{exercise.target_muscle_group}</span>
              </div>
            )}
            {lastPerf && (
              <div style={{ fontSize: 10, color: C.dim, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6 }}>
                Last session: <span style={{ color: C.mid }}>{lastPerf.weight}kg × {lastPerf.reps} reps</span>
              </div>
            )}
            {!lastPerf && (
              <div style={{ fontSize: 10, color: C.dim, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6 }}>
                First time — no history
              </div>
            )}
          </div>

          {/* Set rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sets.map((set, si) => (
              <div key={si} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: set.done ? 'rgba(200,255,0,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${set.done ? 'rgba(200,255,0,0.2)' : C.border}`,
                borderRadius: 12,
                transition: 'all 0.2s ease',
              }}>
                {/* Set number */}
                <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, width: 20, textAlign: 'center', flexShrink: 0 }}>
                  {si + 1}
                </div>

                {/* Weight stepper */}
                <StepperInput
                  label="Weight"
                  value={set.weight}
                  onChange={v => updateSet(si, 'weight', v)}
                  unit="kg"
                  step={2.5}
                  prev={lastPerf?.weight}
                />

                {/* Reps stepper */}
                <StepperInput
                  label="Reps"
                  value={set.reps}
                  onChange={v => updateSet(si, 'reps', v)}
                  unit=""
                  step={1}
                  prev={lastPerf?.reps}
                />

                {/* Done button */}
                <button
                  type="button"
                  onClick={() => markDone(si)}
                  disabled={saving === si}
                  style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    border: `1px solid ${set.done ? 'rgba(200,255,0,0.4)' : C.border}`,
                    background: set.done ? C.accentDim : 'transparent',
                    cursor: saving === si ? 'wait' : 'pointer',
                    fontSize: set.done ? 16 : 14, color: set.done ? C.accent : C.dim,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {saving === si ? '…' : set.done ? '✓' : '○'}
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ marginTop: 8, fontSize: 11, color: C.red, fontWeight: 600, paddingLeft: 4 }}>⚠ {error}</div>
          )}

          {/* + Add Set */}
          <button type="button" onClick={addSet} style={{
            marginTop: 10, width: '100%', padding: '10px',
            background: 'transparent',
            border: `1px dashed ${C.border}`,
            borderRadius: 12, cursor: 'pointer',
            color: C.dim, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
            transition: 'all 0.15s',
          }}>
            + Add Set
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function WorkoutSession({ template, exercises, lastPerformance, lastLogDate }: Props) {
  const [logId, setLogId] = useState<string | null>(null)
  const [timer, setTimer] = useState<{ exerciseName: string; setNum: number } | null>(null)

  const lastDate = lastLogDate
    ? new Date(lastLogDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : null

  return (
    <div>
      {/* Nutrition header */}
      <NutritionHeader template={template} />

      {/* Session title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <SectionHeader>Day {template.day_number} · Today's Session</SectionHeader>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>{template.name}</div>
          {lastDate
            ? <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>Last performed: <span style={{ color: C.mid }}>{lastDate}</span></div>
            : <div style={{ fontSize: 11, color: C.dim, marginTop: 4, fontStyle: 'italic' }}>First time — no history yet</div>
          }
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Pill>{exercises.length} exercises</Pill>
          <button style={{
            padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(255,68,68,0.10)', border: '1px solid rgba(255,68,68,0.22)',
            color: C.red, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>End</button>
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {exercises.map((exercise, index) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            index={index}
            defaultOpen={index === 0}
            lastPerf={lastPerformance[exercise.id]}
            logId={logId}
            onLogIdCreated={setLogId}
            templateId={template.id}
            onSetDone={(name, num) => setTimer({ exerciseName: name, setNum: num })}
          />
        ))}

        {exercises.length === 0 && (
          <div style={{
            backdropFilter: 'blur(20px)', background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: 16,
            padding: 40, textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No exercises in this template</div>
            <div style={{ fontSize: 12, color: C.mid }}>Add exercises in the Architect tab</div>
          </div>
        )}
      </div>

      {/* Finish session */}
      {exercises.length > 0 && (
        <button style={{
          marginTop: 16, width: '100%', padding: '14px',
          background: C.accentDim,
          border: '1px solid rgba(200,255,0,0.3)',
          borderRadius: 14, cursor: 'pointer',
          color: C.accent, fontSize: 14, fontWeight: 800, letterSpacing: '0.04em',
          boxShadow: '0 0 24px rgba(200,255,0,0.1)',
        }}>
          FINISH SESSION ↗
        </button>
      )}

      {/* Floating rest timer */}
      {timer && (
        <RestTimer
          exerciseName={timer.exerciseName}
          setNum={timer.setNum}
          onDismiss={() => setTimer(null)}
        />
      )}
    </div>
  )
}
