import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  children,
  style,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 500,
    transition: 'opacity 0.2s',
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: '#3498db', color: 'white' },
    secondary: { background: '#95a5a6', color: 'white' },
    danger: { background: '#e74c3c', color: 'white' },
  }

  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
