"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TokenBalances() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Token Balances</CardTitle>
          <CardDescription>Your governance and ecosystem tokens</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Coins className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {[
            {
              token: "GOV",
              balance: "1,250",
              value: "$3,750",
              change: "+10.5%",
              logo: "🔷",
            },
            {
              token: "ETH",
              balance: "2.45",
              value: "$4,753",
              change: "+3.2%",
              logo: "⚡",
            },
            {
              token: "USDC",
              balance: "5,280",
              value: "$5,280",
              change: "0%",
              logo: "💵",
            },
            {
              token: "WBTC",
              balance: "0.12",
              value: "$4,032",
              change: "+2.8%",
              logo: "🔶",
            },
          ].map((token, index) => (
            <motion.div
              key={token.token}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-muted/30 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/70 text-lg">
                  {token.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{token.token}</p>
                    <p className="text-xs text-green-500">{token.change}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Balance: {token.balance}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{token.value}</p>
                  <p className="text-xs text-muted-foreground">USD Value</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}

          <div className="pt-2 flex justify-end">
            <Button variant="outline">View All Tokens</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
