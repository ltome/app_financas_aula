import type { Category } from "@/lib/categories"

export type TransactionType = "receita" | "despesa"

export type Transaction = {
  id: string
  description: string
  amount: number
  date: string // YYYY-MM-DD
  type: TransactionType
  category: Category
  created_at: string
}

export type TransactionInput = Omit<Transaction, "id" | "created_at">
