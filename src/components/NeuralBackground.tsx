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
  "#67E8F9",
  "#3B82F6",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
];

const NODE_COUNT = 33; // Further reduced for better performance
const CONNECTION_DISTANCE = 250;
const MAX_CONNECTIONS_PER_NODE = 1;
const BASE_SPEED = 0.1;
const MAX_GLOW = 1.2;
const MIN_GLOW = 0.3;
const PULSE_SPEED = 0.02;
const MIN_CONNECTION_LIFETIME = 6000;
const CONNECTION_UPDATE_INTERVAL = 45;
const LINE_DRAW_SPEED = 0.08;
const VELOCITY_DAMPENING = 0.92;
const Z_RANGE = 250;
const INITIAL_ANIMATION_DURATION = 1200;
const WAVE_FREQUENCY = 0.0003;
const PULSE_SIZE_MIN = 2;
const PULSE_SIZE_MAX = 4;
const PULSE_SPAWN_CHANCE = 0.003;
const PULSE_FADE_SPEED = 0.015;
const OSCILLATION_SPEED_RANGE = [0.001, 0.002];
const NODE_MOVEMENT_FREQUENCY = 0.0004;
const GLOW_WAVE_FREQUENCY = 0.0008;
const BASE_MOVEMENT_RANGE = 0.7;
const MOVEMENT_VARIATION = 0.4;
const RETURN_FORCE = 0.0003;
const MAX_OFFSET = 35;

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
        oscillationSpeed: OSCILLATION_SPEED_RANGE[0] + Math.random() * (OSCILLATION_SPEED_RANGE[1] - OSCILLATION_SPEED_RANGE[0]),
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

  const getOrCreateGradient = useCallback((ctx: CanvasRenderingContext2D, key: string, createGradient: () => CanvasGradient) => {
    if (!gradientCacheRef.current.has(key)) {
      gradientCacheRef.current.set(key, createGradient());
    }
    return gradientCacheRef.current.get(key)!;
  }, []);

  const drawNode = useCallback((
    ctx: CanvasRenderingContext2D,
    node: Node,
    timestamp: number,
    progress: number
  ) => {
    const scale = calculateScale(node.z);
    const currentScale = scale * (progress < 1 ? node.initialScale + (1 - node.initialScale) * progress : 1);
    const radiusModifier = Math.sin(timestamp * node.oscillationSpeed + node.oscillationOffset) * 0.3 + 1;
    const currentRadius = node.baseRadius * radiusModifier * currentScale;
    const alpha = Math.max(0, 1 - Math.abs(node.z) / Z_RANGE);

    ctx.save();

    const outerGradient = getOrCreateGradient(ctx, `outer-${node.color}-${alpha}`, () => {
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, currentRadius * 8);
      gradient.addColorStop(0, `${node.color}${Math.floor(alpha * 25).toString(16).padStart(2, "0")}`);
      gradient.addColorStop(0.5, `${node.color}${Math.floor(alpha * 12).toString(16).padStart(2, "0")}`);
      gradient.addColorStop(1, "transparent");
      return gradient;
    });

    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, currentRadius * 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 12 * node.glowIntensity * currentScale;
    ctx.shadowColor = node.color;

    const innerGradient = getOrCreateGradient(ctx, `inner-${node.color}-${alpha}`, () => {
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, currentRadius * 2);
      gradient.addColorStop(0, `${node.color}${Math.floor(alpha * 200).toString(16).padStart(2, "0")}`);
      gradient.addColorStop(1, `${node.color}${Math.floor(alpha * 80).toString(16).padStart(2, "0")}`);
      return gradient;
    });

    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, currentRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, [calculateScale, getOrCreateGradient]);

  const updateConnections = useCallback(() => {
    const nodes = nodesRef.current;
    const currentConnections = connectionsRef.current;

    currentConnections.forEach((conn) => {
      conn.lifetime--;
      conn.drawProgress = Math.min(1, conn.drawProgress + LINE_DRAW_SPEED);
    });

    connectionsRef.current = currentConnections.filter((conn) => conn.lifetime > 0);

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
              initialOpacity: 0.6,
              drawProgress: 0.3,
            });
          }
        }
      });
    });
  }, []);

  const drawConnections = useCallback((
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
      const distance = Math.max(0.001, Math.sqrt(dx * dx + dy * dy + dz * dz));
      const avgZ = (nodeA.z + nodeB.z) / 2;
      const depthAlpha = Math.max(0, 1 - Math.abs(avgZ) / Z_RANGE);

      connection.initialOpacity = Math.min(1, connection.initialOpacity + deltaTime * 0.01);
      const opacity = Math.min(1, progress * connection.initialOpacity * depthAlpha * 3);
      const alpha = Math.floor(Math.max(0, Math.min(255, strength * 0.7 * opacity * 255 * connection.drawProgress)))
        .toString(16)
        .padStart(2, "0");

      const midX = (nodeA.x + nodeB.x) / 2;
      const midY = (nodeA.y + nodeB.y) / 2;
      const waveAmplitude = Math.min(15, distance * 0.1) * depthAlpha;
      const waveOffset = Math.sin(timestamp * WAVE_FREQUENCY + nodeA.oscillationOffset) * waveAmplitude;
      const perpX = -dy / distance;
      const perpY = dx / distance;
      const controlX = midX + perpX * waveOffset;
      const controlY = midY + perpY * waveOffset;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(0.5, width * depthAlpha);

      const gradient = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
      gradient.addColorStop(0, `${nodeA.color}${alpha}`);
      gradient.addColorStop(0.5, `${nodeA.color}${alpha}`);
      gradient.addColorStop(1, `${nodeB.color}${alpha}`);

      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(nodeA.x, nodeA.y);
      ctx.quadraticCurveTo(controlX, controlY, nodeB.x, nodeB.y);
      ctx.stroke();
      ctx.restore();

      // Pulse animation
      if (connection.drawProgress > 0.3 && connection.pulses.length === 0 && Math.random() < PULSE_SPAWN_CHANCE) {
        connection.pulses.push({
          position: 0,
          opacity: 1
        });
      }

      connection.pulses = connection.pulses.filter(pulse => {
        const t = Math.max(0, Math.min(1, pulse.position));
        const pulseX = Math.pow(1 - t, 2) * nodeA.x + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * nodeB.x;
        const pulseY = Math.pow(1 - t, 2) * nodeA.y + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * nodeB.y;
        const pulseSize = Math.max(PULSE_SIZE_MIN, (PULSE_SIZE_MIN + Math.sin(pulse.position * Math.PI) * (PULSE_SIZE_MAX - PULSE_SIZE_MIN)) * depthAlpha);

        const pulseGradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, pulseSize);
        const pulseOpacity = Math.max(0, Math.min(1, pulse.opacity * Math.sin(pulse.position * Math.PI) * opacity * 2));

        pulseGradient.addColorStop(0, `${nodeA.color}${Math.floor(255 * pulseOpacity).toString(16).padStart(2, "0")}`);
        pulseGradient.addColorStop(0.5, `${nodeA.color}${Math.floor(150 * pulseOpacity).toString(16).padStart(2, "0")}`);
        pulseGradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.fillStyle = pulseGradient;
        ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        pulse.position += PULSE_SPEED * deltaTime;
        pulse.opacity = Math.max(0, pulse.opacity - PULSE_FADE_SPEED * deltaTime);

        return pulse.position < 1 && pulse.opacity > 0;
      });
    });
  }, []);

  const updateNodes = useCallback((
    deltaTime: number,
    width: number,
    height: number,
    progress: number,
    timestamp: number
  ) => {
    const nodes = nodesRef.current;

    nodes.forEach((node) => {
      const timeOffset = timestamp * NODE_MOVEMENT_FREQUENCY + node.movementOffset;
      
      const dx = Math.sin(timeOffset) * Math.cos(timeOffset * 0.7) * BASE_MOVEMENT_RANGE +
                 Math.sin(timeOffset * 0.4) * MOVEMENT_VARIATION;
      
      const dy = Math.cos(timeOffset * 0.8) * Math.sin(timeOffset * 0.5) * BASE_MOVEMENT_RANGE +
                 Math.cos(timeOffset * 0.6) * MOVEMENT_VARIATION;
      
      const dz = Math.sin(timeOffset * 0.3) * 0.4;

      const distanceX = node.originalX - node.x;
      const distanceY = node.originalY - node.y;
      const returnForceX = distanceX * RETURN_FORCE * (1 + Math.abs(distanceX) / MAX_OFFSET);
      const returnForceY = distanceY * RETURN_FORCE * (1 + Math.abs(distanceY) / MAX_OFFSET);

      node.vx += (dx * deltaTime * 0.01) + returnForceX;
      node.vy += (dy * deltaTime * 0.01) + returnForceY;
      node.vz += dz * deltaTime * 0.01;

      if (progress < 1) {
        node.initialScale = Math.min(1, node.initialScale + deltaTime * 0.01);
      }

      node.x += node.vx * deltaTime;
      node.y += node.vy * deltaTime;
      node.z += node.vz * deltaTime;

      const glowWave = Math.sin(timestamp * GLOW_WAVE_FREQUENCY + node.glowWaveOffset) * 0.5;
      node.glowIntensity = MIN_GLOW + (MAX_GLOW - MIN_GLOW) * (0.5 + glowWave * 0.5);

      node.vx *= Math.pow(VELOCITY_DAMPENING, deltaTime);
      node.vy *= Math.pow(VELOCITY_DAMPENING, deltaTime);
      node.vz *= Math.pow(VELOCITY_DAMPENING, deltaTime);

      node.x = Math.max(node.originalX - MAX_OFFSET, Math.min(node.originalX + MAX_OFFSET, node.x));
      node.y = Math.max(node.originalY - MAX_OFFSET, Math.min(node.originalY + MAX_OFFSET, node.y));
      node.z = Math.max(-Z_RANGE / 6, Math.min(Z_RANGE / 6, node.z));
    });
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

    updateNodes(deltaTime, canvas.width, canvas.height, progress, timestamp);

    if (frameCountRef.current % CONNECTION_UPDATE_INTERVAL === 0) {
      updateConnections();
    }

    drawConnections(ctx, deltaTime, timestamp, progress);
    nodesRef.current.forEach((node) => drawNode(ctx, node, timestamp, progress));

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [updateNodes, updateConnections, drawConnections, drawNode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext("2d", { alpha: true });
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
    window.addEventListener("resize", handleResize);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [animate, initNodes]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full bg-neural-bg opacity-50"
      style={{
        WebkitBackdropFilter: "blur(8px)",
        backdropFilter: "blur(8px)",
        zIndex: -1
      }}
    />
  );
};
