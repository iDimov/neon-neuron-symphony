import React, { useCallback, useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  z: number; // Added for 3D effect
  vx: number;
  vy: number;
  vz: number; // Added for 3D effect
  radius: number;
  color: string;
  glowIntensity: number;
  glowDirection: 1 | -1;
  connections: number;
  oscillationOffset: number;
  oscillationSpeed: number;
  baseRadius: number;
  initialScale: number; // For fade-in animation
}

interface Connection {
  nodeA: Node;
  nodeB: Node;
  pulsePosition: number;
  pulseDirection: 1;
  strength: number;
  lifetime: number;
  width: number;
  initialOpacity: number; // For fade-in animation
  pulses: {
    position: number;
    opacity: number;
  }[];
}

interface MousePosition {
  x: number;
  y: number;
  active: boolean;
}

const COLORS = [
  "#0EA5E9", // Electric Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#A855F7", // Bright Purple
  "#2DD4BF", // Teal
];

const NODE_COUNT = 55;
const CONNECTION_DISTANCE = 300;
const MAX_CONNECTIONS_PER_NODE = 3;
const BASE_SPEED = 0.15;
const GLOW_SPEED = 0.006;
const MAX_GLOW = 1.8;
const MIN_GLOW = 0.3;
const PULSE_SPEED = 0.01; // Slightly slower for smoother movement
const MIN_CONNECTION_LIFETIME = 800; // Longer lifetime for more stable connections
const CONNECTION_UPDATE_INTERVAL = 90;
const MOUSE_INFLUENCE_RADIUS = 250;
const MOUSE_REPEL_STRENGTH = 0.6;
const MOUSE_ATTRACT_STRENGTH = 0.2;
const OSCILLATION_SPEED_RANGE = [0.001, 0.005];
const Z_RANGE = 300; // Maximum Z-depth for 3D effect
const INITIAL_ANIMATION_DURATION = 3000; // Duration of initial animation in ms
const WAVE_FREQUENCY = 0.001; // Slightly faster wave animation
const PULSE_SIZE_MIN = 1; // New constant
const PULSE_SIZE_MAX = 5; // New constant
const MAX_PULSE_COUNT = 1; // Maximum number of pulses per connection
const PULSE_SPAWN_CHANCE = 0.01; // Lower chance to make pulses more rare
const PULSE_FADE_SPEED = 0.005; // New constant for controlling fade out speed

