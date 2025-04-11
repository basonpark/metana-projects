import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
