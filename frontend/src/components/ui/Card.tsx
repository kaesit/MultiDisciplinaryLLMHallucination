import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div className={`card ${glow ? 'card-glow' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
