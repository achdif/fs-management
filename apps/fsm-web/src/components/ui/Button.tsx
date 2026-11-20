import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: Props) {
  const base =
    'flex h-14 w-full items-center justify-center rounded-2xl text-[15px] font-semibold transition-opacity disabled:opacity-60';
  const variants: Record<string, string> = {
    primary: 'bg-primary text-white',
    secondary: 'bg-surface text-placeholder',
    danger: 'bg-danger text-white',
    ghost: 'bg-transparent text-primary',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
