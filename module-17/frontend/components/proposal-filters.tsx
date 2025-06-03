"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, Filter, Search, SlidersHorizontal } from "lucide-react"

export function ProposalFilters() {
  const [expanded, setExpanded] = useState(false)
  const [quorumRange, setQuorumRange] = useState([0, 100])

  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-lg font-medium">Filter Proposals</h3>
            </div>

            <div className="flex flex-1 md:flex-none items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <Input placeholder="Search proposals..." className="pl-9 bg-muted/50 border-muted-foreground/20" />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="icon" onClick={() => setExpanded(!expanded)} className="h-10 w-10">
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger className="bg-muted/50 border-muted-foreground/20">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="treasury">Treasury</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="protocol">Protocol</SelectItem>
                      <SelectItem value="funding">Funding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger className="bg-muted/50 border-muted-foreground/20">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="executed">Executed</SelectItem>
                      <SelectItem value="defeated">Defeated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Quorum Range</Label>
                    <span className="text-xs text-muted-foreground">
                      {quorumRange[0]}% - {quorumRange[1]}%
                    </span>
                  </div>
                  <Slider
                    defaultValue={[0, 100]}
                    max={100}
                    step={1}
                    value={quorumRange}
                    onValueChange={setQuorumRange}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date Created</Label>
                  <Select>
                    <SelectTrigger className="bg-muted/50 border-muted-foreground/20">
                      <SelectValue placeholder="Any Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Time</SelectItem>
                      <SelectItem value="day">Last 24 Hours</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voted">Only Show Voted</Label>
                  <Switch id="voted" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="created">Created By Me</Label>
                  <Switch id="created" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="executable">Ready to Execute</Label>
                  <Switch id="executable" />
                </div>

                <div className="pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full gap-2 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90">
                      <Filter className="h-4 w-4" />
                      Apply Filters
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
