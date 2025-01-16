import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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

  // Pre-calculate node positions
  const nodePositions = useMemo(() => {
    const centerY = window.innerHeight * 0.4;
    const spacing = window.innerWidth / 4;
    
    return NODES_INFO.map((_, i) => ({
      x: spacing * (i + 1),
      y: centerY
    }));
  }, []);

  const initNodes = useCallback(() => {
    const nodes = new Array(NODES_INFO.length);
    
    for (let i = 0; i < NODES_INFO.length; i++) {
      nodes[i] = {
        x: nodePositions[i].x,
        y: nodePositions[i].y,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        radius: NODE_RADIUS,
        color: NODES_INFO[i].color,
        id: NODES_INFO[i].id
      };
    }
    nodesRef.current = nodes;

    // Initialize connections with pre-allocation
    const connectionCount = (NODES_INFO.length * (NODES_INFO.length - 1)) / 2;
    const connections = new Array(connectionCount);
    let connectionIndex = 0;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        connections[connectionIndex++] = {
          nodeA: nodes[i],
          nodeB: nodes[j],
          pulses: []
        };
      }
    }
    connectionsRef.current = connections;
  }, [nodePositions]);

  // Optimize mouse interaction with spatial partitioning
  const spatialGridRef = useRef<Map<string, Node>>(new Map());
  
  const updateSpatialGrid = useCallback(() => {
    spatialGridRef.current.clear();
    const cellSize = NODE_RADIUS * 2;
    
    nodesRef.current.forEach(node => {
      const gridX = Math.floor(node.x / cellSize);
      const gridY = Math.floor(node.y / cellSize);
      spatialGridRef.current.set(`${gridX},${gridY}`, node);
    });
  }, []);

  const findNodeUnderMouse = useCallback((x: number, y: number) => {
    const cellSize = NODE_RADIUS * 2;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    
    // Check neighboring cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const node = spatialGridRef.current.get(`${gridX + dx},${gridY + dy}`);
        if (node) {
          const distance = Math.hypot(x - node.x, y - node.y);
          if (distance < NODE_RADIUS) {
            return node;
          }
        }
      }
    }
    return null;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const node = findNodeUnderMouse(x, y);
    setHoveredNode(node?.id || null);
  }, [findNodeUnderMouse]);

  // Optimize animation loop
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Clear with alpha for motion blur effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Batch process nodes
    const nodes = nodesRef.current;
    const batchSize = 5;
    const batches = Math.ceil(nodes.length / batchSize);

    for (let b = 0; b < batches; b++) {
      const start = b * batchSize;
      const end = Math.min(start + batchSize, nodes.length);

      for (let i = start; i < end; i++) {
        const node = nodes[i];
        // Update node position
        node.x += node.vx * deltaTime;
        node.y += node.vy * deltaTime;

        // Boundary check with dampening
        if (node.x < 0 || node.x > canvas.width) node.vx *= -0.8;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -0.8;
      }
    }

    // Update spatial grid for mouse interaction
    updateSpatialGrid();

    // Draw connections with hardware acceleration hints
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    
    connectionsRef.current.forEach(connection => {
      const { nodeA, nodeB } = connection;
      ctx.beginPath();
      ctx.moveTo(nodeA.x, nodeA.y);
      ctx.lineTo(nodeB.x, nodeB.y);
      ctx.stroke();
    });
    
    ctx.restore();

    // Draw nodes with hardware acceleration
    nodes.forEach(node => {
      const isHovered = node.id === hoveredNode;
      const isSelected = node.id === selectedNode;

      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = isHovered || isSelected ? node.color : `${node.color}88`;
      ctx.fill();
      ctx.restore();
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [hoveredNode, selectedNode, updateSpatialGrid]);

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
        style={{ 
          zIndex: 0,
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
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