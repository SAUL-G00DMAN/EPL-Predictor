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
      suppressHydrationWarning
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('epl_theme');var theme=(t==='light')?'light':'dark';document.documentElement.setAttribute('data-theme',theme||'dark');if(theme==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}if(localStorage.getItem('epl_simulations_completed')==='true'){document.documentElement.classList.add('epl-sims-completed');}}catch(e){document.documentElement.setAttribute('data-theme','dark');document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-ambient text-[var(--pl-text-primary)] relative selection:bg-[#E90052] selection:text-white overflow-x-hidden w-full">
        {/* Premier League Lion Ultra-Subtle Watermark Silhouette */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden opacity-[0.07] light:opacity-[0.09] select-none"
        >
          <PremierLeagueLion className="w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] text-white light:text-[#38003C] transform -rotate-12 translate-x-12 translate-y-8" />
        </div>

        <Navbar />
        <ServerWarmupNotice />
        <main className="flex-1 relative z-10 w-full overflow-x-hidden">{children}</main>

        {/* Professional Developer Signature Footer */}
        <footer className="border-t border-[#23293B] light:border-[#E2E8F0] bg-[#0B0E14]/95 light:bg-white/95 backdrop-blur-md py-6 sm:py-8 mt-12 text-slate-400 light:text-slate-600 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
            {/* Left side */}
            <div className="space-y-1.5 flex flex-col items-center md:items-start">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 font-semibold text-slate-200 light:text-[#19001B]">
                <span className="w-2 h-2 rounded-full bg-[#00FF87] light:bg-[#047857]" />
                <span>Premier League 2026-27 Forecast Engine</span>
                <span className="text-slate-600 light:text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 light:text-slate-500 font-mono hidden sm:inline">
                  10,000 Monte Carlo Simulations
                </span>
              </div>
              <p className="text-xs text-slate-500 light:text-slate-500 font-mono">
                FastAPI • XGBoost • Next.js • Dixon-Coles Modeling
              </p>
            </div>

            {/* Center/Right side: Engineered by Mostafa Ahmed with LinkedIn */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm font-medium text-slate-300 light:text-slate-600">
                Engineered by <span className="font-bold text-white light:text-[#19001B]">Mostafa Ahmed</span>
              </span>
              <a
                href="https://www.linkedin.com/in/mostafa-ahmed-ml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 min-h-[40px] rounded-xl bg-slate-800/80 light:bg-white hover:bg-[#0A66C2] light:hover:bg-[#0A66C2] text-slate-200 light:text-slate-700 hover:text-white light:hover:text-white border border-slate-700/80 light:border-slate-300 hover:border-[#0A66C2] light:hover:border-[#0A66C2] transition-all text-xs font-semibold shadow-sm active:scale-95 cursor-pointer"
                title="LinkedIn Profile"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
