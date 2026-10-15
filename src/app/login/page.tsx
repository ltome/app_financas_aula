import type { Metadata } from "next"
import { Suspense } from "react"
import { Logo } from "@/components/logo"
import { AuthForm } from "./auth-form"

export const metadata: Metadata = { title: "Entrar" }

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <Logo />
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  )
}
