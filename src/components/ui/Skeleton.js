import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Animated Shimmer Loading Placeholder
 */
export default function Skeleton({
  width = '100%',
  height = '18px',
  borderRadius = 'var(--radius-xs)',
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}
