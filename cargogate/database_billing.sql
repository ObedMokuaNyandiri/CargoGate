-- =============================================================================
-- CARGOGATE COMPLIANCE
-- BILLING & ORGANISATION DATABASE SCHEMA
-- PostgreSQL / Supabase
-- =============================================================================

-- =============================================================================
-- 0. EXTENSIONS
-- =============================================================================

create extension if not exists pgcrypto;


-- =============================================================================
-- 1. ORGANISATIONS TABLE
-- =============================================================================

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.organisations enable row level security;


-- =============================================================================
-- 2. PROFILES TABLE
-- IMPORTANT:
-- Add columns BEFORE creating policies that reference them.
-- =============================================================================

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists phone_number text;

alter table public.profiles
  add column if not exists company_name text;

alter table public.profiles
  add column if not exists organisation_id uuid;

alter table public.profiles
  add column if not exists role text;


-- Add the foreign key only if it does not already exist.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_organisation_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_organisation_id_fkey
      foreign key (organisation_id)
      references public.organisations(id)
      on delete set null;
  end if;
end
$$;


-- =============================================================================
-- 3. ORGANISATION RLS POLICY
-- =============================================================================

drop policy if exists "Users can view their own organisation"
on public.organisations;

create policy "Users can view their own organisation"
on public.organisations
for select
to authenticated
using (
  id = (
    select p.organisation_id
    from public.profiles p
    where p.id = auth.uid()
  )
);


-- =============================================================================
-- 4. CREDIT ACCOUNTS TABLE
-- =============================================================================

create table if not exists public.credit_accounts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  organisation_id uuid not null
    references public.organisations(id)
    on delete cascade,

  balance integer not null default 0,

  created_at timestamptz not null default timezone('utc', now()),

  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.credit_accounts enable row level security;


-- =============================================================================
-- 5. CREDIT ACCOUNT RLS POLICIES
-- =============================================================================

drop policy if exists "Users can view their own credit accounts"
on public.credit_accounts;

create policy "Users can view their own credit accounts"
on public.credit_accounts
for select
to authenticated
using (
  user_id = auth.uid()
);


-- Allow users to create their own account if your application needs it.
drop policy if exists "Users can insert their own credit accounts"
on public.credit_accounts;

create policy "Users can insert their own credit accounts"
on public.credit_accounts
for insert
to authenticated
with check (
  user_id = auth.uid()
);


-- =============================================================================
-- 6. CREDIT TRANSACTIONS TABLE
-- =============================================================================

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),

  credit_account_id uuid not null
    references public.credit_accounts(id)
    on delete cascade,

  amount integer not null,

  type text not null,

  reason text,

  reference text,

  created_at timestamptz not null default timezone('utc', now())
);

alter table public.credit_transactions enable row level security;


-- =============================================================================
-- 7. CREDIT TRANSACTIONS RLS
-- =============================================================================

drop policy if exists "Users can view their own transactions"
on public.credit_transactions;

create policy "Users can view their own transactions"
on public.credit_transactions
for select
to authenticated
using (
  exists (
    select 1
    from public.credit_accounts ca
    where ca.id = credit_transactions.credit_account_id
      and ca.user_id = auth.uid()
  )
);


-- =============================================================================
-- 8. VALIDATION SESSIONS TABLE
-- =============================================================================

create table if not exists public.validation_sessions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  organisation_id uuid not null
    references public.organisations(id)
    on delete cascade,

  type text not null,

  status text not null default 'PENDING',

  created_at timestamptz not null default timezone('utc', now()),

  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.validation_sessions enable row level security;


-- =============================================================================
-- 9. VALIDATION SESSION RLS
-- =============================================================================

drop policy if exists "Users can view their own validation sessions"
on public.validation_sessions;

create policy "Users can view their own validation sessions"
on public.validation_sessions
for select
to authenticated
using (
  user_id = auth.uid()
);


drop policy if exists "Users can insert their own validation sessions"
on public.validation_sessions;

create policy "Users can insert their own validation sessions"
on public.validation_sessions
for insert
to authenticated
with check (
  user_id = auth.uid()
);


drop policy if exists "Users can update their own validation sessions"
on public.validation_sessions;

create policy "Users can update their own validation sessions"
on public.validation_sessions
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);


-- =============================================================================
-- 10. VALIDATION RESULTS TABLE
-- =============================================================================

