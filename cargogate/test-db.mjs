import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log('Testing connection to:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Test 1: Simple select (should fail if keys are invalid)
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Database connection error:', error);
  } else {
    console.log('Database connection SUCCESS:', data);
  }
}

test();
