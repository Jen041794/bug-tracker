import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((message, type = 'success', durationMs = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type, id: Date.now() });
    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <ToastViewport toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const TYPE_META = {
  success: { bg: 'bg-success', icon: '✅' },
  error: { bg: 'bg-danger', icon: '❌' },
  info: { bg: 'bg-info', icon: 'ℹ️' },
};

function ToastViewport({ toast, onDismiss }) {
  if (!toast) return null;
  const meta = TYPE_META[toast.type] ?? TYPE_META.info;

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 1080 }}
    >
      <div
        key={toast.id}
        className={`toast show text-white ${meta.bg}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{ minWidth: '260px' }}
      >
        <div className="toast-body d-flex align-items-center">
          <span className="me-2">{meta.icon}</span>
          <div className="flex-grow-1">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white ms-2"
            aria-label="關閉"
            onClick={onDismiss}
          />
        </div>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}
