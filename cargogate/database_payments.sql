-- =============================================================================
-- CARGOGATE COMPLIANCE
-- PAYMENTS & UNIFIED VALIDATIONS SCHEMA UPDATE
-- =============================================================================

-- =============================================================================
-- 1. PAYMENTS TABLE
-- =============================================================================

create table if not exists public.payments (
  id text primary key,
  user_id uuid not null
    references auth.users(id)
    on delete cascade,
  amount integer not null,
  currency text not null default 'KES',
  status text not null default 'PENDING',
  provider text,
  provider_reference text,
  credits_purchased integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);


-- =============================================================================
-- 2. PAYMENTS RLS
-- =============================================================================

alter table public.payments enable row level security;

drop policy if exists "Users can view their own payments"
on public.payments;

create policy "Users can view their own payments"
on public.payments
for select
to authenticated
using (
  user_id = auth.uid()
);


-- =============================================================================
-- 3. VALIDATION SESSIONS MODIFICATION
-- =============================================================================

alter table public.validation_sessions
  add column if not exists completed_at timestamptz;

alter table public.validation_sessions
  add column if not exists credit_transaction_id uuid;


-- =============================================================================
-- 4. CREDIT TRANSACTION FOREIGN KEY
-- =============================================================================

do $$
begin

  if not exists (
    select 1
    from pg_constraint
    where conname = 'validation_sessions_credit_transaction_id_fkey'
      and conrelid = 'public.validation_sessions'::regclass
  ) then

    alter table public.validation_sessions
      add constraint validation_sessions_credit_transaction_id_fkey
      foreign key (credit_transaction_id)
      references public.credit_transactions(id);

  end if;

end
$$;


-- =============================================================================
-- 5. VALIDATION CHECKS TABLE
-- =============================================================================

create table if not exists public.validation_checks (
  id uuid primary key default gen_random_uuid(),

  validation_session_id uuid not null
    references public.validation_sessions(id)
    on delete cascade,

  check_type text not null,

  input_value text,

  result text,

  result_details jsonb,

  validated_at timestamptz not null
    default timezone('utc', now())
);


-- =============================================================================
-- 6. VALIDATION CHECKS RLS
-- =============================================================================

alter table public.validation_checks enable row level security;

drop policy if exists "Users can view their own validation checks"
on public.validation_checks;

create policy "Users can view their own validation checks"
on public.validation_checks
for select
to authenticated
using (
  exists (
    select 1
    from public.validation_sessions vs
    where vs.id = validation_checks.validation_session_id
      and vs.user_id = auth.uid()
  )
);


-- =============================================================================
-- 7. PROCESS PAYMENT RPC
--
-- Atomically:
--   1. Locks the payment.
--   2. Verifies payment status.
--   3. Locks the user's credit account.
--   4. Adds purchased credits.
--   5. Creates a ledger transaction.
--   6. Marks payment as SUCCESS.
--
-- Existing successful payments are handled idempotently.
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

  -- ---------------------------------------------------------------------------
  -- 1. Find and lock payment
  -- ---------------------------------------------------------------------------

  select
    user_id,
    status,
    credits_purchased
  into
    v_user_id,
    v_status,
    v_credits_purchased
  from public.payments
  where id = p_payment_id
  for update;


  -- Payment does not exist.
  if not found then
    raise exception 'Payment not found';
  end if;


  -- Already processed.
  if v_status = 'SUCCESS' then
    return true;
  end if;


  -- Payment must be pending.
  if v_status <> 'PENDING' then
    raise exception 'Payment is not in PENDING state';
  end if;


  -- ---------------------------------------------------------------------------
  -- 2. Lock user's credit account
  -- ---------------------------------------------------------------------------

  select id
  into v_account_id
  from public.credit_accounts
  where user_id = v_user_id
  order by created_at
  limit 1
  for update;


  if not found then
    raise exception 'Credit account not found for user';
  end if;


  -- ---------------------------------------------------------------------------
  -- 3. Add purchased credits
  -- ---------------------------------------------------------------------------

  update public.credit_accounts
  set
    balance = balance + v_credits_purchased,
    updated_at = timezone('utc', now())
  where id = v_account_id;


  -- ---------------------------------------------------------------------------
  -- 4. Create credit ledger transaction
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
    v_credits_purchased,
    'PURCHASE',
    'Purchased credits',
    p_payment_id
  );


  -- ---------------------------------------------------------------------------
  -- 5. Mark payment successful
  -- ---------------------------------------------------------------------------

  update public.payments
  set
    status = 'SUCCESS',
    provider_reference = p_provider_reference,
    updated_at = timezone('utc', now())
  where id = p_payment_id;


  return true;

