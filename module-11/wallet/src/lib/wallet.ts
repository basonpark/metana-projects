// wallet.ts - core wallet functionality
import * as crypto from 'crypto';
import { keccak256 } from 'js-sha3';
import { ec as EC } from 'elliptic';
import { hexToBytes, bytesToHex } from './utils';

// we use the secp256k1 curve for ethereum
const ec = new EC('secp256k1');

// wallet interface to define our wallet structure
export interface Wallet {
  privateKey: string;
  publicKey: string;
  address: string;
}

/**
 * creates a new wallet by generating a random private key
 * and deriving the public key and address from it
 */
export function createWallet(): Wallet {
  // generate random private key
  const privateKeyBytes = crypto.randomBytes(32);
  const privateKey = bytesToHex(privateKeyBytes);
  
  // derive public key from private key
  const keyPair = ec.keyFromPrivate(privateKeyBytes);
  const publicKeyBytes = keyPair.getPublic('array');
  const publicKey = bytesToHex(Buffer.from(publicKeyBytes));
  
  // derive ethereum address from public key (last 20 bytes of keccak256 hash)
  // we remove the first byte of public key (0x04 which indicates uncompressed key)
  const addressBytes = keccak256(Buffer.from(publicKeyBytes.slice(1)));
  // take last 20 bytes for ethereum address
  const address = '0x' + addressBytes.substring(addressBytes.length - 40);
  
  return {
    privateKey,
    publicKey,
    address,
  };
}

/**
 * imports an existing wallet from a private key
 */
export function importWallet(privateKey: string): Wallet {
  // remove 0x prefix if present
  const privateKeyHex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  const privateKeyBytes = hexToBytes(privateKeyHex);
  
  // derive public key
  const keyPair = ec.keyFromPrivate(privateKeyBytes);
  const publicKeyBytes = keyPair.getPublic('array');
  const publicKey = bytesToHex(Buffer.from(publicKeyBytes));
  
  // derive address
  const addressBytes = keccak256(Buffer.from(publicKeyBytes.slice(1)));
  const address = '0x' + addressBytes.substring(addressBytes.length - 40);
  
  return {
    privateKey: '0x' + privateKeyHex,
    publicKey,
    address,
  };
}

/**
 * signs a message with the wallet's private key
 */
export function signMessage(wallet: Wallet, message: string): string {
  // remove 0x prefix if present
  const privateKeyHex = wallet.privateKey.startsWith('0x') ? wallet.privateKey.slice(2) : wallet.privateKey;
  const keyPair = ec.keyFromPrivate(privateKeyHex);
  
  // hash the message with keccak256
  const messageHash = keccak256(message);
  
  // sign the hash
  const signature = keyPair.sign(messageHash);
  
  // convert signature to hex format
  const r = signature.r.toString(16).padStart(64, '0');
  const s = signature.s.toString(16).padStart(64, '0');
  const v = signature.recoveryParam ? '1c' : '1b'; // ethereum v value
  
  return '0x' + r + s + v;
} 