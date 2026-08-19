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
            gap: '10px',
            padding: '10px 16px',
            background: 'var(--black)',
            border: '1px solid var(--gray-700)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            color: 'var(--white)',
            fontSize: '12.5px',
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            animation: 'fadeIn 0.15s ease',
          }}
        >
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
      ))}
    </div>
  );
}
