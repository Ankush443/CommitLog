import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', padding = true, onClick }: CardProps) {
  return (
    <div 
      className={`bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-color))] shadow-sm ${padding ? 'p-6' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
