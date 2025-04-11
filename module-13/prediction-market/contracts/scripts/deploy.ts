import { ethers } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("Deploying Prediction Market contracts...");

  // Deploy ChainlinkDataFeed
  const ChainlinkDataFeed = await ethers.getContractFactory("ChainlinkDataFeed");
  const chainlinkDataFeed = await ChainlinkDataFeed.deploy();
  await chainlinkDataFeed.waitForDeployment();
  const chainlinkDataFeedAddress = await chainlinkDataFeed.getAddress();
  console.log(`ChainlinkDataFeed deployed to: ${chainlinkDataFeedAddress}`);

  // Deploy PredictionMarketFactory
  const PredictionMarketFactory = await ethers.getContractFactory("PredictionMarketFactory");
  const predictionMarketFactory = await PredictionMarketFactory.deploy();
  await predictionMarketFactory.waitForDeployment();
  const predictionMarketFactoryAddress = await predictionMarketFactory.getAddress();
  console.log(`PredictionMarketFactory deployed to: ${predictionMarketFactoryAddress}`);

  // If we're on a testnet, add some sample data feeds
  const networkName = (await ethers.provider.getNetwork()).name;
  if (networkName === "sepolia" || networkName === "arbitrumSepolia" || networkName === "baseSepolia") {
    console.log("Adding sample data feeds for testnet...");
    
    // Sample data feeds for Sepolia testnet
    // These are actual Chainlink data feeds on Sepolia
    const dataFeeds = [
      // Price Data Feeds
      {
        name: "BTC/USD",
        address: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
        id: ethers.keccak256(ethers.toUtf8Bytes("BTC/USD"))
      },
      {
        name: "ETH/USD",
        address: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        id: ethers.keccak256(ethers.toUtf8Bytes("ETH/USD"))
      },
      {
        name: "LINK/USD",
        address: "0xc59E3633BAAC79493d908e63626716e204A45EdF",
        id: ethers.keccak256(ethers.toUtf8Bytes("LINK/USD"))
      },
      // Additional Price Feeds
      {
        name: "EUR/USD",
        address: "0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910",
        id: ethers.keccak256(ethers.toUtf8Bytes("EUR/USD"))
      },
      {
        name: "GBP/USD",
        address: "0x91FAB41F5f3bE955963a986366edAcff1aafA017",
        id: ethers.keccak256(ethers.toUtf8Bytes("GBP/USD"))
      },
      {
        name: "JPY/USD",
        address: "0x2e11a59DD8e872d3bE93B6F609303aEe49C86f15",
        id: ethers.keccak256(ethers.toUtf8Bytes("JPY/USD"))
      },
      // Non-Price Data Feeds (weather, elections, sports)
      {
        name: "ELECTION_RESULT",
        address: "0x0000000000000000000000000000000000000000", // This is a placeholder - use real address if available
        id: ethers.keccak256(ethers.toUtf8Bytes("ELECTION_RESULT"))
      },
      {
        name: "WEATHER_NYC",
        address: "0x0000000000000000000000000000000000000000", // This is a placeholder - use real address if available
        id: ethers.keccak256(ethers.toUtf8Bytes("WEATHER_NYC"))
      }
    ];

    // Add the data feeds to the contract
    for (const feed of dataFeeds) {
      // Skip placeholder addresses
      if (feed.address === "0x0000000000000000000000000000000000000000") {
        console.log(`Skipping placeholder feed: ${feed.name}`);
        continue;
      }
      
      const tx = await chainlinkDataFeed.addDataFeed(feed.id, feed.address, feed.name);
      await tx.wait();
      console.log(`Added ${feed.name} data feed with id ${feed.id}`);
    }
  }

  // Create sample markets using the factory (only on local network or testnet)
  if (networkName === "hardhat" || networkName === "localhost" || networkName === "sepolia") {
    console.log("Creating sample markets...");
    
    const currentTime = Math.floor(Date.now() / 1000);
    const oneDayInSeconds = 24 * 60 * 60;
    const oneWeekInSeconds = 7 * oneDayInSeconds;
    const oneMonthInSeconds = 30 * oneDayInSeconds;
    
    // Sample market parameters - varied timeframes and price thresholds
    const marketParams = [
      {
        question: "Will BTC price exceed $75,000 by end of the month?",
        expirationTime: currentTime + oneMonthInSeconds,
        settlementTime: currentTime + oneMonthInSeconds + oneDayInSeconds,
        oracle: chainlinkDataFeedAddress,
        dataFeedId: ethers.keccak256(ethers.toUtf8Bytes("BTC/USD")),
        threshold: ethers.parseUnits("75000", 8), // $75K with 8 decimals
        category: "Crypto",
        fee: 100 // 1%
      },
      {
        question: "Will ETH price exceed $4,000 within two weeks?",
        expirationTime: currentTime + 2 * oneWeekInSeconds,
        settlementTime: currentTime + 2 * oneWeekInSeconds + oneDayInSeconds,
        oracle: chainlinkDataFeedAddress,
        dataFeedId: ethers.keccak256(ethers.toUtf8Bytes("ETH/USD")),
        threshold: ethers.parseUnits("4000", 8), // $4K with 8 decimals
        category: "Crypto",
        fee: 100 // 1%
      },
      {
        question: "Will EUR/USD exchange rate go below 1.05 in the next week?",
        expirationTime: currentTime + oneWeekInSeconds,
        settlementTime: currentTime + oneWeekInSeconds + oneDayInSeconds,
        oracle: chainlinkDataFeedAddress,
        dataFeedId: ethers.keccak256(ethers.toUtf8Bytes("EUR/USD")),
        threshold: ethers.parseUnits("1.05", 8), // 1.05 with 8 decimals
        category: "Finance",
        fee: 75 // 0.75%
      }
    ];

    // Create the markets
    for (const params of marketParams) {
      const tx = await predictionMarketFactory.createMarket(
        params.question,
        params.expirationTime,
        params.settlementTime,
        params.oracle,
        params.dataFeedId,
        params.threshold,
        params.category,
        params.fee
      );
      
      await tx.wait();
      console.log(`Created market with question: ${params.question}`);
    }
    
    // Get all market addresses
    const marketCount = await predictionMarketFactory.getMarketCount();
    console.log(`Total markets created: ${marketCount}`);
    
    if (Number(marketCount) > 0) {
      const markets = await predictionMarketFactory.getMarkets(0, Number(marketCount));
      console.log("Market addresses:");
      markets.forEach((market: string, index: number) => {
        console.log(`Market ${index + 1}: ${market}`);
      });
    }
  }

  // Log contract addresses to be set in environment variables
  console.log("\nDeployment complete! Set your environment variables in .env as follows:");
  console.log(`NEXT_PUBLIC_PREDICTION_MARKET_FACTORY_ADDRESS=${await predictionMarketFactory.getAddress()}`);
  console.log(`NEXT_PUBLIC_CHAINLINK_DATA_FEED_ADDRESS=${chainlinkDataFeedAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 