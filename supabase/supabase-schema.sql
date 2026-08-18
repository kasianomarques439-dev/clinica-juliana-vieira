-- ============================================================
-- CLÍNICA JULIANA VIEIRA - SUPABASE
-- SCHEMA COMPLETO DE REFERÊNCIA / BACKUP
--
-- IMPORTANTE:
-- Este arquivo representa o estado atual desejado do banco.
-- Para atualizar um banco existente, use os arquivos de migrations.
-- NÃO execute este arquivo inteiro no banco de produção apenas para
-- aplicar uma alteração pequena.
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- 1. PERFIS / ADMINISTRADORES
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'admin'
    check (role in ('admin')),
  created_at timestamptz not null default now()
);


-- ============================================================
-- 2. PROCEDIMENTOS
-- ============================================================

create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  short_description text not null default '',

  description text not null default '',

  duration_minutes integer not null default 60
    check (duration_minutes > 0),

  price_cents integer
    check (price_cents is null or price_cents >= 0),

  image_url text,

  is_active boolean not null default true,

  display_order integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

create index if not exists idx_procedures_active
on public.procedures (is_active);

create index if not exists idx_procedures_order
on public.procedures (display_order);


-- ============================================================
-- 3. HORÁRIOS DISPONÍVEIS
-- ============================================================

create table if not exists public.available_slots (
  id uuid primary key default gen_random_uuid(),

  procedure_id uuid
    references public.procedures(id)
    on delete cascade,

  slot_date date not null,

  slot_time time not null,

  status text not null default 'open'
    check (status in ('open', 'booked', 'blocked')),

  created_at timestamptz not null default now(),

  unique (procedure_id, slot_date, slot_time)
);

create index if not exists idx_slots_date
on public.available_slots (slot_date);

create index if not exists idx_slots_status
on public.available_slots (status);

create index if not exists idx_slots_procedure
on public.available_slots (procedure_id);


