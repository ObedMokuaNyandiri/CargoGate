import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConstraint() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: "SELECT pg_get_constraintdef((SELECT oid FROM pg_constraint WHERE conname = 'profiles_role_valid'));" });
  if (error) {
     // fallback: just try to insert a profile with role: 'user' or 'exporter'
     const roles = ['admin', 'Admin', 'User', 'user', 'Exporter', 'exporter', 'Owner', 'owner'];
     for (const r of roles) {
         const { error: e } = await supabase.from('profiles').insert({
            id: '00000000-0000-0000-0000-000000000000',
            email: 'test@example.com',
            company_name: 'Test',
            full_name: 'Test',
            phone_number: '123',
            organisation_id: '00000000-0000-0000-0000-000000000000',
            role: r
         });
         console.log(`Role '${r}':`, e?.code === '23514' ? 'Constraint failed' : (e ? e.message : 'SUCCESS'));
     }
  } else {
     console.log(data);
  }
}
checkConstraint();
