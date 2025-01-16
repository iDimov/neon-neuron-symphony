import React, { useMemo } from 'react';
import { Laptop, BookOpen, LineChart, Users } from "lucide-react";

interface VideoPanelProps {
  activeSection: number;
}

const SECTION_CONTENT = {
  0: {
    icon: (props: any) => <Laptop {...props} />,
    text: "Plan your tech English learning journey",
    color: "text-demo-blue"
  },
  1: {
    icon: (props: any) => <BookOpen {...props} />,
    text: "Learn through interactive tech scenarios",
    color: "text-demo-purple"
  },
  2: {
    icon: (props: any) => <LineChart {...props} />,
    text: "Track your progress with detailed analytics",
    color: "text-demo-pink"
  },
  3: {
    icon: (props: any) => <Users {...props} />,
    text: "Connect with global tech professionals",
    color: "text-demo-purple"
  }
} as const;

export const VideoPanel = React.memo(({ activeSection }: VideoPanelProps) => {
  const currentSection = useMemo(() => {
    const section = SECTION_CONTENT[activeSection as keyof typeof SECTION_CONTENT] || SECTION_CONTENT[0];
    const Icon = section.icon;
    
    return {
      icon: <Icon className={`w-16 h-16 ${section.color} mx-auto mb-4 animate-fade-in`} />,
      text: section.text
    };
  }, [activeSection]);

  return (
    <div 
      className="absolute inset-0 bg-demo-background flex items-center justify-center bg-gradient-to-br from-demo-background to-[#2A2F3C] relative overflow-hidden"
      style={{ willChange: 'transform' }}
    >
      {/* Decorative background elements */}
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
        {currentSection.icon}
        <p 
          className="text-demo-text text-lg font-medium bg-gradient-to-r from-white via-demo-purple to-demo-pink bg-clip-text text-transparent animate-fade-in"
          style={{ willChange: 'transform, opacity' }}
        >
          {currentSection.text}
        </p>
      </div>
    </div>
  );
}); 