export const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const lastTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const mousePositionRef = useRef<MousePosition>({ x: 0, y: 0, active: false });

  const initNodes = (width: number, height: number) => {
    return Array.from({ length: NODE_COUNT }, () => {
      const baseRadius = Math.random() * 2 + 2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * Z_RANGE - Z_RANGE / 2,
        vx: (Math.random() - 0.5) * BASE_SPEED,
        vy: (Math.random() - 0.5) * BASE_SPEED,
        vz: (Math.random() - 0.5) * BASE_SPEED * 0.5,
        radius: baseRadius,
        baseRadius,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        glowIntensity: Math.random() * (MAX_GLOW - MIN_GLOW) + MIN_GLOW,
        glowDirection: Math.random() > 0.5 ? 1 : -1,
        connections: 0,
        oscillationOffset: Math.random() * Math.PI * 2,
        oscillationSpeed:
          OSCILLATION_SPEED_RANGE[0] +
          Math.random() *
            (OSCILLATION_SPEED_RANGE[1] - OSCILLATION_SPEED_RANGE[0]),
        initialScale: 0, // Start at 0 for fade-in animation
      };
    });
  };

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mousePositionRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
    },
    []
  );

  const handleMouseLeave = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      mousePositionRef.current.active = false;
    },
    []
  );

  const calculateScale = (z: number) => {
    return 1 + (z / Z_RANGE) * 0.5; // Scale between 0.5 and 1.5 based on Z position
  };

  const applyMouseInfluence = (node: Node, deltaTime: number) => {
    if (!mousePositionRef.current.active) return;

    const scale = calculateScale(node.z);
    const dx = mousePositionRef.current.x - node.x;
    const dy = mousePositionRef.current.y - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy) / scale;

    if (distance < MOUSE_INFLUENCE_RADIUS) {
      const influence = (1 - distance / MOUSE_INFLUENCE_RADIUS) ** 2;
      const strength =
        distance < MOUSE_INFLUENCE_RADIUS * 0.4
          ? -MOUSE_REPEL_STRENGTH
          : MOUSE_ATTRACT_STRENGTH;

      node.vx += (dx / distance) * influence * strength * deltaTime;
      node.vy += (dy / distance) * influence * strength * deltaTime;
      node.vz += (Math.random() - 0.5) * influence * strength * deltaTime; // Add some Z movement

      node.glowIntensity = Math.min(
        MAX_GLOW * 1.2,
        node.glowIntensity + influence * 0.1
      );
    }
  };

  const drawNode = (
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

    ctx.save();

    const radiusModifier =
      Math.sin(timestamp * node.oscillationSpeed + node.oscillationOffset) *
        0.3 +
      1;
    const currentRadius = node.baseRadius * radiusModifier * currentScale;

    // Enhanced glow effect with depth
    const glowRadius = currentRadius * 8 * currentScale;
    const outerGradient = ctx.createRadialGradient(
      node.x,
      node.y,
      0,
      node.x,
      node.y,
      glowRadius
    );
    const alpha = Math.max(0, 1 - Math.abs(node.z) / Z_RANGE);
    outerGradient.addColorStop(
      0,
      `${node.color}${Math.floor(alpha * 34)
        .toString(16)
        .padStart(2, "0")}`
    );
    outerGradient.addColorStop(
      0.5,
      `${node.color}${Math.floor(alpha * 17)
        .toString(16)
        .padStart(2, "0")}`
    );
    outerGradient.addColorStop(1, "transparent");

    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Core glow with depth effect
    ctx.shadowBlur = 15 * node.glowIntensity * currentScale;
    ctx.shadowColor = node.color;

    const innerGradient = ctx.createRadialGradient(
      node.x,
      node.y,
      0,
      node.x,
      node.y,
      currentRadius * 2
    );
    innerGradient.addColorStop(
      0,
      `${node.color}${Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`
    );
    innerGradient.addColorStop(
      1,
      `${node.color}${Math.floor(alpha * 102)
        .toString(16)
        .padStart(2, "0")}`
    );

    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, currentRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core highlight with depth
    const highlightGradient = ctx.createRadialGradient(
      node.x - currentRadius * 0.3,
      node.y - currentRadius * 0.3,
      0,
      node.x,
      node.y,
      currentRadius
    );
    highlightGradient.addColorStop(
      0,
      `#ffffff${Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, "0")}`
    );
    highlightGradient.addColorStop(
      1,
      `${node.color}${Math.floor(alpha * 51)
        .toString(16)
        .padStart(2, "0")}`
    );

    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const updateConnections = (progress: number) => {
    const nodes = nodesRef.current;
    const currentConnections = connectionsRef.current;

    currentConnections.forEach((conn) => {
      conn.lifetime--;
    });

    connectionsRef.current = currentConnections.filter(
      (conn) => conn.lifetime > 0
    );

    nodes.forEach((node) => (node.connections = 0));
    connectionsRef.current.forEach((conn) => {
      conn.nodeA.connections++;
      conn.nodeB.connections++;
    });

    // Only create new connections after initial animation
    if (progress >= 1) {
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
                pulseDirection: 1,
                strength: 1 - distance / CONNECTION_DISTANCE,
                lifetime: MIN_CONNECTION_LIFETIME + Math.random() * 100,
                width: Math.random() * 1 + 1,
                initialOpacity: 0,
              });
            }
          }
        });
      });
    }
  };

  const drawConnections = (
    ctx: CanvasRenderingContext2D,
    deltaTime: number,
    timestamp: number,
    progress: number
  ) => {
    const sortedConnections = [...connectionsRef.current].sort((a, b) => {
      const aZ = (a.nodeA.z + a.nodeB.z) / 2;
      const bZ = (b.nodeA.z + b.nodeB.z) / 2;
      return bZ - aZ;
    });

    sortedConnections.forEach((connection) => {
      const { nodeA, nodeB, pulsePosition, strength, width } = connection;
      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const dz = nodeB.z - nodeB.z;

      const avgZ = (nodeA.z + nodeB.z) / 2;
      const depthAlpha = Math.max(0, 1 - Math.abs(avgZ) / Z_RANGE);

      connection.initialOpacity = Math.min(
        1,
        connection.initialOpacity + deltaTime * 0.01
      );
      const opacity = progress * connection.initialOpacity * depthAlpha;

      // Calculate curve control point
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const midX = (nodeA.x + nodeB.x) / 2;
      const midY = (nodeA.y + nodeB.y) / 2;
      const waveAmplitude = Math.min(15, distance * 0.1) * depthAlpha;
      const waveOffset = Math.sin(timestamp * WAVE_FREQUENCY + nodeA.oscillationOffset) * waveAmplitude;
      const perpX = -dy / distance;
      const perpY = dx / distance;
      const controlX = midX + perpX * waveOffset;
      const controlY = midY + perpY * waveOffset;

      // Draw the curved path
      ctx.beginPath();
      ctx.moveTo(nodeA.x, nodeA.y);
      ctx.quadraticCurveTo(controlX, controlY, nodeB.x, nodeB.y);

      const gradient = ctx.createLinearGradient(
        nodeA.x,
        nodeA.y,
        nodeB.x,
        nodeB.y
      );
      const alpha = Math.floor(strength * 0.4 * opacity * 255)
        .toString(16)
        .padStart(2, "0");
      gradient.addColorStop(0, `${nodeA.color}${alpha}`);
      gradient.addColorStop(0.5, `${nodeA.color}${alpha}`);
      gradient.addColorStop(1, `${nodeB.color}${alpha}`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = width * depthAlpha;
      ctx.stroke();

      // Pulse management
      if (connection.pulses.length < MAX_PULSE_COUNT && Math.random() < PULSE_SPAWN_CHANCE) {
        connection.pulses.push({
          position: 0,
          opacity: 1
        });
      }

      // Update and draw each pulse
      connection.pulses = connection.pulses.filter(pulse => {
        const t = pulse.position;
        const pulseX = Math.pow(1 - t, 2) * nodeA.x + 
                       2 * (1 - t) * t * controlX + 
                       Math.pow(t, 2) * nodeB.x;
        const pulseY = Math.pow(1 - t, 2) * nodeA.y + 
                       2 * (1 - t) * t * controlY + 
                       Math.pow(t, 2) * nodeB.y;

        const pulseSize = (PULSE_SIZE_MIN + 
          Math.sin(pulse.position * Math.PI) * (PULSE_SIZE_MAX - PULSE_SIZE_MIN)) * 
          depthAlpha;

        const pulseGradient = ctx.createRadialGradient(
          pulseX,
          pulseY,
          0,
          pulseX,
          pulseY,
          pulseSize
        );
        
        const pulseOpacity = pulse.opacity * Math.sin(pulse.position * Math.PI) * opacity;
        pulseGradient.addColorStop(0, `${nodeA.color}${Math.floor(255 * pulseOpacity)
          .toString(16)
          .padStart(2, "0")}`);
        pulseGradient.addColorStop(0.3, `${nodeA.color}${Math.floor(180 * pulseOpacity)
          .toString(16)
          .padStart(2, "0")}`);
        pulseGradient.addColorStop(0.6, `${nodeA.color}${Math.floor(100 * pulseOpacity)
          .toString(16)
          .padStart(2, "0")}`);
        pulseGradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = pulseGradient;
        ctx.fill();

        // Update pulse position
        pulse.position += PULSE_SPEED * deltaTime;
        pulse.opacity = Math.max(0, pulse.opacity - PULSE_FADE_SPEED * deltaTime);

        // Keep pulse if it hasn't reached the end
        return pulse.position <= 1 && pulse.opacity > 0;
      });
    });
  };

  const updateNodes = (
    deltaTime: number,
    width: number,
    height: number,
    progress: number
  ) => {
    const nodes = nodesRef.current;
    const padding = 50;

    nodes.forEach((node) => {
      // Update initial scale for fade-in animation
      if (progress < 1) {
        node.initialScale = Math.min(1, node.initialScale + deltaTime * 0.01);
      }

      applyMouseInfluence(node, deltaTime);

      node.x += node.vx * deltaTime;
      node.y += node.vy * deltaTime;
      node.z += node.vz * deltaTime;

      // Smooth deceleration
      node.vx *= 0.98;
      node.vy *= 0.98;
      node.vz *= 0.98;

      // Enhanced boundary behavior with Z-axis
      const boundaryForce = 0.002 * deltaTime;
      if (node.x < padding) node.vx += boundaryForce;
      if (node.x > width - padding) node.vx -= boundaryForce;
      if (node.y < padding) node.vy += boundaryForce;
      if (node.y > height - padding) node.vy -= boundaryForce;
      if (Math.abs(node.z) > Z_RANGE / 2)
        node.vz -= Math.sign(node.z) * boundaryForce;

      // Keep within bounds
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));
      node.z = Math.max(-Z_RANGE / 2, Math.min(Z_RANGE / 2, node.z));

      // Smooth glow animation
      node.glowIntensity += GLOW_SPEED * node.glowDirection * deltaTime;
      if (node.glowIntensity >= MAX_GLOW || node.glowIntensity <= MIN_GLOW) {
        node.glowDirection *= -1;
      }
    });
  };

  const animate = (timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp;
    }

    const deltaTime = Math.min(32, timestamp - lastTimeRef.current) / 16.67;
    lastTimeRef.current = timestamp;
    frameCountRef.current++;

    // Calculate animation progress
    const progress = Math.min(
      1,
      (timestamp - startTimeRef.current) / INITIAL_ANIMATION_DURATION
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateNodes(deltaTime, canvas.width, canvas.height, progress);

    if (frameCountRef.current % CONNECTION_UPDATE_INTERVAL === 0) {
      updateConnections(progress);
    }

    // Sort nodes by Z-depth for proper rendering
    const sortedNodes = [...nodesRef.current].sort((a, b) => b.z - a.z);

    drawConnections(ctx, deltaTime, timestamp, progress);
    sortedNodes.forEach((node) => drawNode(ctx, node, timestamp, progress));

    animationFrameRef.current = requestAnimationFrame(animate);
  };

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
      startTimeRef.current = 0; // Reset animation on resize
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 w-full h-full bg-neural-bg"
      style={{
        WebkitBackdropFilter: "blur(8px)",
        backdropFilter: "blur(8px)",
      }}
    />
  );
};
