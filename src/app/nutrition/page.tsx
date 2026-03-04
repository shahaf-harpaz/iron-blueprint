'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:           'rgba(255,255,255,0.04)',
  border:       'rgba(255,255,255,0.08)',
  accent:       '#C8FF00',
  accentDim:    'rgba(200,255,0,0.12)',
  accentBorder: 'rgba(200,255,0,0.28)',
  orange:       '#FF9500',
  green:        '#44CC44',
  mid:          'rgba(255,255,255,0.55)',
  dim:          'rgba(255,255,255,0.28)',
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
type MealType = typeof MEAL_TYPES[number]

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch:     'Lunch',
  dinner:    'Dinner',
  snack:     'Snack',
}

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: '#FF9500',
  lunch:     '#60A5FA',
  dinner:    '#A78BFA',
  snack:     '#FACC15',
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Meal {
  id: string
  user_id: string
  nutrition_day_id: string
  meal_type: MealType
  logged_at: string
  kcal: number
  protein_g: number
  notes: string | null
}

interface DayData {
  id: string
  date: string
  meals: Meal[]
}

interface Targets {
  kcal_goal: number
  protein_g: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toLocaleDateString('en-CA')

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  })
}

const inputStyle: React.CSSProperties = {
  background:    'rgba(255,255,255,0.06)',
  border:        '1px solid rgba(255,255,255,0.10)',
  borderRadius:  8,
  padding:       '7px 10px',
  fontSize:      13,
  color:         'rgba(255,255,255,0.85)',
  outline:       'none',
  width:         '100%',
  boxSizing:     'border-box',
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({
  label, value, target, remaining, pct, color,
}: {
  label: string; value: string; target: string
  remaining: string; pct: number; color: string
}) {
  return (
    <div style={{
      backdropFilter:       'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      background:           C.bg,
      border:               `1px solid ${C.border}`,
      borderRadius:         16,
      padding:              '20px 20px 18px',
    }}>
      <div style={{
        fontSize:      11,
        fontWeight:    600,
        color,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom:  8,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontSize:      34,
          fontWeight:    800,
          color:         'rgba(255,255,255,0.95)',
          letterSpacing: '-0.02em',
        }}>
          {value}
        </span>
        <span style={{ fontSize: 13, color: C.dim }}>{target}</span>
      </div>
      <div style={{
        height:       5,
        borderRadius: 3,
        background:   'rgba(255,255,255,0.06)',
        marginTop:    14,
        marginBottom: 8,
      }}>
        <div style={{
          height:     '100%',
          borderRadius: 3,
          width:      `${pct}%`,
          background: color,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ fontSize: 12, color: C.dim }}>{remaining}</div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NutritionPage() {
  const supabase = getSupabaseBrowserClient()

  const [user,         setUser]         = useState<any>(null)
  const [targets,      setTargets]      = useState<Targets>({ kcal_goal: 2500, protein_g: 180 })
  const [daysMap,      setDaysMap]      = useState<Map<string, DayData>>(new Map())
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(() => todayStr())
  const [showForm,     setShowForm]     = useState(false)
  const [form, setForm] = useState<{
    meal_type: MealType; kcal: string; protein_g: string; notes: string; time: string
  }>({
    meal_type: 'breakfast',
    kcal:      '',
    protein_g: '',
    notes:     '',
    time:      new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false }),
  })
  const [saving,        setSaving]        = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error,         setError]         = useState<string | null>(null)

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadMonth = async (userId: string, monthStart: Date) => {
    const y    = monthStart.getFullYear()
    const m    = monthStart.getMonth()
    const from = new Date(y, m, 1).toLocaleDateString('en-CA')
    const to   = new Date(y, m + 1, 0).toLocaleDateString('en-CA')

    const { data: days } = await supabase
      .from('nutrition_days')
      .select('id, date')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to)

    if (!days || days.length === 0) return

    const dayIds = days.map((d: any) => d.id)
    const { data: meals } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .in('nutrition_day_id', dayIds)

    setDaysMap(prev => {
      const next = new Map(prev)
      for (const day of days) {
        next.set(day.date, {
          id:    day.id,
          date:  day.date,
          meals: (meals ?? []).filter((m: any) => m.nutrition_day_id === day.id),
        })
      }
      return next
    })
  }

  // On mount: auth + targets + current month
  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      // Fetch targets; upsert defaults if not found
      const { data: t } = await supabase
        .from('nutrition_targets')
        .select('kcal_goal, protein_g')
        .eq('user_id', user.id)
        .single()

      if (t) {
        setTargets(t)
      } else {
        await supabase
          .from('nutrition_targets')
          .upsert(
            { user_id: user.id, kcal_goal: 2500, protein_g: 180, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' },
          )
        setTargets({ kcal_goal: 2500, protein_g: 180 })
      }

      await loadMonth(user.id, currentMonth)
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when navigating months
  useEffect(() => {
    if (user) loadMonth(user.id, currentMonth)
  }, [currentMonth]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived values ──────────────────────────────────────────────────────────
  const todayData      = daysMap.get(todayStr())
  const todayKcal      = todayData?.meals.reduce((s, m) => s + (m.kcal ?? 0), 0) ?? 0
  const todayProtein   = todayData?.meals.reduce((s, m) => s + (m.protein_g ?? 0), 0) ?? 0
  const selectedData   = daysMap.get(selectedDate)
  const selectedKcal   = selectedData?.meals.reduce((s, m) => s + (m.kcal ?? 0), 0) ?? 0
  const selectedProt   = selectedData?.meals.reduce((s, m) => s + (m.protein_g ?? 0), 0) ?? 0
  const kcalPct        = Math.min((todayKcal / Math.max(targets.kcal_goal, 1)) * 100, 100)
  const proteinPct     = Math.min((todayProtein / Math.max(targets.protein_g, 1)) * 100, 100)

  // Calendar geometry
  const year        = currentMonth.getFullYear()
  const month       = currentMonth.getMonth()
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel  = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Meals grouped by type for selected day
  const mealsByType = Object.fromEntries(
    MEAL_TYPES.map(t => [t, selectedData?.meals.filter(m => m.meal_type === t) ?? []])
  ) as Record<MealType, Meal[]>

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(year, month, day).toLocaleDateString('en-CA'))
    setShowForm(false)
    setDeleteConfirm(null)
    setError(null)
    // Scroll to day detail
    setTimeout(() => {
      document.getElementById('day-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const handleSave = async () => {
    if (!user) return
    if (!form.kcal) { setError('Calories is required'); return }
    setSaving(true)
    setError(null)

    // Upsert the day row (idempotent)
    const { data: day, error: dayErr } = await supabase
      .from('nutrition_days')
      .upsert({ user_id: user.id, date: selectedDate }, { onConflict: 'user_id,date' })
      .select('id')
      .single()

    if (dayErr || !day) {
      setError(dayErr?.message ?? 'Failed to create day')
      setSaving(false)
      return
    }

    const { error: mealErr } = await supabase.from('meals').insert({
      user_id:          user.id,
      nutrition_day_id: day.id,
      meal_type:        form.meal_type,
      logged_at:        form.time || '12:00',
      kcal:             parseInt(form.kcal) || 0,
      protein_g:        parseInt(form.protein_g) || 0,
      notes:            form.notes || null,
    })

    if (mealErr) {
      setError(mealErr.message)
      setSaving(false)
      return
    }

    setShowForm(false)
    setForm(f => ({
      ...f,
      kcal:      '',
      protein_g: '',
      notes:     '',
      time: new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false }),
    }))
    await loadMonth(user.id, currentMonth)
    setSaving(false)
  }

  const handleDelete = async (mealId: string) => {
    if (!user) return
    await supabase.from('meals').delete().eq('id', mealId).eq('user_id', user.id)
    setDeleteConfirm(null)
    await loadMonth(user.id, currentMonth)
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
        Nutrition
      </h1>

      {/* ── Section 1: Daily Summary Strip ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SummaryCard
          label="Calories"
          value={todayKcal.toLocaleString()}
          target={`/ ${targets.kcal_goal.toLocaleString()} kcal`}
          remaining={`${Math.max(targets.kcal_goal - todayKcal, 0).toLocaleString()} kcal remaining`}
          pct={kcalPct}
          color={C.orange}
        />
        <SummaryCard
          label="Protein"
          value={`${todayProtein}g`}
          target={`/ ${targets.protein_g}g`}
          remaining={`${Math.max(targets.protein_g - todayProtein, 0)}g remaining`}
          pct={proteinPct}
          color={C.green}
        />
      </div>

      {/* ── Section 2: Calendar ─────────────────────────────────────────────── */}
      <div style={{
        backdropFilter:       'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        background:           C.bg,
        border:               `1px solid ${C.border}`,
        borderRadius:         16,
        padding:              20,
      }}>
        {/* Month nav */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   16,
        }}>
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.mid, fontSize: 22, padding: '2px 8px', lineHeight: 1,
            }}
          >‹</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
            {monthLabel}
          </span>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.mid, fontSize: 22, padding: '2px 8px', lineHeight: 1,
            }}
          >›</button>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} style={{
              textAlign:    'center',
              fontSize:     10,
              fontWeight:   600,
              color:        C.dim,
              paddingBottom: 8,
            }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {/* Offset cells */}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day      = i + 1
            const dateStr  = new Date(year, month, day).toLocaleDateString('en-CA')
            const isToday  = dateStr === todayStr()
            const isSel    = dateStr === selectedDate
            const hasMeals = (daysMap.get(dateStr)?.meals.length ?? 0) > 0

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                style={{
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  padding:        '8px 2px',
                  borderRadius:   10,
                  cursor:         'pointer',
                  minHeight:      44,
                  border:   isToday  ? `1.5px solid ${C.accent}`
                          : isSel    ? `1.5px solid ${C.accentBorder}`
                          :            '1.5px solid transparent',
                  background: isSel ? C.accentDim : 'transparent',
                  transition: 'all 0.12s',
                }}
              >
                <span style={{
                  fontSize:   13,
                  lineHeight: 1,
                  fontWeight: isToday || isSel ? 700 : 400,
                  color:      isToday ? C.accent
                            : isSel   ? 'rgba(255,255,255,0.9)'
                            :            'rgba(255,255,255,0.5)',
                }}>{day}</span>
                {hasMeals && (
                  <div style={{
                    width:        4,
                    height:       4,
                    borderRadius: '50%',
                    background:   C.orange,
                    marginTop:    3,
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: Day Detail ────────────────────────────────────────────── */}
      <div
        id="day-detail"
        style={{
          backdropFilter:       'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          background:           C.bg,
          border:               `1px solid ${C.border}`,
          borderRadius:         16,
          padding:              20,
        }}
      >
        {/* Header */}
        <div style={{
          display:        'flex',
          alignItems:     'flex-start',
          justifyContent: 'space-between',
          marginBottom:   16,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
              {formatDate(selectedDate)}
            </div>
            <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>
              {selectedKcal.toLocaleString()} kcal · {selectedProt}g protein
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background:   C.accentDim,
                border:       `1px solid ${C.accentBorder}`,
                borderRadius: 10,
                padding:      '8px 14px',
                fontSize:     12,
                fontWeight:   600,
                color:        C.accent,
                cursor:       'pointer',
                whiteSpace:   'nowrap',
              }}
            >
              + Add Meal
            </button>
          )}
        </div>

        {/* Add meal form */}
        {showForm && (
          <div style={{
            background:   'rgba(255,255,255,0.03)',
            border:       '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding:      16,
            marginBottom: 20,
          }}>
            {/* Meal type pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {MEAL_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, meal_type: t }))}
                  style={{
                    padding:    '5px 12px',
                    borderRadius: 20,
                    fontSize:   11,
                    fontWeight: 600,
                    cursor:     'pointer',
                    border:     `1px solid ${form.meal_type === t ? MEAL_COLORS[t] : 'rgba(255,255,255,0.10)'}`,
                    background: form.meal_type === t ? `${MEAL_COLORS[t]}22` : 'transparent',
                    color:      form.meal_type === t ? MEAL_COLORS[t] : C.dim,
                    transition: 'all 0.12s',
                  }}
                >
                  {MEAL_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Numeric inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: C.dim, display: 'block', marginBottom: 4 }}>
                  Calories *
                </label>
                <input
                  type="number"
                  value={form.kcal}
                  onChange={e => setForm(f => ({ ...f, kcal: e.target.value }))}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.dim, display: 'block', marginBottom: 4 }}>
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={form.protein_g}
                  onChange={e => setForm(f => ({ ...f, protein_g: e.target.value }))}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.dim, display: 'block', marginBottom: 4 }}>
                  Time
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: C.dim, display: 'block', marginBottom: 4 }}>
                Notes (optional)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. chicken + rice"
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ fontSize: 11, color: '#F87171', marginBottom: 10 }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding:    '8px 18px',
                  borderRadius: 9,
                  fontSize:   12,
                  fontWeight: 700,
                  background: C.accentDim,
                  border:     `1px solid ${C.accentBorder}`,
                  color:      C.accent,
                  cursor:     saving ? 'wait' : 'pointer',
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(null) }}
                style={{
                  padding:    '8px 18px',
                  borderRadius: 9,
                  fontSize:   12,
                  fontWeight: 600,
                  background: 'transparent',
                  border:     '1px solid rgba(255,255,255,0.10)',
                  color:      C.dim,
                  cursor:     'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Meal list grouped by type */}
        {MEAL_TYPES.map(type => {
          const meals = mealsByType[type]
          if (!meals || meals.length === 0) return null
          const color = MEAL_COLORS[type]

          return (
            <div key={type} style={{ marginBottom: 14 }}>
              <div style={{
                fontSize:      10,
                fontWeight:    700,
                color,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom:  8,
              }}>
                {MEAL_LABELS[type]}
              </div>

              {meals.map(meal => (
                <div key={meal.id} style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        12,
                  padding:    '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border:     '1px solid rgba(255,255,255,0.06)',
                  marginBottom: 6,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                        {meal.kcal.toLocaleString()} kcal
                      </span>
                      <span style={{ fontSize: 12, color: C.green }}>{meal.protein_g}g protein</span>
                      <span style={{ fontSize: 11, color: C.dim }}>{meal.logged_at?.slice(0, 5)}</span>
                    </div>
                    {meal.notes && (
                      <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>{meal.notes}</div>
                    )}
                  </div>

                  {deleteConfirm === meal.id ? (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        style={{
                          padding:    '4px 10px',
                          borderRadius: 6,
                          fontSize:   11,
                          fontWeight: 700,
                          background: 'rgba(248,113,113,0.15)',
                          border:     '1px solid rgba(248,113,113,0.4)',
                          color:      '#F87171',
                          cursor:     'pointer',
                        }}
                      >Delete</button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{
                          padding:    '4px 8px',
                          borderRadius: 6,
                          fontSize:   11,
                          background: 'transparent',
                          border:     '1px solid rgba(255,255,255,0.10)',
                          color:      C.dim,
                          cursor:     'pointer',
                        }}
                      >Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(meal.id)}
                      title="Delete meal"
                      style={{
                        background: 'transparent',
                        border:     'none',
                        cursor:     'pointer',
                        color:      'rgba(255,255,255,0.18)',
                        fontSize:   20,
                        padding:    '2px 6px',
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >×</button>
                  )}
                </div>
              ))}
            </div>
          )
        })}

        {/* Empty state */}
        {(!selectedData || selectedData.meals.length === 0) && !showForm && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.dim, fontSize: 13 }}>
            No meals logged for this day.
          </div>
        )}
      </div>
    </div>
  )
}
