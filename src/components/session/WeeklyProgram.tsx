'use client'
import { useState } from 'react'
import { SessionPanel } from './SessionPanel'
import type { Exercise } from './SessionPanel'

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const C = {
  surface:  'rgba(255,255,255,0.04)',
  border:   'rgba(255,255,255,0.08)',
  text:     '#FFF',
  mid:      'rgba(255,255,255,0.55)',
  dim:      'rgba(255,255,255,0.28)',
}

const glass = {
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.07), 0 20px 40px rgba(0,0,0,0.4)',
}

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Template {
  id: string
  name: string
  description: string
  day_number: number | null
}

interface Props {
  templates: Template[]
  exercisesByTemplate: Record<string, Exercise[]>
  lastPerfByExercise: Record<string, { weight: number; reps: number }>
  lastPerfBySet: Record<string, Record<number, { weight: number; reps: number }>>
  templateLoadError: boolean
}

// ─── WEEKLY PROGRAM ───────────────────────────────────────────────────────────
export function WeeklyProgram({
  templates,
  exercisesByTemplate,
  lastPerfByExercise,
  lastPerfBySet,
  templateLoadError,
}: Props) {
  const [activeDay, setActiveDay] = useState<string | null>(null)

  return (
    <>
      <style>{`
        @keyframes expandIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
      `}</style>

      <p style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12,
      }}>
        Weekly Program
      </p>

      {templateLoadError && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, marginBottom: 12,
          background: 'rgba(255,85,85,0.08)',
          border: '1px solid rgba(255,85,85,0.20)',
          fontSize: 11, color: '#FF5555', fontWeight: 600,
        }}>
          ⚠ Could not load your program. Check your connection and refresh.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {templates.map((day, index) => {
          const isToday  = index === 0
          const isActive = activeDay === day.id
          const desc     = day.description || null

          return (
            <div key={day.id}>
              {/* ── DAY CARD ── */}
              <div
                onClick={() => setActiveDay(isActive ? null : day.id)}
                style={{
                  backdropFilter: 'blur(20px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                  background: isToday ? 'rgba(200,255,0,0.08)' : 'rgba(255,255,255,0.04)',
                  border: isActive
                    ? '1px solid rgba(200,255,0,0.40)'
                    : isToday
                      ? '1px solid rgba(200,255,0,0.28)'
                      : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 18,
                  boxShadow: isToday
                    ? '0 0 32px rgba(200,255,0,0.08), inset 0 0.5px 0 rgba(200,255,0,0.15)'
                    : 'inset 0 0.5px 0 rgba(255,255,255,0.07), 0 16px 32px rgba(0,0,0,0.35)',
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {/* Day number badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: isToday ? 'rgba(200,255,0,0.15)' : 'rgba(255,255,255,0.06)',
                  border: isToday ? '1px solid rgba(200,255,0,0.35)' : '1px solid rgba(255,255,255,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                  color: isToday ? '#C8FF00' : 'rgba(255,255,255,0.5)',
                }}>
                  {day.day_number ?? index + 1}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
                    textTransform: 'uppercase', marginBottom: 3,
                    color: isToday ? '#C8FF00' : 'rgba(255,255,255,0.28)',
                  }}>
                    {isToday ? 'Today' : `Day ${day.day_number ?? index + 1}`}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                    {day.name}
                  </div>
                  {desc && (
                    <div style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {desc}
                    </div>
                  )}
                </div>

                {/* Chevron */}
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: isToday ? 'rgba(200,255,0,0.12)' : 'rgba(255,255,255,0.05)',
                  border: isToday ? '1px solid rgba(200,255,0,0.28)' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isToday ? '#C8FF00' : 'rgba(255,255,255,0.30)',
                  fontSize: 14,
                }}>
                  <span style={{
                    display: 'block',
                    transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                    transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▾</span>
                </div>
              </div>

              {/* ── INLINE SESSION EXPANSION ── */}
              {isActive && (
                <div style={{
                  marginTop: 8,
                  animation: 'expandIn 0.35s cubic-bezier(0.4,0,0.2,1)',
                }}>
                  <SessionPanel
                    templateId={day.id}
                    exercises={exercisesByTemplate[day.id] ?? []}
                    lastPerf={lastPerfByExercise}
                    lastPerfBySet={lastPerfBySet}
                  />
                </div>
              )}
            </div>
          )
        })}

        {!templateLoadError && templates.length === 0 && (
          <div style={{ ...glass, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🏗️</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No templates yet</div>
            <div style={{ fontSize: 12, color: C.mid }}>Go to Architect to build your first workout program</div>
          </div>
        )}
      </div>
    </>
  )
}
