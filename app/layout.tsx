import type { Metadata, Viewport } from "next"
import { Inter, Source_Serif_4 } from "next/font/google"
import "./globals.css"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", display: "swap" })

const description =
  "Asistente de técnica legislativa: investiga, estructura y redacta proyectos de ley para la Ciudad de México, sección por sección y en tiempo real."

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: { default: "LegislaBot — Redacción asistida de proyectos de ley", template: "%s · LegislaBot" },
  description,
  openGraph: { title: "LegislaBot", description, type: "website", locale: "es_MX", siteName: "LegislaBot" },
  twitter: { card: "summary", title: "LegislaBot", description },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#111518" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <body className={`${sans.variable} ${serif.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Saltar al contenido
          </a>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="contenido" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
