import { hardhat } from 'viem/chains';
import GovernanceTokenABI from '../../artifacts/contracts/GovernanceToken.sol/GovernanceToken.json';
import MyGovernorABI from '../../artifacts/contracts/MyGovernor.sol/MyGovernor.json';

// --- Contract Addresses --- (Ensure these are correct for your deployment)
export const governanceTokenAddress = '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf' as const;
export const governorAddress = '0x36C02dA8a0983159322a80FFE9F24b1acfF8B570' as const;
export const timelockAddress = '0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00' as const; // Assuming this might be needed later

// --- Network Configuration --- 
export const targetChain = hardhat; // Using Viem's predefined chain object
export const targetChainId = targetChain.id; // 31337

// --- Contract ABIs --- 
export const governanceTokenABI = GovernanceTokenABI.abi;
export const myGovernorABI = MyGovernorABI.abi;

// --- Combine for easy access ---
export const contracts = {
  governanceToken: {
    address: governanceTokenAddress,
    abi: governanceTokenABI,
  },
  myGovernor: {
    address: governorAddress,
    abi: myGovernorABI,
  },
  // timelock: { // Add if needed
  //   address: timelockAddress,
  //   abi: TimelockABI.abi, 
  // }
} as const;
