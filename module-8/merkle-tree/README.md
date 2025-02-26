# Advanced NFT Project

This project demonstrates advanced NFT techniques using Solidity and Next.js, including:

## Smart Contract Features

1. **Merkle Tree Airdrop**
   - Efficiently verify proof of inclusion in an allowlist
   - Gas cost comparison between mapping and bitmap approaches 

2. **Commit-Reveal Randomness**
   - Two-step process for fair randomization
   - Reveal happens 10 blocks after commit for security
   - Prevents miners from manipulating the outcome

3. **Multicall Support**
   - Transfer multiple NFTs in a single transaction
   - Protection against minting abuse

4. **State Machine**
   - Clear state transitions (Paused → Presale → Public Sale → Sold Out → Revealed)
   - Ensures proper sale progression

5. **Pull Pattern for Withdrawals**
   - Secure distribution of funds to multiple contributors
   - Support for arbitrary number of recipients

## How to Run

### Smart Contracts (Hardhat)

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

### Frontend (Next.js)

```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the dApp.

## Project Structure

- `/contracts`: Solidity smart contracts
- `/client`: Next.js frontend application

## Gas Optimization

The contract implements and compares two different approaches for tracking airdrops:
1. Traditional mapping: `mapping(address => bool)`
2. OpenZeppelin's BitMap: More gas efficient for large datasets

Run the tests to see the gas comparison results.

## License

MIT 