import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to truncate Ethereum addresses
export function truncateAddress(address: string | undefined, chars: number = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address; // Return original if too short to truncate
  const start = address.substring(0, chars + 2); // Include '0x'
  const end = address.substring(address.length - chars);
  return `${start}...${end}`;
}
