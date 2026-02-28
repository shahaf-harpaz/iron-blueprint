import { supabase } from '@/lib/supabase';

export default async function BackendTest() {
  const results = [];

  // TEST 1: Read Table Structure
  const { data: readData, error: readError } = await supabase
    .from('workout_templates')
    .select('*')
    .limit(1);
  results.push({ 
    name: 'Database Read', 
    status: readError ? 'FAIL' : 'PASS', 
    details: readError?.message || `Successfully fetched ${readData?.length} rows.` 
  });

  // TEST 2: Write/Insert (Verification of API Write Permissions)
  const tempName = `Test-${Math.floor(Math.random() * 1000)}`;
  const { data: insertData, error: insertError } = await supabase
    .from('workout_templates')
    .insert([{ name: tempName, day_number: 99, description: 'Diagnostic cleanup required' }])
    .select();
  results.push({ 
    name: 'Database Write', 
    status: insertError ? 'FAIL' : 'PASS', 
    details: insertError?.message || `Inserted row with ID: ${insertData?.[0]?.id}` 
  });

  // TEST 3: Cleanup (Delete the test row)
  if (insertData?.[0]?.id) {
    const { error: deleteError } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', insertData[0].id);
    results.push({ 
      name: 'Database Delete', 
      status: deleteError ? 'FAIL' : 'PASS', 
      details: deleteError?.message || 'Test row purged successfully.' 
    });
  }

  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-black tracking-tighter mb-10">BACKEND DIAGNOSTIC</h1>
      <div className="grid gap-4">
        {results.map((res, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${res.status === 'PASS' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{res.name}</h3>
              <span className={`text-xs font-black px-2 py-1 rounded ${res.status === 'PASS' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                {res.status}
              </span>
            </div>
            <p className="font-mono text-sm">{res.details}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <p className="text-xs text-zinc-500 font-medium italic">
          Note: RLS is currently DISABLED for all tables in your project Project.
        </p>
      </div>
    </div>
  );
}