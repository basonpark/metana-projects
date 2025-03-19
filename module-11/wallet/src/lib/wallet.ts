// wallet.ts - core wallet functionality
import * as crypto from 'crypto';
import { keccak256 } from 'js-sha3';
import { ec as EC } from 'elliptic';
import { hexToBytes, bytesToHex } from './utils';
import { generateMnemonic, mnemonicToSeedSync } from 'ethereum-cryptography/bip39/index.js';
import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english.js';
import { HDKey } from 'ethereum-cryptography/hdkey';

// we use the secp256k1 curve for ethereum
const ec = new EC('secp256k1');

// wallet interface to define our wallet structure
export interface Wallet {
  privateKey: string;
  publicKey: string;
  address: string;
  mnemonic?: string; // Optional mnemonic for seed phrase wallets
}

//creates wallet by deriving public key and addres from private key
export function createWallet(): Wallet {
  // generate mnemonic and derive private key using HD wallet
  const mnemonic = generateMnemonic(wordlist);  // Use English wordlist
  const seed = mnemonicToSeedSync(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed)
    .derive("m/44'/60'/0'/0/0"); // Standard Ethereum path
  
  if (!hdKey.privateKey) {
    throw new Error("Failed to generate private key from mnemonic");
  }
  
  const privateKey = bytesToHex(Buffer.from(hdKey.privateKey));
  
  // derive public key from private key
  const keyPair = ec.keyFromPrivate(hdKey.privateKey);
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
    mnemonic,
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


//when user wants to add new accounts, user needs to reinput password to decrypt private key and show accounts
//every time user wants to add account, you need to make sure that password is the same
//when user wants to generate wallet, you need to store 2 things in the browser