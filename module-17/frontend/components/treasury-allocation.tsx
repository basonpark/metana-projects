"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { PieChart, Wallet } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

// Dynamically import the chart component to avoid SSR issues
const Chart = dynamic(() => import("@/components/ui/chart").then((mod) => mod.Chart), { ssr: false })
const ChartTooltip = dynamic(() => import("@/components/ui/chart").then((mod) => mod.ChartTooltip), { ssr: false })
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false })
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false })
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })

const allocationData = [
  { name: "ETH", value: 33.2, color: "#627EEA" },
  { name: "USDC", value: 27.5, color: "#2775CA" },
  { name: "BTC", value: 11.5, color: "#F7931A" },
  { name: "GOV", value: 10.1, color: "#8A63D2" },
  { name: "Other", value: 17.7, color: "#6E6E6E" },
]

const historyData = [
  { month: "Jan", value: 18500000 },
  { month: "Feb", value: 19200000 },
  { month: "Mar", value: 20100000 },
  { month: "Apr", value: 21500000 },
  { month: "May", value: 22800000 },
  { month: "Jun", value: 23400000 },
  { month: "Jul", value: 24842650 },
]

export function TreasuryAllocation() {
  return (
    <Card className="enhanced-card">
      <CardHeader className="enhanced-card-header">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Treasury Allocation</CardTitle>
          <CardDescription>Asset distribution and historical value</CardDescription>
        </div>
        <div className="enhanced-card-icon">
          <PieChart className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="allocation" className="w-full">
          <TabsList className="mb-6 w-full justify-start bg-muted/50 p-1">
            <TabsTrigger value="allocation" className="flex-1">
              Allocation
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="allocation" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex items-center justify-center p-4"
              >
                <div className="h-[300px] w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <Chart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <ChartTooltip />
                    </Chart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <div className="flex-1 space-y-4">
                <h3 className="font-medium">Asset Distribution</h3>
                <div className="space-y-2">
                  {allocationData.map((asset, index) => (
                    <motion.div
                      key={asset.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between rounded-lg bg-muted/30 p-3 shadow-soft"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: asset.color }} />
                        <span className="text-sm">{asset.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{asset.value}%</span>
                        <span className="text-xs text-muted-foreground">
                          ${Math.round((asset.value / 100) * 24842650).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full gap-2 shadow-button bg-gradient-to-r from-primary to-primary/80">
                      <Wallet className="h-4 w-4" />
                      Manage Treasury
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-[350px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <Chart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" opacity={0.3} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Treasury Value"]}
                    labelFormatter={(label) => `${label} 2023`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--primary)" }}
                    activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--background)" }}
                  />
                </Chart>
              </ResponsiveContainer>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-lg bg-muted/30 p-4 shadow-soft"
              >
                <p className="text-sm text-muted-foreground">Starting Value (Jan)</p>
                <p className="text-lg font-bold">$18,500,000</p>
                <p className="text-xs text-muted-foreground mt-1">Beginning of year</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="rounded-lg bg-muted/30 p-4 shadow-soft"
              >
                <p className="text-sm text-muted-foreground">Current Value (Jul)</p>
                <p className="text-lg font-bold">$24,842,650</p>
                <p className="text-xs text-muted-foreground mt-1">Present day</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="rounded-lg bg-emerald-500/10 p-4 shadow-soft"
              >
                <p className="text-sm text-muted-foreground">Growth (YTD)</p>
                <p className="text-lg font-bold text-emerald-500">+34.3%</p>
                <p className="text-xs text-muted-foreground mt-1">$6,342,650 increase</p>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
