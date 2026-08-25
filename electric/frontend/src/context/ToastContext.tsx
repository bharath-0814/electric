import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (title: string, description?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, description?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className="pointer-events-auto cursor-pointer flex items-start gap-3.5 p-4 rounded-2xl border shadow-2xl transition-all duration-300 transform translate-y-0"
            style={{
              background: '#0A0A0A',
              borderColor:
                t.type === 'success'
                  ? 'rgba(0, 82, 255, 0.4)'
                  : t.type === 'error'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,82,255,0.15)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
              style={{
                background:
                  t.type === 'success' ? '#0052FF' : t.type === 'error' ? '#ef4444' : '#ffffff',
                boxShadow: `0 0 10px ${
                  t.type === 'success' ? '#0052FF' : t.type === 'error' ? '#ef4444' : '#ffffff'
                }`,
              }}
            />
            <div className="flex flex-col gap-0.5">
              <span className="font-display font-semibold text-xs tracking-wider text-white uppercase">
                {t.title}
              </span>
              {t.description && (
                <span className="text-xs text-neutral-400 leading-relaxed">{t.description}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
