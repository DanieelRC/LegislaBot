"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { GavelIcon, Menu, X, Home, FileText, Settings, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Proyectos", href: "/bills", icon: FileText },
  { name: "Configuración", href: "/settings", icon: Settings },
  { name: "Acerca de", href: "/about", icon: Info },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <GavelIcon className="h-6 w-6 text-emerald-600" />
          <span className="font-bold text-xl text-emerald-700">LegislaBot</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-gray-600 hover:text-emerald-600 flex items-center space-x-1",
                pathname === item.href && "text-emerald-600 font-medium",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}

        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <GavelIcon className="h-6 w-6 text-emerald-600" />
                    <span className="font-bold text-xl text-emerald-700">LegislaBot</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4 flex-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-gray-100",
                        pathname === item.href && "bg-emerald-50 text-emerald-600",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
