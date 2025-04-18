import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GavelIcon, Code, BookOpen, Shield, Cpu } from "lucide-react"

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <GavelIcon className="h-12 w-12 text-emerald-600 mr-2" />
                <h1 className="text-4xl font-bold text-emerald-700">LegislaBot</h1>
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Asistente de Formulación de Proyectos de Ley
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl">
                Plataforma de apoyo a legisladores para la formulación de Proyectos de Ley relacionados con la
                regulación del uso de la inteligencia artificial en la Ciudad de México (2024-2030).
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Acerca del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  LegislaBot es una aplicación web diseñada para apoyar a los legisladores de la Ciudad de México en la
                  administración legislativa a nivel estatal. Emplea tecnologías de procesamiento del lenguaje natural (PLN)
                  para reducir significativamente los tiempos de formulación de Proyectos de Ley, específicamente aquellos
                  relacionados con la regulación del uso de la inteligencia artificial en la Ciudad de México durante el
                  periodo 2024-2030. La plataforma combina IA avanzada con conocimientos jurídicos para generar
                  documentos que cumplen con el formato oficial mexicano.
                </p>
                <p>
                  Este proyecto nace de la necesidad de contar con herramientas que faciliten la labor legislativa en
                  temas tecnológicos emergentes, donde la complejidad técnica y la rápida evolución del campo requieren
                  un enfoque especializado y actualizado.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-start space-x-4 pb-2">
                  <BookOpen className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <CardTitle>Metodología</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    LegislaBot utiliza un proceso de tres etapas para la generación de proyectos de ley:
                  </p>
                  <ol className="mt-4 space-y-2 text-gray-600 list-decimal list-inside">
                    <li>Investigación previa utilizando fuentes jurídicas y técnicas actualizadas</li>
                    <li>Generación de borrador base con estructura y contenido preliminar</li>
                    <li>Refinamiento legal para asegurar precisión técnica y jurídica</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-start space-x-4 pb-2">
                  <Cpu className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <CardTitle>Tecnología</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    La plataforma está construida con tecnologías modernas para garantizar rendimiento y escalabilidad:
                  </p>
                  <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
                    <li>Next.js 14 con App Router para una experiencia de usuario fluida</li>
                    <li>AI SDK para integración con modelos de lenguaje avanzados</li>
                    <li>Base de datos PostgreSQL para almacenamiento seguro</li>
                    <li>Tailwind CSS y shadcn/ui para una interfaz moderna y accesible</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                      <Cpu className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="font-medium">Ingeniero en IA</h3>
                    <p className="text-sm text-gray-600">Daniel</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                      <Cpu className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="font-medium">Ingeniero en IA</h3>
                    <p className="text-sm text-gray-600">Fercho</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                      <Cpu className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="font-medium">Ingeniero en IA</h3>
                    <p className="text-sm text-gray-600">Isaac</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Para más información sobre el proyecto, colaboraciones o reportar problemas, puedes contactarnos a
                  través de los siguientes medios:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>Email:</strong> contacto@legislabot.mx
                  </p>
                  <p>
                    <strong>Teléfono:</strong> (55) 1234-5678
                  </p>
                  <p>
                    <strong>Dirección:</strong> Congreso de la Ciudad de México, Plaza de la Constitución 7, Centro,
                    Cuauhtémoc, 06000 Ciudad de México, CDMX
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
