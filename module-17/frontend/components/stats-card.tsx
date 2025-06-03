import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  description: string
  icon: LucideIcon
}

export function StatsCard({ title, value, change, trend, description, icon: Icon }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card to-card/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold font-heading">{value}</p>
              <div
                className={`flex items-center text-xs font-medium ${
                  trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                {trend === "up" ? (
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                ) : trend === "down" ? (
                  <ArrowDown className="h-3 w-3 mr-0.5" />
                ) : null}
                {change}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
