import React from 'react';
import { cn } from '@/lib/utils';
import '@/styles/plasma.css';

export const PlasmaBackground = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-demo-background/80", className)}>
      <div className="plasma-wrapper">
        <div className="plasma-gradient plasma-gradient-1"></div>
        <div className="plasma-gradient plasma-gradient-2"></div>
        <div className="plasma-gradient plasma-gradient-3"></div>
      </div>
    </div>
  );
}; 