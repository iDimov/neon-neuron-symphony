import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Brain, BookOpen, ChartBar, Users } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';

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
  const controls = useAnimation();
  const progressRef = useRef(null);
  const isInView = useInView(progressRef, { once: false });
  const Icon = SECTION_ICONS[title as keyof typeof SECTION_ICONS] || Brain;
  const gradient = SECTION_GRADIENTS[title as keyof typeof SECTION_GRADIENTS] || "from-demo-blue to-demo-purple";

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isActive && isInView) {
      controls.set({ scaleX: 0, originX: 0 });
      controls.start({
        scaleX: 1,
        transition: { 
          duration: 15,
          ease: "linear",
          delay: 0.2
        }
      });

      // Use timeout as backup for completion
      timeoutId = setTimeout(onComplete, 15200); // 15s + 0.2s delay
    } else {
      controls.stop();
      controls.set({ scaleX: 0 });
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isActive, isInView, controls, onComplete]);

  return (
    <div 
      className={cn(
        "rounded-xl transition-all duration-500 cursor-pointer backdrop-blur-sm overflow-hidden group",
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
      style={{ willChange: 'transform, opacity, box-shadow' }}
    >
      <div className="p-4">
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
          <h3 className={cn(
            "text-lg font-semibold bg-gradient-to-r from-white to-demo-purple bg-clip-text text-transparent",
            "transition-all duration-300",
            isActive ? "mb-3" : "mb-0"
          )}>
            {title}
          </h3>
        </div>

        <div className={cn(
          "transition-all duration-500 overflow-hidden",
          isActive ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="mt-3 pl-11">
            <p className="text-demo-text text-sm leading-relaxed mb-4">
              {description}
            </p>
            {isActive && (
              <div 
                ref={progressRef}
                className="h-1.5 rounded-full bg-demo-background/40 shadow-inner overflow-hidden"
              >
                <motion.div 
                  className="h-full w-full rounded-full bg-gradient-to-r from-demo-blue via-demo-purple to-demo-pink"
                  initial={{ scaleX: 0 }}
                  animate={controls}
                  style={{ 
                    originX: 0,
                    willChange: 'transform',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

DemoSection.displayName = 'DemoSection'; 