import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Upload,
  User,
  LogOut,
  Search,
  Menu,
  GraduationCap
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AIProviderBadge } from './AIProviderBadge';

interface NavbarProps {
  onOpenUpload?: () => void;
  onToggleSidebar?: () => void;
  title?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUpload,
  onToggleSidebar,
  title,
  showSearch = false,
  onSearch,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
            VisualLearn<span className="text-indigo-600 dark:text-indigo-400 ml-0.5">AI</span>
          </span>
        </Link>

        {title && (
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 truncate max-w-xs">{title}</span>
          </div>
        )}
      </div>

      {showSearch && onSearch && (
        <div className="hidden md:flex items-center max-w-md w-full mx-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents, topics, or concepts..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-indigo-400 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-hidden text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <AIProviderBadge />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>
        )}

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
              {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
              {user?.display_name || 'Student'}
            </span>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setProfileOpen(false)}
            >
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.display_name}</p>
                <p className="text-slate-400 text-[11px] truncate">{user?.email || 'Demo Account'}</p>
              </div>

              <Link
                to="/settings"
                className="flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                Settings & Preferences
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
