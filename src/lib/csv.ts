import type { Transaction } from "@/lib/types"

const escape = (value: string) =>
  /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

/** CSV com ";" e vírgula decimal, que é o que o Excel em pt-BR abre direto. */
export function toCSV(rows: Transaction[]) {
  const header = ["Data", "Descrição", "Categoria", "Tipo", "Valor"]
  const lines = rows.map((t) => [
    t.date,
    escape(t.description),
    t.category,
    t.type === "receita" ? "Receita" : "Despesa",
    (t.type === "despesa" ? -t.amount : t.amount).toFixed(2).replace(".", ","),
  ].join(";"))
  return [header.join(";"), ...lines].join("\r\n")
}

export function downloadCSV(rows: Transaction[], filename: string) {
  // BOM para o Excel reconhecer UTF-8 (acentos).
  const blob = new Blob(["﻿" + toCSV(rows)], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
