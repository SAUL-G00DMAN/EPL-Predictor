"use client";

import React from "react";
import Link from "next/link";
import {
  Database,
  Sliders,
  Cpu,
  CheckCircle2,
  GitBranch,
  Layers,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface StepItem {
  number: string;
  shortTitle: string;
  fullTitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  explanationArabic: React.ReactNode;
}

const STEPS: StepItem[] = [
  {
    number: "01",
    shortTitle: "Data Collection",
    fullTitle: "Data Collection & Preprocessing",
    badge: "11 Historical Seasons",
    icon: Database,
    explanationArabic: (
      <>
        سحبنا بيانات 11 موسم تاريخي من موقع{" "}
        <span
          dir="ltr"
          className="inline-block text-[#04F5FF] font-medium font-mono px-1"
        >
          football-data
        </span>{" "}
        مع دمج أرقام الـ{" "}
        <span
          dir="ltr"
          className="inline-block text-[#04F5FF] font-medium font-mono px-1"
        >
          xG
        </span>{" "}
        الحقيقية وتصحيح أسماء الفرق والتواريخ بدقة.
      </>
    ),
  },
  {
    number: "02",
    shortTitle: "Feature Engineering",
    fullTitle: "Feature Engineering & Rating Systems",
    badge: "23 Engineered Features",
    icon: Sliders,
    explanationArabic: (
      <>
        بنينا 23 ميزة رياضية تشمل تصنيف{" "}
        <span
          dir="ltr"
          className="inline-block text-[#04F5FF] font-medium font-mono px-1"
        >
          Elo
        </span>{" "}
        للأندية والمدربين، وفورم الأهداف والنقاط، وأيام الراحة المتبقية قبل كل ماتش.
      </>
    ),
  },
  {
    number: "03",
    shortTitle: "Hybrid Modeling",
    fullTitle: "Hybrid Modeling Architecture",
    badge: "Dixon-Coles + XGBoost",
    icon: Cpu,
    explanationArabic: (
      <>
        دمجنا نموذج{" "}
        <span
          dir="ltr"
          className="inline-block text-[#04F5FF] font-medium font-mono px-1"
        >
          Dixon-Coles
        </span>{" "}
        لحساب احتمالية الأهداف مع موديل{" "}
        <span
          dir="ltr"
          className="inline-block text-[#04F5FF] font-medium font-mono px-1"
        >
          XGBoost
        </span>{" "}
        بتصنيف ثلاثي لتوقع نتيجة اللقاء بدقة متوازنة.
      </>
    ),
  },
  {
    number: "04",
    shortTitle: "Validation Gate",
    fullTitle: "Validation & Accuracy Gate",
    badge: "50.66% Accuracy / 1.013 Loss",
    icon: CheckCircle2,
    explanationArabic: (
      <>
        اعتمدنا معيار تحقق صارم{" "}
        <span
          dir="ltr"
          className="inline-block text-[#00FF85] font-medium font-mono px-1"
        >
          (50.66% Accuracy / 1.013 LogLoss)
        </span>{" "}
        لاختبار الموديل على مواسم سابقة ورفض أي تعديل يسبب تشويش.
      </>
    ),
  },
  {
    number: "05",
    shortTitle: "Monte Carlo Sim",
    fullTitle: "10,000-Run Monte Carlo Simulation",
    badge: "3,300,000 Simulated Fixtures",
    icon: GitBranch,
    explanationArabic: (
      <>
        تشغيل محاكاة{" "}
        <span
          dir="ltr"
          className="inline-block text-[#04F5FF] font-medium font-mono px-1"
        >
          Monte Carlo
        </span>{" "}
        بواقع 10,000 موسم كامل لحساب نسب التتويج، والمربع الذهبي، وفرص الهبوط لكل نادي.
      </>
    ),
  },
  {
    number: "06",
    shortTitle: "End-to-End Build",
    fullTitle: "End-to-End System Build",
    badge: "FastAPI + Next.js 16",
    icon: Layers,
    explanationArabic: (
      <>
        ربط المحرك النهائي بـ{" "}
        <span
          dir="ltr"
          className="inline-block text-[#04F5FF] font-medium font-mono px-1"
        >
          FastAPI Backend
        </span>{" "}
        وتحديث فوري للنتائج مع كل جولة على واجهة{" "}
        <span
          dir="ltr"
          className="inline-block text-[#04F5FF] font-medium font-mono px-1"
        >
          Next.js
        </span>
        .
      </>
    ),
  },
];

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 overflow-hidden">
      {/* Visual Atmosphere: Luminous Ambient Background Glows (25-35% Opacity) */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-[#6b21a8]/35 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-44 right-0 w-[480px] h-[480px] bg-[#04F5FF]/25 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[650px] left-0 w-[520px] h-[520px] bg-[#E90052]/25 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[#00FF85]/20 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 glass-panel border border-white/15 glow-purple space-y-6">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-gradient-to-br from-[#04F5FF]/20 to-[#3D195B]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181828] border border-slate-700/80 text-[#04F5FF] text-xs font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00FF85]" />
              ANALYTICS METHODOLOGY
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700 text-xs font-semibold text-slate-200">
              <span>Dixon-Coles + XGBoost + Monte Carlo</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              How This Works
            </h1>

            {/* Concise Single-Line English Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl font-normal">
              End-to-end Premier League forecasting pipeline powered by XGBoost and 10,000 Monte Carlo simulations.
            </p>
          </div>

          {/* Prominent High-Contrast Arabic Introduction Banner (Visible at First Glance) */}
          <div
            dir="rtl"
            className="text-right text-slate-100 font-medium text-base sm:text-lg bg-gradient-to-r from-purple-900/40 via-slate-800/60 to-emerald-950/40 p-4 sm:p-5 rounded-2xl border border-white/15 shadow-md flex items-start sm:items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00FF85]/15 border border-[#00FF85]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <ShieldCheck className="w-4 h-4 text-[#00FF85]" />
            </div>
            <p className="leading-relaxed">
              إزاي بنحسبها؟ دمجنا 11 موسم تاريخي مع موديل{" "}
              <span
                dir="ltr"
                className="inline-block text-[#04F5FF] font-medium font-mono px-1"
              >
                Dixon-Coles
              </span>{" "}
              وذكاء اصطناعي{" "}
              <span
                dir="ltr"
                className="inline-block text-[#04F5FF] font-medium font-mono px-1"
              >
                XGBoost
              </span>{" "}
              لمحاكاة الدوري 10,000 مرة وتوقع البطل، المربع الذهبي، وشبح الهبوط.
            </p>
          </div>

          {/* Quick Flow Road Map */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-300 block mb-2.5">
              System Architecture
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {STEPS.map((s, idx) => (
                <div
                  key={s.number}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#181828] border border-slate-700/70 hover:border-slate-500/80 hover:bg-[#202034] transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-black text-[#00FF85]">
                      {s.number}
                    </span>
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {s.shortTitle}
                    </span>
                  </div>
                  {idx < 5 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden lg:block shrink-0 ml-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Permanently Open Step Cards (Bright Slate Glassmorphism with Top Emerald Accent) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#04F5FF]" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-200">
              Architecture Breakdown
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-300">
            6 Sequential Stages
          </span>
        </div>

        <div className="space-y-4">
          {STEPS.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="bg-[#181828] backdrop-blur-md rounded-2xl border-t-2 border-t-[#00FF85] border-x border-b border-slate-700/70 hover:bg-[#202034] hover:shadow-[0_0_25px_rgba(0,255,133,0.2)] hover:border-slate-500/80 transition-all duration-300 p-6 sm:p-7 shadow-xl relative overflow-hidden group"
              >
                {/* Background Corner Glow on hover */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#00FF85]/15 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Card Header (English Title + Step Badge + Icon) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#00FF85]/20 border border-[#00FF85]/40 text-[#00FF85] flex items-center justify-center shrink-0 shadow-sm shadow-[#00FF85]/15 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#00FF85]">
                          Step {step.number}
                        </span>
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#04F5FF]/15 border border-[#04F5FF]/40 text-[#04F5FF] shadow-sm">
                          {step.badge}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                        {step.fullTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Stylized Step Watermark */}
                  <span className="hidden sm:block font-mono text-4xl font-black text-white/10 select-none pointer-events-none group-hover:text-white/20 transition-colors">
                    #{step.number}
                  </span>
                </div>

                {/* Bilingual Arabic Explanation (RTL with Zero BiDi Glitches) */}
                <div className="pt-4 relative z-10">
                  <div className="p-4 sm:p-5 rounded-xl bg-[#11111E] border border-slate-800 group-hover:border-slate-700 transition-colors">
                    <p
                      dir="rtl"
                      className="text-right text-slate-100 font-medium text-sm sm:text-base leading-relaxed font-sans"
                    >
                      {step.explanationArabic}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Navigation Quick Links */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 glow-purple">
        <div>
          <h3 className="text-lg font-bold text-white">Explore the Predictions</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Browse our 20-team simulated league table or test head-to-head tactical match predictions.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <Link
            href="/"
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-2"
          >
            Table & Odds
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/predict"
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00FF85] to-[#04F5FF] text-black transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#00FF85]/20"
          >
            Match Predictor
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
