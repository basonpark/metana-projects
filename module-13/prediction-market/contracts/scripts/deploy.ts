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
      }
    ];

    // Add the data feeds to the contract
    for (const feed of dataFeeds) {
      const tx = await chainlinkDataFeed.addDataFeed(feed.id, feed.address, feed.name);
      await tx.wait();
      console.log(`Added ${feed.name} data feed`);
    }
  }

  // Create a sample market using the factory (only on local network)
  if (networkName === "hardhat" || networkName === "localhost") {
    console.log("Creating a sample market...");
    
    const currentTime = Math.floor(Date.now() / 1000);
    const oneDayInSeconds = 24 * 60 * 60;
    const oneWeekInSeconds = 7 * oneDayInSeconds;
    
    // Sample market parameters
    const marketParams = {
      question: "Will BTC price be above $50K at the end of the month?",
      expirationTime: currentTime + oneDayInSeconds, // 1 day from now
      settlementTime: currentTime + oneWeekInSeconds, // 1 week from now
      oracle: chainlinkDataFeedAddress,
      dataFeedId: ethers.keccak256(ethers.toUtf8Bytes("BTC/USD")),
      threshold: ethers.parseUnits("50000", 8), // $50K with 8 decimals (Chainlink format)
      category: "Crypto",
      fee: 100 // 1%
    };
    
    // Create the market
    const tx = await predictionMarketFactory.createMarket(
      marketParams.question,
      marketParams.expirationTime,
      marketParams.settlementTime,
      marketParams.oracle,
      marketParams.dataFeedId,
      marketParams.threshold,
      marketParams.category,
      marketParams.fee
    );
    
    await tx.wait();
    console.log("Sample market created");
    
    // Get the market address
    const marketCount = await predictionMarketFactory.getMarketCount();
    const markets = await predictionMarketFactory.getMarkets(0, 1);
    console.log(`Sample market address: ${markets[0]}`);
  }

  console.log("Deployment completed!");
}

// Handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 