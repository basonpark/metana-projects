import { http, createConfig } from "wagmi";
import { mainnet, sepolia, polygon } from "viem/chains";

export const config = createConfig({
  chains: [mainnet, sepolia, polygon],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
  },
});
