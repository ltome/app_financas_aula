import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { supabaseEnv } from "./env"

const PROTECTED_PREFIXES = ["/dashboard", "/transacoes"]
const AUTH_PAGES = ["/login"]

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { url, key } = supabaseEnv()

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Não coloque código entre createServerClient e getClaims():
  // é essa chamada que renova o token de sessão.
  const { data } = await supabase.auth.getClaims()
  const isLoggedIn = Boolean(data?.claims)
  const { pathname } = request.nextUrl

  const redirectTo = (path: string) => {
    const target = request.nextUrl.clone()
    target.pathname = path
    target.search = ""
    const redirect = NextResponse.redirect(target)
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  if (!isLoggedIn && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return redirectTo("/login")
  }
  if (isLoggedIn && AUTH_PAGES.includes(pathname)) {
    return redirectTo("/dashboard")
  }

  return response
}
