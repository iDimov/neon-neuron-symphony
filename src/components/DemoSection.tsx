import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { cn } from "@/lib/utils";

interface DemoSectionProps {
  title: string;
  description: string;
  isActive: boolean;
  onComplete: () => void;
  onClick: () => void;
  className?: string;
}

export const DemoSection = React.memo(({ 
  title, 
  description, 
  isActive,
  onComplete,
  onClick,
  className 
}: DemoSectionProps) => {
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive) {
      timerRef.current = setTimeout(onComplete, 15000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, onComplete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  }, [onClick]);

  const containerClassName = useMemo(() => cn(
    "rounded-lg transition-all duration-500 cursor-pointer backdrop-blur-sm overflow-hidden",
    isActive ? "bg-demo-background/90 shadow-lg shadow-demo-purple/10" : "bg-demo-background/40 hover:bg-demo-background/60",
    "border border-transparent hover:border-demo-purple/30",
    className
  ), [isActive, className]);

  const titleClassName = useMemo(() => cn(
    "text-lg font-semibold bg-gradient-to-r from-white to-demo-purple bg-clip-text text-transparent",
    "transition-all duration-300",
    isActive ? "mb-3" : "mb-0"
  ), [isActive]);

  const contentClassName = useMemo(() => cn(
    "transition-all duration-500 overflow-hidden",
    isActive ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
  ), [isActive]);

  return (
    <div 
      className={containerClassName}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ willChange: 'transform, opacity, box-shadow' }}
    >
      <div className="p-4">
        <h3 className={titleClassName}>
          {title}
        </h3>
        <div className={contentClassName}>
          <p className="text-demo-text text-sm leading-relaxed">
            {description}
          </p>
          {isActive && (
            <div className="h-1 bg-demo-background/80 mt-4 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-demo-blue via-demo-purple to-demo-pink rounded-full"
                style={{ 
                  animation: 'progress-bar 12s linear',
                  willChange: 'width',
                  transform: 'translateZ(0)'
                }} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DemoSection.displayName = 'DemoSection'; 