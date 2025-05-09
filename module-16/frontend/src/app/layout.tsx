import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { cn } from "@/lib/utils";
import { Web3Providers } from "@/lib/web3/providers";
import { Footer } from "@/components/layout/Footer";
import "prismjs/themes/prism.css";

import "prismjs/plugins/line-numbers/prism-line-numbers.css";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const fontSans = FontSans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumina Finance - Decentralized Lending",
  description: "Deposit collateral, borrow LuminaCoin, and earn yield.",
};

const navItems = [
  { name: "Home", url: "/", iconName: "Home" },
  { name: "Vaults", url: "/vaults", iconName: "Layers" },
  { name: "How It Works", url: "/how-it-works", iconName: "Info" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.className} bg-background text-foreground`}>
        <Web3Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="absolute top-6 right-10 z-50">
              <ConnectButton />
            </div>
            <NavBar items={navItems} className="pt-4 sm:pt-6" />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Web3Providers>
      </body>
    </html>
  );
}
