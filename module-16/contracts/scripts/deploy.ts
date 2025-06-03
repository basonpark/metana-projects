import hre from "hardhat";
import { formatEther, parseEther } from "viem"; // Using Viem helpers

async function main() {
  console.log("Deploying contracts...");

  const publicClient = await hre.viem.getPublicClient(); // Get public client

  // --- Deployment Parameters ---
  const ethUsdPriceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Sepolia ETH/USD
  const initialOwner = (await hre.viem.getWalletClients())[0].account.address; // Use first account from hardhat node/config
  const initialRewardRate = parseEther("0.00001"); // Example: 0.00001 ETH per second per staked ETH (adjust as needed!)
  const rewardTokenAddress = "0x0000000000000000000000000000000000000000"; // Address(0) for ETH rewards

  // --- Deploy LuminaCoin ---
  console.log(`Deploying LuminaCoin with owner: ${initialOwner}...`);
  const luminaCoin = await hre.viem.deployContract("LuminaCoin", [initialOwner]);
  console.log(`LuminaCoin deployed to: ${luminaCoin.address}`);

  // --- Deploy CollateralManager ---
  console.log(`Deploying CollateralManager...`);
  console.log(`  LuminaCoin: ${luminaCoin.address}`);
  console.log(`  Price Feed: ${ethUsdPriceFeedAddress}`);
  console.log(`  Owner: ${initialOwner}`);
  const collateralManager = await hre.viem.deployContract("CollateralManager", [
    initialOwner,
    ethUsdPriceFeedAddress,
    luminaCoin.address,
  ]);
  console.log(`CollateralManager deployed to: ${collateralManager.address}`);

  // --- Deploy StakingPool ---
   console.log(`Deploying StakingPool...`);
   console.log(`  Reward Rate (wei/sec): ${initialRewardRate.toString()}`);
   console.log(`  Reward Token: ${rewardTokenAddress === "0x0000000000000000000000000000000000000000" ? "ETH" : rewardTokenAddress}`);
   console.log(`  Owner: ${initialOwner}`);
   const stakingPool = await hre.viem.deployContract("StakingPool", [
       initialOwner,
       initialRewardRate,
       rewardTokenAddress,
   ]);
   console.log(`StakingPool deployed to: ${stakingPool.address}`);


  // --- Post-Deployment Configuration ---
  console.log("Configuring CollateralManager as LuminaCoin minter...");
  const hash = await luminaCoin.write.setCollateralManager([collateralManager.address]);
  await publicClient.waitForTransactionReceipt({ hash }); // Use public client
  console.log("CollateralManager set successfully in LuminaCoin.");

  // --- Optional: Fund Staking Pool with ETH Rewards ---
  if (rewardTokenAddress === "0x0000000000000000000000000000000000000000") {
      const rewardFundAmount = parseEther("1"); // Send 1 ETH for initial rewards
      console.log(`Sending ${formatEther(rewardFundAmount)} ETH to StakingPool for rewards...`);
      const deployerClient = (await hre.viem.getWalletClients())[0]; // Get deployer wallet client
      const fundHash = await deployerClient.sendTransaction({
        to: stakingPool.address,
        value: rewardFundAmount,
      });
      await publicClient.waitForTransactionReceipt({ hash: fundHash }); // Use public client
      console.log("StakingPool funded.");
  }

  console.log("\n--- Deployment Summary ---");
  console.log(`LuminaCoin (LMC): ${luminaCoin.address}`);
  console.log(`CollateralManager: ${collateralManager.address}`);
  console.log(`StakingPool: ${stakingPool.address}`);
  console.log(`ETH/USD Price Feed (Sepolia): ${ethUsdPriceFeedAddress}`);
  console.log(`Initial Owner: ${initialOwner}`);
  console.log("--------------------------\n");

  // Optional: Add verification logic here if deploying to a testnet/mainnet
  // Example for Sepolia:
  // if (hre.network.name === "sepolia") {
  //   console.log("Waiting for block confirmations before verification...");
  //   await luminaCoin.deploymentTransaction()?.wait(6); // Wait for 6 blocks
  //   await verify(luminaCoin.address, [initialOwner]);
  //   // ... verify other contracts ...
  // }
}

// Helper function for verification (optional)
async function verify(contractAddress: string, args: any[]) {
  console.log(`Verifying contract ${contractAddress}...`);
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log("Contract verified successfully!");
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.error("Verification failed:", e);
    }
  }
}


main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});