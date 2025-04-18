"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define the props type based on next-themes actual props
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
  forcedTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  themes?: string[]
  attribute?: string | 'class' | 'data-theme'
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}