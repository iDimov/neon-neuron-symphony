import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VideoPanelProps {
  activeSection: string;
  className?: string;
}

const VIDEO_MAPPING = {
  "Planning Your Journey": "/videos/video-1.mp4",
  "Interactive Learning Hub": "/videos/video-2.mp4",
  "Progress Tracking & Analytics": "/videos/video-3.mp4",
  "Global Tech Community": "/videos/video-4.mp4"
};

export const VideoPanel: React.FC<VideoPanelProps> = ({ activeSection, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const videoPath = VIDEO_MAPPING[activeSection as keyof typeof VIDEO_MAPPING];
    if (!videoPath) return;

    // Reset video state
    videoElement.pause();
    videoElement.currentTime = 0;

    // Update video source and play
    videoElement.src = videoPath;
    
    // Play the video with a small delay to ensure proper loading
    const playPromise = videoElement.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Video playback error:", error);
      });
    }

    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.src = "";
      }
    };
  }, [activeSection]);

  return (
    <div className={cn(
      "relative rounded-2xl overflow-hidden bg-demo-background/40 backdrop-blur-sm",
      "border border-demo-purple/20",
      "shadow-xl shadow-black/20",
      className
    )}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-2xl"
        playsInline
        muted
        loop
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      
      {/* Loading state */}
      <div className="absolute inset-0 flex items-center justify-center bg-demo-background/40 opacity-0 transition-opacity duration-300 pointer-events-none">
        <div className="w-12 h-12 border-4 border-demo-purple/30 border-t-demo-purple rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default VideoPanel; 