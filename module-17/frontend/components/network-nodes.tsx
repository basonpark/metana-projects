"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Server, Wifi, Check, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function NetworkNodes() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Network Nodes</CardTitle>
          <CardDescription>Active validators and node status</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Server className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Active Nodes</h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <Server className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold font-heading">1,245</p>
              <p className="mt-1 text-xs text-muted-foreground">+12 in the last 24h</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Network Health</h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                  <Wifi className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold font-heading">99.98%</p>
              <p className="mt-1 text-xs text-muted-foreground">Uptime last 30 days</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Consensus Rate</h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                  <Check className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold font-heading">98.7%</p>
              <p className="mt-1 text-xs text-muted-foreground">Block finalization rate</p>
            </motion.div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Node Distribution</h3>
              <Badge variant="outline" className="bg-muted/50">
                Global Network
              </Badge>
            </div>

            <div className="space-y-3">
              {[
                { region: "North America", count: 485, percentage: 39 },
                { region: "Europe", count: 372, percentage: 30 },
                { region: "Asia Pacific", count: 248, percentage: 20 },
                { region: "South America", count: 87, percentage: 7 },
                { region: "Africa", count: 53, percentage: 4 },
              ].map((region, index) => (
                <motion.div
                  key={region.region}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>{region.region}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{region.count}</span>
                      <span className="text-xs text-muted-foreground">{region.percentage}%</span>
                    </div>
                  </div>
                  <Progress value={region.percentage} className="h-1.5" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Node Status</h3>
            <div className="space-y-3">
              {[
                {
                  id: "node-1",
                  name: "validator-mainnet-01",
                  status: "active",
                  uptime: "99.99%",
                  lastSeen: "2 seconds ago",
                },
                {
                  id: "node-2",
                  name: "validator-mainnet-02",
                  status: "active",
                  uptime: "99.95%",
                  lastSeen: "5 seconds ago",
                },
                {
                  id: "node-3",
                  name: "validator-mainnet-03",
                  status: "active",
                  uptime: "99.87%",
                  lastSeen: "8 seconds ago",
                },
                {
                  id: "node-4",
                  name: "validator-testnet-01",
                  status: "warning",
                  uptime: "98.45%",
                  lastSeen: "2 minutes ago",
                },
                {
                  id: "node-5",
                  name: "validator-mainnet-04",
                  status: "active",
                  uptime: "99.92%",
                  lastSeen: "3 seconds ago",
                },
              ].map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        node.status === "active" ? "bg-green-500/20" : "bg-yellow-500/20"
                      }`}
                    >
                      {node.status === "active" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{node.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Uptime: {node.uptime}</span>
                        <span>•</span>
                        <span>Last seen: {node.lastSeen}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      node.status === "active" ? "bg-green-500/20 text-green-700" : "bg-yellow-500/20 text-yellow-700"
                    }`}
                  >
                    {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
