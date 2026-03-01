import { supabase } from '@/lib/supabase'

const C = {
  surface:   'rgba(255,255,255,0.04)',
  border:    'rgba(255,255,255,0.08)',
  accent:    '#C8FF00',
  accentDim: 'rgba(200,255,0,0.12)',
  blue:      '#4488FF',
  blueDim:   'rgba(68,136,255,0.14)',
  purple:    '#A855F7',
  red:       '#FF4444',
  redDim:    'rgba(255,68,68,0.12)',
  text:      '#FFFFFF',
  mid:       'rgba(255,255,255,0.55)',
  dim:       'rgba(255,255,255,0.28)',
}

const TABLES = [
  'workout_templates',
  'exercises',
  'template_exercises',
  'workout_logs',
  'set_entries',
] as const

async function fetchTable(name: string) {
  const start = Date.now()
  const { data, error, count } = await supabase
    .from(name)
    .select('*', { count: 'exact' })
    .limit(100)
  return {
    name,
    data: data ?? [],
    error: error?.message ?? null,
    count: count ?? data?.length ?? 0,
    ms: Date.now() - start,
  }
}

export default async function TestBackend() {
  const [results, schemaSet, schemaLog, schemaTe, recentLogs, recentSets] = await Promise.all([
    Promise.all(TABLES.map(fetchTable)),
    supabase.from('set_entries').select('id, log_id, exercise_id, user_id, set_number, weight, reps, rpe, created_at').limit(1),
    supabase.from('workout_logs').select('id, template_id, user_id, performed_at, duration_seconds, body_weight, notes').limit(1),
    supabase.from('template_exercises').select('id, template_id, exercise_id, position, target_sets, target_reps, target_reps_min, target_reps_max').limit(1),
    supabase.from('workout_logs').select('id, user_id, template_id, performed_at').order('performed_at', { ascending: false }).limit(5),
    supabase.from('set_entries').select('id, user_id, exercise_id, set_number, weight, reps, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>
          Supabase · Diagnostic
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: C.text, marginBottom: 6 }}>
          Backend Test
        </h1>
        <p style={{ fontSize: 13, color: C.mid }}>
          Top 100 rows from each table · Go to <a href="/" style={{ color: C.accent, textDecoration: 'none' }}>← Home</a>
        </p>
      </div>

      {/* Schema checks */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 10 }}>
          Schema verification
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { table: 'set_entries',       result: schemaSet },
            { table: 'workout_logs',      result: schemaLog },
            { table: 'template_exercises', result: schemaTe },
          ].map(({ table, result }) => (
            <div key={table} style={{
              padding: '6px 14px', borderRadius: 20,
              background: result.error ? 'rgba(255,68,68,0.12)' : 'rgba(200,255,0,0.10)',
              border: `1px solid ${result.error ? 'rgba(255,68,68,0.25)' : 'rgba(200,255,0,0.25)'}`,
              fontSize: 11, fontWeight: 600,
              color: result.error ? C.red : C.accent,
            }}>
              {result.error
                ? `⚠ ${table}: missing columns — ${result.error}`
                : `✓ ${table}: schema OK`}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: C.dim, marginTop: 8 }}>
          Last checked: {new Date().toLocaleString()}
        </div>
      </div>

      {/* RLS diagnostic note */}
      <div style={{
        marginBottom: 24, padding: '10px 16px', borderRadius: 12,
        background: 'rgba(68,136,255,0.08)', border: '1px solid rgba(68,136,255,0.20)',
        fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
      }}>
        <span style={{ color: C.blue, fontWeight: 700 }}>RLS check: </span>
        If <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>workout_logs</code> or{' '}
        <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>set_entries</code> show 0 rows after logging,
        RLS is rejecting inserts. Each row must have a non-null <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>user_id</code>.
        Any <span style={{ color: C.red, fontWeight: 700 }}>red null</span> in the user_id column below means the fix was not applied.
      </div>

      {/* Recent activity */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 12 }}>
          Recent activity (last 5 rows)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              label: 'workout_logs',
              cols: ['id', 'user_id', 'template_id', 'performed_at'] as const,
              rows: recentLogs.data ?? [],
              error: recentLogs.error?.message ?? null,
            },
            {
              label: 'set_entries',
              cols: ['id', 'user_id', 'exercise_id', 'set_number', 'weight', 'reps', 'created_at'] as const,
              rows: recentSets.data ?? [],
              error: recentSets.error?.message ?? null,
            },
          ].map(({ label, cols, rows, error: qErr }) => (
            <div key={label} style={{
              backdropFilter: 'blur(20px)', background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden',
            }}>
              <div style={{
                padding: '10px 16px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{label}</span>
                {qErr && <span style={{ fontSize: 11, color: C.red }}>⚠ {qErr}</span>}
                {!qErr && rows.length === 0 && <span style={{ fontSize: 11, color: C.dim, fontStyle: 'italic' }}>no rows yet</span>}
              </div>
              {!qErr && rows.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {cols.map(col => (
                          <th key={col} style={{
                            padding: '6px 12px', textAlign: 'left',
                            fontSize: 9, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase',
                            color: C.dim, whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.02)',
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row: any, ri: number) => (
                        <tr key={ri} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                          {cols.map(col => (
                            <td key={col} style={{
                              padding: '6px 12px', fontFamily: 'monospace', whiteSpace: 'nowrap',
                            }}>
                              {col === 'user_id' && (row[col] === null || row[col] === undefined)
                                ? <span style={{ color: C.red, fontWeight: 700 }}>null ← RLS broken</span>
                                : <CellValue value={row[col]} />}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32,
      }}>
        {results.map(r => (
          <div key={r.name} style={{
            padding: '10px 16px', borderRadius: 12,
            background: r.error ? C.redDim : C.accentDim,
            border: `1px solid ${r.error ? 'rgba(255,68,68,0.25)' : 'rgba(200,255,0,0.25)'}`,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: r.error ? C.red : C.accent }}>
              {r.error ? '✗ FAIL' : '✓ OK'}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.name}</div>
            <div style={{ fontSize: 10, color: C.mid }}>
              {r.error ? r.error : `${r.count} rows · ${r.ms}ms`}
            </div>
          </div>
        ))}
      </div>

      {/* Table data */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {results.map(r => (
          <TableSection key={r.name} result={r} />
        ))}
      </div>
    </div>
  )
}

function TableSection({ result }: {
  result: { name: string; data: any[]; error: string | null; count: number; ms: number }
}) {
  const { name, data, error, count, ms } = result

  if (error) {
    return (
      <div style={{
        backdropFilter: 'blur(20px)', background: 'rgba(255,68,68,0.06)',
        border: '1px solid rgba(255,68,68,0.2)', borderRadius: 16, padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.red, background: 'rgba(255,68,68,0.15)', padding: '2px 8px', borderRadius: 99 }}>FAILED</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{name}</span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: C.red, background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: 8 }}>
          {error}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={{
        backdropFilter: 'blur(20px)', background: C.surface,
        border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.mid, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 99 }}>EMPTY</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{name}</span>
          <span style={{ fontSize: 11, color: C.dim, marginLeft: 'auto' }}>{ms}ms</span>
        </div>
        <div style={{ fontSize: 12, color: C.dim, marginTop: 8, fontStyle: 'italic' }}>No rows found in this table.</div>
      </div>
    )
  }

  // Get column names from first row
  const columns = Object.keys(data[0])

  return (
    <div style={{
      backdropFilter: 'blur(20px)', background: C.surface,
      border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden',
      boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.07), 0 20px 40px rgba(0,0,0,0.3)',
    }}>
      {/* Table header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase',
            color: C.accent, background: C.accentDim, padding: '2px 8px', borderRadius: 99,
          }}>✓ {count} rows</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{name}</span>
          <span style={{ fontSize: 10, color: C.dim, fontFamily: 'monospace' }}>
            {columns.length} columns: {columns.join(', ')}
          </span>
        </div>
        <span style={{ fontSize: 10, color: C.dim }}>{ms}ms</span>
      </div>

      {/* Scrollable table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {columns.map(col => (
                <th key={col} style={{
                  padding: '8px 14px', textAlign: 'left',
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase',
                  color: C.dim, whiteSpace: 'nowrap',
                  background: 'rgba(255,255,255,0.02)',
                }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, ri) => (
              <tr key={ri} style={{
                borderBottom: `1px solid rgba(255,255,255,0.04)`,
                background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              }}>
                {columns.map(col => (
                  <td key={col} style={{
                    padding: '8px 14px', color: C.mid,
                    fontFamily: 'monospace', whiteSpace: 'nowrap',
                    maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    <CellValue value={row[col]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {count > 100 && (
        <div style={{ padding: '10px 20px', fontSize: 10, color: C.dim, borderTop: `1px solid ${C.border}`, fontStyle: 'italic' }}>
          Showing 100 of {count} rows
        </div>
      )}
    </div>
  )
}

function CellValue({ value }: { value: any }) {
  if (value === null || value === undefined) {
    return <span style={{ color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>null</span>
  }
  if (typeof value === 'boolean') {
    return <span style={{ color: value ? C.accent : C.red }}>{String(value)}</span>
  }
  if (typeof value === 'number') {
    return <span style={{ color: '#4488FF' }}>{value}</span>
  }
  // UUID pattern
  const str = String(value)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(str)) {
    return <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{str.slice(0, 8)}…</span>
  }
  // Timestamp
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    return <span style={{ color: C.purple }}>{new Date(str).toLocaleString()}</span>
  }
  return <span style={{ color: C.mid }}>{str}</span>
}
