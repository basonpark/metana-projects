import { Clock, FileText, ThumbsDown, ThumbsUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Mock data for proposals
const recentProposals = [
  {
    id: "1",
    title: "Treasury diversification: Allocate 5% to stablecoins",
    description:
      "This proposal aims to diversify our treasury by allocating 5% of our assets to stablecoins to reduce volatility.",
    status: "active",
    votesFor: 650000,
    votesAgainst: 250000,
    votesAbstain: 100000,
    totalVotes: 1000000,
    endTime: "2023-05-15T14:00:00Z",
    category: "Treasury",
  },
  {
    id: "5",
    title: "Implement protocol fee of 0.05%",
    description:
      "Implement a protocol fee of 0.05% on all transactions to generate sustainable revenue for the DAO treasury.",
    status: "active",
    votesFor: 320000,
    votesAgainst: 180000,
    votesAbstain: 50000,
    totalVotes: 550000,
    endTime: "2023-05-18T14:00:00Z",
    category: "Protocol",
  },
  {
    id: "3",
    title: "Reduce voting period to 2 days",
    description: "Reduce the voting period from 3 days to 2 days to speed up governance decisions.",
    status: "executed",
    votesFor: 800000,
    votesAgainst: 150000,
    votesAbstain: 50000,
    totalVotes: 1000000,
    endTime: "2023-05-01T14:00:00Z",
    category: "Governance",
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30"
    case "pending":
      return "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30"
    case "executed":
      return "bg-green-500/20 text-green-700 hover:bg-green-500/30"
    case "defeated":
      return "bg-red-500/20 text-red-700 hover:bg-red-500/30"
    default:
      return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30"
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

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h remaining`
  } else {
    return `${diffHours}h remaining`
  }
}

export function RecentProposals() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {recentProposals.map((proposal) => (
        <Link href="/dashboard" key={proposal.id}>
          <div className="h-full rounded-lg border border-muted-foreground/10 bg-gradient-to-br from-card/80 to-card/50 p-5 hover:bg-muted/30 transition-colors cursor-pointer shadow-md hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={cn("gap-1", getStatusColor(proposal.status))}>
                    {getStatusIcon(proposal.status)}
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="bg-muted/50">
                    {proposal.category}
                  </Badge>
                </div>
                <h3 className="font-heading font-medium text-base line-clamp-2">{proposal.title}</h3>

                {proposal.status === "active" && (
                  <span className="text-xs text-muted-foreground">{formatTimeRemaining(proposal.endTime)}</span>
                )}
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-muted/50">
                <FileText className="h-4 w-4" />
              </Button>
            </div>

            {(proposal.status === "active" || proposal.status === "executed" || proposal.status === "defeated") && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3 text-green-600" />
                    <span>{Math.round((proposal.votesFor / proposal.totalVotes) * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="h-3 w-3 text-red-600" />
                    <span>{Math.round((proposal.votesAgainst / proposal.totalVotes) * 100)}%</span>
                  </div>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/70">
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
                  />
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${(proposal.votesAgainst / proposal.totalVotes) * 100}%` }}
                  />
                  <div
                    className="bg-gray-400 transition-all"
                    style={{ width: `${(proposal.votesAbstain / proposal.totalVotes) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

import { Check, X } from "lucide-react"