-- ============================================================
-- 4. AGENDAMENTOS
--
-- CPF foi removido do agendamento público.
-- A coluna cpf permanece temporariamente no banco como nullable
-- para compatibilidade com a migration já executada.
-- Novos agendamentos gravam cpf = null.
-- ============================================================

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),

  slot_id uuid not null
    references public.available_slots(id)
    on delete restrict,

  procedure_id uuid not null
    references public.procedures(id)
    on delete restrict,

  full_name text not null,

  phone text not null,

  cpf text,

  status text not null default 'confirmed'
    check (
      status in (
        'confirmed',
        'cancelled',
        'completed',
        'no_show'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_date
on public.appointments (created_at desc);

create index if not exists idx_appointments_phone
on public.appointments (phone);

-- Somente um agendamento confirmado por horário.
-- Se o agendamento for cancelado, o horário pode ser utilizado novamente.
create unique index if not exists
idx_unique_active_appointment_per_slot
on public.appointments (slot_id)
where status = 'confirmed';


-- ============================================================
-- 5. FUNÇÃO PARA SABER SE É ADMIN
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;


-- ============================================================
-- 6. UPDATED_AT AUTOMÁTICO
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_procedures_updated_at
on public.procedures;

create trigger trg_procedures_updated_at
before update on public.procedures
for each row
execute function public.set_updated_at();

drop trigger if exists trg_appointments_updated_at
on public.appointments;

create trigger trg_appointments_updated_at
before update on public.appointments
for each row
execute function public.set_updated_at();


-- ============================================================
-- 7. FUNÇÃO PARA CRIAR AGENDAMENTO
--
-- Estado atual após a migration 001_remover_cpf.sql:
-- recebe apenas horário, procedimento, nome e telefone.
-- ============================================================

drop function if exists public.create_appointment(
  uuid,
  uuid,
  text,
  text,
  text
);

create or replace function public.create_appointment(
  p_slot_id uuid,
  p_procedure_id uuid,
  p_full_name text,
  p_phone text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot public.available_slots%rowtype;
  v_appointment_id uuid;
begin

  -- Validação básica do nome.
  if p_full_name is null
     or length(trim(p_full_name)) < 3 then
    raise exception 'Nome inválido.';
  end if;

  -- Validação básica do telefone.
  if p_phone is null
     or length(regexp_replace(p_phone, '[^0-9]', '', 'g')) < 10 then
    raise exception 'Telefone inválido.';
  end if;

  -- Trava o horário durante a reserva para reduzir risco de
  -- duas reservas simultâneas para o mesmo slot.
  select *
  into v_slot
  from public.available_slots
  where id = p_slot_id
  for update;

  if not found then
    raise exception 'Horário não encontrado.';
  end if;

  if v_slot.status <> 'open' then
    raise exception 'Horário não está disponível.';
  end if;

  -- O horário precisa pertencer ao procedimento informado.
  if v_slot.procedure_id is distinct from p_procedure_id then
    raise exception 'Procedimento inválido para este horário.';
  end if;

  -- Cria o agendamento sem CPF.
  insert into public.appointments (
    slot_id,
    procedure_id,
    full_name,
    phone,
    cpf,
    status
  )
  values (
    p_slot_id,
    p_procedure_id,
    trim(p_full_name),
    p_phone,
    null,
    'confirmed'
  )
  returning id into v_appointment_id;

  -- Marca o horário como ocupado.
  update public.available_slots
  set status = 'booked'
  where id = p_slot_id;

  return v_appointment_id;

end;
$$;


-- ============================================================
-- 8. CANCELAMENTO / ALTERAÇÃO DE STATUS
--
-- Quando admin cancelar um agendamento confirmado,
-- o horário volta a ficar disponível.
-- ============================================================

create or replace function public.handle_appointment_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  -- Confirmado -> Cancelado
  if old.status = 'confirmed'
     and new.status = 'cancelled' then

    update public.available_slots
    set status = 'open'
    where id = new.slot_id;

  end if;

  -- Cancelado -> Confirmado
  if old.status = 'cancelled'
     and new.status = 'confirmed' then

    if not exists (
      select 1
      from public.available_slots
      where id = new.slot_id
        and status = 'open'
    ) then
      raise exception
      'Este horário não está disponível.';
    end if;

    update public.available_slots
    set status = 'booked'
    where id = new.slot_id;

  end if;

  return new;
end;
$$;

drop trigger if exists trg_appointment_status
on public.appointments;

create trigger trg_appointment_status
before update of status
on public.appointments
for each row
execute function public.handle_appointment_status();


-- ============================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles
enable row level security;

alter table public.procedures
enable row level security;

alter table public.available_slots
enable row level security;

alter table public.appointments
enable row level security;


-- ============================================================
-- PROFILES
-- ============================================================

drop policy if exists "profiles_select_own"
on public.profiles;

create policy "profiles_select_own"
on public.profiles
for select
using (
  auth.uid() = id
);


-- ============================================================
-- PROCEDURES
-- Público vê procedimentos ativos.
-- Admin pode ver todos.
-- ============================================================

drop policy if exists "procedures_public_select"
on public.procedures;

create policy "procedures_public_select"
on public.procedures
for select
using (
  is_active = true
  or public.is_admin()
);

drop policy if exists "procedures_admin_insert"
on public.procedures;

create policy "procedures_admin_insert"
on public.procedures
for insert
with check (
  public.is_admin()
);

drop policy if exists "procedures_admin_update"
on public.procedures;

create policy "procedures_admin_update"
on public.procedures
for update
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

drop policy if exists "procedures_admin_delete"
on public.procedures;

create policy "procedures_admin_delete"
on public.procedures
for delete
using (
  public.is_admin()
);


-- ============================================================
-- HORÁRIOS
--
-- O público pode consultar horários.
-- Somente admin pode criar, alterar ou excluir.
-- ============================================================

drop policy if exists "slots_public_select"
on public.available_slots;

create policy "slots_public_select"
on public.available_slots
for select
using (true);

drop policy if exists "slots_admin_insert"
on public.available_slots;

create policy "slots_admin_insert"
on public.available_slots
for insert
with check (
  public.is_admin()
);

drop policy if exists "slots_admin_update"
on public.available_slots;

create policy "slots_admin_update"
on public.available_slots
for update
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

drop policy if exists "slots_admin_delete"
on public.available_slots;

create policy "slots_admin_delete"
on public.available_slots
for delete
using (
  public.is_admin()
);


-- ============================================================
-- APPOINTMENTS
--
-- Cliente não pode consultar a tabela diretamente.
-- Cliente não pode inserir diretamente.
-- Somente admin consulta/altera/exclui.
-- ============================================================

drop policy if exists "appointments_public_insert"
on public.appointments;

drop policy if exists "appointments_admin_select"
on public.appointments;

create policy "appointments_admin_select"
on public.appointments
for select
using (
  public.is_admin()
);

drop policy if exists "appointments_admin_update"
on public.appointments;

create policy "appointments_admin_update"
on public.appointments
for update
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

drop policy if exists "appointments_admin_delete"
on public.appointments;

create policy "appointments_admin_delete"
on public.appointments
for delete
using (
  public.is_admin()
);


-- ============================================================
-- 10. PERMISSÃO DA FUNÇÃO PÚBLICA DE AGENDAMENTO
-- ============================================================

revoke all
on function public.create_appointment(
  uuid,
  uuid,
  text,
  text
)
from public;

grant execute
on function public.create_appointment(
  uuid,
  uuid,
  text,
  text
)
to anon, authenticated;


-- ============================================================
-- 11. STORAGE PARA IMAGENS DOS PROCEDIMENTOS
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'procedure-images',
  'procedure-images',
  true
)
on conflict (id)
do update set public = true;


-- ============================================================
-- POLÍTICAS DO STORAGE
-- ============================================================

drop policy if exists
"procedure_images_public_read"
on storage.objects;

create policy
"procedure_images_public_read"
on storage.objects
for select
using (
  bucket_id = 'procedure-images'
);

drop policy if exists
"procedure_images_admin_insert"
on storage.objects;

create policy
"procedure_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'procedure-images'
  and public.is_admin()
);

drop policy if exists
"procedure_images_admin_update"
on storage.objects;

create policy
"procedure_images_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'procedure-images'
  and public.is_admin()
)
with check (
  bucket_id = 'procedure-images'
  and public.is_admin()
);

