import React from 'react';
import { cn } from "@/lib/utils";

interface DemoSectionProps {
  title: string;
  description: string;
  isActive: boolean;
  onComplete: () => void;
  onClick: () => void;
  className?: string;
}

export const DemoSection = ({ 
  title, 
  description, 
  isActive,
  onComplete,
  onClick,
  className 
}: DemoSectionProps) => {
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setTimeout(() => {
        onComplete();
      }, 12000);
    }
    return () => clearTimeout(timer);
  }, [isActive, onComplete]);

  return (
    <div 
      className={cn(
        "rounded-lg transition-all duration-500 cursor-pointer backdrop-blur-sm overflow-hidden",
        isActive ? "bg-demo-background/90 shadow-lg shadow-demo-purple/10" : "bg-demo-background/40 hover:bg-demo-background/60",
        "border border-transparent hover:border-demo-purple/30",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className="p-4">
        <h3 className={cn(
          "text-lg font-semibold bg-gradient-to-r from-white to-demo-purple bg-clip-text text-transparent",
          "transition-all duration-300",
          isActive ? "mb-3" : "mb-0"
        )}>
          {title}
        </h3>
        <div className={cn(
          "transition-all duration-500 overflow-hidden",
          isActive ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <p className="text-demo-text text-sm leading-relaxed">
            {description}
          </p>
          {isActive && (
            <div className="h-1 bg-demo-background/80 mt-4 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-gradient-to-r from-demo-blue via-demo-purple to-demo-pink animate-progress-bar rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 