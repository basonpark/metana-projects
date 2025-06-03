export interface Token {
  name: string;
  symbol: string;
  address: string;
  icon: string;
}

export const tokens: Token[] = [
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    icon: "/usdc.png"
  },
  {
    name: "DAI Stablecoin",
    symbol: "DAI",
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    icon: "/dai.png"
  },
  {
    name: "Uniswap",
    symbol: "UNI",
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    icon: "/uniswap.png"
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    icon: "/tether.png"
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    icon: "/chanlink.png"
  },
  {
    name: "Aave",
    symbol: "AAVE",
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    icon: "/aave.png"
  },
  {
    name: "Decentraland",
    symbol: "MANA",
    address: "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942",
    icon: "/decentraland.png"
  }
]; 