create table if not exists public.validation_results (
  id uuid primary key default gen_random_uuid(),

  validation_session_id uuid not null
    references public.validation_sessions(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  input_data jsonb,

  result_data jsonb,

  status text,

  created_at timestamptz not null default timezone('utc', now())
);

alter table public.validation_results enable row level security;


-- =============================================================================
-- 11. VALIDATION RESULTS RLS
-- =============================================================================

drop policy if exists "Users can view their own validation results"
on public.validation_results;

create policy "Users can view their own validation results"
on public.validation_results
for select
to authenticated
using (
  user_id = auth.uid()
);


drop policy if exists "Users can insert their own validation results"
on public.validation_results;

create policy "Users can insert their own validation results"
on public.validation_results
for insert
to authenticated
with check (
  user_id = auth.uid()
);


-- =============================================================================
-- 12. INDEXES
-- =============================================================================

create index if not exists idx_profiles_organisation_id
on public.profiles(organisation_id);

create index if not exists idx_credit_accounts_user_id
on public.credit_accounts(user_id);

create index if not exists idx_credit_accounts_organisation_id
on public.credit_accounts(organisation_id);

create index if not exists idx_credit_transactions_account_id
on public.credit_transactions(credit_account_id);

create index if not exists idx_validation_sessions_user_id
on public.validation_sessions(user_id);

create index if not exists idx_validation_sessions_organisation_id
on public.validation_sessions(organisation_id);

create index if not exists idx_validation_results_session_id
on public.validation_results(validation_session_id);

create index if not exists idx_validation_results_user_id
on public.validation_results(user_id);


-- =============================================================================
-- 13. CONSUME CREDIT FUNCTION
-- =============================================================================

create or replace function public.consume_credit(
  p_user_id uuid,
  p_session_id uuid,
  p_type text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_balance integer;
begin

  -- Make sure the caller can only consume their own credits.
  if p_user_id <> auth.uid() then
    return false;
  end if;


  -- Lock the account row.
  select
    id,
    balance
  into
    v_account_id,
    v_balance
  from public.credit_accounts
  where user_id = p_user_id
  order by created_at
  limit 1
  for update;


  -- No account.
  if v_account_id is null then
    return false;
  end if;


  -- Not enough credits.
  if v_balance < 1 then
    return false;
  end if;


  -- Deduct one credit.
  update public.credit_accounts
  set
    balance = balance - 1,
    updated_at = timezone('utc', now())
  where id = v_account_id;


  -- Record transaction.
  insert into public.credit_transactions (
    credit_account_id,
    amount,
    type,
    reason,
    reference
  )
  values (
    v_account_id,
    -1,
    p_type,
    'Validation consumption',
    p_session_id::text
  );


  -- Mark validation session as completed.
  update public.validation_sessions
  set
    status = 'COMPLETED',
    updated_at = timezone('utc', now())
  where id = p_session_id
    and user_id = p_user_id;


  return true;

exception
  when others then
    raise;
end;
$$;


-- =============================================================================
-- 14. HANDLE NEW USER FUNCTION
-- =============================================================================

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

  -- ---------------------------------------------------------------------------
  -- Extract user metadata
  -- ---------------------------------------------------------------------------

  v_full_name :=
    nullif(trim(new.raw_user_meta_data->>'full_name'), '');

  v_phone :=
    nullif(trim(new.raw_user_meta_data->>'phone_number'), '');

  v_company :=
    nullif(
      trim(new.raw_user_meta_data->>'company_name'),
      ''
    );


  -- If company name was not supplied, generate one.
  if v_company is null then

    if v_full_name is not null then
      v_company := v_full_name || '''s Organisation';
    else
      v_company := 'New Organisation';
    end if;

  end if;


  -- ---------------------------------------------------------------------------
  -- 1. Create organisation
  -- ---------------------------------------------------------------------------

  insert into public.organisations (
    name
  )
  values (
    v_company
  )
  returning id
  into v_org_id;


  -- ---------------------------------------------------------------------------
  -- 2. Create profile
  -- ---------------------------------------------------------------------------

  insert into public.profiles (
    id,
    email,
    company_name,
    full_name,
    phone_number,
    organisation_id,
    role
  )
  values (
    new.id,
    new.email,
    v_company,
    v_full_name,
    v_phone,
    v_org_id,
    'admin'
  )
  on conflict (id)
  do update
  set
    email = excluded.email,
    company_name = excluded.company_name,
    full_name = excluded.full_name,
    phone_number = excluded.phone_number,
    organisation_id = excluded.organisation_id,
    role = excluded.role;


  -- ---------------------------------------------------------------------------
  -- 3. Create credit account
  -- ---------------------------------------------------------------------------

  insert into public.credit_accounts (
    user_id,
    organisation_id,
    balance
  )
  values (
    new.id,
    v_org_id,
    1
  )
  returning id
  into v_account_id;


  -- ---------------------------------------------------------------------------
  -- 4. Signup bonus ledger entry
  -- ---------------------------------------------------------------------------

  insert into public.credit_transactions (
    credit_account_id,
    amount,
    type,
    reason,
    reference
  )
  values (
    v_account_id,
    1,
    'BONUS',
    'Signup bonus',
    'SIGNUP'
  );


  return new;

end;
$$;


-- =============================================================================
-- 15. AUTH USER SIGNUP TRIGGER
-- =============================================================================

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert
on auth.users
for each row
execute function public.handle_new_user();


-- =============================================================================
-- 16. FUNCTION PERMISSIONS
-- =============================================================================

revoke all on function public.consume_credit(uuid, uuid, text)
from public;

grant execute on function public.consume_credit(uuid, uuid, text)
to authenticated;


-- =============================================================================
-- DONE
-- =============================================================================
