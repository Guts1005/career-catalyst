'use client';

import { showToast } from './Toast';
import { IconCheck } from './Icons';

export default function ShareProfileButton({ username }) {
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Public profile link copied to clipboard!', 'success');
    }
  };

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={handleCopyLink}
      style={{
        fontSize: '12.5px',
        padding: '7px 14px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
      Share Profile
    </button>
  );
}
