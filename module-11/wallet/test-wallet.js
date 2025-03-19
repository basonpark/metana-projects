// Simple test script
const { createWallet } = require('./dist/wallet');

try {
  const wallet = createWallet();
  console.log('Wallet created successfully:');
  console.log('- Address:', wallet.address);
  console.log('- Private Key:', wallet.privateKey.substring(0, 10) + '...');
  console.log('- Mnemonic:', wallet.mnemonic);
} catch (error) {
  console.error('Error creating wallet:', error);
} 