"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ApiUsageSummary {
  api_name: string
  total_tokens: number
  total_cost: number
}

export function UsageDashboard() {
  const [usageData, setUsageData] = useState<ApiUsageSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "all">("month")

  useEffect(() => {
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
        }

        // Construir la URL con los parámetros
        let url = "/api/usage"
        if (startDate && timeframe !== "all") {
          url += `?startDate=${encodeURIComponent(startDate)}`
        }

        const response = await fetch(url)
        const data = await response.json()

        if (data.usage) {
          setUsageData(data.usage)
        }
      } catch (error) {
        console.error("Error fetching usage data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsageData()
  }, [timeframe])

  // Preparar datos para el gráfico
  const chartData = usageData.map((item) => ({
    name: item.api_name,
    tokens: item.total_tokens,
    cost: Number.parseFloat(item.total_cost.toFixed(4)),
  }))

  // Calcular totales
  const totalTokens = usageData.reduce((sum, item) => sum + item.total_tokens, 0)
  const totalCost = usageData.reduce((sum, item) => sum + item.total_cost, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso de APIs de IA</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="month" onValueChange={(value) => setTimeframe(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="day">Último día</TabsTrigger>
            <TabsTrigger value="week">Última semana</TabsTrigger>
            <TabsTrigger value="month">Último mes</TabsTrigger>
            <TabsTrigger value="all">Todo</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total de Tokens</h3>
              <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Costo Estimado</h3>
              <p className="text-2xl font-bold">${totalCost.toFixed(2)} USD</p>
            </div>
          </div>

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
        </Tabs>
      </CardContent>
    </Card>
  )
}
