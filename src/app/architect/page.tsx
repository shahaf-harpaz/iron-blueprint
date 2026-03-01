'use client'
import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const C = {
  accent:       '#C8FF00',
  accentDim:    'rgba(200,255,0,0.12)',
  accentBorder: 'rgba(200,255,0,0.28)',
  text:         '#fff',
  mid:          'rgba(255,255,255,0.55)',
  dim:          'rgba(255,255,255,0.28)',
  border:       'rgba(255,255,255,0.08)',
  red:          '#FF5555',
}

const inputStyle: React.CSSProperties = {
  background:   'rgba(255,255,255,0.06)',
  border:       '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  padding:      '8px 12px',
  color:        '#fff',
  fontSize:     13,
  width:        '100%',
  outline:      'none',
  boxSizing:    'border-box',
}

const glassCard: React.CSSProperties = {
  backdropFilter:       'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  background:           'rgba(255,255,255,0.04)',
  border:               '1px solid rgba(255,255,255,0.08)',
  borderRadius:         16,
  padding:              20,
}

// ─── DAYS TAB ─────────────────────────────────────────────────────────────────
function DaysTab() {
  const [templates, setTemplates] = useState<any[]>([])
  const [editState, setEditState] = useState<Record<string, {
    name:   string
    desc:   string
    saving: boolean
    saved:  boolean
    error:  string | null
  }>>({})

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase
      .from('workout_templates')
      .select('id, day_number, name, description')
      .order('day_number')
      .then(({ data }: { data: any[] | null }) => {
        if (data) {
          setTemplates(data)
          const init: typeof editState = {}
          for (const t of data) {
            init[t.id] = { name: t.name ?? '', desc: t.description ?? '', saving: false, saved: false, error: null }
          }
          setEditState(init)
        }
      })
  }, [])

  const save = async (id: string) => {
    const s = editState[id]
    if (!s) return
    setEditState(prev => ({ ...prev, [id]: { ...prev[id], saving: true, error: null } }))
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase
      .from('workout_templates')
      .update({ name: s.name, description: s.desc })
      .eq('id', id)
    if (error) {
      setEditState(prev => ({ ...prev, [id]: { ...prev[id], saving: false, error: error.message } }))
    } else {
      setEditState(prev => ({ ...prev, [id]: { ...prev[id], saving: false, saved: true, error: null } }))
      setTimeout(() => {
        setEditState(prev => ({ ...prev, [id]: { ...prev[id], saved: false } }))
      }, 2000)
    }
  }

  if (templates.length === 0) {
    return <div style={{ color: C.dim, fontSize: 13 }}>Loading days…</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {templates.map(t => {
        const es = editState[t.id]
        if (!es) return null
        return (
          <div key={t.id} style={glassCard}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.dim, marginBottom: 12 }}>
              Day {t.day_number}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: C.dim, marginBottom: 5 }}>Name</div>
                <input
                  style={inputStyle}
                  value={es.name}
                  onChange={e => setEditState(prev => ({ ...prev, [t.id]: { ...prev[t.id], name: e.target.value } }))}
                  placeholder="Day name…"
                />
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.dim, marginBottom: 5 }}>Description</div>
                <input
                  style={inputStyle}
                  value={es.desc}
                  onChange={e => setEditState(prev => ({ ...prev, [t.id]: { ...prev[t.id], desc: e.target.value } }))}
                  placeholder="Description…"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => save(t.id)}
                  disabled={es.saving}
                  style={{
                    padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: C.accentDim, border: `1px solid ${C.accentBorder}`, color: C.accent,
                    opacity: es.saving ? 0.6 : 1,
                  }}
                >
                  {es.saving ? 'Saving…' : 'Save'}
                </button>
                {es.saved && (
                  <span style={{ fontSize: 11, color: '#44CC44', fontWeight: 600 }}>✓ Saved</span>
                )}
                {es.error && (
                  <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>⚠ {es.error}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── EDIT EXERCISE FORM ───────────────────────────────────────────────────────
function EditExerciseForm({
  exercise,
  onSave,
  onCancel,
}: {
  exercise: any
  onSave: (updated: any) => Promise<void>
  onCancel: () => void
}) {
  const [name,           setName]         = useState(exercise.name ?? '')
  const [muscleGroup,    setMuscleGroup]  = useState(exercise.muscle_group ?? '')
  const [targetMuscle,   setTargetMuscle] = useState(exercise.target_muscle ?? '')
  const [tempo,          setTempo]        = useState(exercise.tempo_instruction ?? '')
  const [defaultSets,    setDefaultSets]  = useState(exercise.default_sets ?? 3)
  const [technicalNotes, setNotes]        = useState(exercise.technical_notes ?? '')
  const [saving,         setSaving]       = useState(false)
  const [error,          setError]        = useState('')

  // Slightly compact style for edit form inputs
  const fi: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 9, padding: '7px 11px', color: '#fff', fontSize: 12,
    width: '100%', outline: 'none', boxSizing: 'border-box',
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    await onSave({
      name, muscle_group: muscleGroup, target_muscle: targetMuscle,
      tempo_instruction: tempo, default_sets: defaultSets, technical_notes: technicalNotes,
    })
    setSaving(false)
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4,
  }

  return (
    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 4 }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={fi} />
        </div>
        <div>
          <label style={labelStyle}>Muscle Group</label>
          <input value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} style={fi} />
        </div>
        <div>
          <label style={labelStyle}>Target Muscle</label>
          <input value={targetMuscle} onChange={e => setTargetMuscle(e.target.value)} style={fi} />
        </div>
        <div>
          <label style={labelStyle}>Tempo (e.g. 3-0-1)</label>
          <input value={tempo} onChange={e => setTempo(e.target.value)} style={fi} />
        </div>
        <div>
          <label style={labelStyle}>Default Sets</label>
          <input
            type="number" min={1} max={10}
            value={defaultSets}
            onChange={e => setDefaultSets(Number(e.target.value))}
            style={{ ...fi, width: 80 }}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Technical Notes</label>
        <textarea
          value={technicalNotes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          style={{ ...fi, resize: 'vertical' }}
        />
      </div>

      {error && (
        <div style={{ fontSize: 11, color: '#F87171', fontWeight: 600 }}>⚠ {error}</div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{
          padding: '7px 16px', borderRadius: 9, fontSize: 11, fontWeight: 700,
          background: 'transparent', border: '1px solid rgba(255,255,255,0.10)',
          color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
        }}>Cancel</button>
        <button type="button" onClick={handleSave} disabled={saving} style={{
          padding: '7px 16px', borderRadius: 9, fontSize: 11, fontWeight: 700,
          background: 'rgba(200,255,0,0.12)', border: '1px solid rgba(200,255,0,0.28)',
          color: '#C8FF00', cursor: saving ? 'wait' : 'pointer',
        }}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>
    </div>
  )
}

// ─── EXERCISES TAB ────────────────────────────────────────────────────────────
function ExercisesTab() {
  const [exercises, setExercises] = useState<any[]>([])
  const [search, setSearch]       = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', muscle_group: '', target_muscle: '', tempo_instruction: '', technical_notes: '',
  })
  const [newDefaultSets, setNewDefaultSets] = useState(3)
  const [addSaving, setAddSaving]   = useState(false)
  const [addError, setAddError]     = useState<string | null>(null)
  const [addSuccess, setAddSuccess] = useState(false)

  const fetchExercises = async () => {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .order('muscle_group')
      .order('name')
    if (data) setExercises(data)
  }

  useEffect(() => { fetchExercises() }, [])

  const q = search.toLowerCase()
  const filtered = exercises.filter(e =>
    e.name?.toLowerCase().includes(q) || e.muscle_group?.toLowerCase().includes(q)
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddSaving(true)
    setAddError(null)
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from('exercises').insert({
      name:               form.name,
      muscle_group:       form.muscle_group,
      target_muscle:      form.target_muscle,
      tempo_instruction:  form.tempo_instruction,
      technical_notes:    form.technical_notes,
      default_sets:       newDefaultSets,
    })
    if (error) {
      setAddError(error.message)
    } else {
      setAddSuccess(true)
      setForm({ name: '', muscle_group: '', target_muscle: '', tempo_instruction: '', technical_notes: '' })
      setNewDefaultSets(3)
      setShowForm(false)
      await fetchExercises()
      setTimeout(() => setAddSuccess(false), 2000)
    }
    setAddSaving(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, width: 'auto', flex: 1 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search exercises…"
        />
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          style={{
            padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: showForm ? C.accentDim : 'rgba(255,255,255,0.06)',
            border: `1px solid ${showForm ? C.accentBorder : C.border}`,
            color: showForm ? C.accent : C.mid,
            flexShrink: 0,
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Exercise'}
        </button>
      </div>

      {addSuccess && (
        <div style={{ fontSize: 11, color: '#44CC44', fontWeight: 600, marginBottom: 12 }}>✓ Exercise added</div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} style={{ ...glassCard, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.dim, marginBottom: 14 }}>
            New Exercise
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {([
              { key: 'name',              label: 'Name' },
              { key: 'muscle_group',      label: 'Muscle Group' },
              { key: 'target_muscle',     label: 'Target Muscle' },
              { key: 'tempo_instruction', label: 'Tempo Instruction' },
            ] as const).map(({ key, label }) => (
              <div key={key}>
                <div style={{ fontSize: 10, color: C.dim, marginBottom: 5 }}>{label}</div>
                <input
                  style={inputStyle}
                  value={form[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={`${label}…`}
                  required={key === 'name'}
                />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 10, color: C.dim, marginBottom: 5 }}>Default Sets</div>
              <input
                type="number" min={1} max={10}
                style={{ ...inputStyle, width: 80 }}
                value={newDefaultSets}
                onChange={e => setNewDefaultSets(Number(e.target.value))}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.dim, marginBottom: 5 }}>Technical Notes</div>
              <input
                style={inputStyle}
                value={form.technical_notes}
                onChange={e => setForm(prev => ({ ...prev, technical_notes: e.target.value }))}
                placeholder="Technical Notes…"
              />
            </div>
            {addError && (
              <div style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>⚠ {addError}</div>
            )}
            <button
              type="submit"
              disabled={addSaving}
              style={{
                padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: C.accentDim, border: `1px solid ${C.accentBorder}`, color: C.accent,
                opacity: addSaving ? 0.6 : 1, marginTop: 4,
              }}
            >
              {addSaving ? 'Adding…' : 'Add Exercise'}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filtered.map(ex => (
          <div key={ex.id} style={{
            backdropFilter: 'blur(20px)',
            background: editingId === ex.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${editingId === ex.id ? 'rgba(200,255,0,0.25)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 12,
            marginBottom: 6,
            overflow: 'hidden',
            transition: 'all 0.2s',
          }}>
            {/* Row header — always visible */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{ex.name}</span>
                {ex.muscle_group && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginLeft: 10 }}>
                    {ex.muscle_group}
                  </span>
                )}
              </div>
              {ex.tempo_instruction && (
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginRight: 8 }}>
                  {ex.tempo_instruction}
                </span>
              )}
              <button
                type="button"
                onClick={() => setEditingId(editingId === ex.id ? null : ex.id)}
                style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                  background: editingId === ex.id ? 'rgba(200,255,0,0.10)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${editingId === ex.id ? 'rgba(200,255,0,0.28)' : 'rgba(255,255,255,0.10)'}`,
                  color: editingId === ex.id ? '#C8FF00' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                }}
              >
                {editingId === ex.id ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Inline edit form — only shown when editing */}
            {editingId === ex.id && (
              <EditExerciseForm
                exercise={ex}
                onSave={async (updated) => {
                  const supabase = getSupabaseBrowserClient()
                  const { error } = await supabase.from('exercises').update(updated).eq('id', ex.id)
                  if (!error) {
                    setEditingId(null)
                    fetchExercises()
                  }
                }}
                onCancel={() => setEditingId(null)}
              />
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ fontSize: 12, color: C.dim, padding: '12px 0' }}>No exercises found.</div>
        )}
      </div>
    </div>
  )
}

