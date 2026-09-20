'use client'

import {
  BarChart3,
  FilePlus2,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type ReactNode, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Link, usePathname, useRouter } from '@/lib/navigation'
import { useUIStore } from '@/lib/stores/ui-store'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dasbor', icon: LayoutDashboard },
  { href: '/input', label: 'Analisis Baru', icon: FilePlus2 },
  { href: '/hasil', label: 'Hasil Analisis', icon: BarChart3 },
  { href: '/riwayat', label: 'Riwayat Analisis', icon: History },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1" aria-label="Navigasi utama">
      {nav.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-ink text-ivory'
                : 'text-muted-foreground hover:bg-surface-strong hover:text-ink',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-ink text-ivory">
        <Sparkles className="size-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold tracking-tight text-ink">Statistics Story AI</span>
    </Link>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const openSidebar = useUIStore((state) => state.openSidebar)
  const closeSidebar = useUIStore((state) => state.closeSidebar)
  const router = useRouter()
  const { isAuthenticated, isReady, user, signOut } = useAuth()

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isReady, router])

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-serif text-sm text-muted-foreground">Memeriksa sesi pengguna...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await signOut()
    router.replace('/login')
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <div className="mt-8 flex-1">
          <NavLinks />
        </div>

        {/* User Info & Logout */}
        <div className="space-y-3 pt-4 border-t border-border">
          {user ? (
            <div className="rounded-xl border border-border bg-surface-strong p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-full bg-ink text-ivory text-xs">
                  <User className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{user.email}</p>
                  <p className="text-[11px] capitalize text-muted-foreground">
                    Peran: {user.peran}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            Keluar dari Akun
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={openSidebar}
          className="flex size-9 items-center justify-center rounded-lg border border-border text-ink transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
          aria-label="Buka menu navigasi"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isSidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              aria-hidden="true"
            />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface px-4 py-6"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between px-2">
                <Brand />
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="flex size-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
                  aria-label="Tutup menu navigasi"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-8 flex-1">
                <NavLinks onNavigate={closeSidebar} />
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                {user ? (
                  <div className="rounded-xl border border-border bg-surface-strong p-3">
                    <p className="truncate text-xs font-semibold text-ink">{user.email}</p>
                    <p className="text-[11px] capitalize text-muted-foreground">
                      Peran: {user.peran}
                    </p>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  Keluar dari Akun
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</div>
      </main>
    </div>
  )
}
