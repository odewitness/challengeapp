import { useCallback, useRef, useState } from 'react'
import { ToastContext } from './toastContext'

// Petit bandeau éphémère en bas d'écran, avec une action facultative
// (ex. « Annuler »). Un seul toast à la fois.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  const showToast = useCallback(
    (message, options = {}) => {
      clearTimeout(timerRef.current)
      setToast({ message, ...options })
      timerRef.current = setTimeout(() => setToast(null), options.duration ?? 4000)
    },
    []
  )

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          {toast.actionLabel && (
            <button
              className="toast-action"
              onClick={() => {
                toast.onAction?.()
                dismiss()
              }}
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}
      <style>{`
        .toast {
          position: fixed;
          left: 50%;
          bottom: calc(84px + env(safe-area-inset-bottom));
          transform: translateX(-50%);
          z-index: 40;
          display: flex;
          align-items: center;
          gap: 14px;
          max-width: min(420px, calc(100vw - 32px));
          padding: 12px 16px;
          border-radius: 999px;
          background: var(--color-ink);
          color: var(--color-bg-raised);
          font-size: 13px;
          font-weight: 500;
          box-shadow: var(--shadow-card);
        }
        .toast-action {
          border: none;
          background: none;
          color: var(--color-accent-gold);
          font: inherit;
          font-weight: 700;
          padding: 0;
          flex-shrink: 0;
        }
      `}</style>
    </ToastContext.Provider>
  )
}
