import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Node {
  x: number;
  y: number;
  label: string;
  connections: number[];
  category: string;
}

export const NetworkVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([
    { x: 50, y: 50, label: "Cloud", connections: [1, 3, 4], category: "infrastructure" },
    { x: 150, y: 100, label: "Security", connections: [0, 2], category: "security" },
    { x: 250, y: 50, label: "Network", connections: [1, 4], category: "infrastructure" },
    { x: 50, y: 150, label: "Servers", connections: [0, 4], category: "infrastructure" },
    { x: 200, y: 200, label: "Data", connections: [2, 3], category: "data" }
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const getNodeColor = (category: string) => {
      switch (category) {
        case 'infrastructure': return '#3B82F6'; // blue
        case 'security': return '#10B981'; // green
        case 'data': return '#8B5CF6'; // purple
        default: return '#6B7280'; // gray
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections with gradients
      nodesRef.current.forEach(node => {
        node.connections.forEach(connIndex => {
          const connNode = nodesRef.current[connIndex];
          const gradient = ctx.createLinearGradient(
            node.x, node.y, connNode.x, connNode.y
          );
          gradient.addColorStop(0, getNodeColor(node.category) + '40');
          gradient.addColorStop(1, getNodeColor(connNode.category) + '40');
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connNode.x, connNode.y);
          ctx.stroke();
        });
      });

      // Draw nodes with category-specific colors
      nodesRef.current.forEach(node => {
        const color = getNodeColor(node.category);
        
        // Glow effect
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, 25
        );
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Label with background
        const label = node.label;
        ctx.font = 'bold 14px system-ui';
        const textWidth = ctx.measureText(label).width;
        
        // Label background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
          node.x - textWidth/2 - 4,
          node.y + 15,
          textWidth + 8,
          22
        );
        
        // Label text
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(label, node.x, node.y + 30);
      });

      // Animate node positions with smoother movement
      nodesRef.current = nodesRef.current.map(node => ({
        ...node,
        x: node.x + Math.sin(Date.now() * 0.001 + node.x * 0.5) * 0.3,
        y: node.y + Math.cos(Date.now() * 0.001 + node.y * 0.5) * 0.3
      }));

      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
}; 