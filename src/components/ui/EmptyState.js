import React from 'react';
import styles from './EmptyState.module.css';
import Button from './Button';

/**
 * Architectural Empty State Card
 */
export default function EmptyState({
  title = 'No Records Found',
  description = 'There are no active entries logged for this view.',
  actionLabel = null,
  onAction = null,
  icon = null,
  className = '',
}) {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
