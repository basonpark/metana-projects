"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Activity, BarChart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

// Dynamically import the chart component to avoid SSR issues
const Chart = dynamic(() => import("@/components/ui/chart").then((mod) => mod.Chart), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false })

const blockTimeData = [
  { time: "00:00", value: 12.3 },
  { time: "04:00", value: 12.1 },
  { time: "08:00", value: 12.4 },
  { time: "12:00", value: 12.2 },
  { time: "16:00", value: 12.5 },
  { time: "20:00", value: 12.3 },
  { time: "24:00", value: 12.2 },
]

export function NetworkMetrics() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Network Metrics</CardTitle>
          <CardDescription>Performance and statistics</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <BarChart className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-medium">Average Block Time</h3>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <Chart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" opacity={0.3} />
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" domain={[12, 13]} tickFormatter={(value) => `${value}s`} />
                  <Tooltip
                    formatter={(value) => [`${value}s`, "Block Time"]}
                    labelFormatter={(label) => `Time: ${label}`}
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
            </div>
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Key Metrics</h3>
            <div className="space-y-3">
              {[
                { metric: "Transactions Per Second", value: "245", change: "+12% (24h)" },
                { metric: "Average Gas Price", value: "25 Gwei", change: "-5% (24h)" },
                { metric: "Network Difficulty", value: "12.45 PH", change: "+2.3% (24h)" },
                { metric: "Active Validators", value: "1,245", change: "+3 (24h)" },
              ].map((metric, index) => (
                <motion.div
                  key={metric.metric}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                >
                  <span className="text-sm">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{metric.value}</span>
                    <span className="text-xs text-muted-foreground">{metric.change}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { event: "Block Produced", time: "12 seconds ago", details: "Block #16,842,753" },
                { event: "Validator Joined", time: "2 minutes ago", details: "validator-mainnet-05" },
                { event: "Network Upgrade", time: "2 days ago", details: "v1.2.5 -> v1.3.0" },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.event}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <p className="text-sm">{activity.details}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <Button variant="outline">View Network Explorer</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
