import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Clock, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MarketWithMetadata } from "@/types/contracts";

interface MarketCardProps {
  market: MarketWithMetadata;
}

export function MarketCard({ market }: MarketCardProps) {
  // Format expiration date for display
  const expiresIn = formatDistanceToNow(
    new Date(market.expirationTime * 1000),
    {
      addSuffix: true,
    }
  );

  // Calculate market status
  const marketStatus =
    market.status === 0 ? "Open" : market.status === 1 ? "Locked" : "Settled";

  // Format market volume and liquidity
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <Badge variant="outline" className="text-xs">
            {market.category || "Uncategorized"}
          </Badge>
          <Badge
            variant={
              marketStatus === "Open"
                ? "outline"
                : marketStatus === "Locked"
                ? "secondary"
                : "default"
            }
            className="text-xs"
          >
            {marketStatus}
          </Badge>
        </div>
        <Link href={`/markets/${market.address}`} className="hover:underline">
          <h3 className="text-lg font-semibold leading-relaxed line-clamp-2 mt-2 font-regular tracking-wide">
            {market.question}
          </h3>
        </Link>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <div className="grid grid-cols-2 gap-4 text-sm font-light">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ends:</span> {expiresIn}
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Volume:</span>{" "}
            {formatCurrency(market.volume || 0)}
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Liquidity:</span>{" "}
            {formatCurrency(market.totalLiquidity || 0)}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full grid grid-cols-2 gap-2">
          <Button
            className="w-full bg-green-50 border-2 border-green-300 text-green-600 font-medium hover:bg-green-100 flex items-center justify-center"
            asChild
          >
            <Link href={`/markets/${market.address}`}>
              Buy Yes <span className="ml-1">👍</span>
            </Link>
          </Button>
          <Button
            className="w-full bg-red-50 border-2 border-red-300 text-red-600 font-medium hover:bg-red-100 flex items-center justify-center"
            asChild
          >
            <Link href={`/markets/${market.address}`}>
              Buy No <span className="ml-1">👎</span>
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
