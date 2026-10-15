const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export const formatCurrency = (value: number) => currency.format(value)

/** "2026-10-14" → "14/10/2026" sem passar por Date (evita erro de fuso). */
export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3))

export const pad = (n: number) => String(n).padStart(2, "0")

export const todayISO = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Intervalo [início, fim) em YYYY-MM-DD; month é 0-11. `span` meses a partir de month. */
export function monthRange(year: number, month: number, span = 1) {
  const end = new Date(year, month + span, 1)
  return {
    from: `${year}-${pad(month + 1)}-01`,
    to: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-01`,
  }
}
