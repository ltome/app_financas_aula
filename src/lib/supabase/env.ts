/**
 * Lê as variáveis do Supabase com uma mensagem clara quando faltam
 * (ex.: deploy na Vercel sem as Environment Variables cadastradas).
 * Acesso literal a process.env.NEXT_PUBLIC_* para o Next embutir os valores no bundle do navegador.
 */
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
        "(.env.local em dev; Settings → Environment Variables na Vercel)."
    )
  }
  return { url, key }
}
