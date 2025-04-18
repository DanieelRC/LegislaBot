"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Download, RefreshCw } from "lucide-react"

interface ApiUsageSummary {
  api_name: string
  total_tokens: number
  total_cost: number
}

interface ApiUsageByDay {
  date: string
  tokens: number
  cost: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function ApiCostAnalysis() {
  const [usageData, setUsageData] = useState<ApiUsageSummary[]>([])
  const [dailyData, setDailyData] = useState<ApiUsageByDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "all">("month")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  const fetchUsageData = async () => {
    setIsLoading(true)
    try {
      // Calcular fechas según el timeframe
      let startDate: string | undefined
      const now = new Date()

      if (timeframe === "day") {
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        startDate = yesterday.toISOString()
      } else if (timeframe === "week") {
        const lastWeek = new Date(now)
        lastWeek.setDate(lastWeek.getDate() - 7)
        startDate = lastWeek.toISOString()
      } else if (timeframe === "month") {
        const lastMonth = new Date(now)
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        startDate = lastMonth.toISOString()
      } else if (dateRange.from && dateRange.to) {
        startDate = dateRange.from.toISOString()
      }

      // Construir la URL con los parámetros
      let url = "/api/usage"
      if (startDate && timeframe !== "all") {
        url += `?startDate=${encodeURIComponent(startDate)}`
        if (dateRange.to && timeframe === "custom") {
          url += `&endDate=${encodeURIComponent(dateRange.to.toISOString())}`
        }
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.usage) {
        setUsageData(data.usage)
      }

      // Obtener datos diarios para el gráfico de tendencia
      const dailyResponse = await fetch("/api/usage/daily")
      const dailyData = await dailyResponse.json()

      if (dailyData.dailyUsage) {
        setDailyData(dailyData.dailyUsage)
      }
    } catch (error) {
      console.error("Error fetching usage data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsageData()
  }, [timeframe, dateRange])

  // Preparar datos para el gráfico
  const chartData = usageData.map((item) => ({
    name: item.api_name,
    tokens: item.total_tokens,
    cost: Number.parseFloat(item.total_cost.toFixed(4)),
  }))

  // Calcular totales
  const totalTokens = usageData.reduce((sum, item) => sum + item.total_tokens, 0)
  const totalCost = usageData.reduce((sum, item) => sum + item.total_cost, 0)

  // Datos para el gráfico de pastel
  const pieData = usageData.map((item) => ({
    name: item.api_name,
    value: item.total_cost,
  }))

  // Función para exportar datos
  const exportData = () => {
    const csvContent = [
      ["API", "Tokens", "Costo (USD)"],
      ...usageData.map((item) => [item.api_name, item.total_tokens, item.total_cost.toFixed(4)]),
      ["TOTAL", totalTokens, totalCost.toFixed(4)],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `api-usage-${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Análisis de Costos de API</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={fetchUsageData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Resumen</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="distribution">Distribución</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <TabsList className="w-full">
                <TabsTrigger value="day" onClick={() => setTimeframe("day")}>
                  Día
                </TabsTrigger>
                <TabsTrigger value="week" onClick={() => setTimeframe("week")}>
                  Semana
                </TabsTrigger>
                <TabsTrigger value="month" onClick={() => setTimeframe("month")}>
                  Mes
                </TabsTrigger>
                <TabsTrigger value="all" onClick={() => setTimeframe("all")}>
                  Todo
                </TabsTrigger>
              </TabsList>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                        {format(dateRange.to, "LLL dd, y", { locale: es })}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y", { locale: es })
                    )
                  ) : (
                    <span>Seleccionar fechas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range || { from: undefined, to: undefined })
                    if (range?.from && range?.to) {
                      setTimeframe("custom")
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total de Tokens</h3>
              <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Costo Estimado</h3>
              <p className="text-2xl font-bold">${totalCost.toFixed(2)} USD</p>
            </div>
          </div>

          <TabsContent value="summary">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="tokens" name="Tokens" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="cost" name="Costo (USD)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>No hay datos de uso disponibles para este período.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : dailyData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="tokens" name="Tokens" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="cost" name="Costo (USD)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>No hay datos de tendencias disponibles para este período.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="distribution">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : pieData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)} USD`, "Costo"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>No hay datos de distribución disponibles para este período.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
