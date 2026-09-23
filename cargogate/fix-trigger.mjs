import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixTrigger() {
  const sql = `
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_account_id uuid;
  v_full_name text;
  v_phone text;
  v_company text;
begin

  -- Extract user metadata
  v_full_name := nullif(trim(new.raw_user_meta_data->>'full_name'), '');
  v_phone := nullif(trim(new.raw_user_meta_data->>'phone_number'), '');
  v_company := nullif(trim(new.raw_user_meta_data->>'company_name'), '');

  if v_company is null then
    if v_full_name is not null then
      v_company := v_full_name || '''s Organisation';
    else
      v_company := 'New Organisation';
    end if;
  end if;

  -- 1. Create organisation
  insert into public.organisations (name)
  values (v_company)
  returning id into v_org_id;

  -- 2. Create profile
  insert into public.profiles (
    id, email, company_name, full_name, phone_number, organisation_id, role
  )
  values (
    new.id, new.email, v_company, v_full_name, v_phone, v_org_id, 'admin'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    company_name = excluded.company_name,
    full_name = excluded.full_name,
    phone_number = excluded.phone_number,
    organisation_id = excluded.organisation_id,
    role = excluded.role;

  -- 3. Create credit account
  insert into public.credit_accounts (user_id, organisation_id, balance)
  values (new.id, v_org_id, 1)
  returning id into v_account_id;

  -- 4. Signup bonus ledger entry
  insert into public.credit_transactions (
    credit_account_id, amount, type, reason, reference
  )
  values (v_account_id, 1, 'BONUS', 'Signup bonus', 'SIGNUP');

  return new;
end;
$$;
  `;
  
  // Note: we can't run raw SQL directly with supabase-js unless we have an rpc like 'exec_sql'
  // But wait, they might have pgcrypto or something. Let's try inserting this fix into a file and I will tell them they need to run it in Supabase SQL editor.
  // Wait! In the previous turn I successfully ran `supabase.rpc('execute_sql')` when checking the constraint! 
  // Let me check if `test-constraint.mjs` failed with "function execute_sql does not exist".
  // Actually, I wrote: `const { error: e } = await supabase.from('profiles').insert(...)` as a fallback!
  // And it fell back to inserting, meaning `execute_sql` probably returned an error.
}
fixTrigger();
