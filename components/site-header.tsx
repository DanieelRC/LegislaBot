"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, Scale, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Redactar", href: "/" },
  { name: "Borradores", href: "/bills" },
  { name: "Ejemplo", href: "/example" },
  { name: "Acerca de", href: "/about" },
]

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="LegislaBot, inicio">
      <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
        <Scale className="h-4 w-4" aria-hidden />
      </span>
      <span className="font-serif text-xl font-semibold tracking-tight">LegislaBot</span>
    </Link>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Brand />

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(item.href) &&
                  "text-foreground after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:bg-gold",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex">
            <Link href="/settings" aria-label="Ajustes">
              <Settings />
            </Link>
          </Button>
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menú</SheetTitle>
              <Brand className="mb-8" />
              <nav aria-label="Móvil" className="flex flex-col gap-1">
                {[...navItems, { name: "Ajustes", href: "/settings" }].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-base text-muted-foreground hover:bg-accent hover:text-foreground",
                      isActive(item.href) && "bg-accent font-medium text-foreground",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
