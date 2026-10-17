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
          className="inline-block text-[#38BDF8] light:text-[#0284C7] font-medium font-mono px-1"
        >
          football-data
        </span>{" "}
        مع دمج أرقام الـ{" "}
        <span
          dir="ltr"
          className="inline-block text-[#38BDF8] light:text-[#0284C7] font-medium font-mono px-1"
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
          className="inline-block text-[#38BDF8] light:text-[#0284C7] font-medium font-mono px-1"
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
          className="inline-block text-[#38BDF8] light:text-[#0284C7] font-medium font-mono px-1"
        >
          Dixon-Coles
        </span>{" "}
        لحساب احتمالية الأهداف مع موديل{" "}
        <span
          dir="ltr"
          className="inline-block text-[#38BDF8] light:text-[#0284C7] font-medium font-mono px-1"
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
          className="inline-block text-[#00FF85] light:text-[#00A855] font-medium font-mono px-1"
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
    badge: "3,200,000 Simulated Fixtures",
    icon: GitBranch,
    explanationArabic: (
      <>
        تشغيل محاكاة{" "}
        <span
          dir="ltr"
          className="inline-block text-[#38BDF8] light:text-[#0284C7] font-medium font-mono px-1"
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
          className="inline-block text-[#38BDF8] light:text-[#0284C7] font-medium font-mono px-1"
        >
          FastAPI Backend
        </span>{" "}
        وتحديث فوري للنتائج مع كل جولة على واجهة{" "}
        <span
          dir="ltr"
          className="inline-block text-[#38BDF8] light:text-[#0284C7] font-medium font-mono px-1"
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
      <div className="absolute top-44 right-0 w-[480px] h-[480px] bg-[#38BDF8]/20 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[650px] left-0 w-[520px] h-[520px] bg-[#E90052]/25 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[#00FF85]/20 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 glass-panel light:bg-white light:border-slate-200 light:shadow-sm border border-white/15 glow-purple space-y-6">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-gradient-to-br from-[#38BDF8]/20 to-[#3D195B]/40 light:from-[#38003C]/10 light:to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181828] light:bg-sky-50 border border-slate-700/80 light:border-sky-300 text-[#38BDF8] light:text-[#0284C7] text-xs font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00FF85] light:bg-[#00A855]" />
              ANALYTICS METHODOLOGY
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 light:bg-slate-100 border border-slate-700 light:border-slate-200 text-xs font-semibold text-slate-200 light:text-slate-700">
              <span>Dixon-Coles + XGBoost + Monte Carlo</span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white light:text-[#19001B] tracking-tight">
              How This Works
            </h1>
          </div>

          {/* Prominent High-Contrast Arabic Introduction Banner (Visible at First Glance) */}
          <div
            dir="rtl"
            className="text-right text-slate-100 light:text-slate-800 font-medium text-base sm:text-lg bg-gradient-to-r from-purple-900/40 via-slate-800/60 to-emerald-950/40 light:from-purple-50 light:via-slate-50 light:to-emerald-50 p-4 sm:p-5 rounded-2xl border border-white/15 light:border-slate-200 shadow-md light:shadow-xs flex items-start sm:items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00FF85]/15 light:bg-[#00A855]/15 border border-[#00FF85]/30 light:border-[#00A855]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <ShieldCheck className="w-4 h-4 text-[#00FF85] light:text-[#00A855]" />
            </div>
            <p className="leading-relaxed">
              إزاي بنحسبها؟ دمجنا 11 موسم تاريخي مع موديل{" "}
              <span
                dir="ltr"
                className="inline-block text-[#38BDF8] light:text-[#0284C7] font-semibold font-mono px-1"
              >
                Dixon-Coles
              </span>{" "}
              وذكاء اصطناعي{" "}
              <span
                dir="ltr"
                className="inline-block text-[#38BDF8] light:text-[#0284C7] font-semibold font-mono px-1"
              >
                XGBoost
              </span>{" "}
              لمحاكاة الدوري 10,000 مرة وتوقع البطل، المربع الذهبي، وشبح الهبوط.
            </p>
          </div>

          {/* Quick Flow Road Map */}
          <div className="pt-2 border-t border-white/10 light:border-slate-200">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-300 light:text-slate-600 block mb-2.5">
              System Architecture
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {STEPS.map((s, idx) => (
                <div
                  key={s.number}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#181828] light:bg-white border border-slate-700/70 light:border-slate-200 hover:border-slate-500/80 light:hover:border-slate-300 hover:bg-[#202034] light:hover:bg-slate-50 light:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-black text-[#00FF85] light:text-[#00A855]">
                      {s.number}
                    </span>
                    <span className="text-xs font-bold text-slate-100 light:text-slate-800 truncate">
                      {s.shortTitle}
                    </span>
                  </div>
                  {idx < 5 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 light:text-slate-500 hidden lg:block shrink-0 ml-1" />
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
            <ShieldCheck className="w-4 h-4 text-[#38BDF8] light:text-[#0284C7]" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-200 light:text-slate-800">
              Architecture Breakdown
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-300 light:text-slate-600">
            6 Sequential Stages
          </span>
        </div>

        <div className="space-y-4">
          {STEPS.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="bg-[#181828] light:bg-white backdrop-blur-md rounded-2xl border-t-2 border-t-[#00FF85] light:border-t-[#00A855] border-x border-b border-slate-700/70 light:border-slate-200 hover:bg-[#202034] light:hover:bg-slate-50/80 light:shadow-sm hover:shadow-[0_0_25px_rgba(0,255,133,0.2)] hover:border-slate-500/80 transition-all duration-300 p-6 sm:p-7 shadow-xl relative overflow-hidden group"
              >
                {/* Background Corner Glow on hover */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#00FF85]/15 light:bg-[#00A855]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Card Header (English Title + Step Badge + Icon) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 light:border-slate-200 relative z-10">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#00FF85]/20 light:bg-emerald-50 border border-[#00FF85]/40 light:border-emerald-300 text-[#00FF85] light:text-[#00A855] flex items-center justify-center shrink-0 shadow-sm shadow-[#00FF85]/15 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#00FF85] light:text-[#00A855]">
                          Step {step.number}
                        </span>
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#38BDF8]/15 light:bg-sky-50 border border-[#38BDF8]/40 light:border-sky-300 text-[#38BDF8] light:text-[#0284C7] shadow-sm">
                          {step.badge}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white light:text-[#19001B] tracking-tight mt-0.5">
                        {step.fullTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Stylized Step Watermark */}
                  <span className="hidden sm:block font-mono text-4xl font-black text-white/10 light:text-slate-200 select-none pointer-events-none group-hover:text-white/20 transition-colors">
                    #{step.number}
                  </span>
                </div>

                {/* Bilingual Arabic Explanation (RTL with Zero BiDi Glitches) */}
                <div className="pt-4 relative z-10">
                  <div className="p-4 sm:p-5 rounded-xl bg-[#11111E] light:bg-slate-50 border border-slate-800 light:border-slate-200 group-hover:border-slate-700 light:group-hover:border-slate-300 transition-colors">
                    <p
                      dir="rtl"
                      className="text-right text-slate-100 light:text-slate-700 font-medium text-sm sm:text-base leading-relaxed font-sans"
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
      <section className="glass-panel light:bg-white light:border-slate-200 light:shadow-sm p-6 sm:p-8 rounded-3xl border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 glow-purple">
        <div>
          <h3 className="text-lg font-bold text-white light:text-[#19001B]">Explore the Predictions</h3>
          <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 mt-1">
            Browse our 20-team simulated league table or test head-to-head tactical match predictions.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <Link
            href="/"
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 light:bg-slate-100 hover:bg-white/20 light:hover:bg-slate-200 border border-transparent light:border-slate-200 text-white light:text-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            Table & Odds
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/predict"
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00FF85] to-[#38BDF8] text-black transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#00FF85]/20"
          >
            Match Predictor
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
