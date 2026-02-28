import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

// We define params as a Promise to satisfy the Next.js compiler
export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  
  // STEP 1: Await the params (This fixes the red error in your terminal)
  const { id } = await params; 

  // STEP 2: Fetch the data using the awaited ID
  const { data: template } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (!template) notFound();

  const { data: exercises } = await supabase
    .from('template_exercises')
    .select(`
      order_index,
      exercises ( id, name, target_muscle_group )
    `)
    .eq('template_id', id)
    .order('order_index');

  return (
    <div style={{ marginLeft: '280px', padding: '50px', backgroundColor: 'black', minHeight: '100vh', color: 'white' }}>
      <header style={{ marginBottom: '50px' }}>
        <p style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Session View</p>
        <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-0.05em', color: 'white' }}>{template.name}</h1>
      </header>

      <div style={{ display: 'grid', gap: '30px' }}>
        {exercises?.map((item: any, index: number) => (
          <div key={index} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '40px', padding: '40px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px', color: 'white' }}>{item.exercises.name}</h3>
            <p style={{ color: '#71717a', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {item.exercises.target_muscle_group}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}