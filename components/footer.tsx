import Link from "next/link"
import { GavelIcon } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GavelIcon className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl text-emerald-700">LegislaBot</span>
            </div>
            <p className="text-sm text-gray-600">
              Plataforma de apoyo a legisladores para la formulación de Proyectos de Ley relacionados con la regulación
              del uso de la inteligencia artificial.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-800 mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-emerald-600">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/bills" className="text-gray-600 hover:text-emerald-600">
                  Proyectos de Ley
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-gray-600 hover:text-emerald-600">
                  Ejemplos
                </Link>
              </li>
            </ul>
          </div>


          <div>
            <h3 className="font-medium text-gray-800 mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600">
                <strong>Email:</strong> contacto@legislabot.mx
              </li>
              <li className="text-gray-600">
                <strong>Teléfono:</strong> (55) 1234-5678
              </li>
              <li className="text-gray-600">
                <strong>Dirección:</strong> Congreso de la Ciudad de México, Plaza de la Constitución 7, Centro,
                Cuauhtémoc, 06000 Ciudad de México, CDMX
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} LegislaBot. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
