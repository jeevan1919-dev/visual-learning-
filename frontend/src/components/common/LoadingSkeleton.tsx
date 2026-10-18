import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div>
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div>
    </div>
    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mb-3"></div>
    <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/2 mb-6"></div>
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-20"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-20"></div>
    </div>
  </div>
);

export const WorkspaceSkeleton: React.FC = () => (
  <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 mb-2"></div>
    <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-2/3 mb-8"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
    </div>
  </div>
);
