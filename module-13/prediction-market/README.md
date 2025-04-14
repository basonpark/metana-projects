# Prediction Market Platform

A decentralized prediction market platform similar to Polymarket where users can bet on outcomes of real-world events. Built with Solidity, TypeScript, and Next.js.

## Features

- Create and participate in prediction markets for various real-world events
- Integration with Chainlink Oracles for reliable data feeds
- Automated market settlement using Chainlink Automation
- Categories for different types of markets (Crypto, Sports, Politics, etc.)
- User-friendly UI for browsing and interacting with markets
- Market creation with customizable parameters
- Fee system for platform sustainability

## Project Structure

- `/contracts` - Smart contracts written in Solidity
- `/frontend` - Next.js application with TypeScript and Tailwind CSS

## Smart Contracts

The platform consists of the following smart contracts:

1. **PredictionMarket** - Core contract for market functionality, bets, and settlements
2. **PredictionMarketFactory** - Factory contract to create and manage prediction markets
3. **ChainlinkDataFeed** - Adapter contract to interact with Chainlink Oracle data feeds

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MetaMask or another Ethereum wallet

### Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd prediction-market
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Install contract dependencies:
   ```
   cd ../contracts
   npm install
   ```

4. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then fill in the required variables in the `.env` file.

### Running Locally

1. Start local blockchain:
   ```
   cd contracts
   npx hardhat node
   ```

2. Deploy contracts to local blockchain (in a new terminal):
   ```
   cd contracts
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. Start frontend (in a new terminal):
   ```
   cd frontend
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Testing

Run smart contract tests:
```
cd contracts
npx hardhat test
```

## Deployment

### Deploy to Testnet

1. Make sure your `.env` file is properly configured with:
   - Private key
   - RPC URL for the target network
   - Etherscan API key (for verification)

2. Deploy:
   ```
   cd contracts
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

3. Verify contracts (optional):
   ```
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

## API Integration

The platform uses the Gamma API from Polymarket for market data. To access this:

1. Register for an API key at Polymarket
2. Add your API key to the `.env` file


## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 