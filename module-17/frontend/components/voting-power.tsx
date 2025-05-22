"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Vote } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function VotingPower() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Voting Power</CardTitle>
          <CardDescription>Your governance influence</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Vote className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Current Voting Power</h3>
              <span className="text-xs text-muted-foreground">0.05% of total</span>
            </div>
            <p className="mt-1 text-2xl font-bold font-heading">1,250 votes</p>
            <div className="mt-2">
              <Progress value={0.05} className="h-1.5" />
            </div>
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Voting Stats</h3>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
            >
              <span className="text-sm">Participation Rate</span>
              <span className="text-sm font-medium">78%</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
            >
              <span className="text-sm">Proposals Voted</span>
              <span className="text-sm font-medium">27 / 35</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
            >
              <span className="text-sm">Vote Distribution</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs">70%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-xs">25%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  <span className="text-xs">5%</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
            >
              <span className="text-sm">Last Vote</span>
              <span className="text-sm font-medium">2 days ago</span>
            </motion.div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Voting Rewards</h3>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 p-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Earned Rewards</h4>
                <span className="text-xs text-green-500">+125 GOV</span>
              </div>
              <p className="mt-1 text-lg font-bold">125 GOV</p>
              <p className="mt-1 text-xs text-muted-foreground">≈ $375 USD</p>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
