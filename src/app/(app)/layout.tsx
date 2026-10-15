import { AppHeader, MobileNav } from "@/components/app-nav"
import { PeriodProvider } from "@/components/period"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-6 md:pb-12">
        <PeriodProvider>{children}</PeriodProvider>
      </main>
      <MobileNav />
    </>
  )
}
