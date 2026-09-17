-- WEKA GlobalPay — Supabase Schema
-- Run this in the Supabase SQL Editor to set up all tables.

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────
create table if not exists customers (
  id            text primary key default 'cus_' || substr(gen_random_uuid()::text, 1, 8),
  name          text not null,
  email         text not null unique,
  phone         text,
  country       text,
  status        text not null default 'active' check (status in ('active','suspended','pending_kyc')),
  balance       numeric(18,6) not null default 0,
  verified      boolean not null default false,
  transactions  integer not null default 0,
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- WALLETS
-- ─────────────────────────────────────────
create table if not exists wallets (
  id            text primary key default 'wal_' || substr(gen_random_uuid()::text, 1, 8),
  customer_id   text not null references customers(id) on delete cascade,
  balance       numeric(18,6) not null default 0,
  pending       numeric(18,6) not null default 0,
  currency      text not null default 'USDC',
  status        text not null default 'active' check (status in ('active','frozen','inactive')),
  network       text not null default 'Arc',
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- TRANSACTIONS
-- ─────────────────────────────────────────
create table if not exists transactions (
  id            text primary key default 'txn_' || substr(gen_random_uuid()::text, 1, 8),
  customer_id   text not null references customers(id) on delete cascade,
  amount        numeric(18,6) not null,
  currency      text not null default 'USDC',
  type          text not null check (type in ('payment','transfer','bridge','swap','deposit','withdrawal')),
  status        text not null default 'pending' check (status in ('completed','pending','failed','processing')),
  sender        text,
  recipient     text,
  fee           numeric(18,6) default 0,
  network       text default 'Arc',
  request_id    text,
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- PAYMENT LINKS
-- ─────────────────────────────────────────
create table if not exists payment_links (
  id                  text primary key default 'pl_' || substr(gen_random_uuid()::text, 1, 8),
  amount              numeric(18,6) not null,
  description         text not null,
  currency            text not null default 'USDC',
  status              text not null default 'active' check (status in ('active','expired','paid')),
  expires_at          timestamptz,
  payments_received   integer not null default 0,
  url                 text,
  metadata            jsonb default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- PAYMENT REQUESTS
-- ─────────────────────────────────────────
create table if not exists payment_requests (
  id          text primary key default 'preq_' || substr(gen_random_uuid()::text, 1, 8),
  from_email  text not null,
  amount      numeric(18,6) not null,
  description text not null,
  status      text not null default 'pending' check (status in ('pending','paid','expired','cancelled')),
  expires_at  timestamptz,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- API LOGS
-- ─────────────────────────────────────────
create table if not exists api_logs (
  id            text primary key default 'log_' || substr(gen_random_uuid()::text, 1, 8),
  method        text not null check (method in ('GET','POST','PUT','PATCH','DELETE')),
  endpoint      text not null,
  status_code   integer not null,
  response_time integer not null, -- ms
  request_id    text,
  request_body  jsonb,
  response_body jsonb,
  ip_address    text,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- WEBHOOK ENDPOINTS
-- ─────────────────────────────────────────
create table if not exists webhook_endpoints (
  id          text primary key default 'wh_' || substr(gen_random_uuid()::text, 1, 8),
  url         text not null,
  events      text[] not null default '{}',
  status      text not null default 'active' check (status in ('active','inactive')),
  secret      text not null default 'whsec_' || encode(gen_random_bytes(24), 'hex'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- WEBHOOK DELIVERIES
-- ─────────────────────────────────────────
create table if not exists webhook_deliveries (
  id              text primary key default 'del_' || substr(gen_random_uuid()::text, 1, 8),
  endpoint_id     text not null references webhook_endpoints(id) on delete cascade,
  event           text not null,
  status          text not null check (status in ('success','failed','pending')),
  attempts        integer not null default 1,
  response_code   integer,
  response_body   text,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_customers_updated before update on customers
  for each row execute function update_updated_at();
create trigger trg_wallets_updated before update on wallets
  for each row execute function update_updated_at();
create trigger trg_transactions_updated before update on transactions
  for each row execute function update_updated_at();
create trigger trg_payment_links_updated before update on payment_links
  for each row execute function update_updated_at();
create trigger trg_payment_requests_updated before update on payment_requests
  for each row execute function update_updated_at();
create trigger trg_webhook_endpoints_updated before update on webhook_endpoints
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (enable but allow authenticated users full access)
-- ─────────────────────────────────────────
alter table customers          enable row level security;
alter table wallets            enable row level security;
alter table transactions       enable row level security;
alter table payment_links      enable row level security;
alter table payment_requests   enable row level security;
alter table api_logs           enable row level security;
alter table webhook_endpoints  enable row level security;
alter table webhook_deliveries enable row level security;

-- Authenticated users can access all rows (dashboard users)
create policy "authenticated_all" on customers          for all to authenticated using (true) with check (true);
create policy "authenticated_all" on wallets            for all to authenticated using (true) with check (true);
create policy "authenticated_all" on transactions       for all to authenticated using (true) with check (true);
create policy "authenticated_all" on payment_links      for all to authenticated using (true) with check (true);
create policy "authenticated_all" on payment_requests   for all to authenticated using (true) with check (true);
create policy "authenticated_all" on api_logs           for all to authenticated using (true) with check (true);
create policy "authenticated_all" on webhook_endpoints  for all to authenticated using (true) with check (true);
create policy "authenticated_all" on webhook_deliveries for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
create index if not exists idx_transactions_customer_id  on transactions(customer_id);
create index if not exists idx_transactions_status       on transactions(status);
create index if not exists idx_transactions_created_at   on transactions(created_at desc);
create index if not exists idx_wallets_customer_id       on wallets(customer_id);
create index if not exists idx_api_logs_created_at       on api_logs(created_at desc);
create index if not exists idx_webhook_deliveries_ep     on webhook_deliveries(endpoint_id);

-- ─────────────────────────────────────────
-- SEED DEMO DATA
-- ─────────────────────────────────────────
insert into customers (id, name, email, phone, country, status, balance, verified, transactions) values
  ('cus_001', 'Acme Corp',        'finance@acmecorp.io',       '+1 415 555 0101', 'United States', 'active',      84920.50,  true,  1482),
  ('cus_002', 'TechFlow Inc',     'payments@techflow.com',     '+44 20 7946 0102','United Kingdom','active',      22100.00,  true,  644),
  ('cus_003', 'Global Markets',   'treasury@globalmarkets.co', '+65 6988 0103',   'Singapore',     'active',      195000.00, true,  3210),
  ('cus_004', 'Sunrise Payments', 'ops@sunrisepay.app',        '+1 212 555 0104', 'United States', 'active',      12450.75,  true,  892),
  ('cus_005', 'NovaPay',          'admin@novapay.io',          '+49 30 5555 0105','Germany',       'active',      48200.00,  true,  2104),
  ('cus_006', 'CloudBase',        'billing@cloudbase.dev',     '+1 650 555 0106', 'United States', 'pending_kyc', 5000.00,   false, 14),
  ('cus_007', 'Meridian Fund',    'ops@meridianfund.com',      '+852 2100 0107',  'Hong Kong',     'active',      510000.00, true,  5421),
  ('cus_008', 'Zephyr Retail',    'payments@zephyrretail.com', '+61 2 9200 0108', 'Australia',     'suspended',   0,         false, 88)
on conflict (id) do nothing;

insert into wallets (id, customer_id, balance, pending, currency, status, network) values
  ('wal_A1b2C3d4', 'cus_001', 84920.50,  0,        'USDC', 'active', 'Arc'),
  ('wal_E5f6G7h8', 'cus_002', 22100.00,  1100.00,  'USDC', 'active', 'Arc'),
  ('wal_I9j0K1l2', 'cus_003', 195000.00, 0,        'USDC', 'active', 'Arc'),
  ('wal_M3n4O5p6', 'cus_004', 12450.75,  560.00,   'USDC', 'active', 'Arc'),
  ('wal_Q7r8S9t0', 'cus_005', 48200.00,  0,        'USDC', 'active', 'Arc'),
  ('wal_U1v2W3x4', 'cus_006', 5000.00,   18000.00, 'USDC', 'active', 'Base'),
  ('wal_Y5z6A7b8', 'cus_007', 510000.00, 0,        'USDC', 'active', 'Arc'),
  ('wal_C9d0E1f2', 'cus_008', 0,         0,        'USDC', 'frozen', 'Arc')
on conflict (id) do nothing;
