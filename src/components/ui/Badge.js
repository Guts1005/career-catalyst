import React from 'react';
import styles from './Badge.module.css';

/**
 * Architectural Proof & Status Badge
 * @param {'green'|'amber'|'purple'|'blue'|'red'|'gray'} variant
 * @param {'solid'|'subtle'|'outline'} styleType
 */
export default function Badge({
  children,
  variant = 'gray',
  styleType = 'subtle',
  className = '',
  icon = null,
  ...props
}) {
  const variantClass = styles[variant] || styles.gray;
  const styleClass = styles[styleType] || styles.subtle;

  return (
    <span className={`${styles.badge} ${variantClass} ${styleClass} ${className}`} {...props}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
