'use client';

import { useState, useEffect } from 'react';
import { IconCheck } from './Icons';

let toastDispatch = null;

export function showToast(message, type = 'success') {
  if (toastDispatch) {
    toastDispatch({ message, type, id: Date.now() });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastDispatch = (toast) => {
      setToasts((prev) => [...prev.slice(-3), toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };

    return () => {
      toastDispatch = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'rgba(18, 18, 22, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fafafa',
            fontSize: '12.5px',
            fontWeight: 500,
            animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: t.type === 'success' ? 'var(--success-subtle)' : 'var(--accent-subtle)',
              color: t.type === 'success' ? 'var(--success)' : 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconCheck size={11} />
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
