"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BarChart, CheckCircle, Clock, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function ProposalStats() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-medium">Total Proposals</h3>
              </div>
              <span className="text-2xl font-bold font-heading">142</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="rounded bg-muted/50 p-1 text-center">
                <div className="font-medium">Active</div>
                <div className="text-muted-foreground">8</div>
              </div>
              <div className="rounded bg-muted/50 p-1 text-center">
                <div className="font-medium">Pending</div>
                <div className="text-muted-foreground">3</div>
              </div>
              <div className="rounded bg-muted/50 p-1 text-center">
                <div className="font-medium">Executed</div>
                <div className="text-muted-foreground">98</div>
              </div>
              <div className="rounded bg-muted/50 p-1 text-center">
                <div className="font-medium">Defeated</div>
                <div className="text-muted-foreground">33</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-medium">Success Rate</h3>
              </div>
              <span className="text-2xl font-bold font-heading">74.8%</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Executed vs Defeated</span>
                <span>98 / 33</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "74.8%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-green-500"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <h3 className="font-medium">Avg. Voting Time</h3>
              </div>
              <span className="text-2xl font-bold font-heading">2.4d</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Time to reach quorum</span>
                <span>57.6 hours</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="h-2 rounded-full bg-yellow-200"></div>
                <div className="h-2 rounded-full bg-yellow-300"></div>
                <div className="h-2 rounded-full bg-yellow-400"></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                  <BarChart className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="font-medium">Participation</h3>
              </div>
              <span className="text-2xl font-bold font-heading">32.5%</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Avg. token participation</span>
                <span>20.3M / 62.5M</span>
              </div>
              <Progress value={32.5} className="h-2" />
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
