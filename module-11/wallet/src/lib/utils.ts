// utils.ts - utility functions for conversion and formatting

/**
 * converts hex string to byte array
 */
export function hexToBytes(hex: string): Uint8Array {
  // remove 0x prefix if present
  hex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  // ensure even length
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  
  const bytes = new Uint8Array(hex.length / 2);
  
  for (let i = 0; i < bytes.length; i++) {
    const byte = parseInt(hex.substr(i * 2, 2), 16);
    bytes[i] = byte;
  }
  
  return bytes;
}

/**
 * converts byte array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * converts number to hex string
 */
export function numberToHex(num: number): string {
  return '0x' + num.toString(16);
}

/**
 * formats wei to ether
 */
export function weiToEther(wei: string): string {
  // remove 0x prefix if present
  const weiValue = wei.startsWith('0x') ? BigInt(wei) : BigInt('0x' + wei);
  
  // 1 ether = 10^18 wei
  const etherValue = Number(weiValue) / 1e18;
  
  return etherValue.toFixed(6);
}

/**
 * formats ether to wei
 */
export function etherToWei(ether: string): string {
  // convert ether to wei (1 ether = 10^18 wei)
  const etherValue = parseFloat(ether);
  const weiValue = Math.floor(etherValue * 1e18);
  
  return '0x' + weiValue.toString(16);
}

/**
 * shortens address for display
 */
export function shortenAddress(address: string): string {
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
} 