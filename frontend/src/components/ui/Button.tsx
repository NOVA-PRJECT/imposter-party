import React from 'react';
import { playButtonClick } from '@/lib/audioManager';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'accent',
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  let baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide transition-all rounded-card min-touch px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    accent: 'bg-accent hover:bg-accent-dim text-white shadow-lg shadow-accent/20',
    primary: 'bg-surface2 hover:bg-border text-primary border border-border',
    secondary: 'bg-surface hover:bg-surface2 text-muted border border-border',
    danger: 'bg-danger hover:bg-red-700 text-white shadow-lg shadow-danger/20',
    ghost: 'bg-transparent hover:bg-surface2 text-muted',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playButtonClick();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
