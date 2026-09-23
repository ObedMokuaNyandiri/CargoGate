import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS for schema inspection
);

async function testSchema() {
  const { data, error } = await supabase.rpc('get_schema_info'); // Wait, we can just query information_schema if RLS doesn't block it via GraphQL or REST. But REST API does not expose information_schema.
  // Instead, let's just do a dummy insert to see the exact database error.
  
  const { data: insertData, error: insertError } = await supabase.from('profiles').insert({
    id: '00000000-0000-0000-0000-000000000000',
    email: 'test@example.com',
    company_name: 'Test',
    full_name: 'Test',
    phone_number: '123',
    organisation_id: '00000000-0000-0000-0000-000000000000',
    role: 'Admin'
  });
  
  console.log('Insert error:', insertError);
}

testSchema();
