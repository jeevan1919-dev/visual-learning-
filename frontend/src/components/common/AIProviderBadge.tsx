import React, { useEffect, useState } from 'react';
import { Sparkles, Cpu, Info } from 'lucide-react';
import { authService } from '../../services/authService';

export const AIProviderBadge: React.FC = () => {
  const [info, setInfo] = useState<{ active_provider: string; has_api_key: boolean; mode_label: string; instructions: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    authService.getProviderInfo().then(setInfo).catch(() => {
      setInfo({
        active_provider: 'smart_local',
        has_api_key: false,
        mode_label: 'Built-in Educational NLP',
        instructions: 'Add GEMINI_API_KEY in backend/.env for live cloud LLM.',
      });
    });
  }, []);

  if (!info) return null;

  const isLive = info.has_api_key;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
          isLive
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300'
            : 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-300'
        }`}
      >
        {isLive ? <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> : <Cpu className="w-3.5 h-3.5 text-purple-500" />}
        <span>{info.mode_label}</span>
        <Info className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100" />
      </button>

      {showTooltip && (
        <div className="absolute right-0 mt-2 w-72 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 text-xs text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-purple-500'}`} />
            {info.mode_label}
          </p>
          <p className="leading-relaxed mb-2 text-slate-500 dark:text-slate-400">
            {isLive
              ? 'Using live AI to synthesize and reason over your uploaded study materials.'
              : 'Extracting genuine definitions, hierarchical trees, and study questions directly from your PDF using our local educational parser.'}
          </p>
          <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {info.instructions}
          </div>
        </div>
      )}
    </div>
  );
};
