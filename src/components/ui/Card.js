import React from 'react';
import styles from './Card.module.css';

/**
 * Clean Architectural Container Card
 * @param {'default'|'subtle'|'elevated'|'interactive'} variant
 * @param {'none'|'sm'|'md'|'lg'} padding
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  ...props
}) {
  const variantClass = styles[variant] || styles.default;
  const paddingClass = styles[`pad_${padding}`] || styles.pad_md;
  const interactiveClass = onClick ? styles.clickable : '';

  return (
    <div
      className={`${styles.card} ${variantClass} ${paddingClass} ${interactiveClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
