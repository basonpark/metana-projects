"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToBytes = hexToBytes;
exports.bytesToHex = bytesToHex;
exports.numberToHex = numberToHex;
exports.weiToEther = weiToEther;
exports.etherToWei = etherToWei;
exports.shortenAddress = shortenAddress;
/**
 * converts hex string to byte array
 */
function hexToBytes(hex) {
    // remove 0x prefix if present
    hex = hex.startsWith('0x') ? hex.slice(2) : hex;
    // ensure even length
    if (hex.length % 2 !== 0) {
        hex = '0' + hex;
    }
    var bytes = new Uint8Array(hex.length / 2);
    for (var i = 0; i < bytes.length; i++) {
        var byte = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        bytes[i] = byte;
    }
    return bytes;
}
/**
 * converts byte array to hex string
 */
function bytesToHex(bytes) {
    return Array.from(bytes)
        .map(function (byte) { return byte.toString(16).padStart(2, '0'); })
        .join('');
}
/**
 * converts number to hex string
 */
function numberToHex(num) {
    return '0x' + num.toString(16);
}
/**
 * formats wei to ether
 */
function weiToEther(wei) {
    // remove 0x prefix if present
    var weiValue = wei.startsWith('0x') ? BigInt(wei) : BigInt('0x' + wei);
    // 1 ether = 10^18 wei
    var etherValue = Number(weiValue) / 1e18;
    return etherValue.toFixed(6);
}
/**
 * formats ether to wei
 */
function etherToWei(ether) {
    // convert ether to wei (1 ether = 10^18 wei)
    var etherValue = parseFloat(ether);
    var weiValue = Math.floor(etherValue * 1e18);
    return '0x' + weiValue.toString(16);
}
/**
 * shortens address for display
 */
function shortenAddress(address) {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}
