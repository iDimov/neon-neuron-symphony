import React, { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";
import { Brain, BookOpen, ChartBar, Users } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface DemoSectionProps {
  title: string;
  description: string[];
  isActive: boolean;
  onComplete: () => void;
  onClick: () => void;
  className?: string;
}

const LinearProgress = ({ isActive, onComplete }: { isActive: boolean; onComplete: () => void }) => {
  const progressRef = useRef(null);
  const isInView = useInView(progressRef, { once: false });
  const controls = useAnimation();
  const progressStartTime = useRef<number | null>(null);

  useEffect(() => {
    const animate = async () => {
      if (isActive && isInView) {
        // Reset and start new animation
        await controls.set({ scaleX: 0 });
        progressStartTime.current = Date.now();
        
        await controls.start({
          scaleX: [0, 1],
          transition: {
            duration: 15,
            ease: "linear",
            times: [0, 1]
          }
        });

        // Only trigger onComplete if enough time has passed (prevents triggering on manual clicks)
        if (progressStartTime.current && Date.now() - progressStartTime.current > 1000) {
          onComplete();
        }
      } else {
        controls.stop();
        await controls.set({ scaleX: 0 });
        progressStartTime.current = null;
      }
    };

    animate();

    return () => {
      controls.stop();
      progressStartTime.current = null;
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
  return (
    <div 
      className={cn(
        "rounded-xl transition-all duration-500 cursor-pointer backdrop-blur-sm overflow-hidden group relative",
        isActive ? "bg-demo-background/90 shadow-lg shadow-demo-purple/10" : "bg-demo-background/40 hover:bg-demo-background/60",
        "border border-transparent hover:border-demo-purple/30",
        className
      )}
      onClick={onClick}
      role="button"
      style={{ willChange: 'transform, opacity, box-shadow' }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className={cn(
            "text-xl font-semibold bg-gradient-to-r from-white to-demo-purple bg-clip-text text-transparent",
            "transition-all duration-300",
            isActive ? "mb-3" : "mb-0"
          )}>
            {title}
          </h3>
          {isActive && (
            <div className="w-0 h-0 
                          border-t-[10px] border-t-transparent 
                          border-l-[16px] border-l-demo-purple/60 
                          border-b-[10px] border-b-transparent 
                          ml-4 animate-pulse"/>
          )}
        </div>

        <div className={cn(
          "transition-all duration-500 overflow-hidden",
          isActive ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="mt-3">
            <ul className="space-y-2 mb-4">
              {description.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-demo-text">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-demo-blue to-demo-purple shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
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