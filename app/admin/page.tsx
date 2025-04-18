import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ApiCostAnalysis } from "@/components/api-cost-analysis"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, FileText, Settings } from "lucide-react"

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

          <Tabs defaultValue="usage">
            <TabsList className="mb-6">
              <TabsTrigger value="usage" className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                Uso de API
              </TabsTrigger>
              <TabsTrigger value="bills" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Proyectos
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </TabsTrigger>
            </TabsList>

            <TabsContent value="usage">
              <ApiCostAnalysis />
            </TabsContent>

            <TabsContent value="bills">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de Proyectos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Total de Proyectos</h3>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Proyectos Publicados</h3>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Borradores</h3>
                      <p className="text-2xl font-bold">16</p>
                    </div>
                  </div>

                  <div className="text-center py-10 text-gray-500">
                    <p>Próximamente: Gráficos y estadísticas detalladas de proyectos</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-gray-500">
                    <p>Próximamente: Configuración avanzada del sistema</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}
