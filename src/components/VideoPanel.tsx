import React, { useRef, useEffect } from 'react';

interface VideoPanelProps {
  activeSection: number;
}

export const VideoPanel = React.memo(({ activeSection }: VideoPanelProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(error => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, [activeSection]);

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

      {/* Video element */}
      <video
        ref={videoRef}
        src="/videos/planning.mp4"
        className="w-full h-full object-cover"
        muted
        playsInline
        loop
        autoPlay
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      />

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