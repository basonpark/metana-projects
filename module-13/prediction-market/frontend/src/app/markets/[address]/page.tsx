'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useMarketContractSafe } from '@/hooks/useMarketContractSafe';
import { MarketInfo, MarketStatus } from '@/types/contracts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimeRemaining } from '@/lib/utils'; // Assuming you have this utility
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

// Define the structure for page props if needed, although useParams covers it
type MarketPageParams = {
  address: string;
};

const MarketDetailPage = () => {
  const params = useParams();
  const { address: marketAddress } = params as MarketPageParams;
  const { isConnected } = useAccount();
  const { contractIsReady, getMarketInfo } = useMarketContractSafe();

  const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      if (!marketAddress || typeof marketAddress !== 'string' || !marketAddress.startsWith('0x')) {
        setError('Invalid market address.');
        setIsLoading(false);
        return;
      }
      if (!contractIsReady) {
        setError('Contract connection not ready.');
        // Don't set loading to false, wait for connection
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        console.log(`Fetching market info for address: ${marketAddress}`);
        const info = await getMarketInfo(marketAddress as `0x${string}`);
        if (info) {
          setMarketInfo(info);
          console.log('Market Info:', info);
        } else {
          setError('Market not found or failed to fetch details.');
        }
      } catch (err) {
        console.error('Error fetching market info:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, [marketAddress, contractIsReady, getMarketInfo]);

  const renderLoading = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex space-x-4 mt-4">
        <Skeleton className="h-24 w-1/2" />
        <Skeleton className="h-24 w-1/2" />
      </div>
    </div>
  );

  const renderError = () => (
     <Alert variant="destructive">
      <Terminal className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  const renderMarketDetails = () => {
    if (!marketInfo) return <p>No market data available.</p>;

    const timeRemaining = formatTimeRemaining(Number(marketInfo.expirationTime || 0));
    // Map contract status to display status
    let status: 'Open' | 'Resolving' | 'Resolved';
    switch (marketInfo.status) {
        case MarketStatus.Open:
            status = 'Open';
            break;
        case MarketStatus.Resolving:
            status = 'Resolving'; // Or maybe 'Closed' if Resolving means closed for trading
            break;
        case MarketStatus.Resolved:
            status = 'Resolved';
            break;
        default:
            status = 'Unknown'; // Should not happen
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl mb-2">{marketInfo.question}</CardTitle>
            <CardDescription className="flex items-center space-x-4">
                <Badge variant={status === 'Open' ? 'default' : status === 'Resolved' ? 'destructive' : 'secondary'}>{status}</Badge>
                <span>Expires: {new Date(Number(marketInfo.expirationTime) * 1000).toLocaleString()} ({timeRemaining})</span>
                <Badge variant="outline">Category: {marketInfo.category}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Chart */}
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-500 mb-6">
              Chart Placeholder
            </div>

            {/* Placeholder for Buy/Sell Interface */}
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Trade</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center text-gray-500 h-32">
                    Buy/Sell Interface Placeholder
                </CardContent>
            </Card>
          </CardContent>
        </Card>

         {/* Placeholder for Market Rules/Details */}
        <Card>
            <CardHeader>
                <CardTitle>Market Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-400">
                <p>Fee: {(Number(marketInfo.fee) / 100).toFixed(2)}%</p>
                <p>Data Feed ID: {marketInfo.dataFeedId}</p>
                {/* Add more details as needed */}
                <p className="mt-4">This market will resolve based on the specified data feed or outcome.</p>
            </CardContent>
        </Card>

      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {isLoading && renderLoading()}
      {!isLoading && error && renderError()}
      {!isLoading && !error && marketInfo && renderMarketDetails()}
      {!isLoading && !error && !marketInfo && <p>Market data could not be loaded.</p>}
    </div>
  );
};

export default MarketDetailPage;
