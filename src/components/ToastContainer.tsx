'use client';

import React from 'react';
import { useToastStore } from '../store/toastStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 left-4 md:left-auto md:bottom-4 md:right-4 z-[100] flex flex-col space-y-2 max-w-sm">
      {toasts.map((t) => {
        const isError = t.type === 'error';
        const isSuccess = t.type === 'success';

        return (
          <div
            key={t.id}
            className={`flex items-center justify-between p-3 rounded-2xl shadow-lg text-xs font-semibold text-white transition-all ${
              isError ? 'bg-red-600' : isSuccess ? 'bg-green-600' : 'bg-blue-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isError ? (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              ) : isSuccess ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <Info className="h-4 w-4 flex-shrink-0" />
              )}
              <span>{t.message}</span>
            </div>
            <button onClick={() => removeToast(t.id)} className="ml-2 text-white/80 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
