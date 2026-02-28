import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default async function Dashboard() {
  const { data: templates } = await supabase
    .from('workout_templates')
    .select('*')
    .order('day_number', { ascending: true });

  return (
    <div>
      <header className="mb-16">
        <h1 className="text-6xl font-bold tracking-tighter mb-4">Your Blueprint</h1>
        <p className="text-zinc-500 text-lg font-medium">Ready for your next session?</p>
      </header>

      <div className="grid gap-6">
        <h2 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Weekly Program</h2>
        
        {templates?.map((day) => (
          <Link 
            href={`/workout/${day.id}`} 
            key={day.id} 
            className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-[2rem] hover:bg-zinc-900/80 hover:border-blue-500/50 transition-all duration-500"
          >
            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-2">
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Day {day.day_number}</span>
                <h3 className="text-3xl font-bold tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                  {day.name}
                </h3>
                <p className="text-zinc-500 text-sm font-medium max-w-md">
                  {day.description}
                </p>
              </div>
              
              <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7"/>
                </svg>
              </div>
            </div>
            
            {/* אפקט תאורה עדין במעבר עכבר */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}