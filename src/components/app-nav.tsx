"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboardIcon, ListIcon, LogOutIcon } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/transactions"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/transacoes", label: "Transações", icon: ListIcon },
] as const

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href="/dashboard" />
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname.startsWith(href) && "bg-muted text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOutIcon /> <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground",
            pathname.startsWith(href) && "text-primary"
          )}
        >
          <Icon className="size-5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
