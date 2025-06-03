"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Shield, Key, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SettingsSecurity() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Security Settings</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Connected Wallets</h3>
              </div>
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/70">
                      <span className="text-sm">🦊</span>
                    </div>
                    <div>
                      <p className="font-medium">MetaMask</p>
                      <p className="text-xs font-mono text-muted-foreground">0x71C...1F3d</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-500/20 text-green-700">
                      Primary
                    </Badge>
                    <Button variant="outline" size="sm">
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                Connect Another Wallet
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
              </div>
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="2fa" className="cursor-pointer">
                      Enable 2FA
                    </Label>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="2fa" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Transaction Security</h3>
              <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="transaction-signing" className="cursor-pointer">
                      Transaction Signing
                    </Label>
                    <p className="text-xs text-muted-foreground">Require confirmation for all transactions</p>
                  </div>
                  <Switch id="transaction-signing" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="spending-limit" className="cursor-pointer">
                      Spending Limit
                    </Label>
                    <p className="text-xs text-muted-foreground">Set a daily spending limit</p>
                  </div>
                  <Switch id="spending-limit" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="contract-verification" className="cursor-pointer">
                      Contract Verification
                    </Label>
                    <p className="text-xs text-muted-foreground">Verify contracts before interacting</p>
                  </div>
                  <Switch id="contract-verification" defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Session Management</h3>
              <div className="rounded-lg bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-xs text-muted-foreground">Started 3 days ago • Chrome on macOS</p>
                  </div>
                  <Button variant="outline" size="sm">
                    End Session
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90">
                  Save Security Settings
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}

import { Badge } from "@/components/ui/badge"
