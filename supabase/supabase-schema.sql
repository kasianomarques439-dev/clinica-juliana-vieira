-- ============================================================================
-- SCHEMA: Clinica Juliana Vieira - Farmaceutica Esteta
-- Execute este arquivo inteiro no SQL Editor do Supabase (Etapa 5 do guia)
-- ============================================================================

-- Extensao necessaria para gerar UUIDs
create extension if not exists "pgcrypto";

-- ============================================================================
-- TABELA: profiles
-- Guarda quem e administrador do painel. Ligada a auth.users do Supabase Auth.
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- TABELA: procedures
-- Catalogo de procedimentos oferecidos pela clinica
-- ============================================================================
create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  price_cents integer check (price_cents is null or price_cents >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_procedures_active on public.procedures (is_active);

-- ============================================================================
-- TABELA: available_slots
-- Horarios disponiveis para agendamento. Cada linha e um horario unico.
-- status: 'open' (livre), 'booked' (ocupado), 'blocked' (bloqueado manualmente)
-- ============================================================================
create table if not exists public.available_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  slot_time time not null,
  status text not null default 'open' check (status in ('open', 'booked', 'blocked')),
  procedure_id uuid references public.procedures(id) on delete set null,
  created_at timestamptz not null default now(),
  -- impede cadastrar o mesmo dia+hora duas vezes
  unique (slot_date, slot_time)
);

create index if not exists idx_slots_date_status on public.available_slots (slot_date, status);

-- ============================================================================
-- TABELA: appointments
-- Agendamentos feitos pelas clientes
-- ============================================================================
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.available_slots(id) on delete restrict,
  procedure_id uuid not null references public.procedures(id) on delete restrict,
  full_name text not null,
  phone text not null,
  cpf text not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  -- protecao extra: um slot so pode ter UM agendamento confirmado
  unique (slot_id)
);

create index if not exists idx_appointments_created_at on public.appointments (created_at desc);
create index if not exists idx_appointments_cpf on public.appointments (cpf);

-- ============================================================================
-- FUNCAO + TRIGGER: ao confirmar um agendamento, marca o slot como 'booked'
-- automaticamente. Isso e o que impede agendamento duplicado no mesmo horario,
-- mesmo se duas pessoas tentarem ao mesmo tempo (a constraint unique(slot_id)
-- em appointments e a unique(slot_date, slot_time) em available_slots sao a
-- garantia final no nivel do banco).
-- ============================================================================
create or replace function public.handle_new_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.available_slots
  set status = 'booked'
  where id = new.slot_id
    and status = 'open';

  if not found then
    raise exception 'Este horario nao esta mais disponivel.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_new_appointment on public.appointments;
create trigger trg_new_appointment
  before insert on public.appointments
  for each row
  execute function public.handle_new_appointment();

-- Se um agendamento for cancelado, o horario volta a ficar aberto
create or replace function public.handle_cancel_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.available_slots
    set status = 'open'
    where id = new.slot_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_cancel_appointment on public.appointments;
create trigger trg_cancel_appointment
  before update on public.appointments
  for each row
  execute function public.handle_cancel_appointment();

-- atualiza updated_at de procedures automaticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_procedures_updated_at on public.procedures;
create trigger trg_procedures_updated_at
  before update on public.procedures
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- FUNCAO AUXILIAR: verifica se o usuario logado e admin
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.procedures enable row level security;
alter table public.available_slots enable row level security;
alter table public.appointments enable row level security;

-- profiles: cada admin so ve o proprio perfil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- procedures: qualquer visitante (publico) pode ver os procedimentos ativos
drop policy if exists "procedures_public_select" on public.procedures;
create policy "procedures_public_select"
  on public.procedures for select
  using (is_active = true or public.is_admin());

-- procedures: somente admin pode inserir/editar/excluir
drop policy if exists "procedures_admin_write" on public.procedures;
create policy "procedures_admin_write"
  on public.procedures for insert
  with check (public.is_admin());

drop policy if exists "procedures_admin_update" on public.procedures;
create policy "procedures_admin_update"
  on public.procedures for update
  using (public.is_admin());

drop policy if exists "procedures_admin_delete" on public.procedures;
create policy "procedures_admin_delete"
  on public.procedures for delete
  using (public.is_admin());

-- available_slots: publico pode ver apenas horarios 'open' (para montar o calendario)
drop policy if exists "slots_public_select" on public.available_slots;
create policy "slots_public_select"
  on public.available_slots for select
  using (status = 'open' or public.is_admin());

-- available_slots: somente admin gerencia horarios
drop policy if exists "slots_admin_insert" on public.available_slots;
create policy "slots_admin_insert"
  on public.available_slots for insert
  with check (public.is_admin());

drop policy if exists "slots_admin_update" on public.available_slots;
create policy "slots_admin_update"
  on public.available_slots for update
  using (public.is_admin());

drop policy if exists "slots_admin_delete" on public.available_slots;
create policy "slots_admin_delete"
  on public.available_slots for delete
  using (public.is_admin());

-- appointments: NAO publico. Ninguem le CPF/telefone de outra pessoa.
-- Insercao publica e permitida (cliente cria seu proprio agendamento),
-- mas leitura e restrita ao admin.
drop policy if exists "appointments_public_insert" on public.appointments;
create policy "appointments_public_insert"
  on public.appointments for insert
  with check (true);

drop policy if exists "appointments_admin_select" on public.appointments;
create policy "appointments_admin_select"
  on public.appointments for select
  using (public.is_admin());

drop policy if exists "appointments_admin_update" on public.appointments;
create policy "appointments_admin_update"
  on public.appointments for update
  using (public.is_admin());

-- ============================================================================
-- DADOS DE EXEMPLO (opcional - pode apagar estas linhas se nao quiser)
-- ============================================================================
insert into public.procedures (name, description, duration_minutes, price_cents, is_active)
values
  ('Limpeza de Pele Profunda', 'Higienizacao, esfoliacao e extracao com produtos farmaceuticos de alta performance.', 60, 18000, true),
  ('Peeling Quimico', 'Renovacao celular para uniformizar textura e tom da pele.', 45, 25000, true),
  ('Preenchimento Labial', 'Procedimento com acido hialuronico para volume e contorno labial.', 50, 90000, true)
on conflict do nothing;

-- FIM DO SCRIPT
