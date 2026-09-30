import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { Goal, UserProfile, AICoachResponse } from '../types';
import { askAICoach } from '../services/aiService';

interface AICoachViewProps {
  goals: Goal[];
  profile: UserProfile;
}

export const AICoachView: React.FC<AICoachViewProps> = ({ goals, profile }) => {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string>('Analyze My Progress');
  const [customPrompt, setCustomPrompt] = useState('');
  const [response, setResponse] = useState<AICoachResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quickActions = [
    'Analyze My Progress',
    'Create a Savings Plan',
    'How Can I Reach My Goal Faster?',
    'Explain My Financial Progress',
    'Give Me Saving Suggestions'
  ];

  const handleRunCoach = async (action: string, customQuestion?: string) => {
    setActiveAction(action);
    setLoading(true);
    setError(null);

    try {
      const res = await askAICoach({
        action,
        prompt: customQuestion,
        goals,
        profile
      });
      setResponse(res);
    } catch (err: any) {
      setError(err?.message || 'AI Coach is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              SaveIQ Coach
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              <Cpu className="w-3 h-3" />
              <span>Groq LLaMA 3.3-70B</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized mathematical analysis and behavioral guidance for your savings goals.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {goals.length} goals in evaluation context
        </div>
      </div>

      {/* Quick Action Buttons (Section 10) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Select Analysis Objective
        </span>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => handleRunCoach(action)}
              disabled={loading}
              className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeAction === action && !customPrompt
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{action}</span>
            </button>
          ))}
        </div>

        {/* Custom Question Box */}
        <div className="pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customPrompt.trim()) {
                handleRunCoach('Custom Question', customPrompt.trim());
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Or ask a specific financial question (e.g. Can I afford ₹15k monthly for Travel without delaying Emergency Fund?)..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !customPrompt.trim()}
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Analyzing your progress...
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Groq LLaMA 3.3-70B is evaluating deadlines, contribution paces, and milestone balances.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recommendation Cards (Section 10) */}
      {!loading && response && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Model: {response.provider || 'Groq LLaMA 3.3-70B Versatile'}</span>
            <span>Generated: Just now</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: AI Insight */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                  AI Insight
                </h3>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
                {response.aiInsight}
              </p>
            </div>

            {/* Card 2: Recommended Action */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                  Recommended Action
                </h3>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
                {response.recommendedAction}
              </p>
            </div>

            {/* Card 3: Why It Matters */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                  Why It Matters
                </h3>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
                {response.whyItMatters}
              </p>
            </div>

            {/* Card 4: Suggested Next Step */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                  Suggested Next Step
                </h3>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1 font-medium">
                {response.suggestedNextStep}
              </p>
            </div>
          </div>

          {/* Mandatory AI Disclaimer (Section 10) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              {response.disclaimer ||
                'AI-generated information is for educational and planning purposes and should not be considered guaranteed financial advice.'}
            </span>
          </div>
        </div>
      )}

      {/* Initial Prompt State */}
      {!loading && !response && (
        <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Ready to analyze your savings strategy
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Click one of the quick actions above or ask any personalized question to receive real-time financial trajectory feedback.
          </p>
          <button
            onClick={() => handleRunCoach('Analyze My Progress')}
            className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Analyze My Progress Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
