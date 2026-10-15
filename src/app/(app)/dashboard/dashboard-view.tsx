"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowDownRightIcon, ArrowUpRightIcon, PlusIcon, ScaleIcon } from "lucide-react"
import { MonthPicker, usePeriod } from "@/components/period"
import { TransactionFormDialog } from "@/components/transaction-form"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CATEGORY_COLORS, type Category } from "@/lib/categories"
import { formatCurrency, formatDate, monthRange, MONTHS_SHORT } from "@/lib/format"
import { useTransactions } from "@/lib/transactions"
import { cn } from "@/lib/utils"
import { CategoryPie, MonthlyBars } from "./charts"

const HISTORY_MONTHS = 6

export function DashboardView() {
  const { period } = usePeriod()
  const [formOpen, setFormOpen] = useState(false)

  // Carrega os últimos 6 meses (até o mês selecionado) numa única consulta.
  const start = new Date(period.year, period.month - (HISTORY_MONTHS - 1), 1)
  const { from, to } = monthRange(start.getFullYear(), start.getMonth(), HISTORY_MONTHS)
  const current = monthRange(period.year, period.month)
  const { data, loading, error, reload } = useTransactions(from, to)

  const stats = useMemo(() => {
    const month = data.filter((t) => t.date >= current.from && t.date < current.to)
    let income = 0
    let expense = 0
    const byCategory = new Map<Category, number>()
    for (const t of month) {
      if (t.type === "receita") income += t.amount
      else {
        expense += t.amount
        byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount)
      }
    }
    const pie = [...byCategory]
      .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] }))
      .sort((a, b) => b.value - a.value)

    const history = Array.from({ length: HISTORY_MONTHS }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
      const r = monthRange(d.getFullYear(), d.getMonth())
      const rows = data.filter((t) => t.date >= r.from && t.date < r.to)
      return {
        label: MONTHS_SHORT[d.getMonth()],
        Receitas: rows.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0),
        Despesas: rows.filter((t) => t.type === "despesa").reduce((s, t) => s + t.amount, 0),
      }
    })

    return { income, expense, balance: income - expense, pie, history, recent: month.slice(0, 5) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start/current derivam de `data` + período
  }, [data, current.from, current.to])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumo financeiro do mês.</p>
        </div>
        <div className="flex items-center gap-2">
          <MonthPicker />
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon /> <span className="hidden sm:inline">Nova transação</span>
          </Button>
        </div>
      </div>

      {error && <Card className="p-6 text-sm text-destructive">Erro ao carregar: {error}</Card>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Receitas" value={stats.income} loading={loading} icon={ArrowUpRightIcon} tone="income" />
        <StatCard label="Despesas" value={stats.expense} loading={loading} icon={ArrowDownRightIcon} tone="expense" />
        <StatCard
          label="Saldo"
          value={stats.balance}
          loading={loading}
          icon={ScaleIcon}
          tone={stats.balance < 0 ? "expense" : "primary"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Despesas por categoria</CardTitle>
            <CardDescription>Para onde foi o dinheiro neste mês</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="mx-auto size-52 rounded-full" />
            ) : stats.pie.length ? (
              <CategoryPie data={stats.pie} total={stats.expense} />
            ) : (
              <Empty text="Nenhuma despesa registrada neste mês." />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Receitas x Despesas</CardTitle>
            <CardDescription>Últimos {HISTORY_MONTHS} meses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : <MonthlyBars data={stats.history} />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="grid gap-1">
            <CardTitle>Últimas transações</CardTitle>
            <CardDescription>As mais recentes do mês</CardDescription>
          </div>
          <Link href="/transacoes" className={buttonVariants({ variant: "outline", size: "sm" })}>Ver todas</Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : stats.recent.length ? (
            <ul className="divide-y">
              {stats.recent.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: CATEGORY_COLORS[t.category] }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.date)} · {t.category}</p>
                  </div>
                  <span className={cn("font-medium tabular-nums", t.type === "receita" ? "text-income" : "text-expense")}>
                    {t.type === "receita" ? "+" : "−"} {formatCurrency(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Sem transações neste mês ainda." />
          )}
        </CardContent>
      </Card>

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={reload} />
    </div>
  )
}

function StatCard({
  label,
  value,
  loading,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  loading: boolean
  icon: React.ComponentType<{ className?: string }>
  tone: "income" | "expense" | "primary"
}) {
  const color = { income: "text-income bg-income/10", expense: "text-expense bg-expense/10", primary: "text-primary bg-primary/10" }[tone]
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-32" />
          ) : (
            <p className={cn("mt-1 text-2xl font-semibold tracking-tight tabular-nums", tone !== "primary" && color.split(" ")[0])}>
              {formatCurrency(value)}
            </p>
          )}
        </div>
        <span className={cn("flex size-9 items-center justify-center rounded-lg", color)}>
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>
}
