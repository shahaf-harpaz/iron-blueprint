import { randomUUID } from 'crypto'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

// ─── EDIT DEFAULT PROGRAM HERE ────────────────────────────────────────────────

const DEFAULT_EXERCISES = [
  // Day 1 — Chest & Shoulders
  { key: 'incline_bb_bench',    name: 'Incline Barbell Bench Press', muscle_group: 'Upper Chest',    target_muscle: 'Clavicular Head',     tempo_instruction: '3-0-1-0', technical_notes: 'Set bench to 30-45°. Retract scapula, drive through heels. Bar touches upper chest.' },
  { key: 'flat_db_press',       name: 'Flat Dumbbell Press',         muscle_group: 'Chest',          target_muscle: 'Sternal Head',        tempo_instruction: '3-0-1-0', technical_notes: 'Full stretch at bottom. Press in slight arc. Squeeze at top.' },
  { key: 'standing_ohp',        name: 'Standing Barbell OHP',        muscle_group: 'Shoulders',      target_muscle: 'Anterior Deltoid',    tempo_instruction: '2-0-1-0', technical_notes: 'Brace core. Bar path slightly back around face then straight up. Lock out overhead.' },
  { key: 'lateral_raises',      name: 'Lateral Raises',              muscle_group: 'Shoulders',      target_muscle: 'Medial Deltoid',      tempo_instruction: '2-0-2-1', technical_notes: 'Slight forward lean. Lead with elbows. Control the descent.' },
  { key: 'pushups',             name: 'Pushups',                     muscle_group: 'Chest',          target_muscle: 'Pectoralis Major',    tempo_instruction: '2-0-1-0', technical_notes: 'Full ROM. Elbows at 45°. Core locked throughout.' },
  { key: 'incline_walk',        name: 'Incline Walk',                muscle_group: 'Cardio',         target_muscle: 'Cardiovascular',      tempo_instruction: '',        technical_notes: '10–12% incline, 3.5–4 mph. Keep heart rate around 130–140 bpm.' },

  // Day 2 — Back & Rear Delts
  { key: 'pullups',             name: 'Pull-ups',                    muscle_group: 'Back',           target_muscle: 'Latissimus Dorsi',    tempo_instruction: '2-0-1-1', technical_notes: 'Full dead hang. Initiate with lats. Chin clears bar.' },
  { key: 'bent_over_row',       name: 'Bent Over Row',               muscle_group: 'Back',           target_muscle: 'Mid Traps / Rhomboids', tempo_instruction: '2-1-1-0', technical_notes: 'Hip hinge to ~45°. Bar to lower sternum. Row with elbows, not biceps.' },
  { key: 'one_arm_db_row',      name: 'One Arm Dumbbell Row',        muscle_group: 'Back',           target_muscle: 'Latissimus Dorsi',    tempo_instruction: '2-0-1-1', technical_notes: 'Brace on bench. Pull elbow straight back. Full stretch at bottom.' },
  { key: 'pendlay_row',         name: 'Pendlay Row',                 muscle_group: 'Back',           target_muscle: 'Upper Back',          tempo_instruction: '1-0-1-0', technical_notes: 'Bar dead-stops on floor each rep. Torso parallel. Explosive pull.' },
  { key: 'rear_delt_flyes',     name: 'Rear Delt Flyes',             muscle_group: 'Shoulders',      target_muscle: 'Posterior Deltoid',   tempo_instruction: '2-0-2-1', technical_notes: 'Slight bend in elbow. Lead with rear delt. Avoid shrugging.' },
  { key: 'rowing_machine',      name: 'Rowing Machine',              muscle_group: 'Cardio',         target_muscle: 'Cardiovascular',      tempo_instruction: '',        technical_notes: 'Legs → hips → arms on drive. Arms → hips → legs on return. Steady pace.' },

  // Day 3 — Active Recovery
  { key: 'incline_walk_liss',   name: 'Incline Walk LISS',           muscle_group: 'Cardio',         target_muscle: 'Cardiovascular',      tempo_instruction: '',        technical_notes: '10% incline, comfortable pace. Zone 2. Do not rush.' },
  { key: 'chest_shoulder_mob',  name: 'Chest & Shoulder Mobility',   muscle_group: 'Mobility',       target_muscle: 'Pecs / Anterior Delt', tempo_instruction: '',       technical_notes: 'Doorway stretches, cross-body shoulder stretch, wall angels.' },
  { key: 'hip_flexor_stretch',  name: 'Hip Flexor Stretches',        muscle_group: 'Mobility',       target_muscle: 'Hip Flexors',         tempo_instruction: '',        technical_notes: 'Kneeling lunge stretch. Hold 30–45s each side. Posterior pelvic tilt.' },

  // Day 4 — Legs & Posterior Chain
  { key: 'back_squat',          name: 'Back Squat',                  muscle_group: 'Legs',           target_muscle: 'Quadriceps',          tempo_instruction: '3-1-1-0', technical_notes: 'Bar on traps. Brace 360°. Break parallel. Drive knees out.' },
  { key: 'romanian_deadlift',   name: 'Romanian Deadlift',           muscle_group: 'Legs',           target_muscle: 'Hamstrings',          tempo_instruction: '3-1-1-0', technical_notes: 'Soft knee, hip hinge. Bar close to body. Feel hamstring stretch at bottom.' },
  { key: 'goblet_squat',        name: 'Goblet Squat',                muscle_group: 'Legs',           target_muscle: 'Quadriceps / Glutes', tempo_instruction: '3-0-1-0', technical_notes: 'Hold DB/KB at chest. Elbows inside knees at bottom. Tall torso.' },
  { key: 'walking_lunges',      name: 'Walking Lunges',              muscle_group: 'Legs',           target_muscle: 'Glutes / Quads',      tempo_instruction: '2-0-1-0', technical_notes: 'Long stride. Front knee stays over ankle. Upright torso.' },
  { key: 'kb_swings',           name: 'KB Swings',                   muscle_group: 'Legs',           target_muscle: 'Glutes / Hamstrings', tempo_instruction: '1-0-1-0', technical_notes: 'Hip hinge — not a squat. Explosive hip extension. Glutes at top.' },

  // Day 5 — Upper Body Mastery
  { key: 'bb_bench_press',      name: 'Barbell Bench Press',         muscle_group: 'Chest',          target_muscle: 'Pectoralis Major',    tempo_instruction: '3-0-1-0', technical_notes: 'Arch naturally. Bar to lower chest. Drive feet through floor.' },
  { key: 'kettlebell_rows',     name: 'Kettlebell Rows',             muscle_group: 'Back',           target_muscle: 'Latissimus Dorsi',    tempo_instruction: '2-0-1-1', technical_notes: 'Hip hinge, both arms simultaneously. Drive elbows back.' },
  { key: 'bicep_curls',         name: 'Bicep Curls',                 muscle_group: 'Arms',           target_muscle: 'Biceps Brachii',      tempo_instruction: '2-0-1-1', technical_notes: 'Elbows pinned. Supinate at top. Full extension at bottom.' },
  { key: 'overhead_tricep_ext', name: 'Overhead Tricep Extension',   muscle_group: 'Arms',           target_muscle: 'Triceps Long Head',   tempo_instruction: '2-0-1-0', technical_notes: 'Elbows narrow and forward. Full stretch overhead. Squeeze at extension.' },
  { key: 'airbike',             name: 'AirBike',                     muscle_group: 'Cardio',         target_muscle: 'Cardiovascular',      tempo_instruction: '',        technical_notes: 'Alternate between steady state and sprint intervals. Finish strong.' },
]

