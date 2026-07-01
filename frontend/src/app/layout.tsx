import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollButtons from "@/components/ScrollButtons";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sellmynotes.co.za"),
  title: {
    default: "sellmynotes | Buy & Sell Study Notes",
    template: "%s | sellmynotes"
  },
  description: "The premier South African marketplace for students to buy and sell high-quality study notes, summaries, and exam prep materials.",
  keywords: ["study notes", "sell notes", "buy notes", "university notes", "exam prep", "South Africa", "student marketplace"],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://sellmynotes.co.za",
    title: "sellmynotes | Buy & Sell Study Notes",
    description: "The premier South African marketplace for students to buy and sell high-quality study notes, summaries, and exam prep materials.",
    siteName: "sellmynotes"
  },
  twitter: {
    card: "summary_large_image",
    title: "sellmynotes | Buy & Sell Study Notes",
    description: "The premier South African marketplace for students to buy and sell high-quality study notes, summaries, and exam prep materials."
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE_HERE",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <ScrollButtons />
      </body>
    </html>
  );
}
