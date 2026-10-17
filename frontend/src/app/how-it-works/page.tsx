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
          className="inline-block text-white light:text-slate-900 font-semibold px-1"
        >
          football-data
        </span>{" "}
        مع دمج أرقام الـ{" "}
        <span
          dir="ltr"
          className="inline-block text-white light:text-slate-900 font-semibold px-1"
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
          className="inline-block text-white light:text-slate-900 font-semibold px-1"
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
          className="inline-block text-white light:text-slate-900 font-semibold px-1"
        >
          Dixon-Coles
        </span>{" "}
        لحساب احتمالية الأهداف مع موديل{" "}
        <span
          dir="ltr"
          className="inline-block text-white light:text-slate-900 font-semibold px-1"
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
          className="inline-block text-white light:text-slate-900 font-semibold font-mono px-1"
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
          className="inline-block text-white light:text-slate-900 font-semibold px-1"
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
          className="inline-block text-white light:text-slate-900 font-semibold px-1"
        >
          FastAPI Backend
        </span>{" "}
        وتحديث فوري للنتائج مع كل جولة على واجهة{" "}
        <span
          dir="ltr"
          className="inline-block text-white light:text-slate-900 font-semibold px-1"
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
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-xl p-6 sm:p-10 bg-[#111317] light:bg-white light:border-slate-200 light:shadow-sm border border-white/[0.07] space-y-6">
        <div className="relative z-10 space-y-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white light:text-[#19001B] tracking-tight">
              How This Works
            </h1>
          </div>

          {/* Prominent High-Contrast Arabic Introduction Banner (Visible at First Glance) */}
          <div
            dir="rtl"
            className="text-right text-slate-100 light:text-slate-800 font-medium text-base sm:text-lg bg-[#16181D] light:bg-slate-50 p-4 sm:p-5 rounded-xl border border-white/[0.07] light:border-slate-200 border-r-[3px] border-r-[#00FF85] light:border-r-[#00A855] shadow-md light:shadow-xs flex items-start sm:items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00FF85]/15 light:bg-[#00A855]/15 border border-[#00FF85]/30 light:border-[#00A855]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <ShieldCheck className="w-4 h-4 text-[#00FF85] light:text-[#00A855]" />
            </div>
            <p className="leading-relaxed">
              إزاي بنحسبها؟ دمجنا 11 موسم تاريخي مع موديل{" "}
              <span
                dir="ltr"
                className="inline-block text-white light:text-slate-900 font-semibold px-1"
              >
                Dixon-Coles
              </span>{" "}
              وذكاء اصطناعي{" "}
              <span
                dir="ltr"
                className="inline-block text-white light:text-slate-900 font-semibold px-1"
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
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#16181D] light:bg-white border border-white/[0.07] light:border-slate-200 hover:border-white/20 light:hover:border-slate-300 hover:bg-[#1C2027] light:hover:bg-slate-50 light:shadow-xs transition-all"
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

      {/* Permanently Open Step Cards */}
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
                className="bg-[#111317] light:bg-white rounded-xl border border-white/[0.07] border-t-2 border-t-[#00FF85] light:border-t-[#00A855] light:border-slate-200 hover:bg-[#16181D] light:hover:bg-slate-50/80 light:shadow-sm hover:border-white/20 transition-all duration-300 p-6 sm:p-7 shadow-xl relative overflow-hidden group"
              >
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
                  <div className="p-4 sm:p-5 rounded-xl bg-[#16181D] light:bg-slate-50 border border-white/[0.07] light:border-slate-200 group-hover:border-white/15 light:group-hover:border-slate-300 transition-colors">
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
      <section className="bg-[#111317] light:bg-white light:border-slate-200 light:shadow-sm p-6 sm:p-8 rounded-xl border border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white light:text-[#19001B]">Explore the Predictions</h3>
          <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 mt-1">
            Browse our 20-team simulated league table or test head-to-head tactical match predictions.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <Link
            href="/"
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-[#181A20] hover:bg-[#20232B] light:bg-slate-100 light:hover:bg-slate-200 border border-white/10 light:border-slate-200 text-white light:text-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            Table & Odds
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/predict"
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-[#181A20] hover:bg-[#20232B] light:bg-[#38003C] light:hover:bg-[#260029] text-white border border-white/10 light:border-[#38003C] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Match Predictor
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
