"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Activity, Globe, Server, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export function NetworkOverview() {
  return (
    <Card className="enhanced-card">
      <CardHeader className="enhanced-card-header">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Network Overview</CardTitle>
          <CardDescription>Blockchain status and metrics</CardDescription>
        </div>
        <div className="enhanced-card-icon">
          <Globe className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 w-full justify-start bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex-1">
              Performance
            </TabsTrigger>
            <TabsTrigger value="status" className="flex-1">
              Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                    <Activity className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="font-medium">Network Status</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium">Operational</span>
                </div>
                <p className="text-xs text-muted-foreground">All systems normal</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                    <Server className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Current Block</h3>
                </div>
                <p className="text-lg font-bold font-mono">16,842,753</p>
                <p className="text-xs text-muted-foreground">Last block: 12 seconds ago</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="font-medium">TPS</h3>
                </div>
                <p className="text-lg font-bold">245</p>
                <p className="text-xs text-muted-foreground">Transactions per second</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20">
                    <Activity className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="font-medium">Gas Price</h3>
                </div>
                <p className="text-lg font-bold">25 Gwei</p>
                <div className="flex items-center gap-2">
                  <Progress value={25} max={100} className="h-1.5" />
                  <span className="text-xs text-muted-foreground">Low</span>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Network Health</h3>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">99.98%</span>
                    </div>
                    <Progress value={99.98} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Block Time</span>
                      <span className="font-medium">12.3s</span>
                    </div>
                    <Progress value={82} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Finality</span>
                      <span className="font-medium">98.7%</span>
                    </div>
                    <Progress value={98.7} className="h-1.5" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="rounded-lg bg-gradient-to-br from-muted/50 to-muted/70 p-6 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Network Stats</h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Validators</p>
                    <p className="text-lg font-bold">1,245</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Staked Value</p>
                    <p className="text-lg font-bold">$124.5M</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Network Version</p>
                    <p className="text-lg font-bold">v1.3.0</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Consensus</p>
                    <p className="text-lg font-bold">PoS</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Performance Metrics</h3>
              <div className="space-y-3">
                {[
                  { metric: "Average Block Time", value: "12.3s", target: "12.0s", percentage: 97 },
                  { metric: "Transaction Throughput", value: "245 TPS", target: "300 TPS", percentage: 82 },
                  { metric: "Finality Time", value: "15.2s", target: "15.0s", percentage: 99 },
                  { metric: "Validator Participation", value: "98.7%", target: "99.0%", percentage: 99 },
                  { metric: "Network Latency", value: "125ms", target: "100ms", percentage: 80 },
                ].map((metric, index) => (
                  <motion.div
                    key={metric.metric}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="space-y-1"
                  >
                    <div className="flex justify-between text-sm">
                      <span>{metric.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.value}</span>
                        <span className="text-xs text-muted-foreground">Target: {metric.target}</span>
                      </div>
                    </div>
                    <Progress value={metric.percentage} className="h-1.5" />
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">System Status</h3>
              <div className="space-y-3">
                {[
                  { system: "Consensus Layer", status: "Operational", details: "All systems normal" },
                  { system: "Execution Layer", status: "Operational", details: "All systems normal" },
                  { system: "P2P Network", status: "Operational", details: "All systems normal" },
                  { system: "RPC Endpoints", status: "Operational", details: "All systems normal" },
                  { system: "Block Explorer", status: "Operational", details: "All systems normal" },
                ].map((system, index) => (
                  <motion.div
                    key={system.system}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-lg bg-muted/30 p-3 shadow-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{system.system}</p>
                        <p className="text-xs text-muted-foreground">{system.details}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-emerald-600">{system.status}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
