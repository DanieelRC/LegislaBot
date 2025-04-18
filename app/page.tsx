import { LegislativeDraftingForm } from "@/components/legislative-drafting-form"
import { LegislativeHeader } from "@/components/legislative-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExampleInitiatives } from "@/components/example-initiatives"
import { DraftList } from "@/components/draft-list"
import { Toaster } from "@/components/ui/toaster"
import { EnvWarning } from "@/components/env-warning"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Suspense } from "react"
import { testConnection } from "@/lib/db"
import { DbFallback } from "@/components/db-fallback"

// Componente de carga para Suspense
function Loading() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  )
}

export default async function Home() {
  // Verificar la conexión a la base de datos
  let dbConnected = false
  try {
    dbConnected = await testConnection()
  } catch (error) {
    console.error("Error checking database connection:", error)
    // Continuamos con dbConnected = false
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pb-12">
        <div className="container mx-auto px-4 py-8">
          <LegislativeHeader />

          <EnvWarning />

          {!dbConnected ? (
            <DbFallback />
          ) : (
            <Tabs defaultValue="generate" className="mt-8">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="generate">Generar</TabsTrigger>
                <TabsTrigger value="examples">Ejemplos</TabsTrigger>
                <TabsTrigger value="drafts">Borradores</TabsTrigger>
              </TabsList>

              <TabsContent value="generate">
                <Suspense fallback={<Loading />}>
                  <LegislativeDraftingForm />
                </Suspense>
              </TabsContent>

              <TabsContent value="examples">
                <Suspense fallback={<Loading />}>
                  <ExampleInitiatives />
                </Suspense>
              </TabsContent>

              <TabsContent value="drafts">
                <Suspense fallback={<Loading />}>
                  <DraftList />
                </Suspense>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
      <Toaster />
    </>
  )
}
