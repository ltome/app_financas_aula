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

1. Em [vercel.com](https://vercel.com) → **Add New → Project**, importe o repositório do GitHub.
   O framework (Next.js) e os comandos de build são detectados automaticamente.
2. Em **Environment Variables**, cadastre para *Production*, *Preview* e *Development*:

   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://SEU-PROJETO.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |

   Se faltar alguma, o app mostra um erro explicando qual variável está ausente.
3. Clique em **Deploy**.
4. No Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://SEU-APP.vercel.app`
   - **Redirect URLs**: adicione `https://SEU-APP.vercel.app/auth/confirm` (mantenha a de `localhost` para desenvolvimento)

A partir daí, cada `git push` na `main` gera um novo deploy de produção, e cada pull request ganha uma URL de preview.

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

**No código**
- **Row Level Security:** cada linha de `transactions` tem `user_id` (preenchido com `auth.uid()`) e as políticas
  só permitem ler, criar, editar e excluir as próprias transações, inclusive em chamadas diretas à API.
- **Validação no banco:** `CHECK` constraints garantem valor > 0, tipo e categoria válidos e descrição até 200 caracteres.
- **Proteção de rotas:** `src/proxy.ts` valida o token (`getClaims`) e renova a sessão em cookies a cada requisição.
- **Cabeçalhos HTTP** (`next.config.ts`): Content-Security-Policy (só o próprio app e `*.supabase.co`),
  HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy e Permissions-Policy.
- **CSV:** descrições que começam com `=`, `+`, `-` ou `@` são neutralizadas para não virarem fórmula no Excel.
- **Segredos:** só a chave *publishable* é usada, porque ela foi feita para o navegador. `.env.local` não vai para o git.
  **Nunca** use a `service_role`/secret key neste projeto.

**No painel do Supabase (recomendado antes de divulgar o app)**
- **Authentication → Sign In / Providers → Email:** mantenha **Confirm email** ligado e defina
  **Minimum password length = 8** (o formulário já exige 8, mas a regra que vale é a do servidor).
- **Authentication → Emails → SMTP Settings:** configure um SMTP próprio (Resend, SendGrid…). O SMTP padrão
  do Supabase envia poucos e-mails por hora e serve só para testes.
- **Authentication → Rate Limits:** revise os limites de cadastro e login.
- **Advisors → Security Advisor:** rode e confira se não há alertas.
