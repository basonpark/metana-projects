import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PolymarketAPIMarket } from "@/types/market"
import { ethers } from "ethers" // Import ethers for formatting

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an ISO date string or timestamp number into a human-readable time remaining string.
 * @param endDateStringOrTimestamp - The end date as an ISO string or Unix timestamp (in milliseconds).
 * @returns A string like "Ended", "5 days remaining", "1 hour remaining", etc.
 */
export function formatTimeRemaining(endDateStringOrTimestamp: string | number): string {
  const now = new Date();
  const end = new Date(endDateStringOrTimestamp);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return "Ended";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 1) return `${days} days remaining`;
  if (days === 1) return `1 day remaining`;
  if (hours > 1) return `${hours} hours remaining`;
  if (hours === 1) return `1 hour remaining`;
  if (minutes > 1) return `${minutes} minutes remaining`;
  return `1 minute remaining`;
}

/**
 * Categorizes a market based on keywords in its question or slug.
 * Uses the market's predefined category if available.
 * @param marketData - The market data object with question and optional category.
 * @returns A category string.
 */
export function categorizeMarket(marketData: { question: string; category?: string }): string {
  // Prioritize the category provided by the API if it exists and isn't empty/generic
  if (marketData.category && marketData.category.trim() !== '' && marketData.category.toLowerCase() !== 'other') {
    // Simple pluralization check - very basic
    if (marketData.category.toLowerCase() === 'crypto') return 'Crypto';
    if (marketData.category.toLowerCase() === 'politics') return 'Politics';
     if (marketData.category.toLowerCase() === 'sports') return 'Sports';
    // Add more direct mappings if needed
    return marketData.category; // Return the API's category directly
  }

  // Fallback to keyword analysis if no suitable category from API
  // Use question for keyword matching
  const text = marketData.question.toLowerCase();

  // Expanded keywords for better matching
  const categories: { [key: string]: RegExp } = {
    'Crypto': /(bitcoin|ethereum|crypto|blockchain|price|btc|eth|solana|token|nft|web3|defi|wallet|mining|airdrop|doge|shiba|coin|altcoin|hodl|staking|yield|liquidity|stablecoin|dao|dapp|metaverse)/i,
    'Tech': /(tech|ai|artificial intelligence|spacex|tesla|starship|google|apple|microsoft|amazon|meta|facebook|twitter|x|nvidia|amd|intel|software|hardware|gadget|phone|laptop|internet|data|cloud|robot|semiconductor|algorithm|code|programming|startup|innovation)/i,
    'Sports': /(NBA|super bowl|nba|nfl|mlb|nhl|football|basketball|baseball|hockey|soccer|fifa|world cup|olympics|champion|league|team|player|match|game|score|playoff|tournament|draft|transfer|tennis|golf|ufc|mma|esports|gaming)/i,
    'Politics': /(election|president|congress|vote|biden|trump|democrat|republican|senate|house|white house|government|policy|law|political|party|candidate|primary|debate|poll|geopolitics|ukraine|russia|china|eu|un|nato)/i,
    'Entertainment': /(oscars|grammys|emmys|movie|film|tv|television|series|netflix|hbo|disney|hollywood|actor|actress|director|celebrity|music|artist|album|song|concert|tour|box office|streaming|award|show|pop culture)/i,
    'Finance': /(stock|market|finance|economy|inflation|interest rate|fed|federal reserve|gdp|recession|growth|earnings|ipo|investment|dow jones|nasdaq|s&p 500|trading|bank|loan|mortgage|debt|currency|forex|commodities|oil|gold|bonds|yield)/i,
    'World': /(world|global|international|country|nation|region|war|conflict|peace|treaty|diplomacy|climate|environment|energy|disaster|news|headline|event|summit|geopolitics)/i, // Added World category
    'Science': /(science|research|discovery|nasa|space|planet|astronomy|physics|chemistry|biology|medicine|health|disease|vaccine|study|experiment|journal|nature|climate change|environment|technology)/i, // Added Science category
  };

  for (const category in categories) {
    if (categories[category].test(text)) {
      return category;
    }
  }

  // Default category if no keywords match
  return 'Other';
};

/**
 * Formats a BigInt value (representing wei) into a short ETH string.
 * @param value - The BigInt value in wei.
 * @param decimals - Number of decimal places to show (default: 4).
 * @returns A string like "1.2345 ETH".
 */
export function formatEtherShort(value: bigint | undefined, decimals: number = 4): string {
  if (value === undefined) {
    return "0.0".padEnd(decimals + 2, '0') + " ETH";
  }
  try {
    const formatted = ethers.formatUnits(value, 18);
    // Use regex to truncate decimals without rounding
    const match = formatted.match(`^-?\d*\.?\d{0,${decimals}}`);
    const truncated = match ? match[0] : formatted; // Fallback if regex fails
    // Ensure there's a decimal part if needed
    const parts = truncated.split('.');
    const integerPart = parts[0];
    const decimalPart = (parts[1] || '').padEnd(decimals, '0');
    return `${integerPart}.${decimalPart} ETH`;
  } catch (error) {
    console.error("Error formatting ether value:", error);
    return "Error ETH"; // Fallback on error
  }
}

/**
 * Formats a BigInt value (representing wei) into a shorter ETH string using formatEtherShort.
 * @param value - The BigInt value in wei.
 * @returns A string like "1.2345 ETH".
 */
export function formatBalance(value: bigint | undefined): string {
  if (value === undefined) return "0.0000 ETH"; // Match formatEtherShort default
  return formatEtherShort(value); // Reuse formatEtherShort
}

/**
 * Formats a BigInt value (representing basis points) into a percentage string.
 * @param feeBps - The BigInt value in basis points.
 * @returns A string like "2.5%".
 */
export function formatFee(feeBps: bigint | undefined): string {
  if (feeBps === undefined || feeBps < 0n) return "N/A";
  // Basis points to percentage - convert bigint to Number for division
  return `${Number(feeBps) / 100}%`;
}
