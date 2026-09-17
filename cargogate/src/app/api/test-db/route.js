import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}
      }
    }
  )

  const res = await supabase.auth.signUp({
    email: 'test' + Math.random() + '@example.com',
    password: 'password123',
    options: {
      data: { company_name: 'Test Co' }
    }
  })

  return Response.json(res)
}