const DEFAULT_TEMPLATES = [
  { key: 'd1', day_number: 1, name: 'Day 1 – Chest & Shoulders',      description: 'Horizontal and vertical pressing. Focus on upper chest development and shoulder health.' },
  { key: 'd2', day_number: 2, name: 'Day 2 – Back & Rear Delts',      description: 'Vertical and horizontal pulling. Build lat width and rear delt density for balanced shoulders.' },
  { key: 'd3', day_number: 3, name: 'Day 3 – Active Recovery',        description: 'Low-intensity movement and mobility work. Keep blood flowing without accumulated fatigue.' },
  { key: 'd4', day_number: 4, name: 'Day 4 – Legs & Posterior Chain', description: 'Quad-dominant compound work followed by hamstring and glute isolation.' },
  { key: 'd5', day_number: 5, name: 'Day 5 – Upper Body Mastery',     description: 'Balanced upper body volume. Chest, back, and arms all get direct work.' },
]

// [template_key, exercise_key, position, target_sets, target_reps]
const DEFAULT_TEMPLATE_EXERCISES: [string, string, number, number, string][] = [
  // Day 1
  ['d1', 'incline_bb_bench',   1, 3, '8-10'],
  ['d1', 'flat_db_press',      2, 3, '10-12'],
  ['d1', 'standing_ohp',       3, 3, '8-10'],
  ['d1', 'lateral_raises',     4, 3, '15-20'],
  ['d1', 'pushups',            5, 2, 'Failure'],
  ['d1', 'incline_walk',       6, 1, '15 min'],
  // Day 2
  ['d2', 'pullups',            1, 3, 'Failure'],
  ['d2', 'bent_over_row',      2, 3, '8-10'],
  ['d2', 'one_arm_db_row',     3, 3, '10-12'],
  ['d2', 'pendlay_row',        4, 2, '8'],
  ['d2', 'rear_delt_flyes',    5, 3, '15-20'],
  ['d2', 'rowing_machine',     6, 1, '10 min'],
  // Day 3
  ['d3', 'incline_walk_liss',  1, 1, '30-45 min'],
  ['d3', 'chest_shoulder_mob', 2, 1, '10-15 min'],
  ['d3', 'hip_flexor_stretch', 3, 1, '10-15 min'],
  // Day 4
  ['d4', 'back_squat',         1, 3, '8-10'],
  ['d4', 'romanian_deadlift',  2, 3, '10-12'],
  ['d4', 'goblet_squat',       3, 3, '12-15'],
  ['d4', 'walking_lunges',     4, 3, '10/10'],
  ['d4', 'kb_swings',          5, 2, '20'],
  // Day 5
  ['d5', 'bb_bench_press',     1, 3, '10'],
  ['d5', 'kettlebell_rows',    2, 3, '12'],
  ['d5', 'bicep_curls',        3, 3, '12-15'],
  ['d5', 'overhead_tricep_ext',4, 3, '12-15'],
  ['d5', 'airbike',            5, 1, '10 min'],
]

