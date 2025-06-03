"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Copy, ExternalLink, QrCode, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function WalletOverview() {
  return (
    <Card className="enhanced-card">
      <CardHeader className="enhanced-card-header">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Wallet Overview</CardTitle>
          <CardDescription>Your connected wallet and voting power</CardDescription>
        </div>
        <div className="enhanced-card-icon">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 w-full justify-start bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="voting" className="flex-1">
              Voting Power
            </TabsTrigger>
            <TabsTrigger value="delegation" className="flex-1">
              Delegation
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
                  <h3 className="text-lg font-medium">Connected Wallet</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-mono text-lg font-medium">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Connected 3 days ago</span>
                    <span>•</span>
                    <a href="#" className="flex items-center gap-1 text-primary">
                      View on Explorer
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Network</p>
                    <p className="font-medium">Ethereum Mainnet</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Connection</p>
                    <p className="font-medium">MetaMask</p>
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
                  <h3 className="text-lg font-medium">Voting Power</h3>
                  <div className="flex items-center gap-1 text-emerald-500 text-sm">
                    <span>+125 (30d)</span>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-heading gradient-text-primary">1,250</span>
                  <span className="text-sm text-muted-foreground">votes</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Delegation Status</p>
                    <p className="font-medium">Self-delegated</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">% of Total Supply</p>
                    <p className="font-medium">0.05%</p>
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
                    <p className="text-sm font-medium">Proposals Voted</p>
                    <p className="text-lg font-bold">27</p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">78% participation rate</p>
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
                    <p className="text-sm font-medium">Proposals Created</p>
                    <p className="text-lg font-bold">3</p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">2 passed, 1 active</p>
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
                    <p className="text-sm font-medium">Rewards Earned</p>
                    <p className="text-lg font-bold">125 GOV</p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">≈ $375 USD</p>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="voting" className="space-y-6">
            <div className="rounded-lg border border-muted-foreground/10 overflow-hidden shadow-soft">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Proposal</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Vote</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Weight</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted-foreground/10">
                  {[
                    {
                      proposal: "Treasury diversification: Allocate 5% to stablecoins",
                      vote: "For",
                      weight: "1,250",
                      date: "2 days ago",
                    },
                    {
                      proposal: "Reduce voting period to 2 days",
                      vote: "For",
                      weight: "1,125",
                      date: "2 weeks ago",
                    },
                    {
                      proposal: "Add liquidity to Uniswap V3",
                      vote: "Against",
                      weight: "1,125",
                      date: "1 month ago",
                    },
                    {
                      proposal: "Increase developer grants by 20%",
                      vote: "For",
                      weight: "1,000",
                      date: "2 months ago",
                    },
                  ].map((vote, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-card/50"
                    >
                      <td className="px-4 py-3 text-sm">{vote.proposal}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            vote.vote === "For"
                              ? "vote-for-pill"
                              : vote.vote === "Against"
                                ? "vote-against-pill"
                                : "vote-abstain-pill"
                          }`}
                        >
                          {vote.vote}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{vote.weight}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{vote.date}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" className="shadow-button">
                View All Votes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="delegation" className="space-y-6">
            <div className="rounded-lg bg-muted/30 p-6 shadow-soft">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">Delegation Status</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You are currently self-delegated with 1,250 votes
                  </p>
                </div>
                <Button className="shadow-button bg-gradient-to-r from-primary to-primary/80">Change Delegation</Button>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium">Delegation Options</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4 cursor-pointer shadow-soft"
                  >
                    <h5 className="font-medium">Self Delegation</h5>
                    <p className="text-sm text-muted-foreground mt-1">Maintain full control of your voting power</p>
                    <div className="mt-2 text-xs text-primary">Current selection</div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-lg bg-muted/50 p-4 cursor-pointer shadow-soft"
                  >
                    <h5 className="font-medium">Delegate to Address</h5>
                    <p className="text-sm text-muted-foreground mt-1">Transfer voting power to another wallet</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-lg bg-muted/50 p-4 cursor-pointer shadow-soft"
                  >
                    <h5 className="font-medium">Community Delegates</h5>
                    <p className="text-sm text-muted-foreground mt-1">Choose from active community members</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-lg bg-muted/50 p-4 cursor-pointer shadow-soft"
                  >
                    <h5 className="font-medium">Split Delegation</h5>
                    <p className="text-sm text-muted-foreground mt-1">Divide voting power among multiple delegates</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
