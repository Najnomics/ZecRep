import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zecrep.xyz"),
  title: "ZecRep • Zcash Reputation Oracle",
  description:
    "Prove shielded Zcash activity, mint a verifiable reputation NFT, and unlock premium treatment across Ethereum DeFi — powered by fully homomorphic encryption.",
  keywords: [
    "Zcash",
    "FHE",
    "Fhenix",
    "Reputation",
    "Private DeFi",
    "ZecRep",
  ],
  openGraph: {
    title: "ZecRep • Privacy-Preserving Reputation",
    description:
      "Bridge shielded Zcash history into Ethereum without revealing raw amounts. Tiered NFTs, encrypted proofs, and ready-made integrations.",
    url: "https://zecrep.xyz",
    siteName: "ZecRep",
    images: [
      {
        url: "/og-card.svg",
        width: 1200,
        height: 630,
        alt: "ZecRep reputation overview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ZecRepOracle",
    creator: "@ZecRepOracle",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
