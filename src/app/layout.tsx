import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Persona Chat — Hitesh & Piyush AI",
  description:
    "Chat with AI personas of Hitesh Choudhary and Piyush Garg. Same voice, same teaching style, available 24/7.",
  keywords: [
    "Hitesh Choudhary",
    "Piyush Garg",
    "AI persona",
    "chai aur code",
    "learn programming"
  ],
  openGraph: {
    title: "Persona Chat — Hitesh & Piyush AI",
    description: "Chat with AI personas of Hitesh Choudhary and Piyush Garg.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-neutral-900 text-neutral-200 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
