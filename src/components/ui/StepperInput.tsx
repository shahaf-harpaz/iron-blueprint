'use client'

interface Props {
  value: number
  onChange: (v: number) => void
  unit?: string
  step?: number
}

export function StepperInput({ value, onChange, unit = '', step = 1 }: Props) {
  const display = unit === 'kg' && value % 1 !== 0 ? value.toFixed(1) : String(value)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', borderRadius: 12, overflow: 'hidden',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)',
    }}>
      <button
        type="button"
        onClick={() => onChange(parseFloat(Math.max(0, value - step).toFixed(2)))}
        style={{
          width: 34, height: 40, background: 'transparent', border: 'none',
          cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 20, fontWeight: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >−</button>

      <div style={{
        flex: 1, textAlign: 'center', fontWeight: 900, fontSize: 16,
        color: '#fff', letterSpacing: '-0.02em', userSelect: 'none',
      }}>
        {display}
        {unit && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginLeft: 2, fontWeight: 500 }}>{unit}</span>}
      </div>

      <button
        type="button"
        onClick={() => onChange(parseFloat((value + step).toFixed(2)))}
        style={{
          width: 34, height: 40, background: 'transparent', border: 'none',
          cursor: 'pointer', color: '#C8FF00', fontSize: 20, fontWeight: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >+</button>
    </div>
  )
}
