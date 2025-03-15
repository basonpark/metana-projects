import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ethereum Wallet",
  description: "A basic Ethereum wallet implementation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  );
}
