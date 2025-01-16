import React, { useRef, useEffect } from 'react';

interface VideoPanelProps {
  activeSection: number;
  key?: number; // Add key to force remount
}

export const VideoPanel = React.memo(({ activeSection }: VideoPanelProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Reset and play video
      video.currentTime = 0;
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Video playback failed:', error);
        });
      }

      // Clean up function
      return () => {
        if (!video.paused) {
          video.pause();
        }
      };
    }
  }, [activeSection]); // This will trigger on both automatic and manual section changes

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
        loop={false} // Disable loop since we want to control playback
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      />
    </div>
  );
}); 