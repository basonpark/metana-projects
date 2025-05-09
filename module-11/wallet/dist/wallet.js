"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWallet = createWallet;
exports.importWallet = importWallet;
exports.signMessage = signMessage;
var js_sha3_1 = require("js-sha3");
var elliptic_1 = require("elliptic");
var utils_1 = require("./utils");
var index_js_1 = require("ethereum-cryptography/bip39/index.js");
var english_js_1 = require("ethereum-cryptography/bip39/wordlists/english.js");
var hdkey_1 = require("ethereum-cryptography/hdkey");
// we use the secp256k1 curve for ethereum
var ec = new elliptic_1.ec('secp256k1');
//creates wallet by deriving public key and addres from private key
function createWallet() {
    // generate mnemonic and derive private key using HD wallet
    var mnemonic = (0, index_js_1.generateMnemonic)(english_js_1.wordlist); // Use English wordlist
    var seed = (0, index_js_1.mnemonicToSeedSync)(mnemonic);
    var hdKey = hdkey_1.HDKey.fromMasterSeed(seed)
        .derive("m/44'/60'/0'/0/0"); // Standard Ethereum path
    if (!hdKey.privateKey) {
        throw new Error("Failed to generate private key from mnemonic");
    }
    var privateKey = (0, utils_1.bytesToHex)(Buffer.from(hdKey.privateKey));
    // derive public key from private key
    var keyPair = ec.keyFromPrivate(hdKey.privateKey);
    var publicKeyBytes = keyPair.getPublic('array');
    var publicKey = (0, utils_1.bytesToHex)(Buffer.from(publicKeyBytes));
    // derive ethereum address from public key (last 20 bytes of keccak256 hash)
    // we remove the first byte of public key (0x04 which indicates uncompressed key)
    var addressBytes = (0, js_sha3_1.keccak256)(Buffer.from(publicKeyBytes.slice(1)));
    // take last 20 bytes for ethereum address
    var address = '0x' + addressBytes.substring(addressBytes.length - 40);
    return {
        privateKey: privateKey,
        publicKey: publicKey,
        address: address,
        mnemonic: mnemonic,
    };
}
/**
 * imports an existing wallet from a private key
 */
function importWallet(privateKey) {
    // remove 0x prefix if present
    var privateKeyHex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    var privateKeyBytes = (0, utils_1.hexToBytes)(privateKeyHex);
    // derive public key
    var keyPair = ec.keyFromPrivate(privateKeyBytes);
    var publicKeyBytes = keyPair.getPublic('array');
    var publicKey = (0, utils_1.bytesToHex)(Buffer.from(publicKeyBytes));
    // derive address
    var addressBytes = (0, js_sha3_1.keccak256)(Buffer.from(publicKeyBytes.slice(1)));
    var address = '0x' + addressBytes.substring(addressBytes.length - 40);
    return {
        privateKey: '0x' + privateKeyHex,
        publicKey: publicKey,
        address: address,
    };
}
/**
 * signs a message with the wallet's private key
 */
function signMessage(wallet, message) {
    // remove 0x prefix if present
    var privateKeyHex = wallet.privateKey.startsWith('0x') ? wallet.privateKey.slice(2) : wallet.privateKey;
    var keyPair = ec.keyFromPrivate(privateKeyHex);
    // hash the message with keccak256
    var messageHash = (0, js_sha3_1.keccak256)(message);
    // sign the hash
    var signature = keyPair.sign(messageHash);
    // convert signature to hex format
    var r = signature.r.toString(16).padStart(64, '0');
    var s = signature.s.toString(16).padStart(64, '0');
    var v = signature.recoveryParam ? '1c' : '1b'; // ethereum v value
    return '0x' + r + s + v;
}
//when user wants to add new accounts, user needs to reinput password to decrypt private key and show accounts
//every time user wants to add account, you need to make sure that password is the same
//when user wants to generate wallet, you need to store 2 things in the browser
