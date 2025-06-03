import type React from "react";
import "@/app/globals.css";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { cookieToInitialState } from "wagmi";
import { wagmiConfig } from "@/config/wagmi";
import { headers } from "next/headers";
import { Globe as GlobeComponent } from "@/components/ui/globe";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "DAO Governance Platform",
  description:
    "A modern, elegant DAO governance platform for decentralized voting",
  generator: "v0.dev",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerInstance = await headers();
  const initialState = cookieToInitialState(
    wagmiConfig,
    headerInstance.get("cookie")
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable, outfit.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider initialState={initialState}>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            {/* Footer */}
            <footer className="border-t py-12 bg-gradient-to-t from-muted/50 to-background mt-auto">
              <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    DAO
                  </div>
                  <span className="font-heading text-xl font-bold">Governance</span>
                </div>
                <p className="text-center text-sm text-muted-foreground md:text-left">
                  &copy; {new Date().getFullYear()} DAO Governance. All rights reserved.
                </p>
                <div className="flex gap-4">
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Terms
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy
                  </Link>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Docs
                  </Link>
                </div>
              </div>
            </footer>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
