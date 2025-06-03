"use client"

import { Progress } from "@/components/ui/progress"

import { useState } from "react"
import { Clock, FileText, ThumbsDown, ThumbsUp, X, Check } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProposalDialogProps {
  proposal: {
    id: string
    title: string
    description: string
    status: string
    votesFor: number
    votesAgainst: number
    votesAbstain: number
    totalVotes: number
    endTime: string
    createdBy: string
    createdAt: string
    category: string
    quorum: number
    currentQuorum: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "active":
      return "status-active"
    case "pending":
      return "status-pending"
    case "executed":
      return "status-executed"
    case "defeated":
      return "status-defeated"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return <Clock className="h-3 w-3" />
    case "pending":
      return <Clock className="h-3 w-3" />
    case "executed":
      return <Check className="h-3 w-3" />
    case "defeated":
      return <X className="h-3 w-3" />
    default:
      return null
  }
}

function formatTimeRemaining(endTimeStr: string) {
  const endTime = new Date(endTimeStr)
  const now = new Date()

  if (now > endTime) return "Ended"

  const diffMs = endTime.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h remaining`
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m remaining`
  } else {
    return `${diffMinutes}m remaining`
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

export function ProposalDialog({ proposal, open, onOpenChange }: ProposalDialogProps) {
  const [selectedVote, setSelectedVote] = useState<"for" | "against" | "abstain" | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [voteAmount, setVoteAmount] = useState(1250)

  const handleVote = () => {
    if (selectedVote) {
      setHasVoted(true)
      // Here you would call the contract to cast the vote
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-gradient-to-br from-background to-muted/30 border-none shadow-card">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <DialogHeader className="p-6 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("gap-1", getStatusBadgeClass(proposal.status))}>
                {getStatusIcon(proposal.status)}
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
              <Badge variant="outline" className="bg-muted/50">
                {proposal.category}
              </Badge>
              {proposal.status === "active" && (
                <span className="text-xs text-muted-foreground">{formatTimeRemaining(proposal.endTime)}</span>
              )}
            </div>
            <DialogTitle className="text-xl font-heading font-bold mt-2">{proposal.title}</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <span>Created by {proposal.createdBy}</span>
              <span>on {formatDate(proposal.createdAt)}</span>
              <span>ID: {proposal.id}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 max-h-[70vh] overflow-y-auto">
          <Tabs defaultValue="overview">
            <TabsList className="w-full bg-muted/50 p-1">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>
              <TabsTrigger value="votes" className="flex-1">
                Votes
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{proposal.description}</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Voting Results</h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 vote-for" />
                      <span>For: {Math.round((proposal.votesFor / proposal.totalVotes) * 100)}%</span>
                    </div>
                    <span>{proposal.votesFor.toLocaleString()} votes</span>
                  </div>
                  <Progress
                    value={(proposal.votesFor / proposal.totalVotes) * 100}
                    className="h-2 bg-muted"
                    indicatorClassName="vote-progress-for"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 vote-against" />
                      <span>Against: {Math.round((proposal.votesAgainst / proposal.totalVotes) * 100)}%</span>
                    </div>
                    <span>{proposal.votesAgainst.toLocaleString()} votes</span>
                  </div>
                  <Progress
                    value={(proposal.votesAgainst / proposal.totalVotes) * 100}
                    className="h-2 bg-muted"
                    indicatorClassName="vote-progress-against"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Abstain: {Math.round((proposal.votesAbstain / proposal.totalVotes) * 100)}%</span>
                    <span>{proposal.votesAbstain.toLocaleString()} votes</span>
                  </div>
                  <Progress
                    value={(proposal.votesAbstain / proposal.totalVotes) * 100}
                    className="h-2 bg-muted"
                    indicatorClassName="vote-progress-abstain"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        proposal.currentQuorum >= proposal.quorum ? "bg-emerald-500" : "bg-amber-500",
                      )}
                    />
                    <span className="text-sm">
                      Quorum: {proposal.currentQuorum}% / {proposal.quorum}%
                    </span>
                  </div>
                  <Progress
                    value={(proposal.currentQuorum / proposal.quorum) * 100}
                    className="h-1.5 w-24 bg-muted"
                    indicatorClassName={proposal.currentQuorum >= proposal.quorum ? "bg-emerald-500" : "bg-amber-500"}
                  />
                </div>
              </div>

              {proposal.status === "active" && !hasVoted && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Cast Your Vote</h3>
                    <p className="text-sm text-muted-foreground">
                      You have {voteAmount.toLocaleString()} votes available to cast on this proposal.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant={selectedVote === "for" ? "default" : "outline"}
                        className={cn(
                          "flex-1 min-w-[100px] shadow-button",
                          selectedVote === "for"
                            ? "bg-gradient-to-r from-[hsl(var(--vote-for))] to-[hsl(var(--vote-for-subtle))] text-white shadow-[hsl(var(--vote-for-subtle))]/20"
                            : "",
                        )}
                        onClick={() => setSelectedVote("for")}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Vote For
                      </Button>
                      <Button
                        variant={selectedVote === "against" ? "default" : "outline"}
                        className={cn(
                          "flex-1 min-w-[100px] shadow-button",
                          selectedVote === "against"
                            ? "bg-gradient-to-r from-[hsl(var(--vote-against))] to-[hsl(var(--vote-against-subtle))] text-white shadow-[hsl(var(--vote-against-subtle))]/20"
                            : "",
                        )}
                        onClick={() => setSelectedVote("against")}
                      >
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        Vote Against
                      </Button>
                      <Button
                        variant={selectedVote === "abstain" ? "default" : "outline"}
                        className={cn(
                          "flex-1 min-w-[100px] shadow-button",
                          selectedVote === "abstain" ? "bg-gradient-to-r from-gray-600 to-gray-500 text-white" : "",
                        )}
                        onClick={() => setSelectedVote("abstain")}
                      >
                        Abstain
                      </Button>
                    </div>

                    <Button
                      className="w-full shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90"
                      disabled={!selectedVote}
                      onClick={handleVote}
                    >
                      Submit Vote
                    </Button>
                  </div>
                </>
              )}

              {proposal.status === "active" && hasVoted && (
                <>
                  <Separator />

                  <div className="rounded-lg bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 p-4 text-center">
                    <Check className="mx-auto h-6 w-6 text-emerald-500" />
                    <p className="mt-2 font-medium">Your vote has been cast successfully!</p>
                    <p className="text-sm text-muted-foreground">
                      You can change your vote until the voting period ends.
                    </p>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="details" className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Proposal Details</h3>
                    <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Proposal ID:</span>
                        <span className="font-mono">{proposal.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{proposal.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created by:</span>
                        <span className="font-mono">{proposal.createdBy}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created at:</span>
                        <span>{formatDate(proposal.createdAt)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Voting ends:</span>
                        <span>{formatDate(proposal.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">On-chain Information</h3>
                    <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Contract:</span>
                        <span className="font-mono truncate">0x8Fc3...7Fa2</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Block:</span>
                        <span>16,842,753</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transaction:</span>
                        <span className="font-mono truncate">0x7Bc9...9Ad1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network:</span>
                        <span>Ethereum Mainnet</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gas used:</span>
                        <span>245,872</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Actions</h3>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">Contract Call</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target:</span>
                        <span className="font-mono">0x9Ac2...2Fb3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Function:</span>
                        <span className="font-mono">allocateFunds(address,uint256)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Value:</span>
                        <span>0 ETH</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Calldata:</span>
                        <div className="font-mono text-xs bg-muted p-2 rounded-md overflow-x-auto">
                          0x4a75626100000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc45000000000000000000000000000000000000000000000021e19e0c9bab2400000
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="votes" className="pt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Recent Votes</h3>
                <div className="space-y-3">
                  {[
                    { voter: "0x71C...1F3d", vote: "For", amount: "1,250", time: "2 hours ago" },
                    { voter: "0x8Fc...3Fa2", vote: "Against", amount: "45,000", time: "5 hours ago" },
                    { voter: "0x7Bc...9Ad1", vote: "For", amount: "120,000", time: "8 hours ago" },
                    { voter: "0x9Ac...2Fb3", vote: "Abstain", amount: "75,000", time: "1 day ago" },
                    { voter: "0x6Dc...5Ea4", vote: "For", amount: "250,000", time: "1 day ago" },
                  ].map((vote, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            vote.vote === "For"
                              ? "bg-[hsl(var(--vote-for-subtle))]"
                              : vote.vote === "Against"
                                ? "bg-[hsl(var(--vote-against-subtle))]"
                                : "bg-[hsl(var(--vote-abstain-subtle))]",
                          )}
                        />
                        <span className="font-mono text-sm">{vote.voter}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            vote.vote === "For"
                              ? "vote-for"
                              : vote.vote === "Against"
                                ? "vote-against"
                                : "vote-abstain",
                          )}
                        >
                          {vote.vote}
                        </span>
                        <span className="text-sm">{vote.amount}</span>
                        <span className="text-xs text-muted-foreground">{vote.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  View All Votes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="pt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Proposal Timeline</h3>
                <div className="relative pl-6 space-y-6">
                  <div className="absolute top-0 bottom-0 left-2 border-l-2 border-dashed border-muted-foreground/30" />

                  {[
                    { event: "Created", date: "May 8, 2023 14:00", description: "Proposal created by 0x8Fc...3Fa2" },
                    {
                      event: "Voting Started",
                      date: "May 9, 2023 14:00",
                      description: "Voting period began after 1 day delay",
                    },
                    { event: "Current", date: "Now", description: "Voting in progress" },
                    { event: "Voting Ends", date: "May 15, 2023 14:00", description: "Scheduled end of voting period" },
                    {
                      event: "Execution",
                      date: "May 17, 2023 14:00",
                      description: "Scheduled execution after timelock (if passed)",
                    },
                  ].map((item, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-6 top-0 flex h-4 w-4 items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-medium">{item.event}</h4>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
