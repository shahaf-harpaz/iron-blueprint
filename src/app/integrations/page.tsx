'use client'
import { useState, useEffect, useCallback } from 'react'
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
  red:          '#F87171',
  blue:         '#60A5FA',
  purple:       '#A78BFA',
  orange:       '#FB923C',
}

const glass: React.CSSProperties = {
  backdropFilter:       'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  background:           'rgba(255,255,255,0.04)',
  border:               '1px solid rgba(255,255,255,0.08)',
  borderRadius:         16,
  padding:              20,
}

function generateToken() {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
        background: copied ? C.accentDim : 'rgba(255,255,255,0.06)',
        border: `1px solid ${copied ? C.accentBorder : 'rgba(255,255,255,0.10)'}`,
        color: copied ? C.accent : C.mid,
        cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
      }}
    >
      {copied ? '✓ Copied' : (label ?? 'Copy')}
    </button>
  )
}

function HealthChip({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: '12px 16px', minWidth: 80,
    }}>
      <div style={{ fontSize: 18, fontWeight: 900, color, letterSpacing: '-0.02em' }}>
        {value}{unit && <span style={{ fontSize: 11, fontWeight: 600, color: C.dim, marginLeft: 2 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.dim, marginTop: 4 }}>
        {label}
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  const [token,       setToken]       = useState<string | null>(null)
  const [tokenId,     setTokenId]     = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [lastSync,    setLastSync]    = useState<any>(null)
  const [error,       setError]       = useState<string | null>(null)
  const [showToken,   setShowToken]   = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const endpoint    = `${supabaseUrl}/functions/v1/health-sync`

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [{ data: tokenData }, { data: syncData }] = await Promise.all([
      supabase.from('sync_tokens').select('id, token').eq('user_id', user.id).single(),
      supabase.from('health_sync').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(1).single(),
    ])

    if (tokenData) {
      setToken(tokenData.token)
      setTokenId(tokenData.id)
    }
    if (syncData) setLastSync(syncData)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleRegenerate = async () => {
    setRegenerating(true)
    setError(null)
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setRegenerating(false); return }

    const newToken = generateToken()

    if (tokenId) {
      const { error: err } = await supabase
        .from('sync_tokens')
        .update({ token: newToken })
        .eq('id', tokenId)
        .eq('user_id', user.id)
      if (err) { setError(err.message); setRegenerating(false); return }
    } else {
      const { data, error: err } = await supabase
        .from('sync_tokens')
        .insert({ user_id: user.id, token: newToken })
        .select('id')
        .single()
      if (err) { setError(err.message); setRegenerating(false); return }
      if (data) setTokenId(data.id)
    }

    setToken(newToken)
    setShowToken(true)
    setRegenerating(false)
  }

  const today = new Date().toLocaleDateString('en-CA')
  const isSyncedToday = lastSync?.date === today

  const jsonTemplate = JSON.stringify({
    steps:              8500,
    sleep_hours:        7.5,
    resting_heart_rate: 58,
    hrv:                45,
    active_calories:    420,
    stand_hours:        10,
    date:               today,
  }, null, 2)

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>
          Iron Blueprint · Integrations
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', color: C.text, margin: 0 }}>
          Integrations
        </h1>
        <div style={{ fontSize: 13, color: C.mid, marginTop: 6 }}>
          Connect Apple Health via iPhone Shortcuts to sync daily metrics.
        </div>
      </div>

      {/* ── Apple Health card ── */}
      <div style={{ ...glass, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #FF6B6B, #FF4500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>❤️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Apple Health</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Steps · Sleep · HRV · Heart Rate · Active Calories</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{
              padding: '4px 12px', borderRadius: 999, fontSize: 10, fontWeight: 800,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: isSyncedToday ? 'rgba(200,255,0,0.12)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isSyncedToday ? C.accentBorder : C.border}`,
              color: isSyncedToday ? C.accent : C.dim,
            }}>
              {isSyncedToday ? '● Synced today' : 'Not synced'}
            </div>
          </div>
        </div>

        {lastSync && (
          <>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.dim, marginBottom: 10 }}>
              Last sync — {lastSync.date}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <HealthChip label="Health Score" value={lastSync.health_score ?? 0}      color={C.accent} />
              <HealthChip label="Steps"        value={(lastSync.steps ?? 0).toLocaleString()} color={C.blue} />
              <HealthChip label="Sleep"        value={lastSync.sleep_hours ?? 0}       unit="h" color={C.purple} />
              <HealthChip label="HRV"          value={lastSync.hrv ?? 0}              unit="ms" color="#34D399" />
              <HealthChip label="Resting HR"   value={lastSync.resting_heart_rate ?? 0} unit="bpm" color={C.orange} />
              <HealthChip label="Active Cal"   value={lastSync.active_calories ?? 0}  color={C.red} />
              <HealthChip label="Stand Hrs"    value={lastSync.stand_hours ?? 0}      unit="h" color="#F9A8D4" />
            </div>
          </>
        )}
        {!lastSync && !loading && (
          <div style={{ fontSize: 12, color: C.dim, fontStyle: 'italic' }}>
            No health data yet. Follow the setup steps below to start syncing.
          </div>
        )}
      </div>

      {/* ── Sync Token ── */}
      <div style={{ ...glass, marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.dim, marginBottom: 14 }}>
          Sync Token
        </div>
        <div style={{ fontSize: 12, color: C.mid, marginBottom: 14 }}>
          This secret token authenticates your iPhone Shortcut. Keep it private.
        </div>

        {loading ? (
          <div style={{ fontSize: 12, color: C.dim }}>Loading…</div>
        ) : token ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                flex: 1, fontFamily: 'monospace', fontSize: 11,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '10px 14px',
                color: C.mid, letterSpacing: '0.02em',
                wordBreak: 'break-all',
              }}>
                {showToken ? token : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowToken(v => !v)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                  color: C.mid, cursor: 'pointer',
                }}
              >
                {showToken ? 'Hide' : 'Show'}
              </button>
              <CopyButton text={token} label="Copy Token" />
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                  color: C.red, cursor: regenerating ? 'wait' : 'pointer',
                  opacity: regenerating ? 0.6 : 1,
                }}
              >
                {regenerating ? 'Regenerating…' : 'Regenerate'}
              </button>
            </div>
            {error && <div style={{ fontSize: 11, color: C.red, marginTop: 10 }}>⚠ {error}</div>}
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: C.dim, marginBottom: 12 }}>No token yet. Generate one to start syncing.</div>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              style={{
                padding: '9px 20px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: C.accentDim, border: `1px solid ${C.accentBorder}`,
                color: C.accent, cursor: regenerating ? 'wait' : 'pointer',
              }}
            >
              {regenerating ? 'Generating…' : 'Generate Token'}
            </button>
            {error && <div style={{ fontSize: 11, color: C.red, marginTop: 10 }}>⚠ {error}</div>}
          </>
        )}
      </div>

      {/* ── Setup Instructions ── */}
      <div style={{ ...glass, marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.dim, marginBottom: 16 }}>
          Setup Instructions
        </div>

        {/* Step 1 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: C.accentDim, border: `1px solid ${C.accentBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 900, color: C.accent,
            }}>1</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Copy the endpoint URL</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 30 }}>
            <div style={{
              flex: 1, fontFamily: 'monospace', fontSize: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '8px 12px', color: C.mid,
              wordBreak: 'break-all',
            }}>
              {endpoint}
            </div>
            <CopyButton text={endpoint} />
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: C.accentDim, border: `1px solid ${C.accentBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 900, color: C.accent,
            }}>2</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Create an iPhone Shortcut</div>
          </div>
          <div style={{ marginLeft: 30, fontSize: 12, color: C.mid, lineHeight: 1.7 }}>
            <div>On your iPhone, open the <strong style={{ color: C.text }}>Shortcuts</strong> app.</div>
            <div>Create a new Shortcut and add these actions:</div>
            <ol style={{ margin: '8px 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Health → <em>Get Quantity from Health</em> (Steps, Sleep Analysis, HRV, Heart Rate, Active Energy Burned, Stand Hours)</li>
              <li>Scripting → <em>Get Contents of URL</em></li>
            </ol>
            <div>Configure the URL action:</div>
            <ul style={{ margin: '8px 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>URL: <span style={{ fontFamily: 'monospace', color: C.accent, fontSize: 11 }}>{endpoint}</span></li>
              <li>Method: <strong style={{ color: C.text }}>POST</strong></li>
              <li>Headers: <span style={{ fontFamily: 'monospace', color: C.accent, fontSize: 11 }}>Authorization: Bearer YOUR_TOKEN</span></li>
              <li>Request Body: <strong style={{ color: C.text }}>JSON</strong></li>
            </ul>
          </div>
        </div>

        {/* Step 3 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: C.accentDim, border: `1px solid ${C.accentBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 900, color: C.accent,
            }}>3</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Use this JSON body template</div>
          </div>
          <div style={{ marginLeft: 30 }}>
            <div style={{ fontSize: 11, color: C.mid, marginBottom: 8 }}>
              Replace the example values with the Health values from step 2. Set the date to today&apos;s date in YYYY-MM-DD format.
            </div>
            <div style={{ position: 'relative' }}>
              <pre style={{
                fontFamily: 'monospace', fontSize: 11,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '12px 14px',
                color: C.mid, margin: 0,
                overflowX: 'auto',
                lineHeight: 1.6,
              }}>
                {jsonTemplate}
              </pre>
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <CopyButton text={jsonTemplate} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Health Score formula ── */}
      <div style={{ ...glass }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.dim, marginBottom: 14 }}>
          Health Score Formula
        </div>
        <div style={{ fontSize: 12, color: C.mid, marginBottom: 14 }}>
          Your daily Health Score (0–100) is calculated from 6 metrics:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { metric: 'Steps',        target: '10,000 steps', weight: '25 pts', color: C.blue },
            { metric: 'Sleep',        target: '8 hours',       weight: '25 pts', color: C.purple },
            { metric: 'HRV',          target: '60 ms',         weight: '20 pts', color: '#34D399' },
            { metric: 'Stand Hours',  target: '12 hours',      weight: '10 pts', color: C.accent },
            { metric: 'Active Cal',   target: '600 kcal',      weight: '10 pts', color: C.orange },
            { metric: 'Resting HR',   target: '≤40 bpm',       weight: '10 pts', color: C.red },
          ].map(({ metric, target, weight, color }) => (
            <div key={metric} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text }}>{metric}</div>
              <div style={{ fontSize: 11, color: C.dim }}>target: {target}</div>
              <div style={{
                fontSize: 11, fontWeight: 800, color,
                background: 'rgba(255,255,255,0.04)',
                padding: '2px 8px', borderRadius: 6,
              }}>{weight}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
