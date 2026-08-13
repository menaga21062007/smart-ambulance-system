import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="bg-white dark:bg-navy-800 border border-dashed border-slate-300 dark:border-navy-700 rounded-2xl p-8 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-hospital-50 dark:bg-navy-700 text-hospital-600 dark:text-hospital-100 flex items-center justify-center mx-auto">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-extrabold text-navy-800 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">{description}</p>
      </div>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
};
