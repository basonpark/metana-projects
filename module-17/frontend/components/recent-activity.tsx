import { Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivity() {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-muted/20">
        <div className="space-y-1">
          <CardTitle className="font-heading text-xl">Recent Activity</CardTitle>
          <CardDescription>Latest governance actions</CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Activity className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative pl-6 space-y-6">
          <div className="absolute top-0 bottom-0 left-2 border-l-2 border-dashed border-muted-foreground/30" />

          {[
            {
              event: "Vote Cast",
              description: "You voted For on 'Treasury diversification'",
              time: "2 hours ago",
              icon: "🗳️",
            },
            {
              event: "Proposal Created",
              description: "New proposal: 'Implement protocol fee of 0.05%'",
              time: "5 hours ago",
              icon: "📝",
            },
            {
              event: "Tokens Delegated",
              description: "0x8Fc...3Fa2 delegated 45,000 GOV to you",
              time: "1 day ago",
              icon: "🔄",
            },
            {
              event: "Proposal Executed",
              description: "'Reduce voting period to 2 days' was executed",
              time: "3 days ago",
              icon: "✅",
            },
            {
              event: "Tokens Claimed",
              description: "You claimed 125 GOV tokens",
              time: "5 days ago",
              icon: "💰",
            },
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="absolute -left-6 top-0 flex h-4 w-4 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <h4 className="font-medium">{item.event}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
