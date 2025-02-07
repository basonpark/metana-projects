export interface Token {
  address: string;
  symbol: string;
  name: string;
  icon: string;
}

export const tokens: Token[] = [
  {
    address: process.env.NEXT_PUBLIC_USDC_ERC20_ADDRESS!,
    symbol: "USDC",
    name: "USD Coin",
    icon: "/tokens/usdc.png",
  },
  {
    address: process.env.NEXT_PUBLIC_USDT_ERC20_ADDRESS!,
    symbol: "USDT",
    name: "Tether",
    icon: "/tokens/usdt.png",
  },
  {
    address: process.env.NEXT_PUBLIC_DAI_ERC20_ADDRESS!,
    symbol: "DAI",
    name: "Dai",
    icon: "/tokens/dai.png",
  },
  {
    address: process.env.NEXT_PUBLIC_UNISWAP_ERC20_ADDRESS!,
    symbol: "UNI",
    name: "Uniswap",
    icon: "/tokens/uni.png",
  },
]; 