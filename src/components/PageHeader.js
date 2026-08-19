'use client';

export default function PageHeader({ chapter, title, subtitle, actions }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '32px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '24px',
        gap: '20px',
        flexWrap: 'wrap',
      }}
    >
      <div>
        {chapter && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: '8px',
            }}
          >
            {chapter}
          </div>
        )}
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginTop: '6px',
              maxWidth: '680px',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
