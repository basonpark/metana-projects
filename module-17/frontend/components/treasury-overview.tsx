"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, DollarSign } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TreasuryOverview() {
  return (
    <Card className="enhanced-card">
      <CardHeader className="enhanced-card-header">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Treasury Overview</CardTitle>
          <CardDescription>Total assets and recent activity</CardDescription>
        </div>
        <div className="enhanced-card-icon">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 w-full justify-start bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex-1">
              Assets
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex-1">
              Cash Flows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex-1 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Total Value</h3>
                  <div className="flex items-center gap-1 text-emerald-500 text-sm">
                    <ArrowUp className="h-3 w-3" />
                    <span>+5.2%</span>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-heading gradient-text-primary">$24,842,650</span>
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">30d Change</p>
                    <p className="font-medium text-emerald-500">+$1,245,320</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">90d Change</p>
                    <p className="font-medium text-emerald-500">+$3,842,120</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex-1 rounded-lg bg-gradient-to-br from-muted/50 to-muted/70 p-6 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Monthly Expenses</h3>
                  <div className="flex items-center gap-1 text-rose-500 text-sm">
                    <ArrowDown className="h-3 w-3" />
                    <span>-2.8%</span>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-heading">$342,120</span>
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Burn Rate</p>
                    <p className="font-medium">14.2 months</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">YTD Expenses</p>
                    <p className="font-medium">$2,842,650</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="rounded-lg bg-muted/30 p-4 shadow-soft"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">ETH Balance</p>
                    <p className="text-lg font-bold">4,250 ETH</p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">≈ $8,245,000 USD</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="rounded-lg bg-muted/30 p-4 shadow-soft"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Stablecoin Balance</p>
                    <p className="text-lg font-bold">6,842,650 USDC</p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">≈ $6,842,650 USD</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="rounded-lg bg-muted/30 p-4 shadow-soft"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Other Assets</p>
                    <p className="text-lg font-bold">$9,755,000</p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Multiple tokens and NFTs</p>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="rounded-lg border border-muted-foreground/10 overflow-hidden shadow-soft">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Asset</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Balance</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Value (USD)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted-foreground/10">
                  {[
                    { name: "ETH", balance: "4,250 ETH", value: "$8,245,000", allocation: "33.2%" },
                    { name: "USDC", balance: "6,842,650 USDC", value: "$6,842,650", allocation: "27.5%" },
                    { name: "BTC", balance: "42.5 BTC", value: "$2,845,000", allocation: "11.5%" },
                    { name: "GOV", balance: "12,500,000 GOV", value: "$2,500,000", allocation: "10.1%" },
                    { name: "Other", balance: "Multiple", value: "$4,410,000", allocation: "17.7%" },
                  ].map((asset, index) => (
                    <motion.tr
                      key={asset.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-card/50"
                    >
                      <td className="px-4 py-3 text-sm">{asset.name}</td>
                      <td className="px-4 py-3 text-sm font-mono">{asset.balance}</td>
                      <td className="px-4 py-3 text-sm">{asset.value}</td>
                      <td className="px-4 py-3 text-sm">{asset.allocation}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="flows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Monthly Income</h3>
                <div className="space-y-2">
                  {[
                    { source: "Protocol Fees", amount: "$245,000", percentage: "82.3%" },
                    { source: "Staking Rewards", amount: "$42,500", percentage: "14.3%" },
                    { source: "Investments", amount: "$10,200", percentage: "3.4%" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.source}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between rounded-lg bg-muted/30 p-3 shadow-soft"
                    >
                      <span className="text-sm">{item.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.amount}</span>
                        <span className="text-xs text-muted-foreground">{item.percentage}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Monthly Expenses</h3>
                <div className="space-y-2">
                  {[
                    { category: "Development Grants", amount: "$180,000", percentage: "52.6%" },
                    { category: "Marketing", amount: "$85,000", percentage: "24.8%" },
                    { category: "Operations", amount: "$45,000", percentage: "13.2%" },
                    { category: "Security Audits", amount: "$32,120", percentage: "9.4%" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.category}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between rounded-lg bg-muted/30 p-3 shadow-soft"
                    >
                      <span className="text-sm">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.amount}</span>
                        <span className="text-xs text-muted-foreground">{item.percentage}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
