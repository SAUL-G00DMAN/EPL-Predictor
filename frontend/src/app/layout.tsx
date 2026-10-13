import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Navbar } from "@/components/Navbar";
import { ServerWarmupNotice } from "@/components/ServerWarmupNotice";
import { PremierLeagueLion } from "@/components/PremierLeagueLion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://epl-predictor.vercel.app"),
  title: "EPL Predictor | Premier League AI Simulation & Analytics",
  description:
    "Simulate Premier League match outcomes, forecast title odds, and explore team tactical radars powered by Dixon-Coles and XGBoost models.",
  applicationName: "EPL Predictor",
  keywords: [
    "Premier League",
    "EPL",
    "Simulation",
    "AI",
    "Monte Carlo",
    "Dixon-Coles",
    "XGBoost",
    "Football Analytics",
    "Expected Goals",
    "Title Odds",
  ],
  authors: [{ name: "Mostafa Ahmed" }],
  openGraph: {
    title: "EPL Predictor | Premier League AI Simulation",
    description:
      "Premier League match forecasting and season simulation platform powered by 10,000 Monte Carlo runs.",
    url: "https://epl-predictor.vercel.app",
    siteName: "EPL Predictor",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Premier League AI Predictor",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EPL Predictor | Premier League AI Simulation",
    description:
      "Premier League match forecasting and season simulation platform powered by 10,000 Monte Carlo runs.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-ambient text-slate-100 relative selection:bg-[#E90052] selection:text-white overflow-x-hidden w-full">
        {/* Premier League Lion Ultra-Subtle Watermark Silhouette */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden opacity-[0.035] select-none"
        >
          <PremierLeagueLion className="w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] text-white transform -rotate-12 translate-x-12 translate-y-8" />
        </div>

        <Navbar />
        <ServerWarmupNotice />
        <main className="flex-1 relative z-10 w-full overflow-x-hidden">{children}</main>

        {/* Professional Developer Signature Footer */}
        <footer className="border-t border-slate-800 bg-[#0c0c16]/95 backdrop-blur-md py-8 mt-12 text-slate-400 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left side */}
            <div className="space-y-1.5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 font-semibold text-slate-200">
                <span className="w-2 h-2 rounded-full bg-[#00FF85]" />
                <span>Premier League 2026-27 Forecast Engine</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  10,000 Monte Carlo Simulations
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                FastAPI • XGBoost • Next.js • Dixon-Coles Modeling
              </p>
            </div>

            {/* Center/Right side: Engineered by Mostafa Ahmed with LinkedIn & GitHub */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-xs sm:text-sm font-medium text-slate-300">
                Engineered by <span className="font-bold text-white">Mostafa Ahmed</span>
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://github.com/MostafaAhmed200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-500 transition-all text-xs font-semibold shadow-sm"
                  title="GitHub Profile"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/mostafa-ahmed-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-[#0A66C2] text-slate-200 hover:text-white border border-slate-700/80 hover:border-[#0A66C2] transition-all text-xs font-semibold shadow-sm"
                  title="LinkedIn Profile"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
