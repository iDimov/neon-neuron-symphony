import React from 'react';
import { Laptop, BookOpen, LineChart, Users } from "lucide-react";

interface VideoPanelProps {
  activeSection: number;
}

export const VideoPanel = ({ activeSection }: VideoPanelProps) => {
  const getIcon = () => {
    switch (activeSection) {
      case 0:
        return <Laptop className="w-16 h-16 text-demo-blue mx-auto mb-4 animate-fade-in" />;
      case 1:
        return <BookOpen className="w-16 h-16 text-demo-purple mx-auto mb-4 animate-fade-in" />;
      case 2:
        return <LineChart className="w-16 h-16 text-demo-pink mx-auto mb-4 animate-fade-in" />;
      case 3:
        return <Users className="w-16 h-16 text-demo-purple mx-auto mb-4 animate-fade-in" />;
      default:
        return <Laptop className="w-16 h-16 text-demo-blue mx-auto mb-4 animate-fade-in" />;
    }
  };

  const getContent = () => {
    switch (activeSection) {
      case 0:
        return "Plan your tech English learning journey";
      case 1:
        return "Learn through interactive tech scenarios";
      case 2:
        return "Track your progress with detailed analytics";
      case 3:
        return "Connect with global tech professionals";
      default:
        return "Start your tech English journey";
    }
  };

  return (
    <div className="absolute inset-0 bg-demo-background flex items-center justify-center bg-gradient-to-br from-demo-background to-[#2A2F3C] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-demo-blue rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-demo-pink rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="text-center relative z-10">
        {getIcon()}
        <p className="text-demo-text text-lg font-medium bg-gradient-to-r from-white via-demo-purple to-demo-pink bg-clip-text text-transparent animate-fade-in">
          {getContent()}
        </p>
      </div>
    </div>
  );
}; 