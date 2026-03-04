'use client'
import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { StepperInput } from '@/components/ui/StepperInput'

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const C = {
  surface:      'rgba(255,255,255,0.04)',
  surfaceLo:    'rgba(255,255,255,0.025)',
  border:       'rgba(255,255,255,0.08)',
  borderHi:     'rgba(255,255,255,0.16)',
  accent:       '#C8FF00',
  accentDim:    'rgba(200,255,0,0.12)',
  accentBorder: 'rgba(200,255,0,0.28)',
  text:         '#FFFFFF',
  mid:          'rgba(255,255,255,0.55)',
  dim:          'rgba(255,255,255,0.28)',
  dimLo:        'rgba(255,255,255,0.18)',
}

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface Exercise {
  id: string
  name: string
  muscle_group: string | null
  tempo: string | null
  notes: string | null
  target_sets: number
  target_reps: string
  position: number
}

type SetState = { weight: number; reps: number; rpe?: number; done: boolean }

// ─── useIsMobile ─────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

// ─── REST TIMER ───────────────────────────────────────────────────────────────
function RestTimer({
  exerciseName,
  setNum,
  onDismiss,
}: {
  exerciseName: string
  setNum: number
  onDismiss: () => void
}) {
  const TOTAL    = 90
  const [sec, setSec] = useState(TOTAL)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (sec <= 0) { onDismiss(); return }
    const t = setTimeout(() => setSec((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [sec, onDismiss])

  const pct  = sec / TOTAL
  const r    = 36
  const circ = 2 * Math.PI * r

  return (
    <>
      <style>{`
        @keyframes timerIn {
          from { transform: translateY(16px) scale(0.96); opacity: 0; }
          to   { transform: translateY(0)    scale(1);    opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom:   isMobile ? 110 : 32,
        right:    isMobile ? 16  : 32,
        zIndex:   9999,
        maxWidth: 'calc(100vw - 32px)',
        backdropFilter: 'blur(60px) saturate(200%)',
        WebkitBackdropFilter: 'blur(60px) saturate(200%)',
        background: 'rgba(200,255,0,0.10)',
        border: '1px solid rgba(200,255,0,0.25)',
        borderRadius: 20,
        boxShadow: '0 0 40px rgba(200,255,0,0.12), 0 0 80px rgba(200,255,0,0.04), 0 20px 40px rgba(0,0,0,0.5)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        animation: 'timerIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg width={80} height={80} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
            <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(200,255,0,0.15)" strokeWidth={4} />
            <circle cx={40} cy={40} r={r} fill="none" stroke={C.accent} strokeWidth={4}
              strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s linear' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: C.accent, letterSpacing: '-0.04em', lineHeight: 1 }}>{sec}</span>
            <span style={{ fontSize: 8, color: C.dim, letterSpacing: '0.1em', marginTop: 2 }}>REST</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>Rest Timer</div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 10 }}>
            {exerciseName} · Set {setNum}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => setSec((s) => s + 15)} style={{
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
    </>
  )
}

// ─── SET ROW ─────────────────────────────────────────────────────────────────
function SetRow({
  setIndex, weight, reps, done, lastWeight, lastReps, perSetLast,
  onWeightChange, onRepsChange, onLog, saving,
}: {
  setIndex: number
  weight: number
  reps: number
  done: boolean
  lastWeight?: number
  lastReps?: number
  perSetLast?: { weight: number; reps: number }
  onWeightChange: (v: number) => void
  onRepsChange: (v: number) => void
  onLog: () => void
  saving: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 13px', borderRadius: 10,
      background: done ? 'rgba(200,255,0,0.04)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${done ? 'rgba(200,255,0,0.22)' : 'rgba(255,255,255,0.06)'}`,
      transition: 'all 0.2s ease',
    }}>
      <span style={{
        fontSize: 10, color: C.dimLo, width: 16,
        flexShrink: 0, fontWeight: 700,
      }}>
        {setIndex + 1}
      </span>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: C.dimLo, marginBottom: 5,
            }}>
              WEIGHT
              {lastWeight !== undefined && (
                <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 4, textTransform: 'none', letterSpacing: 0 }}>
                  ↑ last {lastWeight}kg
                </span>
              )}
            </div>
            <StepperInput value={weight} onChange={onWeightChange} unit="kg" step={2.5} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: C.dimLo, marginBottom: 5,
            }}>
              REPS
              {lastReps !== undefined && (
                <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 4, textTransform: 'none', letterSpacing: 0 }}>
                  ↑ last {lastReps}
                </span>
              )}
            </div>
            <StepperInput value={reps} onChange={onRepsChange} unit="" step={1} />
          </div>
        </div>
        {perSetLast && (
          <div style={{
            fontSize: 9, color: 'rgba(255,255,255,0.28)',
            fontStyle: 'italic', marginTop: 4, paddingLeft: 2,
          }}>
            ↑ last: {perSetLast.weight}kg × {perSetLast.reps} reps
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onLog}
        disabled={done || saving}
        style={{
          width: 42, height: 44, borderRadius: 11, flexShrink: 0,
          background: done ? 'rgba(200,255,0,0.12)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${done ? 'rgba(200,255,0,0.28)' : C.border}`,
          color: done ? C.accent : 'rgba(255,255,255,0.4)',
          fontSize: saving ? 11 : 18,
          cursor: done ? 'default' : saving ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        {saving ? '…' : done ? '✓' : '○'}
      </button>
    </div>
  )
}

// ─── EXERCISE ACCORDION ───────────────────────────────────────────────────────
function ExerciseAccordion({
  exercise, index, defaultOpen, lastWeight, lastReps,
  logId, onLogIdCreated, templateId, onSetLogged, targetSets = 3, lastPerfBySet = {},
}: {
  exercise: Exercise
  index: number
  defaultOpen: boolean
  lastWeight?: number
  lastReps?: number
  logId: string | null
  onLogIdCreated: (id: string) => void
  templateId: string
  onSetLogged: (exerciseName: string, setNum: number) => void
  targetSets?: number
  lastPerfBySet?: Record<number, { weight: number; reps: number }>
}) {
  const [open, setOpen]   = useState(defaultOpen)
  const [sets, setSets]   = useState<SetState[]>(() =>
    Array.from({ length: targetSets }, (_, i) => {
      const prev = lastPerfBySet[i + 1]
      return {
        weight: prev?.weight ?? lastWeight ?? 60,
        reps:   prev?.reps   ?? lastReps   ?? 8,
        done:   false,
      }
    })
  )
  const [saving, setSaving] = useState<number | null>(null)
  const [error,  setError]  = useState<string | null>(null)

  const doneSets = sets.filter((s) => s.done).length

  const updateSet = (i: number, key: 'weight' | 'reps', val: number) =>
    setSets((prev) => prev.map((s, xi) => (xi === i ? { ...s, [key]: val } : s)))

  const addSet = () =>
    setSets((prev) => [...prev, { weight: prev[prev.length - 1].weight, reps: prev[prev.length - 1].reps, done: false }])

  const handleLog = async (i: number) => {
    if (sets[i].done) return
    setSaving(i)
    setError(null)

    try {
      const supabase = getSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in. Please refresh and log in again.')

      let currentLogId = logId
      if (!currentLogId) {
        const { data: newLog, error: logErr } = await supabase
          .from('workout_logs')
          .insert({
            template_id:  templateId,
            user_id:      user.id,
            performed_at: new Date().toISOString(),
          })
          .select('id')
          .single()
        if (logErr) throw new Error(`Could not start workout log: ${logErr.message}`)
        currentLogId = newLog.id
        onLogIdCreated(currentLogId!)
      }

      const { error: setErr } = await supabase
        .from('set_entries')
        .insert({
          log_id:      currentLogId,
          exercise_id: exercise.id,
          user_id:     user.id,
          set_number:  i + 1,
          weight:      sets[i].weight,
          reps:        sets[i].reps,
          rpe:         sets[i].rpe ?? null,
        })
      if (setErr) throw new Error(`Could not save set: ${setErr.message}`)

      setSets((prev) => prev.map((s, xi) => (xi === i ? { ...s, done: true } : s)))
      onSetLogged(exercise.name, i + 1)
    } catch (err: any) {
      setError(err.message ?? 'Save failed')
    }

    setSaving(null)
  }

  return (
    <div style={{
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      background: open ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
      border: `1px solid ${open ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: open
        ? '0 0 0 0.5px rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.3)'
        : 'none',
    }}>

      {/* ── HEADER ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
          color: C.text, textAlign: 'left',
        }}
      >
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

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: C.text }}>
            {exercise.name}
          </div>
          {!open && (
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
              {[
                exercise.muscle_group,
                lastWeight ? `Last: ${lastWeight}kg × ${lastReps}` : 'No history',
                doneSets > 0 ? `${doneSets}/${sets.length} done` : null,
              ].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
            fontSize: 10, color: C.dim, display: 'block',
            transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
            transform: open ? 'rotate(180deg)' : 'none',
          }}>▾</span>
        </div>
      </button>

      {/* ── BODY ── */}
      <div style={{
        maxHeight: open ? 900 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ padding: '0 18px 18px' }}>

          {/* Meta tags */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {exercise.muscle_group && (
              <span style={{ fontSize: 10, color: C.dim, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6 }}>
                {exercise.muscle_group}
              </span>
            )}
            {exercise.tempo && (
              <span style={{ fontSize: 10, color: C.dim, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6 }}>
                {exercise.tempo}
              </span>
            )}
            {lastWeight !== undefined && (
              <span style={{ fontSize: 10, color: C.dim, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6 }}>
                Last session: <span style={{ color: C.mid }}>{lastWeight}kg × {lastReps}</span>
              </span>
            )}
            {lastWeight === undefined && (
              <span style={{ fontSize: 10, color: C.dim, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6, fontStyle: 'italic' }}>
                First time — no history
              </span>
            )}
          </div>

          {/* Set rows */}
          <div style={{
            marginLeft: 12,
            paddingLeft: 12,
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {sets.map((set, i) => (
              <SetRow
                key={i}
                setIndex={i}
                weight={set.weight}
                reps={set.reps}
                done={set.done}
                lastWeight={lastWeight}
                lastReps={lastReps}
                perSetLast={lastPerfBySet[i + 1]}
                onWeightChange={(v) => updateSet(i, 'weight', v)}
                onRepsChange={(v) => updateSet(i, 'reps', v)}
                onLog={() => handleLog(i)}
                saving={saving === i}
              />
            ))}

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 10px', borderRadius: 8,
                background: 'rgba(255,85,85,0.08)',
                border: '1px solid rgba(255,85,85,0.18)',
                fontSize: 11, color: '#FF5555', fontWeight: 600,
              }}>
                ⚠ {error}
              </div>
            )}

            {/* + Add Set */}
            <button
              type="button"
              onClick={addSet}
              style={{
                width: '100%', padding: '10px',
                background: 'transparent',
                border: `1px dashed ${C.border}`,
                borderRadius: 12, cursor: 'pointer',
                color: C.dim, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
                transition: 'all 0.15s',
              }}
            >
              + Add Set
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SHIMMER SKELETON ─────────────────────────────────────────────────────────
function SkeletonCard({ index }: { index: number }) {
  const delay = `${index * 0.15}s`
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', marginBottom: 8,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Badge placeholder */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'rgba(255,255,255,0.08)',
          animation: 'shimmer 1.4s ease-in-out infinite',
          animationDelay: delay,
        }} />
        {/* Text placeholders */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 13, width: '55%', borderRadius: 6, background: 'rgba(255,255,255,0.08)', animation: 'shimmer 1.4s ease-in-out infinite', animationDelay: delay }} />
          <div style={{ height: 10, width: '35%', borderRadius: 6, background: 'rgba(255,255,255,0.05)', animation: 'shimmer 1.4s ease-in-out infinite', animationDelay: `${index * 0.15 + 0.1}s` }} />
        </div>
      </div>
    </div>
  )
}

// ─── SESSION PANEL ────────────────────────────────────────────────────────────
export function SessionPanel({
  templateId,
  exercises,
  lastPerf,
  lastPerfBySet = {},
}: {
  templateId: string
  exercises: Exercise[]
  lastPerf: Record<string, { weight: number; reps: number }>
  lastPerfBySet?: Record<string, Record<number, { weight: number; reps: number }>>
}) {
  // Show shimmer skeleton during the expandIn animation (350ms), then real data
  const [ready, setReady] = useState(false)
  const [logId, setLogId] = useState<string | null>(null)
  const [timer, setTimer] = useState<{ exerciseName: string; setNum: number } | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350)
    return () => clearTimeout(t)
  }, [])

  const skeletonCount = exercises.length > 0 ? Math.min(exercises.length, 5) : 3

  if (!ready) {
    return (
      <div>
        <style>{`
          @keyframes shimmer {
            0%, 100% { opacity: 0.4; }
            50%       { opacity: 1; }
          }
        `}</style>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderRadius: 10, marginTop: 4,
        background: 'rgba(255,85,85,0.08)',
        border: '1px solid rgba(255,85,85,0.20)',
      }}>
        <span style={{ fontSize: 14 }}>⚠</span>
        <span style={{ fontSize: 11, color: '#FF5555', fontWeight: 600, lineHeight: 1.5 }}>
          No exercises found in this template. Add some in the Architect tab.
        </span>
      </div>
    )
  }

  return (
    <div style={{
      marginLeft: 16,
      paddingLeft: 16,
      borderLeft: '2px solid rgba(200,255,0,0.12)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginTop: 8,
    }}>
      {exercises.map((exercise, index) => {
        const perf = lastPerf[exercise.id]
        return (
          <ExerciseAccordion
            key={exercise.id}
            exercise={exercise}
            index={index}
            defaultOpen={index === 0}
            lastWeight={perf?.weight}
            lastReps={perf?.reps}
            lastPerfBySet={lastPerfBySet[exercise.id] ?? {}}
            logId={logId}
            onLogIdCreated={setLogId}
            templateId={templateId}
            targetSets={exercise.target_sets}
            onSetLogged={(name, num) => setTimer({ exerciseName: name, setNum: num })}
          />
        )
      })}

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
