// supabase/functions/health-sync/index.ts
// Deploy: supabase functions deploy health-sync
// Tables required (run in Supabase SQL editor):
//   CREATE TABLE sync_tokens (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users NOT NULL, token text NOT NULL UNIQUE, created_at timestamptz DEFAULT now());
//   ALTER TABLE sync_tokens ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Users manage own tokens" ON sync_tokens FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
//
//   CREATE TABLE health_sync (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users NOT NULL, date date NOT NULL, steps integer DEFAULT 0, sleep_hours float DEFAULT 0, resting_heart_rate integer DEFAULT 0, hrv integer DEFAULT 0, active_calories integer DEFAULT 0, stand_hours integer DEFAULT 0, health_score integer DEFAULT 0, synced_at timestamptz DEFAULT now(), UNIQUE(user_id, date));
//   ALTER TABLE health_sync ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Users manage own health" ON health_sync FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // ── Auth via Bearer token ──────────────────────────────────────────────────
    const auth  = req.headers.get('Authorization') ?? ''
    const token = auth.replace(/^Bearer\s+/i, '').trim()
    if (!token) return json({ error: 'Missing Authorization header' }, 401)

    const { data: tokenRow, error: tokenErr } = await supabase
      .from('sync_tokens')
      .select('user_id')
      .eq('token', token)
      .single()

    if (tokenErr || !tokenRow) return json({ error: 'Invalid token' }, 401)

    const userId = tokenRow.user_id as string

    // ── Parse body ────────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}))
    const {
      steps              = 0,
      sleep_hours        = 0,
      resting_heart_rate = 0,
      hrv                = 0,
      active_calories    = 0,
      stand_hours        = 0,
      date               = new Date().toLocaleDateString('en-CA'),
    } = body as Record<string, number | string>

    // ── Health score (weighted, max 100) ──────────────────────────────────────
    // steps:       0-10000 → 25 pts
    // sleep:       0-8h    → 25 pts
    // hrv:         0-60ms  → 20 pts
    // stand hours: 0-12h   → 10 pts
    // active cal:  0-600   → 10 pts
    // resting HR:  <40 bpm → 10 pts (lower is better; 80 bpm = 0 pts, 40 bpm = 10 pts)
    const stepsScore = Math.min(Number(steps) / 10000, 1) * 25
    const sleepScore = Math.min(Number(sleep_hours) / 8, 1) * 25
    const hrvScore   = Math.min(Number(hrv) / 60, 1) * 20
    const standScore = Math.min(Number(stand_hours) / 12, 1) * 10
    const calScore   = Math.min(Number(active_calories) / 600, 1) * 10
    const hrScore    = Number(resting_heart_rate) > 0
      ? Math.min(Math.max((80 - Number(resting_heart_rate)) / 40, 0), 1) * 10
      : 0

    const health_score = Math.round(stepsScore + sleepScore + hrvScore + standScore + calScore + hrScore)

    // ── Upsert health_sync ────────────────────────────────────────────────────
    const { error: upsertErr } = await supabase.from('health_sync').upsert({
      user_id:            userId,
      date,
      steps:              Number(steps),
      sleep_hours:        Number(sleep_hours),
      resting_heart_rate: Number(resting_heart_rate),
      hrv:                Number(hrv),
      active_calories:    Number(active_calories),
      stand_hours:        Number(stand_hours),
      health_score,
      synced_at:          new Date().toISOString(),
    }, { onConflict: 'user_id,date' })

    if (upsertErr) return json({ error: upsertErr.message }, 500)

    return json({ ok: true, health_score })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: msg }, 500)
  }
})