// ─── EXERCISE IN DAY ROW ──────────────────────────────────────────────────────
function ExerciseInDayRow({
  te,
  onRemove,
  onUpdateSets,
}: {
  te: any
  onRemove: (id: string) => void
  onUpdateSets: (id: string, sets: number) => Promise<void>
}) {
  const ex = te.exercises as any
  const [sets, setSets]     = useState<number>(te.target_sets ?? 3)
  const [saving, setSaving] = useState(false)

  const handleSetsChange = async (newVal: number) => {
    if (newVal === te.target_sets) return
    setSaving(true)
    await onUpdateSets(te.id, newVal)
    setSaving(false)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 10, marginBottom: 6,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>⠿</span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', width: 16 }}>
        {te.position}
      </span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#fff' }}>
        {ex?.name}
      </span>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
        {ex?.muscle_group}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>sets</span>
        <input
          type="number" min={1} max={20}
          value={sets}
          onChange={e => setSets(Number(e.target.value))}
          onBlur={e => handleSetsChange(Number(e.target.value))}
          onKeyDown={e => { if (e.key === 'Enter') handleSetsChange(sets) }}
          style={{
            width: 44, padding: '4px 6px', borderRadius: 7, textAlign: 'center',
            background: saving ? 'rgba(200,255,0,0.08)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${saving ? 'rgba(200,255,0,0.3)' : 'rgba(255,255,255,0.12)'}`,
            color: '#C8FF00', fontSize: 13, fontWeight: 800, outline: 'none',
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(te.id)}
        style={{
          width: 24, height: 24, borderRadius: 6, border: 'none',
          background: 'rgba(248,113,113,0.10)',
          color: '#F87171', fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >✕</button>
    </div>
  )
}

// ─── PROGRAM TAB ──────────────────────────────────────────────────────────────
function ProgramTab() {
  const [templates, setTemplates]               = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [templateExercises, setTemplateExercises]   = useState<any[]>([])
  const [allExercises, setAllExercises]             = useState<any[]>([])
  const [addSearch, setAddSearch]                   = useState('')
  const [newSets, setNewSets]                       = useState(3)
  const [selectedExercise, setSelectedExercise]     = useState<any>(null)
  const [opError, setOpError]                       = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    Promise.all([
      supabase.from('workout_templates').select('id, day_number, name').order('day_number'),
      supabase.from('exercises').select('id, name, muscle_group, default_sets').order('name'),
    ]).then(([{ data: tData }, { data: eData }]) => {
      if (tData) setTemplates(tData)
      if (eData) setAllExercises(eData)
    })
  }, [])

  const fetchTemplateExercises = async (templateId: string) => {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
      .from('template_exercises')
      .select('id, position, target_sets, target_reps, exercises(id, name, muscle_group)')
      .eq('template_id', templateId)
      .order('position')
    if (data) setTemplateExercises(data)
  }

  const selectTemplate = (id: string) => {
    setSelectedTemplateId(id)
    setOpError(null)
    fetchTemplateExercises(id)
  }

  const removeExercise = async (templateExerciseId: string) => {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase
      .from('template_exercises')
      .delete()
      .eq('id', templateExerciseId)
    if (error) {
      setOpError(error.message)
    } else if (selectedTemplateId) {
      fetchTemplateExercises(selectedTemplateId)
    }
  }

  const handleSelectExercise = (exercise: any) => {
    setSelectedExercise(exercise)
    setNewSets(exercise.default_sets ?? 3)
  }

  const handleUpdateSets = async (templateExerciseId: string, newSetCount: number) => {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase
      .from('template_exercises')
      .update({ target_sets: newSetCount })
      .eq('id', templateExerciseId)
    if (!error && selectedTemplateId) {
      fetchTemplateExercises(selectedTemplateId)
    }
  }

  const addExercise = async (exercise: any) => {
    if (!selectedTemplateId) return
    setOpError(null)
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from('template_exercises').insert({
      template_id:     selectedTemplateId,
      exercise_id:     exercise.id,
      position:        templateExercises.length + 1,
      target_sets:     newSets,
      target_reps:     '8-10',
      target_reps_min: 8,
      target_reps_max: 10,
    })
    if (error) {
      setOpError(error.message)
    } else {
      setNewSets(3)
      setSelectedExercise(null)
      fetchTemplateExercises(selectedTemplateId)
    }
  }

  const filteredAdd = allExercises.filter(e =>
    e.name?.toLowerCase().includes(addSearch.toLowerCase()) ||
    e.muscle_group?.toLowerCase().includes(addSearch.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Left column — template list */}
      <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>
          Days
        </div>
        {templates.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTemplate(t.id)}
            style={{
              padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', textAlign: 'left',
              background: selectedTemplateId === t.id ? C.accentDim : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedTemplateId === t.id ? C.accentBorder : C.border}`,
              color: selectedTemplateId === t.id ? C.accent : C.mid,
            }}
          >
            Day {t.day_number}{t.name ? ` — ${t.name}` : ''}
          </button>
        ))}
      </div>

      {/* Right column — exercise list + add */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedTemplateId === null ? (
          <div style={{ fontSize: 13, color: C.dim, paddingTop: 40 }}>← Select a day to manage its exercises</div>
        ) : (
          <>
            {opError && (
              <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 12 }}>⚠ {opError}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {templateExercises.length === 0 && (
                <div style={{ fontSize: 12, color: C.dim, fontStyle: 'italic' }}>No exercises assigned to this day yet.</div>
              )}
              {templateExercises.map(te => (
                <ExerciseInDayRow
                  key={te.id}
                  te={te}
                  onRemove={removeExercise}
                  onUpdateSets={handleUpdateSets}
                />
              ))}
            </div>

            <div style={{ ...glassCard }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.dim, marginBottom: 12 }}>
                Add Exercise to Day
              </div>
              <input
                style={{ ...inputStyle, marginBottom: 10 }}
                value={addSearch}
                onChange={e => setAddSearch(e.target.value)}
                placeholder="Search exercises to add…"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto', marginBottom: 10 }}>
                {filteredAdd.map(e => {
                  const isSelected = selectedExercise?.id === e.id
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => handleSelectExercise(e)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 12px', borderRadius: 8,
                        background: isSelected ? 'rgba(200,255,0,0.08)' : 'transparent',
                        border: `1px solid ${isSelected ? 'rgba(200,255,0,0.28)' : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: isSelected ? C.accent : C.text }}>{e.name}</span>
                      {e.muscle_group && <span style={{ fontSize: 11, color: C.dim }}>{e.muscle_group}</span>}
                    </button>
                  )
                })}
              </div>
              {selectedExercise && (
                <button
                  type="button"
                  onClick={() => addExercise(selectedExercise)}
                  style={{
                    width: '100%', padding: '9px 14px', borderRadius: 10,
                    background: C.accentDim, border: `1px solid ${C.accentBorder}`,
                    color: C.accent, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  + Add {selectedExercise.name} ({newSets} sets)
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── ARCHITECT PAGE ───────────────────────────────────────────────────────────
export default function ArchitectPage() {
  const [tab, setTab] = useState<'days' | 'exercises' | 'program'>('days')

  const tabs: { id: 'days' | 'exercises' | 'program'; label: string }[] = [
    { id: 'days',      label: 'Days' },
    { id: 'exercises', label: 'Exercises' },
    { id: 'program',   label: 'Program' },
  ]

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>
          Iron Blueprint · Architect
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: C.text, margin: 0 }}>
          Architect
        </h1>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: tab === t.id ? 'rgba(200,255,0,0.10)' : 'transparent',
              border: `1px solid ${tab === t.id ? 'rgba(200,255,0,0.28)' : 'transparent'}`,
              color: tab === t.id ? '#C8FF00' : 'rgba(255,255,255,0.4)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'days'      && <DaysTab />}
      {tab === 'exercises' && <ExercisesTab />}
      {tab === 'program'   && <ProgramTab />}
    </div>
  )
}
