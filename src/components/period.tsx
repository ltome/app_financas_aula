"use client"

import { createContext, use, useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MONTHS } from "@/lib/format"

type Period = { year: number; month: number } // month: 0-11

const PeriodContext = createContext<{
  period: Period
  shift: (delta: number) => void
} | null>(null)

/**
 * Mês selecionado, compartilhado entre Dashboard e Transações.
 * O mês atual é lido no navegador (após montar), nunca no prerender do servidor.
 */
export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<Period | null>(null)

  useEffect(() => {
    const now = new Date()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data atual só existe no cliente
    setPeriod({ year: now.getFullYear(), month: now.getMonth() })
  }, [])

  if (!period) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  const shift = (delta: number) =>
    setPeriod((p) => {
      const d = new Date(p!.year, p!.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  return <PeriodContext value={{ period, shift }}>{children}</PeriodContext>
}

export function usePeriod() {
  const ctx = use(PeriodContext)
  if (!ctx) throw new Error("usePeriod precisa de <PeriodProvider>")
  return ctx
}

export function MonthPicker() {
  const { period, shift } = usePeriod()
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-card p-0.5">
      <Button variant="ghost" size="icon-sm" onClick={() => shift(-1)} aria-label="Mês anterior">
        <ChevronLeftIcon />
      </Button>
      <span className="min-w-32 text-center text-sm font-medium tabular-nums">
        {MONTHS[period.month]} {period.year}
      </span>
      <Button variant="ghost" size="icon-sm" onClick={() => shift(1)} aria-label="Próximo mês">
        <ChevronRightIcon />
      </Button>
    </div>
  )
}
