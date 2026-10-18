import React, { useState, useEffect } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Sparkles,
  Key,
  Save,
  Check,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [difficulty, setDifficulty] = useState(user?.preferred_difficulty || 'intermediate');
  const [providerInfo, setProviderInfo] = useState<{ active_provider: string; has_api_key: boolean; mode_label: string; instructions: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name);
      setDifficulty(user.preferred_difficulty || 'intermediate');
    }
    authService.getProviderInfo().then(setProviderInfo).catch(console.error);
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser({
        display_name: displayName.trim(),
        preferred_difficulty: difficulty as any,
        theme_preference: theme,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Account & Learning Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your profile, visual depth preference, and AI integrations.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          Student Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-hidden focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'student@visuallearn.ai'}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 cursor-not-allowed"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Account identity managed via Supabase / Local Auth.</span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Learning Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            Preferred Explanation Difficulty
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Sets the default depth tier when generating step-by-step explanations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'beginner', title: 'Beginner', desc: 'Everyday analogies & simple language' },
              { id: 'intermediate', title: 'Intermediate', desc: 'Standard college-level terminology' },
              { id: 'advanced', title: 'Advanced', desc: 'Axiomatic rigor, edge cases & proofs' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  difficulty === d.id
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-bold block mb-1">{d.title}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Interface Theme
          </h3>
          <div className="grid grid-cols-3 gap-3 max-w-sm">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-950/60 text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                theme === 'system'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>System</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Provider Configuration Monitor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            AI Engine Integration
          </h2>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          VisualLearn AI operates either with cloud models (Google Gemini / OpenAI) or via our zero-setup Built-in Educational NLP Engine.
        </p>

        {providerInfo && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Active Provider:
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {providerInfo.mode_label}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-400">
              {providerInfo.instructions}
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p>• To activate Google Gemini: set <code>GEMINI_API_KEY=your_key</code> in <code>backend/.env</code></p>
              <p>• To activate OpenAI: set <code>OPENAI_API_KEY=your_key</code> in <code>backend/.env</code></p>
            </div>
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Session Management</span>
          <span className="text-[11px] text-slate-500">Sign out of your active browser session.</span>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
