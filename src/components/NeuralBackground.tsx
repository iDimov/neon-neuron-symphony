import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowIntensity: number;
  glowDirection: 1 | -1;
}

const COLORS = ['#0EA5E9', '#8B5CF6', '#D946EF'];
const NODE_COUNT = 30;
const CONNECTION_DISTANCE = 150;
const SPEED = 0.5;
const GLOW_SPEED = 0.02;
const MAX_GLOW = 1.5;
const MIN_GLOW = 0.5;

export const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initNodes = () => {
      nodesRef.current = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        radius: Math.random() * 2 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        glowIntensity: Math.random() * (MAX_GLOW - MIN_GLOW) + MIN_GLOW,
        glowDirection: Math.random() > 0.5 ? 1 : -1,
      }));
    };

    const drawNode = (node: Node) => {
      if (!ctx) return;
      
      ctx.save();
      ctx.shadowBlur = 15 * node.glowIntensity;
      ctx.shadowColor = node.color;
      ctx.fillStyle = node.color;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * node.glowIntensity, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      ctx.restore();
    };

    const drawConnections = () => {
      if (!ctx) return;
      const nodes = nodesRef.current;

      nodes.forEach((nodeA, i) => {
        nodes.slice(i + 1).forEach(nodeB => {
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            const opacity = (1 - (distance / CONNECTION_DISTANCE)) * 
                          Math.min(nodeA.glowIntensity, nodeB.glowIntensity);
            
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            
            // Ensure opacity is between 0 and 255 before converting to hex
            const opacityValue = Math.max(0, Math.min(255, Math.floor(opacity * 255)));
            const opacityHex = opacityValue.toString(16).padStart(2, '0');
            
            const gradient = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
            gradient.addColorStop(0, `${nodeA.color}${opacityHex}`);
            gradient.addColorStop(1, `${nodeB.color}${opacityHex}`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = opacity * 2;
            
            ctx.shadowBlur = 10 * opacity;
            ctx.shadowColor = nodeA.color;
            ctx.stroke();
          }
        });
      });
    };

    const updateNodes = () => {
      const nodes = nodesRef.current;
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        node.glowIntensity += GLOW_SPEED * node.glowDirection;
        if (node.glowIntensity >= MAX_GLOW || node.glowIntensity <= MIN_GLOW) {
          node.glowDirection *= -1;
        }
      });
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      updateNodes();
      drawConnections();
      nodesRef.current.forEach(drawNode);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initNodes();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initNodes();
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full bg-neural-bg animate-breathe"
      style={{ 
        WebkitBackdropFilter: 'blur(8px)', 
        backdropFilter: 'blur(8px)',
      }}
    />
  );
};