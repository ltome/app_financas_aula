"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabase } from "@/lib/transactions"

type Mode = "login" | "cadastro"

const ERRORS: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  "User already registered": "Já existe uma conta com este e-mail.",
}

export function AuthForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<Mode>(params.get("modo") === "cadastro" ? "cadastro" : "login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    params.get("erro") ? "Não foi possível confirmar o e-mail. Tente novamente." : null
  )

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email"))
    const password = String(form.get("password"))
    setLoading(true)
    setError(null)

    const supabase = getSupabase()
    const { data, error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
          })

    setLoading(false)
    if (error) {
      setError(ERRORS[error.message] ?? error.message)
      return
    }
    if (!data.session) {
      toast.success("Conta criada! Confira seu e-mail para confirmar o cadastro.")
      setMode("login")
      return
    }
    router.replace("/dashboard")
    router.refresh()
  }

  const isLogin = mode === "login"

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{isLogin ? "Bem-vindo de volta" : "Crie sua conta"}</CardTitle>
        <CardDescription>
          {isLogin ? "Entre para ver seu dashboard." : "Leva menos de um minuto."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={isLogin ? "" : "Mínimo de 6 caracteres"}
            />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Aguarde…" : isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setMode(isLogin ? "cadastro" : "login")
              setError(null)
            }}
          >
            {isLogin ? "Cadastre-se" : "Entrar"}
          </button>
        </p>
      </CardContent>
    </Card>
  )
}
