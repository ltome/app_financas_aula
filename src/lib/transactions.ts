"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Transaction, TransactionInput } from "@/lib/types"

let client: ReturnType<typeof createClient> | null = null
/** Criado sob demanda: só existe no navegador, nunca durante o prerender. */
export const getSupabase = () => (client ??= createClient())

const normalize = (row: Transaction): Transaction => ({ ...row, amount: Number(row.amount) })

/** Busca as transações do usuário logado no intervalo [from, to). RLS filtra por usuário. */
export function useTransactions(from: string, to: string) {
  const [data, setData] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, error } = await getSupabase()
      .from("transactions")
      .select("*")
      .gte("date", from)
      .lt("date", to)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
    setError(error?.message ?? null)
    setData((data ?? []).map(normalize))
    setLoading(false)
  }, [from, to])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de dados
    reload()
  }, [reload])

  return { data, loading, error, reload }
}

export async function saveTransaction(input: TransactionInput, id?: string) {
  const query = id
    ? getSupabase().from("transactions").update(input).eq("id", id)
    : getSupabase().from("transactions").insert(input)
  const { error } = await query
  if (error) throw new Error(error.message)
}

export async function deleteTransaction(id: string) {
  const { error } = await getSupabase().from("transactions").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function signOut() {
  await getSupabase().auth.signOut()
}
