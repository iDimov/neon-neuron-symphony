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

interface Connection {
  nodeA: Node;
  nodeB: Node;
  pulsePosition: number;
  pulseDirection: 1;
}

const COLORS = ['#0EA5E9', '#8B5CF6', '#D946EF'];
const NODE_COUNT = 30;
const CONNECTION_DISTANCE = 150;
const SPEED = 0.5;
const GLOW_SPEED = 0.02;
const MAX_GLOW = 1.5;
const MIN_GLOW = 0.5;
const PULSE_SPEED = 0.005; // Slowed down from 0.02
const CONNECTION_PROBABILITY = 0.3; // Added to reduce connection frequency

export const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
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

    const updateConnections = () => {
      const nodes = nodesRef.current;
      connectionsRef.current = [];

      nodes.forEach((nodeA, i) => {
        nodes.slice(i + 1).forEach(nodeB => {
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Only create connection if within distance AND passes probability check
          if (distance < CONNECTION_DISTANCE && Math.random() < CONNECTION_PROBABILITY) {
            connectionsRef.current.push({
              nodeA,
              nodeB,
              pulsePosition: Math.random(),
              pulseDirection: 1,
            });
          }
        });
      });
    };

    const drawConnections = () => {
      if (!ctx) return;
      const connections = connectionsRef.current;

      connections.forEach(connection => {
        const { nodeA, nodeB, pulsePosition } = connection;
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Draw the base connection line
        const baseOpacity = 0.2;
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);

        const opacityValue = Math.max(0, Math.min(255, Math.floor(baseOpacity * 255)));
        const opacityHex = opacityValue.toString(16).padStart(2, '0');
        
        const gradient = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
        gradient.addColorStop(0, `${nodeA.color}${opacityHex}`);
        gradient.addColorStop(1, `${nodeB.color}${opacityHex}`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw the pulse
        const pulseX = nodeA.x + dx * pulsePosition;
        const pulseY = nodeA.y + dy * pulsePosition;
        
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `${nodeA.color}FF`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = nodeA.color;
        ctx.fill();

        // Update pulse position
        connection.pulsePosition += PULSE_SPEED;
        if (connection.pulsePosition > 1) {
          connection.pulsePosition = 0;
        }
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
      updateConnections();
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
      className="fixed inset-0 w-full h-full bg-neural-bg"
      style={{ 
        WebkitBackdropFilter: 'blur(8px)', 
        backdropFilter: 'blur(8px)',
      }}
    />
  );
};