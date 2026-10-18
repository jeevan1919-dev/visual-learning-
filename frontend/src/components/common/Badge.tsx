import React from 'react';
import clsx from 'clsx';
import { ProcessingStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'lavender' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className,
}) => {
  const variantStyles = {
    primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    lavender: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    info: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ProcessingStatus }> = ({ status }) => {
  switch (status) {
    case 'COMPLETED':
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          Ready
        </Badge>
      );
    case 'GENERATING':
      return (
        <Badge variant="lavender">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5 animate-ping" />
          Generating Visuals
        </Badge>
      );
    case 'EXTRACTING':
      return (
        <Badge variant="info">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-1.5 animate-spin" />
          Extracting Text
        </Badge>
      );
    case 'QUEUED':
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          Queued
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
          Failed
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};
