import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const _inter = Inter({ subsets: ["latin"] });
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Futures Terminal — Binance",
  description:
    "Rule-based AI trading signal engine for Binance Futures. Supertrend, EMA 200, ADX, Volume-confirmed signals.",
};

export const viewport: Viewport = {
  themeColor: "#0a0b0e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[var(--color-background)]">
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}
