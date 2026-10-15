"use client"

import { useMemo, useState } from "react"
import { DownloadIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { MonthPicker, usePeriod } from "@/components/period"
import { TransactionFormDialog } from "@/components/transaction-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/categories"
import { downloadCSV } from "@/lib/csv"
import { formatCurrency, formatDate, monthRange, pad } from "@/lib/format"
import { deleteTransaction, useTransactions } from "@/lib/transactions"
import type { Transaction } from "@/lib/types"
import { cn } from "@/lib/utils"

const ALL = "todas"
const CATEGORY_ITEMS = [{ value: ALL, label: "Todas as categorias" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]
const TYPE_ITEMS = [
  { value: ALL, label: "Receitas e despesas" },
  { value: "receita", label: "Só receitas" },
  { value: "despesa", label: "Só despesas" },
]

export function TransactionsView() {
  const { period } = usePeriod()
  const { from, to } = monthRange(period.year, period.month)
  const { data, loading, error, reload } = useTransactions(from, to)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState(ALL)
  const [type, setType] = useState(ALL)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("pt-BR")
    return data.filter(
      (t) =>
        (category === ALL || t.category === category) &&
        (type === ALL || t.type === type) &&
        (!q || t.description.toLocaleLowerCase("pt-BR").includes(q))
    )
  }, [data, search, category, type])

  const totals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of filtered) {
      if (t.type === "receita") income += t.amount
      else expense += t.amount
    }
    return { income, expense, balance: income - expense }
  }, [filtered])

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (t: Transaction) => {
    setEditing(t)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteTransaction(deleting.id)
      toast.success("Transação excluída.")
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.")
    } finally {
      setDeleting(null)
    }
  }

  function exportCSV() {
    if (!filtered.length) return toast.info("Nenhuma transação para exportar.")
    downloadCSV(filtered, `transacoes-${period.year}-${pad(period.month + 1)}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas receitas e despesas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthPicker />
          <Button variant="outline" onClick={exportCSV}>
            <DownloadIcon /> Exportar CSV
          </Button>
          <Button onClick={openNew}>
            <PlusIcon /> Nova transação
          </Button>
        </div>
      </div>

      <Card className="gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição…"
            className="pl-8"
            aria-label="Buscar por descrição"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Select value={category} onValueChange={(v) => setCategory(v ?? ALL)} items={CATEGORY_ITEMS}>
            <SelectTrigger className="w-full sm:w-48" aria-label="Categoria"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORY_ITEMS.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={(v) => setType(v ?? ALL)} items={TYPE_ITEMS}>
            <SelectTrigger className="w-full sm:w-44" aria-label="Tipo"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPE_ITEMS.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span className="text-muted-foreground">{filtered.length} transaç{filtered.length === 1 ? "ão" : "ões"}</span>
        <span>Receitas <strong className="text-income tabular-nums">{formatCurrency(totals.income)}</strong></span>
        <span>Despesas <strong className="text-expense tabular-nums">{formatCurrency(totals.expense)}</strong></span>
        <span>Saldo <strong className="tabular-nums">{formatCurrency(totals.balance)}</strong></span>
      </div>

      {error ? (
        <Card className="p-6 text-sm text-destructive">Erro ao carregar: {error}</Card>
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="items-center gap-3 p-10 text-center">
          <p className="font-medium">Nenhuma transação encontrada</p>
          <p className="text-sm text-muted-foreground">
            {data.length ? "Tente ajustar os filtros." : "Comece registrando sua primeira receita ou despesa deste mês."}
          </p>
          {!data.length && <Button onClick={openNew}><PlusIcon /> Nova transação</Button>}
        </Card>
      ) : (
        <>
          {/* Desktop */}
          <Card className="hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24 pr-4"><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-4 text-muted-foreground tabular-nums">{formatDate(t.date)}</TableCell>
                    <TableCell className="max-w-72 truncate font-medium">{t.description}</TableCell>
                    <TableCell><CategoryTag category={t.category} /></TableCell>
                    <TableCell className="text-right"><Amount t={t} /></TableCell>
                    <TableCell className="pr-4 text-right">
                      <RowActions onEdit={() => openEdit(t)} onDelete={() => setDeleting(t)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile */}
          <Card className="divide-y py-0 md:hidden">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.description}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {formatDate(t.date)} · <CategoryTag category={t.category} />
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Amount t={t} />
                  <RowActions onEdit={() => openEdit(t)} onDelete={() => setDeleting(t)} />
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} transaction={editing} onSaved={reload} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.description}” será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CategoryTag({ category }: { category: Transaction["category"] }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="size-2 rounded-full" style={{ background: CATEGORY_COLORS[category] }} />
      {category}
    </span>
  )
}

function Amount({ t }: { t: Transaction }) {
  const income = t.type === "receita"
  return (
    <span className={cn("font-medium tabular-nums", income ? "text-income" : "text-expense")}>
      {income ? "+" : "−"} {formatCurrency(t.amount)}
    </span>
  )
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-0.5">
      <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Editar">
        <PencilIcon />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label="Excluir" className="hover:text-destructive">
        <Trash2Icon />
      </Button>
    </div>
  )
}
