# Clinica Juliana Vieira - Farmaceutica Esteta

Site institucional com agendamento online para a clinica da Juliana Vieira.

## Tecnologias

- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, RLS, Storage)
- Resend (envio de e-mail de notificacao)
- Vercel (hospedagem)

## Estrutura do projeto

```
/app                 rotas (App Router)
  /admin              painel administrativo (protegido por login)
  /api/appointments   rota que cria agendamentos com seguranca
  page.tsx            pagina inicial publica
/components           componentes React reutilizaveis
/lib                  clientes Supabase, utilitarios, envio de e-mail
/public
  /images             logo e imagens
  /videos             video de fundo (hero.mp4)
/supabase
  supabase-schema.sql  script SQL completo do banco
/types                 tipos TypeScript do banco de dados
```

## Como rodar localmente

1. Instale as dependencias:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env.local` e preencha com as chaves do seu
   projeto Supabase (veja a secao abaixo).
3. Rode o servidor local:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000`.

## Como configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor** e execute todo o conteudo de
   `supabase/supabase-schema.sql`. Isso cria as tabelas `procedures`,
   `available_slots`, `appointments`, `profiles`, alem das trocas de RLS e da
   trigger que impede agendamento duplicado no mesmo horario.
3. Em **Authentication > Users**, crie o usuario administrador (e-mail/senha
   da Juliana). Depois, no **SQL Editor**, rode:
   ```sql
   insert into public.profiles (id, full_name, role)
   values ('COLE_AQUI_O_ID_DO_USUARIO', 'Juliana Vieira', 'admin');
   ```
   O ID do usuario aparece na lista de **Authentication > Users**.
4. Em **Project Settings > API**, copie a **Project URL** e a
   **anon/publishable key** para o `.env.local`.

## Variaveis de ambiente

| Variavel | Onde usar | Descricao |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | publica | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publica | Chave publica (anon) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | somente servidor | Usada na API de agendamento; nunca deve ir para o navegador |
| `RESEND_API_KEY` | somente servidor | Chave da API do Resend para envio de e-mail |
| `CLINIC_OWNER_EMAIL` | somente servidor | E-mail que recebe a notificacao de novo agendamento |

## Publicar (Vercel)

1. Suba o projeto para o GitHub.
2. Importe o repositorio na Vercel.
3. Configure as mesmas variaveis de ambiente do `.env.local` em
   **Project Settings > Environment Variables** na Vercel.
4. Clique em Deploy.

A cada `git push` na branch `main`, a Vercel publica automaticamente uma nova
versao (Etapa 16 do guia).

## Estrutura do banco de dados

- `procedures`: catalogo de procedimentos (nome, descricao, duracao, preco).
- `available_slots`: horarios disponiveis (`open`, `booked` ou `blocked`),
  com constraint `unique(slot_date, slot_time)`.
- `appointments`: agendamentos das clientes, com `unique(slot_id)` e uma
  trigger que marca o horario como `booked` de forma atomica — isso e o que
  impede duas pessoas reservarem o mesmo horario ao mesmo tempo.
- `profiles`: liga um usuario do Supabase Auth ao papel de administrador.

## Seguranca

- Row Level Security (RLS) ativado em todas as tabelas.
- CPF e telefone das clientes **nao sao publicos**: somente o admin
  autenticado consegue ler a tabela `appointments`.
- A `SUPABASE_SERVICE_ROLE_KEY` e usada apenas na API route do servidor,
  nunca exposta ao navegador (o pacote `server-only` garante isso em tempo de
  build).
- `/admin` e protegido por `middleware.ts`: sem login, o visitante e
  redirecionado para `/admin/login`.
- LGPD: o formulario de agendamento exige consentimento explicito antes de
  enviar nome, celular e CPF.
