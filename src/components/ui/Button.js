'use client';

import React from 'react';
import styles from './Button.module.css';

/**
 * Standard Catalyst OS Action Button
 * @param {'primary'|'secondary'|'ghost'|'danger'|'outline'} variant
 * @param {'sm'|'md'|'lg'} size
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = styles[variant] || styles.primary;
  const sizeClass = styles[size] || styles.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${styles.button} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
