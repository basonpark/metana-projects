import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  swcMinify: false, 
  experimental: {  
    forceSwcTransforms: false,
  },  
};

export default nextConfig;
