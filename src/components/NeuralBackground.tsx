import { motion } from "framer-motion";
import React, { useCallback, useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
  glowIntensity: number;
  oscillationOffset: number;
  oscillationSpeed: number;
  baseRadius: number;
  initialScale: number;
  movementOffset: number;
  glowWaveOffset: number;
  originalX: number;
  originalY: number;
  connections: number;
}

interface Connection {
  nodeA: Node;
  nodeB: Node;
  pulsePosition: number;
  strength: number;
  lifetime: number;
  width: number;
  initialOpacity: number;
  pulses: {
    position: number;
    opacity: number;
  }[];
  drawProgress: number;
}

const COLORS = [
  "#67E8F9",  // Cyan
  "#3B82F6",  // Blue
  "#8B5CF6",  // Purple
  "#A855F7",  // Violet
  "#EC4899",  // Pink
];

const GRADIENT_COLORS = [
  { color: '#3B82F6', opacity: 0.05, speed: 0.00008, scale: 1.2 },    // Blue
  { color: '#8B5CF6', opacity: 0.05, speed: 0.00010, scale: 1.1 },    // Purple
  { color: '#EC4899', opacity: 0.05, speed: 0.00006, scale: 1.3 },    // Pink
];

const NODE_COUNT = 25;
const CONNECTION_DISTANCE = 250;
const MAX_CONNECTIONS_PER_NODE = 2;
const BASE_SPEED = 0.03;
const MAX_GLOW = 1.2;
const MIN_GLOW = 0.3;
const PULSE_SPEED = 0.008;
const MIN_CONNECTION_LIFETIME = 15000;
const CONNECTION_UPDATE_INTERVAL = 45;
const LINE_DRAW_SPEED = 0.15;
const VELOCITY_DAMPENING = 0.97;
const Z_RANGE = 150;
const INITIAL_ANIMATION_DURATION = 1500;
const WAVE_FREQUENCY = 0.0001;
const PULSE_SIZE_MIN = 1.5;
const PULSE_SIZE_MAX = 3;
const PULSE_SPAWN_CHANCE = 0.003;
const PULSE_FADE_SPEED = 0.006;
const OSCILLATION_SPEED_RANGE = [0.0003, 0.0006];
const NODE_MOVEMENT_FREQUENCY = 0.00015;
const GLOW_WAVE_FREQUENCY = 0.0003;
const BASE_MOVEMENT_RANGE = 0.8;
const MOVEMENT_VARIATION = 0.4;
const RETURN_FORCE = 0.00008;
const MAX_OFFSET = 40;

