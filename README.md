# Finanças Pessoais

Web app de gestão financeira pessoal: registre receitas e despesas, categorize e acompanhe
o saldo do mês num dashboard visual.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Recharts · Supabase (Auth + PostgreSQL + RLS) · Vercel

## Funcionalidades

- Landing page (`/`)
- Login e cadastro com e-mail/senha (Supabase Auth); `/dashboard` e `/transacoes` são protegidas em `src/proxy.ts`
- Dashboard: cards de Receitas, Despesas e Saldo, gráfico de pizza de despesas por categoria e barras dos últimos 6 meses
- CRUD de transações (descrição, valor, data, tipo, categoria)
- Filtros por mês/ano, categoria e tipo, além de busca por descrição
- Exportação das transações filtradas em CSV (compatível com Excel pt-BR)
- Layout responsivo com barra de navegação inferior no celular

## Como rodar

1. **Crie um projeto** em [supabase.com](https://supabase.com).
2. **Crie a tabela:** abra *SQL Editor*, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e execute.
3. **Configure as variáveis:**
   ```bash
   cp .env.example .env.local
   ```
   Preencha com a URL do projeto e a chave *publishable* (ou *anon*), que ficam em *Project Settings → API*.
4. **Configure as URLs de autenticação:** em *Authentication → URL Configuration*, defina a *Site URL*
   (`http://localhost:3000` em dev) e adicione `http://localhost:3000/auth/confirm` às *Redirect URLs*.
   Para testar sem confirmar e-mail, desative *Confirm email* em *Authentication → Providers → Email*.
5. **Rode:**
   ```bash
   npm install
   npm run dev
   ```

## Deploy na Vercel

1. Suba o repositório para o GitHub e importe-o na Vercel.
2. Cadastre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em *Environment Variables*.
3. No Supabase, atualize a *Site URL* e adicione `https://SEU-APP.vercel.app/auth/confirm` às *Redirect URLs*.

## Estrutura

```
supabase/schema.sql              tabela transactions + políticas RLS
src/proxy.ts                     renova a sessão e protege as rotas
src/lib/supabase/                clientes Supabase (browser, server, proxy)
src/lib/transactions.ts          hook useTransactions + salvar/excluir
src/lib/categories.ts            categorias e cores
src/lib/csv.ts                   exportação CSV
src/app/page.tsx                 landing page
src/app/login/                   login e cadastro
src/app/auth/confirm/route.ts    callback do e-mail de confirmação
src/app/(app)/dashboard/         dashboard e gráficos
src/app/(app)/transacoes/        lista, filtros, CRUD e exportação
```

## Segurança

Cada linha de `transactions` tem `user_id` (preenchido automaticamente com `auth.uid()`), e as
políticas RLS garantem que cada usuário só lê e altera as próprias transações, inclusive
em chamadas diretas à API do Supabase.
