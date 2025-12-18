
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, style }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-card rounded-xl p-5 animate-subtle-glow ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;