import React, { useRef, useEffect, useState } from 'react';

interface VideoPanelProps {
  activeSection: number;
  key?: number;
}

export const VideoPanel = React.memo(({ activeSection }: VideoPanelProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset video state
    video.currentTime = 0;
    setIsPlaying(false);

    // Delay play to ensure previous operations are complete
    const playTimeout = setTimeout(async () => {
      try {
        setIsPlaying(true);
        await video.play();
      } catch (error) {
        console.log('Video playback failed:', error);
        setIsPlaying(false);
      }
    }, 100);

    return () => {
      clearTimeout(playTimeout);
      if (video && !video.paused) {
        setIsPlaying(false);
        video.pause();
      }
    };
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
        loop={false}
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      />
    </div>
  );
}); 