"use client"

import { useEffect, useRef, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const loadedRef = useRef(false);

  // Estados para cada sección de configuración
  const [generalSettings, setGeneralSettings] = useState({
    app_name: "LegisAI",
    app_description: "Asistente de Formulación de Proyectos de Ley",
    default_legislator: "Dip. Juan Pérez",
    dark_mode: false,
    notifications: true,
  });
  const [apiSettings, setApiSettings] = useState({
    openai_api_key: "",
    google_generative_ai_api_key: "",
    max_tokens_per_request: "8000",
    enable_api_usage_tracking: true,
    use_local_model: false,
  });
  const [exportSettings, setExportSettings] = useState({
    pdf_template: "official",
    footer_text: "Congreso de la Ciudad de México - LegisAI",
    include_page_numbers: true,
    include_watermark: false,
  });
  const [advancedSettings, setAdvancedSettings] = useState({
    database_url: "postgres://user:password@host:port/database",
    cache_timeout: "3600",
    log_level: "info",
    debug_mode: false,
  });

  // Cargar configuraciones al montar el componente (solo una vez)
  useEffect(() => {
    // Previene la ejecución si ya se cargó (importante por StrictMode en dev)
    if (loadedRef.current) return;
    loadedRef.current = true;

    async function loadSettings() {
      try {
        setIsLoading(true);
        // Asumiendo que tienes una API route que llama a getAllSettings
        const res = await fetch('/api/settings');
        if (!res.ok) {
          throw new Error(`Error fetching settings: ${res.statusText}`);
        }
        const settings = await res.json();

        // Asegúrate que settings sea un array antes de reducir
        if (!Array.isArray(settings)) {
          console.error("La respuesta de /api/settings no es un array:", settings);
          throw new Error("Formato de respuesta inesperado.");
        }

        const mappedSettings: Record<string, string> = settings.reduce((acc: Record<string, string>, s: any) => {
          // Verifica que 's' sea un objeto con 'key' y 'value'
          if (s && typeof s.key === 'string' && typeof s.value !== 'undefined') {
            acc[s.key] = String(s.value); // Convertir a string por si acaso
          }
          return acc;
        }, {});

        // Actualizar estados
        setGeneralSettings({
          app_name: mappedSettings.app_name || "LegisAI",
          app_description: mappedSettings.app_description || "Asistente de Formulación de Proyectos de Ley",
          default_legislator: mappedSettings.default_legislator || "Dip. Juan Pérez",
          dark_mode: mappedSettings.dark_mode === "true",
          notifications: mappedSettings.notifications !== "false",
        });

        setApiSettings({
          openai_api_key: mappedSettings.openai_api_key || "",
          google_generative_ai_api_key: mappedSettings.google_generative_ai_api_key || "",
          max_tokens_per_request: mappedSettings.max_tokens_per_request || "8000",
          enable_api_usage_tracking: mappedSettings.enable_api_usage_tracking !== "false",
          use_local_model: mappedSettings.use_local_model === "true",
        });

      } catch (error) {
        console.error("Error al cargar configuraciones:", error);
        toast({
          title: "Error al cargar configuraciones",
          description: `No se pudieron cargar las configuraciones. ${error instanceof Error ? error.message : ''}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Manejadores de cambios
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleApiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setApiSettings(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // Manejador para Exportación
  const handleExportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setExportSettings(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // NUEVO: Manejador para Avanzado
  const handleAdvancedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setAdvancedSettings(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };




  // Guardar configuraciones
  const saveSettings = async (settingsKey: string, settingsData: Record<string, any>) => {
    try {
      setIsSaving(true);

      // Convierte booleanos a string antes de enviar
      const settingsToSave = Object.entries(settingsData).reduce((acc, [key, val]) => {
        acc[key] = typeof val === 'boolean' ? String(val) : val;
        return acc;
      }, {} as Record<string, string>);


      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave),
      });
      // Verifica si la respuesta es JSON antes de intentar parsearla
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const { success, error } = await res.json();
        if (success) {
          toast({
            title: "Configuración guardada",
            description: `Los cambios en "${settingsKey}" se han guardado correctamente.`,
          });
        } else {
          throw new Error(error || "No se pudieron guardar los cambios");
        }
      } else {
        // Si no es JSON, asume éxito si el status es OK, o lanza error
        if (!res.ok) {
          throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
        }
        // Si es OK pero no JSON, muestra un mensaje genérico de éxito
        toast({
          title: "Configuración guardada",
          description: `Los cambios en "${settingsKey}" se han guardado correctamente.`,
        });
      }
    } catch (error) {
      console.error(`Error al guardar ${settingsKey}:`, error);
      toast({
        title: "Error al guardar",
        description: `No se pudieron guardar los cambios en "${settingsKey}". ${error instanceof Error ? error.message : 'Inténtelo de nuevo más tarde.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Funciones específicas de guardado que llaman a la genérica
  const saveGeneralSettings = () => saveSettings("General", generalSettings);
  const saveApiSettings = () => saveSettings("API", apiSettings);
  const saveExportSettings = () => saveSettings("Exportación", exportSettings);
  const saveAdvancedSettings = () => saveSettings("Avanzado", advancedSettings);



  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 py-8">
          <div className="container mx-auto px-4 flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="mt-2">Cargando configuraciones...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Configuración</h1>

          <Tabs defaultValue="general">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-64 flex-shrink-0">
                <TabsList className="flex flex-col w-full h-auto items-stretch"> {/* Asegura que los triggers ocupen el ancho */}
                  <TabsTrigger value="general" className="justify-start data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="api" className="justify-start data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                    Configuración de API
                  </TabsTrigger>
                  <TabsTrigger value="export" className="justify-start data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                    Exportación
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="justify-start data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
                    Avanzado
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1">
                {/* --- Pestaña General (Existente) --- */}
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* ... Inputs y Switches para General ... */}
                      <div className="space-y-2">
                        <Label htmlFor="app_name">Nombre de la Aplicación</Label>
                        <Input
                          id="app_name"
                          value={generalSettings.app_name}
                          onChange={handleGeneralChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="app_description">Descripción</Label>
                        <Input
                          id="app_description"
                          value={generalSettings.app_description}
                          onChange={handleGeneralChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="default_legislator">Legislador por Defecto</Label>
                        <Input
                          id="default_legislator"
                          value={generalSettings.default_legislator}
                          onChange={handleGeneralChange}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dark_mode" className="cursor-pointer">Modo Oscuro</Label>
                          <p className="text-sm text-gray-500">Activar tema oscuro en la interfaz</p>
                        </div>
                        <Switch
                          id="dark_mode"
                          checked={generalSettings.dark_mode}
                          onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, dark_mode: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifications" className="cursor-pointer">Notificaciones</Label>
                          <p className="text-sm text-gray-500">Recibir notificaciones del sistema</p>
                        </div>
                        <Switch
                          id="notifications"
                          checked={generalSettings.notifications}
                          onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, notifications: checked }))}
                        />
                      </div>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={saveGeneralSettings}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
                        ) : (
                          "Guardar Cambios (General)"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* --- NUEVO: Pestaña API --- */}
                <TabsContent value="api">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de API</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="openai_api_key">Clave API OpenAI</Label>
                        <Input
                          id="openai_api_key"
                          type="password" // Ocultar la clave
                          value={apiSettings.openai_api_key}
                          onChange={handleApiChange}
                          placeholder="sk-..."
                        />

                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="google_generative_ai_api_key">Clave API Google Generative AI</Label>
                        <Input
                          id="google_generative_ai_api_key"
                          type="password" // Ocultar la clave
                          value={apiSettings.google_generative_ai_api_key}
                          onChange={handleApiChange}
                          placeholder="AIza..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_tokens_per_request">Máx. Tokens por Solicitud</Label>
                        <Input
                          id="max_tokens_per_request"
                          type="number"
                          value={apiSettings.max_tokens_per_request}
                          onChange={handleApiChange}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="enable_api_usage_tracking" className="cursor-pointer">Seguimiento de Uso API</Label>
                          <p className="text-sm text-gray-500">Registrar el uso de las APIs (si aplica)</p>
                        </div>
                        <Switch
                          id="enable_api_usage_tracking"
                          checked={apiSettings.enable_api_usage_tracking}
                          onCheckedChange={(checked) => setApiSettings(prev => ({ ...prev, enable_api_usage_tracking: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="use_local_model" className="cursor-pointer">Usar Modelo Local</Label>
                          <p className="text-sm text-gray-500">Utilizar un modelo de lenguaje local (si está configurado)</p>
                        </div>
                        <Switch
                          id="use_local_model"
                          checked={apiSettings.use_local_model}
                          onCheckedChange={(checked) => setApiSettings(prev => ({ ...prev, use_local_model: checked }))}
                        />
                      </div>

                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={saveApiSettings}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
                        ) : (
                          "Guardar Cambios (API)"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="export">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de Exportación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="pdf_template">Plantilla PDF</Label>
                        {/* Podrías usar un Select aquí si tienes varias plantillas */}
                        <Input
                          id="pdf_template"
                          value={exportSettings.pdf_template}
                          onChange={handleExportChange}
                          placeholder="Ej: official, simple"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer_text">Texto de Pie de Página</Label>
                        <Input
                          id="footer_text"
                          value={exportSettings.footer_text}
                          onChange={handleExportChange}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="include_page_numbers" className="cursor-pointer">Incluir Números de Página</Label>
                        </div>
                        <Switch
                          id="include_page_numbers"
                          checked={exportSettings.include_page_numbers}
                          onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, include_page_numbers: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="include_watermark" className="cursor-pointer">Incluir Marca de Agua</Label>
                        </div>
                        <Switch
                          id="include_watermark"
                          checked={exportSettings.include_watermark}
                          onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, include_watermark: checked }))}
                        />
                      </div>

                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={saveExportSettings}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
                        ) : (
                          "Guardar Cambios (Exportación)"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* --- NUEVO: Pestaña Avanzado --- */}
                <TabsContent value="advanced">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración Avanzada</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="database_url">URL Base de Datos</Label>
                        <Input
                          id="database_url"
                          value={advancedSettings.database_url}
                          onChange={handleAdvancedChange}
                          placeholder="postgres://..."
                          disabled // Generalmente no se edita desde UI
                        />
                        <p className="text-sm text-gray-500">Normalmente configurado vía variables de entorno.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cache_timeout">Timeout Caché (segundos)</Label>
                        <Input
                          id="cache_timeout"
                          type="number"
                          value={advancedSettings.cache_timeout}
                          onChange={handleAdvancedChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="log_level">Nivel de Log</Label>
                        {/* Podrías usar un Select aquí (info, warn, error, debug) */}
                        <Input
                          id="log_level"
                          value={advancedSettings.log_level}
                          onChange={handleAdvancedChange}
                          placeholder="info, warn, error, debug"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="debug_mode" className="cursor-pointer">Modo Depuración</Label>
                          <p className="text-sm text-gray-500">Activar logs y funcionalidades adicionales para depuración.</p>
                        </div>
                        <Switch
                          id="debug_mode"
                          checked={advancedSettings.debug_mode}
                          onCheckedChange={(checked) => setAdvancedSettings(prev => ({ ...prev, debug_mode: checked }))}
                        />
                      </div>

                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={saveAdvancedSettings}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
                        ) : (
                          "Guardar Cambios (Avanzado)"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
      <Toaster />
    </>

  );
}