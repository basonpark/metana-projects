"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function SettingsNotifications() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Notification Settings</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
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
              <h3 className="text-sm font-medium">Proposal Notifications</h3>
              <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-proposals" className="cursor-pointer">
                      New Proposals
                    </Label>
                    <p className="text-xs text-muted-foreground">Get notified when new proposals are created</p>
                  </div>
                  <Switch id="new-proposals" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="voting-starts" className="cursor-pointer">
                      Voting Starts
                    </Label>
                    <p className="text-xs text-muted-foreground">Get notified when voting begins on proposals</p>
                  </div>
                  <Switch id="voting-starts" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="voting-ends" className="cursor-pointer">
                      Voting Ends
                    </Label>
                    <p className="text-xs text-muted-foreground">Get notified when voting ends on proposals</p>
                  </div>
                  <Switch id="voting-ends" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="proposal-executed" className="cursor-pointer">
                      Proposal Executed
                    </Label>
                    <p className="text-xs text-muted-foreground">Get notified when proposals are executed</p>
                  </div>
                  <Switch id="proposal-executed" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Wallet Notifications</h3>
              <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="token-transfers" className="cursor-pointer">
                      Token Transfers
                    </Label>
                    <p className="text-xs text-muted-foreground">Get notified about token transfers</p>
                  </div>
                  <Switch id="token-transfers" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="delegation-changes" className="cursor-pointer">
                      Delegation Changes
                    </Label>
                    <p className="text-xs text-muted-foreground">Get notified when your delegation changes</p>
                  </div>
                  <Switch id="delegation-changes" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rewards" className="cursor-pointer">
                      Rewards
                    </Label>
                    <p className="text-xs text-muted-foreground">Get notified about governance rewards</p>
                  </div>
                  <Switch id="rewards" defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Communication Channels</h3>
              <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="cursor-pointer">
                      Email
                    </Label>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="browser-notifications" className="cursor-pointer">
                      Browser
                    </Label>
                    <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch id="browser-notifications" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="discord-notifications" className="cursor-pointer">
                      Discord
                    </Label>
                    <p className="text-xs text-muted-foreground">Receive notifications via Discord</p>
                  </div>
                  <Switch id="discord-notifications" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90">
                  Save Preferences
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
