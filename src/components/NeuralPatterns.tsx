import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const NeuralPatterns = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Create patterns
    const patterns = Array.from({ length: 15 }, (_, i) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      
      // Create a curved path
      const d = `M ${startX} ${startY} 
                 C ${startX + 50} ${startY - 50},
                   ${startX + 100} ${startY + 50},
                   ${startX + 150} ${startY}`;
      
      path.setAttribute("d", d);
      path.setAttribute("stroke", "url(#neural-gradient)");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-dasharray", "200");
      path.setAttribute("stroke-dashoffset", "200");
      path.setAttribute("opacity", "0.3");
      
      svg.appendChild(path);
      return path;
    });

    // Animate patterns
    patterns.forEach((path, i) => {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.5,
        delay: i * 0.1,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      });

      gsap.to(path, {
        opacity: 0.6,
        duration: 2,
        delay: i * 0.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    });

    return () => {
      patterns.forEach(path => path.remove());
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ filter: 'blur(1px)' }}
    >
      <defs>
        <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#EC4899" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
}; 