end;
$$;


-- =============================================================================
-- 8. CONSUME CREDIT RPC
--
-- IMPORTANT:
-- The old function already exists as:
--
--   consume_credit(uuid, uuid, text) RETURNS boolean
--
-- PostgreSQL does NOT allow CREATE OR REPLACE FUNCTION to change its
-- return type.
--
-- Therefore we explicitly DROP the old function first.
-- =============================================================================

drop function if exists public.consume_credit(
  uuid,
  uuid,
  text
);


-- =============================================================================
-- 9. CREATE NEW CONSUME CREDIT RPC
--
-- Returns the UUID of the credit transaction.
--
-- Returns NULL when:
--   - caller is not the requested user
--   - validation session does not exist
--   - validation session belongs to another user
--   - user has no credit account
--   - user has insufficient credits
-- =============================================================================

create function public.consume_credit(
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
  v_session_user_id uuid;
begin

  -- ---------------------------------------------------------------------------
  -- 1. Caller must be the user whose credit is being consumed.
  -- ---------------------------------------------------------------------------

  if p_user_id is null
     or auth.uid() is null
     or p_user_id <> auth.uid() then

    return null;

  end if;


  -- ---------------------------------------------------------------------------
  -- 2. Verify validation session belongs to this user.
  -- ---------------------------------------------------------------------------

  select user_id
  into v_session_user_id
  from public.validation_sessions
  where id = p_session_id;


  if not found then
    return null;
  end if;


  if v_session_user_id <> p_user_id then
    return null;
  end if;


  -- ---------------------------------------------------------------------------
  -- 3. Lock the user's credit account.
  -- ---------------------------------------------------------------------------

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


  -- No credit account.
  if not found then
    return null;
  end if;


  -- Insufficient credits.
  if v_balance < 1 then
    return null;
  end if;


  -- ---------------------------------------------------------------------------
  -- 4. Deduct one credit.
  -- ---------------------------------------------------------------------------

  update public.credit_accounts
  set
    balance = balance - 1,
    updated_at = timezone('utc', now())
  where id = v_account_id;


  -- ---------------------------------------------------------------------------
  -- 5. Create credit transaction.
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
    -1,
    p_type,
    'Validation consumption',
    p_session_id::text
  )
  returning id
  into v_transaction_id;


  -- ---------------------------------------------------------------------------
  -- 6. Complete validation session and link transaction.
  -- ---------------------------------------------------------------------------

  update public.validation_sessions
  set
    status = 'COMPLETED',
    completed_at = timezone('utc', now()),
    credit_transaction_id = v_transaction_id,
    updated_at = timezone('utc', now())
  where id = p_session_id
    and user_id = p_user_id;


  -- ---------------------------------------------------------------------------
  -- 7. Return transaction ID.
  -- ---------------------------------------------------------------------------

  return v_transaction_id;

end;
$$;


-- =============================================================================
-- 10. FUNCTION PERMISSIONS
-- =============================================================================

revoke execute
on function public.process_payment(text, text)
from public;

revoke execute
on function public.process_payment(text, text)
from anon;

revoke execute
on function public.process_payment(text, text)
from authenticated;


revoke execute
on function public.consume_credit(uuid, uuid, text)
from public;

revoke execute
on function public.consume_credit(uuid, uuid, text)
from anon;

grant execute
on function public.consume_credit(uuid, uuid, text)
to authenticated;


-- =============================================================================
-- 11. INDEXES
-- =============================================================================

create index if not exists payments_user_id_idx
on public.payments(user_id);

create index if not exists payments_status_idx
on public.payments(status);

create index if not exists validation_sessions_credit_transaction_id_idx
on public.validation_sessions(credit_transaction_id);

create index if not exists validation_checks_session_id_idx
on public.validation_checks(validation_session_id);


-- =============================================================================
-- END OF CARGOGATE PAYMENTS & VALIDATIONS UPDATE
-- =============================================================================