import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSignup() {
  const email = 'test_signup_' + Date.now() + '@example.com';
  console.log('Testing signup with:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: 'password123',
    options: {
      data: {
        full_name: 'Test User',
        phone_number: '1234567890'
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
  } else {
    console.log('Signup SUCCESS:', data.user ? 'User created' : 'Check email');
  }
}

testSignup();
