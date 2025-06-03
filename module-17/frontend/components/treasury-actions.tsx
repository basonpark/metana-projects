"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TreasuryActions() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Quick Actions</CardTitle>
          <CardDescription>Manage treasury assets</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/5 p-4 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                  <Download className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Deposit Funds</p>
                  <p className="text-xs text-muted-foreground">Add assets to treasury</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/5 p-4 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                  <Upload className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Withdraw Funds</p>
                  <p className="text-xs text-muted-foreground">Requires proposal approval</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </motion.div>

          <div className="pt-2">
            <Button variant="outline" className="w-full">
              View All Actions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
