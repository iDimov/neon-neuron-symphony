import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Brain, BookOpen, ChartBar, Users } from 'lucide-react';

const SECTION_ICONS = {
  "Planning Your Journey": Brain,
  "Interactive Learning Hub": BookOpen,
  "Progress Tracking & Analytics": ChartBar,
  "Global Tech Community": Users
};

const SECTION_GRADIENTS = {
  "Planning Your Journey": "from-demo-blue to-demo-purple",
  "Interactive Learning Hub": "from-demo-purple to-demo-pink",
  "Progress Tracking & Analytics": "from-demo-pink to-demo-purple",
  "Global Tech Community": "from-demo-purple to-demo-blue"
};

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
  const Icon = SECTION_ICONS[title as keyof typeof SECTION_ICONS] || Brain;
  const gradient = SECTION_GRADIENTS[title as keyof typeof SECTION_GRADIENTS] || "from-demo-blue to-demo-purple";

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
    "rounded-xl transition-all duration-500 cursor-pointer backdrop-blur-sm overflow-hidden group",
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
        {/* Icon and Title */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center transition-all duration-500 group-hover:scale-105",
            isActive ? gradient : "from-white/5 to-white/10"
          )}>
            <Icon className={cn(
              "w-4 h-4 transition-all duration-500",
              isActive ? "text-white" : "text-white/50"
            )} />
          </div>
          <h3 className={titleClassName}>
            {title}
          </h3>
        </div>

        {/* Description and Progress */}
        <div className={contentClassName}>
          <div className="mt-3 pl-11"> {/* Align with icon */}
            <p className="text-demo-text text-sm leading-relaxed mb-4">
              {description}
            </p>
            {isActive && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-demo-blue via-demo-purple to-demo-pink opacity-10 blur-xl" />
                <div className="h-0.5 bg-demo-background/80 rounded-full overflow-hidden backdrop-blur-sm relative">
                  <div 
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r",
                      gradient,
                      "animate-progress-bar"
                    )}
                    style={{ 
                      willChange: 'width',
                      transform: 'translateZ(0)'
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

DemoSection.displayName = 'DemoSection'; 