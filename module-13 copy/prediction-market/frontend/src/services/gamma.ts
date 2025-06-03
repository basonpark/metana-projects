import { PolymarketAPIMarket } from '@/types/market';

const GAMMA_POLYMARKET_API_ENDPOINT = '/api/gamma/markets';
const MAX_MARKETS_TO_FETCH = 400; 
const LIMIT_PER_PAGE = 100; 

interface RawPolymarketMarket {
  id: string;
  slug?: string;
  question: string;
  outcomes: string; 
  volume?: number;
  created_at?: string; 
  endDate?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  description?: string;
  image?: string;
  volumeClob?: number;
  liquidityClob?: number;
  bestBid?: number;
  bestAsk?: number;
  state?: string; 
}

function parseOutcomes(outcomesString: string): string[] {
  try {
    if (typeof outcomesString !== 'string') {
         console.warn(`Attempted to parse non-string outcomes: ${outcomesString}`);
         return [];
    }
    const parsed = JSON.parse(outcomesString);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse outcomes string:', outcomesString, error);
  }
  return [];
}

function dateStringToTimestamp(dateString: string | undefined): number {
  if (!dateString) return 0;
  try {
    const timestamp = Math.floor(new Date(dateString).getTime() / 1000);
    return isNaN(timestamp) ? 0 : timestamp;
  } catch (error) {
    console.error('Failed to parse date string:', dateString, error);
    return 0;
  }
}

function mapRawMarketToPolymarket(rawMarket: RawPolymarketMarket): PolymarketAPIMarket {
  const parsedOutcomes = parseOutcomes(rawMarket.outcomes);
  const isBinary = parsedOutcomes.length === 2;

  return {
    id: rawMarket.id as `0x${string}`, 
    source: 'polymarket', 
    question: rawMarket.question,
    state: (rawMarket.state === 'open' || rawMarket.state === 'closed' || rawMarket.state === 'resolved')
           ? rawMarket.state
           : 'open', 
    outcomes: parsedOutcomes, 
    volume: rawMarket.volume ?? 0, 
    creationTime: dateStringToTimestamp(rawMarket.created_at),
    expirationTime: dateStringToTimestamp(rawMarket.endDate), 
    category: rawMarket.category,
    slug: rawMarket.slug,
    description: rawMarket.description,
    image: rawMarket.image,
    volumeClob: rawMarket.volumeClob,
    liquidityClob: rawMarket.liquidityClob,
    bestBid: isBinary ? rawMarket.bestBid : undefined,
    bestAsk: isBinary ? rawMarket.bestAsk : undefined,
  };
}

export async function fetchActivePolymarketMarkets(): Promise<PolymarketAPIMarket[]> {
  let allMappedMarkets: PolymarketAPIMarket[] = [];
  let offset = 0;
  let hasMore = true;

  while (allMappedMarkets.length < MAX_MARKETS_TO_FETCH && hasMore) {
    const currentLimit = Math.min(LIMIT_PER_PAGE, MAX_MARKETS_TO_FETCH - allMappedMarkets.length);
    const params = new URLSearchParams({
      active: 'true',
      closed: 'false', 
      limit: currentLimit.toString(),
      offset: offset.toString()
    });
    const urlString = `${GAMMA_POLYMARKET_API_ENDPOINT}?${params.toString()}`;

    try {
      console.log(`Fetching page: offset=${offset}, limit=${currentLimit} from ${urlString}`);
      const response = await fetch(urlString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Gamma API request failed with status ${response.status}: ${errorBody} for URL: ${urlString}`);
        throw new Error(`Failed to fetch Polymarket data. Status: ${response.status}`);
      }

      const rawMarketsData: RawPolymarketMarket[] = await response.json();

      if (!Array.isArray(rawMarketsData)) {
        console.error('Invalid data structure received from Gamma API: Expected an array, got:', rawMarketsData);
        throw new Error('Invalid data structure received from Gamma API.');
      }

      console.log(`Fetched ${rawMarketsData.length} markets from API.`);

      const mappedMarketsFromPage = rawMarketsData.map(mapRawMarketToPolymarket);
      const binaryMarketsFromPage = mappedMarketsFromPage.filter(market => market.outcomes.length === 2);

      console.log(`Found ${binaryMarketsFromPage.length} binary markets on this page.`);
      allMappedMarkets = allMappedMarkets.concat(binaryMarketsFromPage);
      console.log(`Total active binary markets collected so far: ${allMappedMarkets.length}`);

      if (rawMarketsData.length < currentLimit) {
        hasMore = false;
        console.log('API returned fewer markets than limit, stopping fetch loop.');
      } else {
        offset += rawMarketsData.length; 
      }

    } catch (error) {
      console.error(`Error fetching Polymarket data chunk (offset: ${offset}):`, error);
      throw error;
    }
  }

  console.log(`Finished fetching. Total active binary markets retrieved: ${allMappedMarkets.length}`);
  return allMappedMarkets;
}

export async function fetchMarketById(
  marketId: string
): Promise<PolymarketAPIMarket | null> {
  if (!marketId) {
    console.error("fetchMarketById requires a marketId.");
    return null;
  }

  const urlString = `${GAMMA_POLYMARKET_API_ENDPOINT}/${marketId}`;

  try {
    console.log(`Fetching market details from: ${urlString}`);
    const response = await fetch(urlString, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Market with ID ${marketId} not found via Gamma API.`);
        return null; 
      }
      const errorBody = await response.text();
      console.error(
        `Gamma API request for market ${marketId} failed with status ${response.status}: ${errorBody}`
      );
      throw new Error(
        `Failed to fetch Polymarket market data. Status: ${response.status}`
      );
    }

    const rawMarketData: RawPolymarketMarket = await response.json();

    if (!rawMarketData || typeof rawMarketData !== 'object' || !rawMarketData.id) {
      console.error(
        "Invalid data structure received for single market:",
        rawMarketData
      );
      throw new Error("Invalid data structure received for single market.");
    }

    const mappedMarket = mapRawMarketToPolymarket(rawMarketData);

    if (mappedMarket.outcomes.length !== 2) {
        console.warn(`Market ${mappedMarket.id} fetched by ID is not a binary market based on outcomes:`, mappedMarket.outcomes);
    }

    console.log(`Successfully fetched and mapped market ${mappedMarket.id}`);
    return mappedMarket;
  } catch (error) {
    console.error(`Error fetching market ${marketId} data:`, error);
    return null; 
  }
}

export async function fetchPolymarketMarketById(id: string): Promise<PolymarketAPIMarket | null> {
  console.log(`[gamma.ts] fetchPolymarketMarketById: Fetching market with ID: ${id}`);
  if (!id) {
    console.error("[gamma.ts] fetchPolymarketMarketById: marketId is empty or null.");
    return null;
  }
  const urlString = `${GAMMA_POLYMARKET_API_ENDPOINT}/${id}`;
  console.log(`Fetching single market: ${id} from ${urlString}`);

  try {
    const response = await fetch(urlString, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Market with ID ${id} not found.`);
        return null;
      } else {
        throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
      }
    }

    const rawMarket: RawPolymarketMarket = await response.json();

    if (!rawMarket || !rawMarket.id) {
      console.warn(`Invalid data received for market ID ${id}.`);
      return null;
    }

    return mapRawMarketToPolymarket(rawMarket);

  } catch (error) {
    console.error(`Error fetching market details for ID ${id}:`, error);
    return null; 
  }
}