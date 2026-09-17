-- =============================================================================
-- CARGOGATE COMPLIANCE
-- PAYMENTS & UNIFIED VALIDATIONS SCHEMA UPDATE
-- =============================================================================

-- =============================================================================
-- 1. PAYMENTS TABLE
-- =============================================================================

create table if not exists public.payments (
  id text primary key, -- Custom ID like 'PAY-000101'
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  currency text not null default 'KES',
  status text not null default 'PENDING',
  provider text,
  provider_reference text,
  credits_purchased integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.payments enable row level security;

-- Users can view their own payments
drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments"
on public.payments
for select
to authenticated
using (user_id = auth.uid());


-- =============================================================================
-- 2. VALIDATION SESSIONS MODIFICATION
-- =============================================================================

-- Ensure validation_sessions has completed_at and credit_transaction_id
alter table public.validation_sessions add column if not exists completed_at timestamptz;
alter table public.validation_sessions add column if not exists credit_transaction_id uuid references public.credit_transactions(id);


-- =============================================================================
-- 3. VALIDATION CHECKS TABLE
-- =============================================================================

create table if not exists public.validation_checks (
  id uuid primary key default gen_random_uuid(),
  validation_session_id uuid not null references public.validation_sessions(id) on delete cascade,
  check_type text not null, -- 'EORI', 'HS_CODE', 'DESCRIPTION'
  input_value text,
  result text,
  result_details jsonb,
  validated_at timestamptz not null default timezone('utc', now())
);

alter table public.validation_checks enable row level security;

-- We can tie RLS to the session
drop policy if exists "Users can view their own validation checks" on public.validation_checks;
create policy "Users can view their own validation checks"
on public.validation_checks
for select
to authenticated
using (
  exists (
    select 1 from public.validation_sessions vs
    where vs.id = validation_checks.validation_session_id
    and vs.user_id = auth.uid()
  )
);

-- =============================================================================
-- 4. ATOMIC PAYMENT PROCESSING RPC
-- =============================================================================

create or replace function public.process_payment(
  p_payment_id text,
  p_provider_reference text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_status text;
  v_credits_purchased integer;
  v_account_id uuid;
begin
  -- 1. Get the pending payment and lock it
  select user_id, status, credits_purchased 
  into v_user_id, v_status, v_credits_purchased
  from public.payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'Payment not found';
  end if;

  if v_status = 'SUCCESS' then
    return true; -- Already processed (idempotency)
  end if;

  if v_status <> 'PENDING' then
    raise exception 'Payment is not in PENDING state';
  end if;

  -- 2. Lock the user's credit account
  select id into v_account_id
  from public.credit_accounts
  where user_id = v_user_id
  order by created_at limit 1
  for update;

  if not found then
    raise exception 'Credit account not found for user';
  end if;

  -- 3. Update the balance
  update public.credit_accounts
  set balance = balance + v_credits_purchased,
      updated_at = timezone('utc', now())
  where id = v_account_id;

  -- 4. Create Ledger Entry
  insert into public.credit_transactions (
    credit_account_id, amount, type, reason, reference
  ) values (
    v_account_id, v_credits_purchased, 'PURCHASE', 'Purchased credits', p_payment_id
  );

  -- 5. Mark Payment as SUCCESS
  update public.payments
  set status = 'SUCCESS',
      provider_reference = p_provider_reference,
      updated_at = timezone('utc', now())
  where id = p_payment_id;

  return true;

exception
  when others then
    raise;
end;
$$;


-- =============================================================================
-- 5. UPDATE CONSUME CREDIT RPC TO RETURN TRANSACTION ID
-- =============================================================================

create or replace function public.consume_credit(
  p_user_id uuid,
  p_session_id uuid,
  p_type text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_balance integer;
  v_transaction_id uuid;
begin

  -- Make sure the caller can only consume their own credits.
  if p_user_id <> auth.uid() then
    return null;
  end if;

  -- Lock the account row.
  select id, balance into v_account_id, v_balance
  from public.credit_accounts
  where user_id = p_user_id
  order by created_at limit 1
  for update;

  if v_account_id is null or v_balance < 1 then
    return null;
  end if;

  -- Deduct one credit.
  update public.credit_accounts
  set balance = balance - 1, updated_at = timezone('utc', now())
  where id = v_account_id;

  -- Record transaction and get ID
  insert into public.credit_transactions (
    credit_account_id, amount, type, reason, reference
  )
  values (
    v_account_id, -1, p_type, 'Validation consumption', p_session_id::text
  ) returning id into v_transaction_id;

  -- Mark validation session as completed and link transaction
  update public.validation_sessions
  set status = 'COMPLETED',
      completed_at = timezone('utc', now()),
      credit_transaction_id = v_transaction_id,
      updated_at = timezone('utc', now())
  where id = p_session_id and user_id = p_user_id;

  return v_transaction_id;
end;
$$;
