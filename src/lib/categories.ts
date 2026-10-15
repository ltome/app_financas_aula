export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Salário",
  "Freelance",
  "Outros",
] as const

export type Category = (typeof CATEGORIES)[number]

export const INCOME_CATEGORIES: Category[] = ["Salário", "Freelance", "Outros"]
export const EXPENSE_CATEGORIES: Category[] = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Outros",
]

export const CATEGORY_COLORS: Record<Category, string> = {
  Alimentação: "#f59e0b",
  Transporte: "#3b82f6",
  Moradia: "#8b5cf6",
  Lazer: "#ec4899",
  Saúde: "#ef4444",
  Educação: "#06b6d4",
  Salário: "#10b981",
  Freelance: "#84cc16",
  Outros: "#94a3b8",
}
