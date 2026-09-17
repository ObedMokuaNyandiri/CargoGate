-- ==============================================================================
-- CARGOGATE COMPLIANCE - BILLING & ORGANISATION DATABASE SCHEMA
-- ==============================================================================

-- 1. Create organisations table
create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for organisations (users can only see organisations they belong to)
alter table public.organisations enable row level security;
create policy "Users can view their own organisation"
  on public.organisations for select
  using ( id in (select organisation_id from public.profiles where id = auth.uid()) );

-- 2. Modify profiles to act as the primary user extension table
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists organisation_id uuid references public.organisations(id);

-- 3. Create credit_accounts table
create table public.credit_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null, -- Added user_id for strict ownership rule
  organisation_id uuid references public.organisations(id) not null,
  balance integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.credit_accounts enable row level security;
create policy "Users can view their own credit accounts"
  on public.credit_accounts for select
  using ( user_id = auth.uid() );

-- 4. Create credit_transactions ledger table
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  credit_account_id uuid references public.credit_accounts(id) on delete cascade not null,
  amount integer not null,
  type text not null, -- 'BONUS', 'VALIDATION', 'PURCHASE'
  reason text,
  reference text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.credit_transactions enable row level security;
create policy "Users can view their own transactions"
  on public.credit_transactions for select
  using ( credit_account_id in (select id from public.credit_accounts where user_id = auth.uid()) );

-- 5. Create validation_sessions table
create table public.validation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  organisation_id uuid references public.organisations(id) not null,
  type text not null, -- 'EORI', 'HS_CODE'
  status text not null, -- 'IN_PROGRESS', 'COMPLETED', 'FAILED'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.validation_sessions enable row level security;
create policy "Users can view their own validation sessions"
  on public.validation_sessions for select
  using ( user_id = auth.uid() );

create policy "Users can insert their own validation sessions"
  on public.validation_sessions for insert
  with check ( user_id = auth.uid() );

create policy "Users can update their own validation sessions"
  on public.validation_sessions for update
  using ( user_id = auth.uid() );

-- 6. Create validation_results table
create table public.validation_results (
  id uuid primary key default gen_random_uuid(),
  validation_session_id uuid references public.validation_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  input_data jsonb,
  result_data jsonb,
  status text, -- 'VALID', 'INVALID'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.validation_results enable row level security;
create policy "Users can view their own validation results"
  on public.validation_results for select
  using ( user_id = auth.uid() );

create policy "Users can insert their own validation results"
  on public.validation_results for insert
  with check ( user_id = auth.uid() );

-- ==============================================================================
-- STORED PROCEDURES & TRIGGERS
-- ==============================================================================

-- Atomic function to consume a credit for validation
create or replace function public.consume_credit(p_user_id uuid, p_session_id uuid, p_type text)
returns boolean as $$
declare
  v_account_id uuid;
  v_balance integer;
begin
  -- Lock the credit account row for this user to prevent race conditions
  select id, balance into v_account_id, v_balance 
  from public.credit_accounts 
  where user_id = p_user_id 
  for update;

  if v_balance >= 1 then
    -- Deduct balance
    update public.credit_accounts 
    set balance = balance - 1, updated_at = now() 
    where id = v_account_id;
    
    -- Insert transaction ledger record
    insert into public.credit_transactions (credit_account_id, amount, type, reason, reference)
    values (v_account_id, -1, p_type, 'Validation consumption', p_session_id::text);
    
    -- Mark session completed
    update public.validation_sessions
    set status = 'COMPLETED', updated_at = now()
    where id = p_session_id;

    return true;
  else
    return false;
  end if;
end;
$$ language plpgsql security definer;

-- Auto-provisioning trigger on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_org_id uuid;
  v_account_id uuid;
  v_full_name text;
  v_phone text;
  v_company text;
begin
  -- Extract metadata
  v_full_name := new.raw_user_meta_data->>'full_name';
  v_phone := new.raw_user_meta_data->>'phone_number';
  v_company := coalesce(new.raw_user_meta_data->>'company_name', v_full_name || '''s Organisation');

  -- 1. Create Organisation
  insert into public.organisations (name)
  values (v_company)
  returning id into v_org_id;

  -- 2. Create User Profile
  insert into public.profiles (id, email, company_name, full_name, phone_number, organisation_id, role)
  values (new.id, new.email, v_company, v_full_name, v_phone, v_org_id, 'Admin');

  -- 3. Create Credit Account (owned by user and organisation) with 1 starting balance
  insert into public.credit_accounts (user_id, organisation_id, balance)
  values (new.id, v_org_id, 1)
  returning id into v_account_id;

  -- 4. Create Ledger Entry for the signup bonus
  insert into public.credit_transactions (credit_account_id, amount, type, reason, reference)
  values (v_account_id, 1, 'BONUS', 'Signup bonus', 'SIGNUP');

  return new;
end;
$$ language plpgsql security definer;