drop policy if exists
"procedure_images_admin_delete"
on storage.objects;

create policy
"procedure_images_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'procedure-images'
  and public.is_admin()
);


-- ============================================================
-- 12. PERFIL ADMINISTRATIVO EXISTENTE
-- ============================================================

insert into public.profiles (
  id,
  full_name,
  role
)
select
  id,
  'Juliana Vieira',
  'admin'
from auth.users
where email = 'jvesteta@gmail.com'
on conflict (id)
do update set
  full_name = excluded.full_name,
  role = 'admin';


-- ============================================================
-- 13. PROCEDIMENTO DE AVALIAÇÃO
-- ============================================================

insert into public.procedures (
  name,
  short_description,
  description,
  duration_minutes,
  price_cents,
  image_url,
  is_active,
  display_order
)
select
  'Avaliação',
  'Primeira avaliação para novos clientes.',
  'Consulta inicial para conhecer as necessidades do cliente e definir os procedimentos mais indicados.',
  30,
  null,
  null,
  true,
  0
where not exists (
  select 1
  from public.procedures
  where lower(name) = lower('Avaliação')
);


-- ============================================================
-- 14. CATÁLOGO DE PROCEDIMENTOS
-- ============================================================

with novos_procedimentos (
  name,
  short_description,
  description,
  duration_minutes,
  price_cents,
  image_url,
  is_active,
  display_order
) as (
  values
    (
      'Toxina Botulínica (Botox)',
      'Suavização de linhas de expressão.',
      'Procedimento com toxina botulínica indicado para suavizar rugas e linhas de expressão, proporcionando uma aparência mais descansada e natural.',
      40,
      null,
      '/images/procedimentos/botox.png',
      true,
      1
    ),
    (
      'Preenchimento Labial',
      'Volume, contorno e definição dos lábios.',
      'Procedimento realizado com ácido hialurônico para melhorar volume, contorno, simetria e definição dos lábios.',
      60,
      null,
      '/images/procedimentos/preenchimento-labial.png',
      true,
      2
    ),
    (
      'Preenchimento Malar',
      'Realce e sustentação da região das maçãs do rosto.',
      'Preenchimento da região malar para melhorar sustentação facial, projeção e contorno das maçãs do rosto.',
      60,
      null,
      '/images/procedimentos/preenchimento-malar.png',
      true,
      3
    ),
    (
      'Preenchimento de Mandíbula',
      'Contorno e definição mandibular.',
      'Procedimento para melhorar o contorno da mandíbula e proporcionar maior definição ao perfil facial.',
      60,
      null,
      '/images/procedimentos/mandibula.png',
      true,
      4
    ),
    (
      'Preenchimento de Mento',
      'Projeção e harmonização do queixo.',
      'Preenchimento do mento para melhorar projeção, proporção e equilíbrio do perfil facial.',
      60,
      null,
      '/images/procedimentos/mento.png',
      true,
      5
    ),
    (
      'Preenchimento de Marionete',
      'Suavização das linhas ao redor da boca.',
      'Procedimento indicado para suavizar os sulcos conhecidos como linhas de marionete, melhorando o aspecto da região inferior da face.',
      60,
      null,
      '/images/procedimentos/marionete.png',
      true,
      6
    ),
    (
      'Preenchimento de Bigode Chinês',
      'Suavização do sulco nasogeniano.',
      'Preenchimento indicado para amenizar o sulco nasogeniano, conhecido popularmente como bigode chinês.',
      60,
      null,
      '/images/procedimentos/bigode-chines.png',
      true,
      7
    ),
    (
      'Preenchimento de Olheiras',
      'Suavização do aspecto profundo das olheiras.',
      'Procedimento indicado para melhorar o aspecto de olheiras profundas e proporcionar uma transição mais suave entre a pálpebra e a face.',
      60,
      null,
      '/images/procedimentos/olheiras.png',
      true,
      8
    ),
    (
      'Harmonização Facial',
      'Equilíbrio e valorização das proporções faciais.',
      'Conjunto personalizado de procedimentos estéticos voltados ao equilíbrio das proporções e valorização dos traços faciais.',
      90,
      null,
      '/images/procedimentos/harmonizacao-facial.png',
      true,
      9
    ),
    (
      'Intradermoterapia para Manchas',
      'Tratamento direcionado para manchas da pele.',
      'Aplicação de ativos selecionados para auxiliar no tratamento e melhora da aparência de manchas da pele.',
      45,
      null,
      '/images/procedimentos/manchas.png',
      true,
      10
    ),
    (
      'Intradermoterapia para Celulite',
      'Tratamento para melhorar o aspecto da celulite.',
      'Aplicação de ativos específicos para auxiliar na melhora do aspecto da celulite e da qualidade da pele.',
      45,
      null,
      '/images/procedimentos/celulite.png',
      true,
      11
    ),
    (
      'Intradermoterapia para Estrias',
      'Tratamento para melhorar a aparência das estrias.',
      'Protocolo direcionado para melhorar textura e aparência de áreas com estrias.',
      45,
      null,
      '/images/procedimentos/estrias.png',
      true,
      12
    ),
    (
      'Intradermoterapia para Flacidez',
      'Tratamento para melhora da firmeza da pele.',
      'Protocolo com ativos selecionados para auxiliar na melhora da firmeza e qualidade da pele.',
      45,
      null,
      '/images/procedimentos/flacidez.png',
      true,
      13
    ),
    (
      'Skinbooster',
      'Hidratação profunda e melhora da qualidade da pele.',
      'Tratamento injetável voltado à hidratação profunda, viço, textura e qualidade geral da pele.',
      60,
      null,
      '/images/procedimentos/skinbooster.png',
      true,
      14
    ),
    (
      'Bioestimulador de Colágeno Facial',
      'Estímulo de colágeno e melhora da firmeza facial.',
      'Procedimento que estimula a produção natural de colágeno, auxiliando na firmeza, sustentação e qualidade da pele.',
      60,
      null,
      '/images/procedimentos/bioestimulador-facial.png',
      true,
      15
    ),
    (
      'Fios de PDO',
      'Estímulo de colágeno e sustentação.',
      'Procedimento com fios de PDO utilizado para estimular colágeno e melhorar determinadas áreas de sustentação facial.',
      75,
      null,
      '/images/procedimentos/fios-pdo.png',
      true,
      16
    ),
    (
      'Harmonização dos Glúteos',
      'Protocolo personalizado para contorno e aparência dos glúteos.',
      'Tratamento personalizado voltado à melhora do contorno, qualidade da pele e harmonia da região glútea.',
      90,
      null,
      '/images/procedimentos/harmonizacao-gluteos.png',
      true,
      17
    ),
    (
      'Bioestimulador de Colágeno Corporal',
      'Estímulo de colágeno e firmeza corporal.',
      'Procedimento corporal voltado ao estímulo da produção de colágeno e melhora da firmeza e qualidade da pele.',
      60,
      null,
      '/images/procedimentos/bioestimulador-corporal.png',
      true,
      18
    )
)
insert into public.procedures (
  name,
  short_description,
  description,
  duration_minutes,
  price_cents,
  image_url,
  is_active,
  display_order
)
select
  np.name,
  np.short_description,
  np.description,
  np.duration_minutes,
  np.price_cents,
  np.image_url,
  np.is_active,
  np.display_order
from novos_procedimentos np
where not exists (
  select 1
  from public.procedures p
  where lower(p.name) = lower(np.name)
);


-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