export const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const gradientCacheRef = useRef<Map<string, CanvasGradient>>(new Map());
  const opacityRef = useRef<number>(1);

  const initNodes = useCallback((width: number, height: number) => {
    return Array.from({ length: NODE_COUNT }, () => {
      const baseRadius = Math.random() * 1.5 + 1.5;
      const x = Math.random() * width;
      const y = Math.random() * height;
      return {
        x,
        y,
        originalX: x,
        originalY: y,
        z: Math.random() * Z_RANGE - Z_RANGE / 2,
        vx: (Math.random() - 0.5) * BASE_SPEED,
        vy: (Math.random() - 0.5) * BASE_SPEED,
        vz: (Math.random() - 0.5) * BASE_SPEED * 0.5,
        radius: baseRadius,
        baseRadius,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        glowIntensity: Math.random() * (MAX_GLOW - MIN_GLOW) + MIN_GLOW,
        oscillationOffset: Math.random() * Math.PI * 2,
        oscillationSpeed:
          OSCILLATION_SPEED_RANGE[0] +
          Math.random() *
            (OSCILLATION_SPEED_RANGE[1] - OSCILLATION_SPEED_RANGE[0]),
        initialScale: 0,
        movementOffset: Math.random() * Math.PI * 2,
        glowWaveOffset: Math.random() * Math.PI * 2,
        connections: 0,
      };
    });
  }, []);

  const calculateScale = useCallback((z: number) => {
    return 1 + (z / Z_RANGE) * 0.5;
  }, []);

  const getOrCreateGradient = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      key: string,
      createGradient: () => CanvasGradient
    ) => {
      if (!gradientCacheRef.current.has(key)) {
        gradientCacheRef.current.set(key, createGradient());
      }
      return gradientCacheRef.current.get(key)!;
    },
    []
  );

  const drawNode = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      node: Node,
      timestamp: number,
      progress: number
    ) => {
      const scale = calculateScale(node.z);
      const currentScale =
        scale *
        (progress < 1
          ? node.initialScale + (1 - node.initialScale) * progress
          : 1);
      const radiusModifier =
        Math.sin(timestamp * node.oscillationSpeed + node.oscillationOffset) *
          0.3 +
        1;
      const currentRadius = node.baseRadius * radiusModifier * currentScale;
      const alpha = Math.max(0, 1 - Math.abs(node.z) / Z_RANGE);

      ctx.save();

      // Outer glow
      const outerGradient = getOrCreateGradient(
        ctx,
        `outer-${node.color}-${alpha}`,
        () => {
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            currentRadius * 10
          );
          gradient.addColorStop(
            0,
            `${node.color}${Math.floor(alpha * 30)
              .toString(16)
              .padStart(2, "0")}`
          );
          gradient.addColorStop(
            0.5,
            `${node.color}${Math.floor(alpha * 15)
              .toString(16)
              .padStart(2, "0")}`
          );
          gradient.addColorStop(1, "transparent");
          return gradient;
        }
      );

      ctx.fillStyle = outerGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, currentRadius * 10, 0, Math.PI * 2);
      ctx.fill();

      // Enhanced glow effect
      ctx.shadowBlur = 15 * node.glowIntensity * currentScale;
      ctx.shadowColor = node.color;

      // Inner bright core
      const innerGradient = getOrCreateGradient(
        ctx,
        `inner-${node.color}-${alpha}`,
        () => {
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            currentRadius * 2.5
          );
          gradient.addColorStop(
            0,
            `${node.color}${Math.floor(alpha * 255)
              .toString(16)
              .padStart(2, "0")}`
          );
          gradient.addColorStop(
            0.6,
            `${node.color}${Math.floor(alpha * 180)
              .toString(16)
              .padStart(2, "0")}`
          );
          gradient.addColorStop(
            1,
            `${node.color}${Math.floor(alpha * 100)
              .toString(16)
              .padStart(2, "0")}`
          );
          return gradient;
        }
      );

      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, currentRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
    [calculateScale, getOrCreateGradient]
  );

  const updateConnections = useCallback(() => {
    const nodes = nodesRef.current;
    const currentConnections = connectionsRef.current;

    currentConnections.forEach((conn) => {
      conn.lifetime--;
      conn.drawProgress = Math.min(1, conn.drawProgress + LINE_DRAW_SPEED);
    });

    connectionsRef.current = currentConnections.filter(
      (conn) => conn.lifetime > 0
    );

    nodes.forEach((node) => (node.connections = 0));
    connectionsRef.current.forEach((conn) => {
      conn.nodeA.connections++;
      conn.nodeB.connections++;
    });

    nodes.forEach((nodeA, i) => {
      if (nodeA.connections >= MAX_CONNECTIONS_PER_NODE) return;

      nodes.slice(i + 1).forEach((nodeB) => {
        if (nodeB.connections >= MAX_CONNECTIONS_PER_NODE) return;

        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dz = nodeA.z - nodeB.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < CONNECTION_DISTANCE) {
          const existingConnection = connectionsRef.current.find(
            (conn) =>
              (conn.nodeA === nodeA && conn.nodeB === nodeB) ||
              (conn.nodeA === nodeB && conn.nodeB === nodeA)
          );

          if (!existingConnection) {
            connectionsRef.current.push({
              nodeA,
              nodeB,
              pulses: [],
              pulsePosition: Math.random(),
              strength: 1 - distance / CONNECTION_DISTANCE,
              lifetime: MIN_CONNECTION_LIFETIME + Math.random() * 2000,
              width: Math.random() * 1.5 + 1,
              initialOpacity: 1,
              drawProgress: 1,
            });
          }
        }
      });
    });
  }, []);

  const drawConnections = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      deltaTime: number,
      timestamp: number,
      progress: number
    ) => {
      connectionsRef.current.forEach((connection) => {
        const { nodeA, nodeB, strength, width } = connection;
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const dz = nodeB.z - nodeB.z;
        const distance = Math.max(
          0.001,
          Math.sqrt(dx * dx + dy * dy + dz * dz)
        );
        const avgZ = (nodeA.z + nodeB.z) / 2;
        const depthAlpha = Math.max(0, 1 - Math.abs(avgZ) / Z_RANGE);

        connection.initialOpacity = Math.min(
          1,
          connection.initialOpacity + deltaTime * 0.008
        );
        const opacity = Math.min(
          1,
          progress * connection.initialOpacity * depthAlpha * 2.5
        );
        const alpha = Math.floor(
          Math.max(
            0,
            Math.min(
              255,
              strength * 0.8 * opacity * 255 * connection.drawProgress
            )
          )
        )
          .toString(16)
          .padStart(2, "0");

        const midX = (nodeA.x + nodeB.x) / 2;
        const midY = (nodeA.y + nodeB.y) / 2;
        const waveAmplitude = Math.min(20, distance * 0.12) * depthAlpha;
        const waveOffset =
          Math.sin(timestamp * WAVE_FREQUENCY + nodeA.oscillationOffset) *
          waveAmplitude;
        const perpX = -dy / distance;
        const perpY = dx / distance;
        const controlX = midX + perpX * waveOffset;
        const controlY = midY + perpY * waveOffset;

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(0.8, width * depthAlpha * 1.2);

        // Enhanced connection gradient
        const gradient = ctx.createLinearGradient(
          nodeA.x,
          nodeA.y,
          nodeB.x,
          nodeB.y
        );
        gradient.addColorStop(0, `${nodeA.color}${alpha}`);
        gradient.addColorStop(0.5, `${nodeA.color}${alpha}`);
        gradient.addColorStop(1, `${nodeB.color}${alpha}`);

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.quadraticCurveTo(controlX, controlY, nodeB.x, nodeB.y);
        ctx.stroke();

        // Enhanced glow effect for connections
        ctx.shadowBlur = 8;
        ctx.shadowColor = nodeA.color;
        ctx.stroke();

        ctx.restore();

        // Pulse animation with enhanced visibility
        if (
          connection.drawProgress > 0.3 &&
          connection.pulses.length === 0 &&
          Math.random() < PULSE_SPAWN_CHANCE
        ) {
          connection.pulses.push({
            position: 0,
            opacity: 1,
          });
        }

        connection.pulses = connection.pulses.filter((pulse) => {
          const t = Math.max(0, Math.min(1, pulse.position));
          const pulseX =
            Math.pow(1 - t, 2) * nodeA.x +
            2 * (1 - t) * t * controlX +
            Math.pow(t, 2) * nodeB.x;
          const pulseY =
            Math.pow(1 - t, 2) * nodeA.y +
            2 * (1 - t) * t * controlY +
            Math.pow(t, 2) * nodeB.y;
          const pulseSize = Math.max(
            PULSE_SIZE_MIN,
            (PULSE_SIZE_MIN +
              Math.sin(pulse.position * Math.PI) *
                (PULSE_SIZE_MAX - PULSE_SIZE_MIN)) *
              depthAlpha * 1.2
          );

          const pulseGradient = ctx.createRadialGradient(
            pulseX,
            pulseY,
            0,
            pulseX,
            pulseY,
            pulseSize
          );
          const pulseOpacity = Math.max(
            0,
            Math.min(
              1,
              pulse.opacity * Math.sin(pulse.position * Math.PI) * opacity * 2.5
            )
          );

          pulseGradient.addColorStop(
            0,
            `${nodeA.color}${Math.floor(255 * pulseOpacity)
              .toString(16)
              .padStart(2, "0")}`
          );
          pulseGradient.addColorStop(
            0.5,
            `${nodeA.color}${Math.floor(180 * pulseOpacity)
              .toString(16)
              .padStart(2, "0")}`
          );
          pulseGradient.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.fillStyle = pulseGradient;
          ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
          ctx.fill();

          pulse.position += PULSE_SPEED * deltaTime;
          pulse.opacity = Math.max(
            0,
            pulse.opacity - PULSE_FADE_SPEED * deltaTime
          );

          return pulse.position < 1 && pulse.opacity > 0;
        });
      });
    },
    []
  );

  const updateNodes = useCallback(
    (
      deltaTime: number,
      width: number,
      height: number,
      progress: number,
      timestamp: number
    ) => {
      const nodes = nodesRef.current;

      nodes.forEach((node) => {
        const timeOffset =
          timestamp * NODE_MOVEMENT_FREQUENCY + node.movementOffset;

        const dx =
          Math.sin(timeOffset) *
            Math.cos(timeOffset * 0.7) *
            BASE_MOVEMENT_RANGE +
          Math.sin(timeOffset * 0.4) * MOVEMENT_VARIATION;

        const dy =
          Math.cos(timeOffset * 0.8) *
            Math.sin(timeOffset * 0.5) *
            BASE_MOVEMENT_RANGE +
          Math.cos(timeOffset * 0.6) * MOVEMENT_VARIATION;

        const dz = Math.sin(timeOffset * 0.3) * 0.4;

        const distanceX = node.originalX - node.x;
        const distanceY = node.originalY - node.y;
        const returnForceX =
          distanceX * RETURN_FORCE * (1 + Math.abs(distanceX) / MAX_OFFSET);
        const returnForceY =
          distanceY * RETURN_FORCE * (1 + Math.abs(distanceY) / MAX_OFFSET);

        node.vx += dx * deltaTime * 0.01 + returnForceX;
        node.vy += dy * deltaTime * 0.01 + returnForceY;
        node.vz += dz * deltaTime * 0.01;

        if (progress < 1) {
          node.initialScale = Math.min(1, node.initialScale + deltaTime * 0.01);
        }

        node.x += node.vx * deltaTime;
        node.y += node.vy * deltaTime;
        node.z += node.vz * deltaTime;

        const glowWave =
          Math.sin(timestamp * GLOW_WAVE_FREQUENCY + node.glowWaveOffset) * 0.5;
        node.glowIntensity =
          MIN_GLOW + (MAX_GLOW - MIN_GLOW) * (0.5 + glowWave * 0.5);

        node.vx *= Math.pow(VELOCITY_DAMPENING, deltaTime);
        node.vy *= Math.pow(VELOCITY_DAMPENING, deltaTime);
        node.vz *= Math.pow(VELOCITY_DAMPENING, deltaTime);

        node.x = Math.max(
          node.originalX - MAX_OFFSET,
          Math.min(node.originalX + MAX_OFFSET, node.x)
        );
        node.y = Math.max(
          node.originalY - MAX_OFFSET,
          Math.min(node.originalY + MAX_OFFSET, node.y)
        );
        node.z = Math.max(-Z_RANGE / 6, Math.min(Z_RANGE / 6, node.z));
      });
    },
    []
  );

  const drawAnimatedGradients = useCallback((ctx: CanvasRenderingContext2D, timestamp: number, width: number, height: number) => {
    ctx.save();
    
    // Create overlapping gradients with different animations
    GRADIENT_COLORS.forEach((gradientColor, index) => {
      const time = timestamp * gradientColor.speed;
      const angleOffset = (Math.PI * 2 / GRADIENT_COLORS.length) * index;
      const angle = time + angleOffset;
      
      // More complex movement pattern
      const xOffset = Math.cos(angle) * width * 0.35 + Math.sin(time * 0.3) * width * 0.1;
      const yOffset = Math.sin(angle * 0.7) * height * 0.35 + Math.cos(time * 0.4) * height * 0.1;
      
      const centerX = width / 2 + xOffset;
      const centerY = height / 2 + yOffset;
      const radius = Math.max(width, height) * gradientColor.scale;
      
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      
      // Enhanced gradient with more color stops
      gradient.addColorStop(0, `${gradientColor.color}${Math.floor(gradientColor.opacity * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(0.3, `${gradientColor.color}${Math.floor(gradientColor.opacity * 200).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(0.6, `${gradientColor.color}${Math.floor(gradientColor.opacity * 127).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    });
    
    ctx.restore();
  }, []);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp;
    }

    const deltaTime = Math.min(32, timestamp - lastTimeRef.current) / 16.67;
    lastTimeRef.current = timestamp;
    frameCountRef.current++;

    const progress = Math.min(1, (timestamp - startTimeRef.current) / INITIAL_ANIMATION_DURATION);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw animated gradients first (background layer)
    drawAnimatedGradients(ctx, timestamp, canvas.width, canvas.height);

    // Then draw neural network
    updateNodes(deltaTime, canvas.width, canvas.height, progress, timestamp);
    if (frameCountRef.current % CONNECTION_UPDATE_INTERVAL === 0) {
      updateConnections();
    }
    drawConnections(ctx, deltaTime, timestamp, progress);
    nodesRef.current.forEach(node => drawNode(ctx, node, timestamp, progress));

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [updateNodes, updateConnections, drawConnections, drawNode, drawAnimatedGradients]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext('2d', { alpha: true });
    const ctx = ctxRef.current;
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      nodesRef.current = initNodes(canvas.width, canvas.height);
      connectionsRef.current = [];
      startTimeRef.current = 0;
      gradientCacheRef.current.clear();
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

  useEffect(() => {
    const startFadeOut = () => {
      setTimeout(() => {
        const fadeInterval = setInterval(() => {
          opacityRef.current = Math.max(0.5, opacityRef.current - 0.02);
          if (opacityRef.current <= 0.5) {
            clearInterval(fadeInterval);
          }
        }, 16);
      }, 3500);
    };

    startFadeOut();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full bg-[#030409] transition-opacity duration-1000"
        style={{
          WebkitBackdropFilter: "blur(12px)",
          backdropFilter: "blur(12px)",
          zIndex: -1,
          opacity: opacityRef.current,
        }}
      />
    </div>
  );
};
