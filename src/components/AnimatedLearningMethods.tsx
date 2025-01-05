import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Brain, BookOpen, Gauge } from 'lucide-react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  id: string;
}

interface Pulse {
  position: number;
  opacity: number;
  speed: number;
}

interface Connection {
  nodeA: Node;
  nodeB: Node;
  pulses: Pulse[];
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899'];
const NODE_RADIUS = 50;
const CONNECTION_DISTANCE = 800;
const MOVEMENT_RANGE = 10;
const SPEED = 0.3;

// Pulse animation constants
const PULSE_SPEED = 0.001;
const PULSE_SPAWN_CHANCE = 0.002;
const PULSE_FADE_SPEED = 0.001;
const PULSE_SIZE = 12;
const HOVER_RADIUS = 60;

const NODES_INFO = [
  {
    id: 'language',
    label: 'Language Acquisition',
    description: 'Natural approach to mastering technical English',
    color: '#3B82F6',
    details: [
      'Immersive learning in IT context',
      'Real-world vocabulary acquisition',
      'Natural grammar understanding'
    ]
  },
  {
    id: 'brain',
    label: 'Build a Second Brain',
    description: 'Systematic approach to knowledge management',
    color: '#8B5CF6',
    details: [
      'Organized note-taking system',
      'Efficient information retrieval',
      'Connected learning patterns'
    ]
  },
  {
    id: 'habits',
    label: 'Developing Habits',
    description: 'Creating sustainable learning routines',
    color: '#EC4899',
    details: [
      'Consistent practice schedule',
      'Progress tracking system',
      'Adaptive learning paths'
    ]
  }
];

const AnimatedLearningMethods = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const initNodes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerY = window.innerHeight * 0.4;
    const spacing = window.innerWidth / 4;

    nodesRef.current = NODES_INFO.map((info, i) => ({
      x: spacing * (i + 1),
      y: centerY,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      radius: NODE_RADIUS,
      color: info.color,
      id: info.id
    }));

    // Initialize connections
    connectionsRef.current = [];
    nodesRef.current.forEach((nodeA, i) => {
      nodesRef.current.forEach((nodeB, j) => {
        if (i < j) {
          connectionsRef.current.push({
            nodeA,
            nodeB,
            pulses: []
          });
        }
      });
    });
  }, []);

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, deltaTime: number) => {
    // Draw connections first (under nodes)
    connectionsRef.current.forEach(connection => {
      const { nodeA, nodeB } = connection;
      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Base connection line
      const alpha = Math.min(1, 0.5 - (distance / CONNECTION_DISTANCE));
      
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
      ctx.lineWidth = .5;
      ctx.moveTo(nodeA.x, nodeA.y);
      ctx.lineTo(nodeB.x, nodeB.y);
      ctx.stroke();

      // Glowing effect
      ctx.beginPath();
      ctx.strokeStyle = `${nodeA.color}70`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 30;
      ctx.shadowColor = nodeA.color;
      ctx.moveTo(nodeA.x, nodeA.y);
      ctx.lineTo(nodeB.x, nodeB.y);
      ctx.stroke();

      // Handle pulse spawning
      if (Math.random() < PULSE_SPAWN_CHANCE && connection.pulses.length < 3) {
        connection.pulses.push({
          position: 0,
          opacity: 1,
          speed: PULSE_SPEED * (0.8 + Math.random() * 0.4)
        });
      }

      // Update and draw pulses
      connection.pulses = connection.pulses.filter(pulse => {
        const x = nodeA.x + dx * pulse.position;
        const y = nodeA.y + dy * pulse.position;

        // Draw pulse
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, PULSE_SIZE);
        gradient.addColorStop(0, `${nodeA.color}${Math.floor(pulse.opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, PULSE_SIZE, 0, Math.PI * 2);
        ctx.fill();

        // Update pulse
        pulse.position += pulse.speed * deltaTime;
        pulse.opacity = Math.max(0, pulse.opacity - PULSE_FADE_SPEED * deltaTime);

        return pulse.position < 1 && pulse.opacity > 0;
      });
    });

    // Draw node glows
    nodesRef.current.forEach(node => {
      const isHovered = node.id === hoveredNode;
      
      // Glow effect
      const gradient = ctx.createRadialGradient(
        node.x,
        node.y,
        0,
        node.x,
        node.y,
        node.radius * (isHovered ? 1.8 : 1.5)
      );
      gradient.addColorStop(0, `${node.color}${isHovered ? 'B0' : '90'}`);
      gradient.addColorStop(0.5, `${node.color}${isHovered ? '80' : '60'}`);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.shadowBlur = isHovered ? 50 : 40;
      ctx.shadowColor = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * (isHovered ? 1.2 : 1), 0, Math.PI * 2);
      ctx.fill();
    });
  }, [hoveredNode]);

  const updateNodes = useCallback(() => {
    nodesRef.current.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      const startX = node.x - MOVEMENT_RANGE;
      const startY = node.y - MOVEMENT_RANGE;

      // Bounce within movement range
      if (Math.abs(node.x - startX) > MOVEMENT_RANGE * 2) {
        node.vx *= -1;
      }
      if (Math.abs(node.y - startY) > MOVEMENT_RANGE * 2) {
        node.vy *= -1;
      }
    });
  }, []);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updateNodes();
    drawConnections(ctx, deltaTime);

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [drawConnections, updateNodes]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find hovered node
    const hoveredNodeObj = nodesRef.current.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < HOVER_RADIUS;
    });

    setHoveredNode(hoveredNodeObj?.id || null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [animate, initNodes]);

  return (
    <section className="relative min-h-screen">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 0 }}
        onMouseMove={handleMouseMove}
      />
      <div className="absolute inset-0 pointer-events-none">
        {NODES_INFO.map((info) => {
          const node = nodesRef.current.find(n => n.id === info.id);
          if (!node) return null;

          return (
            <div
              key={info.id}
              className="absolute pointer-events-auto"
              style={{
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <button
                className={`group relative rounded-full transition-all duration-300 ${
                  hoveredNode === info.id ? 'scale-110' : 'scale-100'
                }`}
                onClick={() => setSelectedNode(selectedNode === info.id ? null : info.id)}
                onMouseEnter={() => setHoveredNode(info.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div 
                  className="w-24 h-24 rounded-full"
                  style={{
                    background: `radial-gradient(circle at center, ${info.color}40, ${info.color}20, transparent)`,
                    boxShadow: `0 0 60px ${info.color}40`
                  }}
                />
                
                {/* Info Card */}
                <div
                  className={`absolute left-full ml-6 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-xl rounded-xl p-4 transition-all duration-300 ${
                    selectedNode === info.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
                  }`}
                  style={{
                    width: '280px',
                    borderLeft: `3px solid ${info.color}`
                  }}
                >
                  <h3 
                    className="text-xl font-medium mb-2"
                    style={{ color: info.color }}
                  >
                    {info.label}
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    {info.description}
                  </p>
                  <ul className="space-y-2">
                    {info.details.map((detail, index) => (
                      <li 
                        key={index}
                        className="flex items-start gap-2 text-sm text-white/70"
                      >
                        <span 
                          className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: info.color }}
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hover Label */}
                <div
                  className={`absolute left-full ml-6 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                    hoveredNode === info.id && selectedNode !== info.id
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4 pointer-events-none'
                  }`}
                  style={{
                    background: `${info.color}20`,
                    boxShadow: `0 0 20px ${info.color}20`,
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <span className="text-white font-medium">{info.label}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AnimatedLearningMethods; 