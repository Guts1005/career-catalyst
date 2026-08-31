'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

let toastDispatch = null;
let readinessFeedbackDispatch = null;

/**
 * Dispatches a standard notification toast.
 */
export function showToast(message, type = 'success') {
  if (toastDispatch) {
    toastDispatch({ message, type, id: `toast_${Date.now()}_${Math.random()}` });
  }
}

/**
 * Dispatches a structured readiness intelligence feedback toast.
 */
export function showReadinessFeedback(feedback) {
  if (readinessFeedbackDispatch) {
    readinessFeedbackDispatch({ ...feedback, isReadinessFeedback: true, id: `feedback_${Date.now()}` });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastDispatch = (toast) => {
      setToasts((prev) => [...prev.slice(-2), toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    readinessFeedbackDispatch = (feedbackToast) => {
      setToasts((prev) => [...prev.slice(-1), feedbackToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== feedbackToast.id));
      }, 6500);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setToasts([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      toastDispatch = null;
      readinessFeedbackDispatch = null;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleDismiss = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        width: 'calc(100% - 48px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => {
        if (t.isReadinessFeedback) {
          return (
            <div
              key={t.id}
              style={{
                pointerEvents: 'auto',
                background: 'var(--bg-surface, #121215)',
                border: '1px solid var(--border-strong, #3f3f46)',
                borderLeft: '4px solid var(--green, #22c55e)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
                borderRadius: '6px',
                padding: '14px 16px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ✓ {t.actionType.replace(/_/g, ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => handleDismiss(t.id)}
                  aria-label="Dismiss readiness feedback notification"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {t.entityName}
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                {t.reason}
              </p>

              {/* Score Impact Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px 10px', background: 'var(--bg-subtle, #1a1a1e)', borderRadius: '4px', border: '1px solid var(--border)', marginBottom: t.nextBestActionChanged ? '10px' : '0' }}>
                <div>
                  <div style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {t.affectedDimension}
                  </div>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {t.previousSubscore}% → {t.newSubscore}%{' '}
                    <span style={{ color: t.subscoreDelta >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      ({t.subscoreDelta >= 0 ? `+${t.subscoreDelta}` : t.subscoreDelta}%)
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Overall Readiness
                  </div>
                  <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {t.previousOverallScore}% → {t.newOverallScore}%{' '}
                    <span style={{ color: t.overallDelta >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      ({t.overallDelta >= 0 ? `+${t.overallDelta}` : t.overallDelta}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Best Action Transition */}
              {t.nextBestActionChanged && t.newNextActionTitle && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    🎯 NEXT ACTION: <strong style={{ color: 'var(--text-primary)' }}>{t.newNextActionTitle.slice(0, 20)}...</strong>
                  </span>
                  {t.newNextActionUrl && (
                    <Link
                      href={t.newNextActionUrl}
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDismiss(t.id)}
                      style={{ fontSize: '10.5px', padding: '3px 8px' }}
                    >
                      VIEW NEXT ACTION →
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '10px 16px',
              background: 'var(--bg-surface, #121215)',
              border: '1px solid var(--border-strong, #3f3f46)',
              boxShadow: 'var(--shadow-lg, 0 8px 30px rgba(0, 0, 0, 0.3))',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              animation: 'fadeIn 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: t.type === 'error' ? 'var(--red)' : t.type === 'info' ? 'var(--blue)' : 'var(--green)',
                }}
              />
              <span>{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => handleDismiss(t.id)}
              aria-label="Dismiss toast"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
