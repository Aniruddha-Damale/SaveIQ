import React from 'react';
import {
  TrendingUp,
  Target,
  Sparkles,
  BarChart3,
  Bell,
  ArrowRight,
  Shield,
  Layers,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onViewDemo }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight font-display">
                Save<span className="text-emerald-600 dark:text-emerald-400">IQ</span>
              </span>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                FinTech Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onViewDemo}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer px-3 py-2"
            >
              Explore Demo
            </button>
            <button
              onClick={onGetStarted}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-400/10 via-teal-400/10 to-transparent blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Powered by LLaMA 3.3-70B & Google Sheets Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display max-w-3xl mx-auto leading-[1.12]">
              Save smarter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
                Reach your goals faster.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              SaveIQ helps you organize savings goals, monitor your progress, and receive intelligent guidance to stay on track.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto py-3.5 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onViewDemo}
                className="w-full sm:w-auto py-3.5 px-7 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-base rounded-xl transition-all cursor-pointer shadow-sm"
              >
                View Live Dashboard
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Spreadsheets Headaches</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automated Gmail Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Daily Financial Audit Triggers</span>
              </div>
            </div>
          </div>

          {/* Interactive Financial Dashboard Preview */}
          <div className="mt-14 max-w-6xl mx-auto px-6">
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                    Portfolio Progress Overview
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Good morning, Aniruddha · ₹189,000 Saved across 4 Active Goals
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ₹189,000 / ₹380,000
                    </div>
                    <div className="text-[11px] text-slate-400">50% overall completion</div>
                  </div>
                </div>
              </div>

              {/* Sample Mini Stat Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">Total Savings</span>
                  <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                    ₹189,000
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold">+₹35,000 this month</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">Total Target</span>
                  <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                    ₹380,000
                  </p>
                  <span className="text-[10px] text-slate-400">4 total goals</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">Emergency Fund</span>
                  <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                    65% Done
                  </p>
                  <span className="text-[10px] text-slate-400">Target ₹100,000</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500">AI Pace Forecast</span>
                  <p className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                    On Track
                  </p>
                  <span className="text-[10px] text-slate-400">Next deposit in 4 days</span>
                </div>
              </div>

              {/* Sample Goals preview */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span>Emergency Fund</span>
                    <span className="text-xs font-mono text-emerald-600">₹65,000 / ₹100,000</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2.5">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span>Travel Fund (Himachal Expedition)</span>
                    <span className="text-xs font-mono text-emerald-600">₹32,000 / ₹50,000</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2.5">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                Built for disciplined financial execution
              </h2>
              <p className="mt-3 text-slate-500 text-sm sm:text-base">
                Four enterprise-grade pillars engineered to keep your savings trajectory compounding without emotional drift.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-2">
                  Smart Goal Tracking
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  Categorized target allocations with dynamic progress meters, automated monthly pacing calculations, and milestone timelines.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-2">
                  AI Savings Coach
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  Deep contextual analysis powered by Groq LLaMA 3.3-70B. Provides tailored recommendations, actionable tasks, and velocity tactics.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-5">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-2">
                  Financial Analytics
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  Multi-metric trajectory charts, category distributions, monthly contribution velocity, and portfolio status breakdowns.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-2">
                  Automated Reminders
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  Time-driven Google Apps Script triggers running daily 8:00 AM audits to detect overdue deadlines and dispatch Gmail reminders.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-slate-100/50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white font-display">SaveIQ</span>
            <span>·</span>
            <span>Smart Savings. Better Goals. Stronger Future.</span>
          </div>
          <div>
            Built with React, Google Apps Script, Google Sheets, Groq LLaMA 3.3-70B & Gmail.
          </div>
        </div>
      </footer>
    </div>
  );
};
