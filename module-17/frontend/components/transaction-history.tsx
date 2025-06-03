"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, History } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TransactionHistory() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Transaction History</CardTitle>
          <CardDescription>Recent wallet activity</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <History className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {[
            {
              type: "receive",
              description: "Received GOV Tokens",
              amount: "125 GOV",
              date: "2 days ago",
              from: "0x8Fc...3Fa2",
            },
            {
              type: "send",
              description: "Vote on Proposal #1",
              amount: "0 ETH",
              date: "2 days ago",
              from: "0x71C...1F3d",
            },
            {
              type: "receive",
              description: "Received ETH",
              amount: "0.5 ETH",
              date: "5 days ago",
              from: "0x7Bc...9Ad1",
            },
            {
              type: "send",
              description: "Delegate Votes",
              amount: "0 ETH",
              date: "1 week ago",
              from: "0x71C...1F3d",
            },
            {
              type: "send",
              description: "Create Proposal #3",
              amount: "0 ETH",
              date: "2 weeks ago",
              from: "0x71C...1F3d",
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
                    transaction.type === "receive" ? "bg-green-500/20" : "bg-blue-500/20"
                  }`}
                >
                  {transaction.type === "receive" ? (
                    <ArrowDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowUp className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{transaction.date}</span>
                    <span>•</span>
                    <span className="font-mono">{transaction.from}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium">{transaction.amount}</p>
            </motion.div>
          ))}

          <div className="pt-2 flex justify-center">
            <Button variant="outline">View All Transactions</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
