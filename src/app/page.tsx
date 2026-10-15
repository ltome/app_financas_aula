import Link from "next/link"
import {
  ArrowRightIcon,
  DownloadIcon,
  FilterIcon,
  LockIcon,
  PieChartIcon,
  SmartphoneIcon,
  TagsIcon,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const features = [
  { icon: PieChartIcon, title: "Dashboard visual", text: "Receitas, despesas e saldo do mês num relance, com gráfico por categoria." },
  { icon: TagsIcon, title: "Categorias prontas", text: "Alimentação, Moradia, Salário, Freelance e mais — sem configurar nada." },
  { icon: FilterIcon, title: "Busca e filtros", text: "Encontre qualquer lançamento por mês, categoria, tipo ou descrição." },
  { icon: DownloadIcon, title: "Exportar CSV", text: "Leve suas transações filtradas para o Excel ou Google Planilhas." },
  { icon: SmartphoneIcon, title: "Feito para o celular", text: "Registre um gasto na fila do caixa. Funciona bem em qualquer tela." },
  { icon: LockIcon, title: "Dados protegidos", text: "Cada conta só enxerga as próprias transações, com Row Level Security." },
]

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>Entrar</Link>
          <Link href="/login?modo=cadastro" className={buttonVariants()}>Criar conta</Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <div>
            <p className="mb-4 inline-flex rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              Grátis · sem planilha · sem complicação
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Saiba para onde vai <span className="text-primary">cada real</span> do seu mês.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground text-pretty">
              Registre receitas e despesas em segundos e acompanhe saldo, categorias e
              tendências num dashboard limpo. Tudo num só lugar, no computador ou no celular.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?modo=cadastro" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
                Começar agora <ArrowRightIcon />
              </Link>
              <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 px-5 text-base")}>
                Já tenho conta
              </Link>
            </div>
          </div>
          <HeroPreview />
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tudo o que você precisa, nada que atrapalhe</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl border bg-background p-6">
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-4 font-medium">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Finanças Pessoais · feito com Next.js, Supabase e shadcn/ui
      </footer>
    </div>
  )
}

function HeroPreview() {
  const bars = [
    { label: "Moradia", pct: 82, color: "#8b5cf6" },
    { label: "Alimentação", pct: 54, color: "#f59e0b" },
    { label: "Transporte", pct: 31, color: "#3b82f6" },
    { label: "Lazer", pct: 18, color: "#ec4899" },
  ]
  return (
    <div aria-hidden className="rounded-2xl border bg-card p-5 shadow-xl shadow-primary/5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Receitas", value: "R$ 6.400", cls: "text-income" },
          { label: "Despesas", value: "R$ 4.182", cls: "text-expense" },
          { label: "Saldo", value: "R$ 2.218", cls: "text-primary" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className={cn("mt-1 font-semibold tabular-nums sm:text-lg", c.cls)}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border p-4">
        <p className="text-sm font-medium">Despesas por categoria</p>
        <div className="mt-4 space-y-3">
          {bars.map((b) => (
            <div key={b.label} className="grid grid-cols-[6rem_1fr] items-center gap-3 text-xs">
              <span className="text-muted-foreground">{b.label}</span>
              <span className="h-2 rounded-full bg-muted">
                <span className="block h-2 rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
