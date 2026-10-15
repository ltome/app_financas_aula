"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Category } from "@/lib/categories"
import { todayISO } from "@/lib/format"
import { saveTransaction } from "@/lib/transactions"
import type { Transaction, TransactionType } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Transação sendo editada; ausente = nova transação. */
  transaction?: Transaction | null
  onSaved: () => void
}

export function TransactionFormDialog({ open, onOpenChange, transaction, onSaved }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar transação" : "Nova transação"}</DialogTitle>
          <DialogDescription>Preencha os dados da receita ou despesa.</DialogDescription>
        </DialogHeader>
        {/* key remonta o formulário a cada abertura, zerando o estado. */}
        {open && (
          <TransactionForm
            key={transaction?.id ?? "new"}
            transaction={transaction}
            onCancel={() => onOpenChange(false)}
            onSaved={() => {
              onOpenChange(false)
              onSaved()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function TransactionForm({
  transaction,
  onCancel,
  onSaved,
}: {
  transaction?: Transaction | null
  onCancel: () => void
  onSaved: () => void
}) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "despesa")
  const [category, setCategory] = useState<Category | null>(transaction?.category ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = type === "receita" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  function changeType(next: TransactionType) {
    setType(next)
    const allowed = next === "receita" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    if (category && !allowed.includes(category)) setCategory(null)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const description = String(form.get("description")).trim()
    const amount = parseAmount(String(form.get("amount")))
    const date = String(form.get("date"))

    if (!description) return setError("Informe uma descrição.")
    if (!Number.isFinite(amount) || amount <= 0) return setError("Informe um valor maior que zero.")
    if (!category) return setError("Escolha uma categoria.")

    setSaving(true)
    setError(null)
    try {
      await saveTransaction(
        { description, amount: Math.round(amount * 100) / 100, date, type, category },
        transaction?.id
      )
      toast.success(transaction ? "Transação atualizada." : "Transação adicionada.")
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="radiogroup" aria-label="Tipo">
        {(["despesa", "receita"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => changeType(t)}
            className={cn(
              "rounded-md py-1.5 text-sm font-medium text-muted-foreground transition-colors",
              type === t && "bg-background shadow-sm",
              type === t && (t === "receita" ? "text-income" : "text-expense")
            )}
          >
            {t === "receita" ? "Receita" : "Despesa"}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          required
          maxLength={200}
          defaultValue={transaction?.description}
          placeholder={type === "receita" ? "Ex.: Salário de outubro" : "Ex.: Supermercado"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            name="amount"
            required
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={transaction ? transaction.amount.toFixed(2).replace(".", ",") : ""}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" required defaultValue={transaction?.date ?? todayISO()} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Categoria</Label>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as Category | null)}
          items={categories.map((c) => ({ value: c, label: c }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
      </DialogFooter>
    </form>
  )
}

/** Aceita "1.234,56", "1234,56" e "1234.56". */
function parseAmount(raw: string) {
  const s = raw.replace(/[R$\s]/g, "")
  return Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s)
}
