import React from 'react';
import { useStore } from '../../store/useStore';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 end-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-[#6C5CE7] shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-500/30',
          info: 'border-[#6C5CE7]/30',
          warning: 'border-amber-500/30',
          error: 'border-rose-500/30',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border ${borders[toast.type]} shadow-xl text-slate-800 dark:text-slate-100 text-sm animate-in slide-in-from-bottom-5 duration-200`}
          >
            {icons[toast.type]}
            <p className="flex-1 font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
