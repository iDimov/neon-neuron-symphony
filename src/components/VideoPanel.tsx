import React, { useMemo } from 'react';
import { Brain, BookOpen, Gauge } from 'lucide-react';

// Pre-define section content for better performance
const SECTION_CONTENT = {
  0: {
    icon: Brain,
    text: "Neural networks are trained through iterative optimization",
    color: "text-demo-blue"
  },
  1: {
    icon: BookOpen,
    text: "Learning algorithms adapt to patterns in data",
    color: "text-demo-purple"
  },
  2: {
    icon: Gauge,
    text: "Performance metrics guide model improvements",
    color: "text-demo-pink"
  },
  3: {
    icon: Brain,
    text: "Deep learning enables complex pattern recognition",
    color: "text-demo-purple"
  }
};

interface VideoPanelProps {
  activeSection: number;
}

export const VideoPanel = React.memo(({ activeSection }: VideoPanelProps) => {
  // Memoize current section content
  const { icon: Icon, text, color } = useMemo(() => 
    SECTION_CONTENT[activeSection as keyof typeof SECTION_CONTENT] || SECTION_CONTENT[0],
    [activeSection]
  );

  return (
    <div className="absolute inset-0 bg-demo-background flex items-center justify-center bg-gradient-to-br from-demo-background to-[#2A2F3C] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute top-0 left-0 w-32 h-32 bg-demo-blue rounded-full filter blur-3xl"
          style={{ willChange: 'transform' }}
        />
        <div 
          className="absolute bottom-0 right-0 w-32 h-32 bg-demo-pink rounded-full filter blur-3xl"
          style={{ willChange: 'transform' }}
        />
      </div>

      <div className="text-center relative z-10">
        <Icon 
          className={`w-16 h-16 ${color} mx-auto mb-4 animate-fade-in`}
          style={{ willChange: 'transform' }}
        />
        <p 
          className="text-lg font-medium bg-gradient-to-r from-white via-demo-purple to-demo-pink bg-clip-text text-transparent animate-fade-in"
          style={{ willChange: 'transform, opacity' }}
        >
          {text}
        </p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
        <div 
          className="h-full bg-gradient-to-r from-demo-blue via-demo-purple to-demo-pink rounded-full animate-progress-bar"
          style={{ 
            willChange: 'width',
            transform: 'translateZ(0)'
          }} 
        />
      </div>
    </div>
  );
}); 