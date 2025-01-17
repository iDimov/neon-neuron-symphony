import React, { useEffect, useRef, useState } from 'react';
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

const LinearProgress = ({ isActive, onComplete }: { isActive: boolean; onComplete: () => void }) => {
  const progressRef = useRef(null);
  const isInView = useInView(progressRef, { once: false });
  const controls = useAnimation();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const animate = async () => {
      if (isActive && isInView) {
        await controls.start({
          scaleX: [0, 1],
          transition: {
            duration: 15,
            ease: "linear",
            times: [0, 1]
          }
        });
        onComplete();
      } else {
        controls.stop();
        await controls.set({ scaleX: 0 });
      }
    };

    animate();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      controls.stop();
    };
  }, [isActive, isInView, controls, onComplete]);

  return (
    <div 
      ref={progressRef}
      className="relative h-1.5 rounded-full bg-demo-background/40 shadow-inner overflow-hidden"
    >
      <motion.div 
        className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-demo-blue via-demo-purple to-demo-pink"
        initial={{ scaleX: 0 }}
        animate={controls}
        style={{ 
          originX: 0,
          willChange: 'transform',
        }}
      />
    </div>
  );
};

export const DemoSection = React.memo(({ 
  title, 
  description, 
  isActive,
  onComplete,
  onClick,
  className 
}: DemoSectionProps) => {
  const Icon = SECTION_ICONS[title as keyof typeof SECTION_ICONS] || Brain;
  const gradient = SECTION_GRADIENTS[title as keyof typeof SECTION_GRADIENTS] || "from-demo-blue to-demo-purple";
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    } else {
      const timer = setTimeout(() => setIsExpanded(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
    setIsExpanded(true);
  };

  return (
    <div 
      className={cn(
        "rounded-xl transition-all duration-500 cursor-pointer backdrop-blur-sm overflow-hidden group",
        isActive ? "bg-demo-background/90 shadow-lg shadow-demo-purple/10" : "bg-demo-background/40 hover:bg-demo-background/60",
        "border border-transparent hover:border-demo-purple/30",
        className
      )}
      onClick={handleClick}
      role="button"
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
              <LinearProgress isActive={isActive} onComplete={onComplete} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

DemoSection.displayName = 'DemoSection'; 