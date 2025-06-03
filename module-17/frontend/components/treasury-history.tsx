"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, History } from "lucide-react"

export function TreasuryHistory() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Recent Transactions</CardTitle>
          <CardDescription>Latest treasury movements</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <History className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {[
            {
              type: "outflow",
              description: "Developer Grant Payment",
              amount: "45,000 USDC",
              date: "2 days ago",
              address: "0x71C...1F3d",
            },
            {
              type: "inflow",
              description: "Protocol Fee Collection",
              amount: "12.5 ETH",
              date: "3 days ago",
              address: "0x8Fc...3Fa2",
            },
            {
              type: "outflow",
              description: "Marketing Expense",
              amount: "25,000 USDC",
              date: "5 days ago",
              address: "0x7Bc...9Ad1",
            },
            {
              type: "inflow",
              description: "Staking Rewards",
              amount: "2,450 GOV",
              date: "1 week ago",
              address: "0x9Ac...2Fb3",
            },
          ].map((transaction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    transaction.type === "inflow" ? "bg-green-500/20" : "bg-red-500/20"
                  }`}
                >
                  {transaction.type === "inflow" ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{transaction.date}</span>
                    <span>•</span>
                    <span className="font-mono">{transaction.address}</span>
                  </div>
                </div>
              </div>
              <p className={`text-sm font-medium ${transaction.type === "inflow" ? "text-green-500" : "text-red-500"}`}>
                {transaction.type === "inflow" ? "+" : "-"}
                {transaction.amount}
              </p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
