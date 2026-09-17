'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function login(formData) {
  const supabase = await createClient()
  
  const email = formData.get('email')
  const password = formData.get('password')

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData) {
  const supabase = await createClient()
  
  const email = formData.get('email')
  const password = formData.get('password')
  const fullName = formData.get('full_name')
  const phoneNumber = formData.get('phone_number')

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.session) {
    return { success: 'Please check your email for a confirmation link to complete signup.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updateProfile(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const companyName = formData.get('company_name')
  const role = formData.get('role')

  // Enforce the check constraint strictly on the server before hitting DB
  if (!companyName || companyName.trim().length === 0) {
    return { error: 'Company name cannot be blank.' }
  }

  // Use the Service Role Key to bypass RLS and avoid infinite recursion
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ 
      company_name: companyName.trim(),
      role: role ? role.trim() : 'Exporter' 
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
