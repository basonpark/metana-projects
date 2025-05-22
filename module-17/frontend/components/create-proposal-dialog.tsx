"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface CreateProposalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProposalDialog({ open, onOpenChange }: CreateProposalDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [targetAddress, setTargetAddress] = useState("")
  const [functionSignature, setFunctionSignature] = useState("")
  const [calldata, setCalldata] = useState("")
  const [ethValue, setEthValue] = useState("0")
  const [isAdvanced, setIsAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would call the contract to create the proposal
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-gradient-to-br from-background to-muted/30 border-none shadow-2xl">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-heading font-bold">Create New Proposal</DialogTitle>
            <DialogDescription>Submit a new proposal for the DAO to vote on.</DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 max-h-[70vh] overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Proposal Title</Label>
              <Input
                id="title"
                placeholder="Enter a clear, descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted/50 border-muted-foreground/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-muted/50 border-muted-foreground/20">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="treasury">Treasury</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="protocol">Protocol</SelectItem>
                  <SelectItem value="funding">Funding</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed explanation of your proposal"
                className="min-h-[120px] bg-muted/50 border-muted-foreground/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          <Tabs defaultValue="action" className="w-full">
            <TabsList className="w-full bg-muted/50 p-1">
              <TabsTrigger value="action" className="flex-1">
                Action
              </TabsTrigger>
              <TabsTrigger value="text" className="flex-1">
                Text Only
              </TabsTrigger>
            </TabsList>

            <TabsContent value="action" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="advanced-mode" className="cursor-pointer">
                  Advanced Mode
                </Label>
                <Switch id="advanced-mode" checked={isAdvanced} onCheckedChange={setIsAdvanced} />
              </div>

              <div className="space-y-4 rounded-lg bg-muted/30 p-4 border border-muted-foreground/10">
                <div className="space-y-2">
                  <Label htmlFor="target">Target Contract Address</Label>
                  <Input
                    id="target"
                    placeholder="0x..."
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                    className="font-mono bg-muted/50 border-muted-foreground/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="function">Function Signature</Label>
                  <Input
                    id="function"
                    placeholder="transfer(address,uint256)"
                    value={functionSignature}
                    onChange={(e) => setFunctionSignature(e.target.value)}
                    className="font-mono bg-muted/50 border-muted-foreground/20"
                  />
                </div>

                {isAdvanced && (
                  <div className="space-y-2">
                    <Label htmlFor="calldata">Calldata (hex)</Label>
                    <Input
                      id="calldata"
                      placeholder="0x..."
                      value={calldata}
                      onChange={(e) => setCalldata(e.target.value)}
                      className="font-mono bg-muted/50 border-muted-foreground/20"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="value">ETH Value (in wei)</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={ethValue}
                    onChange={(e) => setEthValue(e.target.value)}
                    className="bg-muted/50 border-muted-foreground/20"
                  />
                </div>
              </div>

              {!isAdvanced && (
                <div className="rounded-lg bg-muted/30 p-4 border border-muted-foreground/10">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Common Actions</Label>
                      <Select>
                        <SelectTrigger className="bg-muted/50 border-muted-foreground/20">
                          <SelectValue placeholder="Select an action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transfer">Transfer Funds</SelectItem>
                          <SelectItem value="upgrade">Upgrade Contract</SelectItem>
                          <SelectItem value="parameter">Update Parameter</SelectItem>
                          <SelectItem value="whitelist">Modify Whitelist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        id="recipient"
                        placeholder="0x..."
                        className="font-mono bg-muted/50 border-muted-foreground/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <div className="flex gap-2">
                        <Input
                          id="amount"
                          type="number"
                          min="0"
                          placeholder="0"
                          className="bg-muted/50 border-muted-foreground/20"
                        />
                        <Select defaultValue="eth">
                          <SelectTrigger className="w-[100px] bg-muted/50 border-muted-foreground/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eth">ETH</SelectItem>
                            <SelectItem value="gov">GOV</SelectItem>
                            <SelectItem value="usdc">USDC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="text" className="pt-4">
              <div className="rounded-lg bg-muted/30 p-4 border border-muted-foreground/10">
                <p className="text-sm text-muted-foreground">
                  This proposal will not execute any on-chain actions. It is for signaling community sentiment only.
                </p>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="discussion">Discussion Link (Optional)</Label>
                  <Input
                    id="discussion"
                    placeholder="https://forum.example.com/discussion/123"
                    className="bg-muted/50 border-muted-foreground/20"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90">
              Create Proposal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