// ─────────────────────────────────────────────────────────────────────────────

export async function seedUser(userId: string): Promise<void> {
  const supabase = getSupabaseAdminClient()

  // Idempotency check — skip if user already has templates
  const { count } = await supabase
    .from('workout_templates')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count ?? 0) > 0) return

  // Generate stable UUIDs for this seed run
  const exerciseIdMap: Record<string, string> = {}
  for (const ex of DEFAULT_EXERCISES) {
    exerciseIdMap[ex.key] = randomUUID()
  }

  const templateIdMap: Record<string, string> = {}
  for (const t of DEFAULT_TEMPLATES) {
    templateIdMap[t.key] = randomUUID()
  }

  // Insert exercises
  const { error: exErr } = await supabase.from('exercises').insert(
    DEFAULT_EXERCISES.map(ex => ({
      id:                 exerciseIdMap[ex.key],
      user_id:            userId,
      name:               ex.name,
      muscle_group:       ex.muscle_group,
      target_muscle:      ex.target_muscle,
      tempo_instruction:  ex.tempo_instruction,
      technical_notes:    ex.technical_notes,
      default_sets:       3,
    }))
  )
  if (exErr) throw new Error(`seedUser exercises: ${exErr.message}`)

  // Insert templates
  const { error: tErr } = await supabase.from('workout_templates').insert(
    DEFAULT_TEMPLATES.map(t => ({
      id:          templateIdMap[t.key],
      user_id:     userId,
      day_number:  t.day_number,
      name:        t.name,
      description: t.description,
    }))
  )
  if (tErr) throw new Error(`seedUser templates: ${tErr.message}`)

  // Insert template_exercises
  const { error: teErr } = await supabase.from('template_exercises').insert(
    DEFAULT_TEMPLATE_EXERCISES.map(([tKey, exKey, position, target_sets, target_reps]) => ({
      id:           randomUUID(),
      user_id:      userId,
      template_id:  templateIdMap[tKey],
      exercise_id:  exerciseIdMap[exKey],
      position,
      target_sets,
      target_reps,
    }))
  )
  if (teErr) throw new Error(`seedUser template_exercises: ${teErr.message}`)
}
