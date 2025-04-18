import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Avatar" />
                      <AvatarFallback>JP</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold mt-4">Dip. Juan Pérez</h2>
                    <p className="text-sm text-gray-500">Legislador</p>
                    <Button variant="outline" className="mt-4 w-full">
                      Cambiar foto
                    </Button>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <p className="text-sm font-medium">Correo electrónico</p>
                      <p className="text-sm text-gray-500">legislador@congreso.mx</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Distrito</p>
                      <p className="text-sm text-gray-500">Distrito 5, Ciudad de México</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Partido</p>
                      <p className="text-sm text-gray-500">Partido Ejemplo</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Miembro desde</p>
                      <p className="text-sm text-gray-500">Enero 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Tabs defaultValue="personal">
                <TabsList className="mb-6">
                  <TabsTrigger value="personal">Información Personal</TabsTrigger>
                  <TabsTrigger value="account">Cuenta</TabsTrigger>
                  <TabsTrigger value="preferences">Preferencias</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información Personal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Nombre</Label>
                          <Input id="firstName" defaultValue="Juan" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Apellido</Label>
                          <Input id="lastName" defaultValue="Pérez" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input id="email" defaultValue="legislador@congreso.mx" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" defaultValue="(55) 1234-5678" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Biografía</Label>
                        <textarea
                          id="bio"
                          className="w-full min-h-[100px] p-2 border rounded-md"
                          defaultValue="Diputado por el Distrito 5 de la Ciudad de México. Especialista en temas de tecnología y regulación digital."
                        />
                      </div>

                      <Button className="bg-emerald-600 hover:bg-emerald-700">Guardar Cambios</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de Cuenta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña Actual</Label>
                        <Input id="currentPassword" type="password" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Input id="newPassword" type="password" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>

                      <Button className="bg-emerald-600 hover:bg-emerald-700">Actualizar Contraseña</Button>

                      <div className="border-t pt-4 mt-6">
                        <h3 className="font-medium mb-2">Sesiones Activas</h3>
                        <div className="bg-gray-50 p-3 rounded-md mb-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">Chrome en Windows</p>
                              <p className="text-xs text-gray-500">Ciudad de México · Activa ahora</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Cerrar
                            </Button>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">Safari en iPhone</p>
                              <p className="text-xs text-gray-500">Ciudad de México · Hace 2 días</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Cerrar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferencias</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <select id="language" className="w-full p-2 border rounded-md">
                          <option value="es">Español</option>
                          <option value="en">English</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="theme">Tema</Label>
                        <select id="theme" className="w-full p-2 border rounded-md">
                          <option value="light">Claro</option>
                          <option value="dark">Oscuro</option>
                          <option value="system">Sistema</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span>Recibir notificaciones por correo electrónico</span>
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked />
                          <span>Recibir actualizaciones sobre nuevas funcionalidades</span>
                        </Label>
                      </div>

                      <Button className="bg-emerald-600 hover:bg-emerald-700">Guardar Preferencias</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </>
  )
}
