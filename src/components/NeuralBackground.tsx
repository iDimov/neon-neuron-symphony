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
  movementOffset: number; // Add this new property
  glowWaveOffset: number; // Add this new property
  originalX: number;
  originalY: number;
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
  drawProgress: number; // Add this for line drawing animation
}

interface MousePosition {
  x: number;
  y: number;
  active: boolean;
}

const COLORS = [
  "#67E8F9", // Cyan-300 (from)
  "#3B82F6", // Blue-500 (via)
  "#8B5CF6", // Violet-500 (to)
  "#A855F7", // Purple-500
  "#EC4899", // Pink-500
];

const NODE_COUNT = 55;
const CONNECTION_DISTANCE = 350;
const MAX_CONNECTIONS_PER_NODE = 1;
const BASE_SPEED = 0.15;
const GLOW_SPEED = 0.002; // Even slower for smoother transitions
const MAX_GLOW = 1.4; // Further reduced glow
const MIN_GLOW = 0.2; // Lower minimum glow
const PULSE_SPEED = 0.02; // Even faster movement
const MIN_CONNECTION_LIFETIME = 8000; // Even longer lifetime for more stability
const CONNECTION_UPDATE_INTERVAL = 30; // More frequent updates
const LINE_DRAW_SPEED = 0.08; // Faster line drawing
const MOUSE_INFLUENCE_RADIUS = 350; // Slightly reduced
const MOUSE_REPEL_STRENGTH = 1.8; // Slightly reduced
const MOUSE_ATTRACT_STRENGTH = 0.4; // Slightly stronger attract
const MOUSE_FORCE_TRANSITION = 0.7; // Point where repel changes to attract
const MOUSE_GLOW_INTENSITY = 1.4; // Reduced mouse glow
const VELOCITY_DAMPENING = 0.92; // Less dampening for more continuous movement
const FORCE_FIELD_STRENGTH = 0.7; // Reduced force
const MOUSE_VELOCITY_MEMORY = 0.95; // Increased for smoother mouse tracking
const Z_FORCE_MULTIPLIER = 0.15; // More subtle depth movement
const Z_RANGE = 300; // Maximum Z-depth for 3D effect
const INITIAL_ANIMATION_DURATION = 1500; // Faster initial animation
const WAVE_FREQUENCY = 0.0003; // Slower waves
const PULSE_SIZE_MIN = 2;
const PULSE_SIZE_MAX = 4; // Slightly smaller
const MAX_PULSE_COUNT = 1;
const PULSE_SPAWN_CHANCE = 0.005; // Much lower spawn chance
const PULSE_FADE_SPEED = 0.01; // Faster fade out
const OSCILLATION_SPEED_RANGE = [0.001, 0.003]; // Slightly faster oscillation
const NODE_MOVEMENT_FREQUENCY = 0.0005; // Faster base movement
const GLOW_WAVE_FREQUENCY = 0.0008; // Faster glow pulsing
const GLOW_SECONDARY_FREQUENCY = 0.001;
const GLOW_TERTIARY_FREQUENCY = 0.0012;
const BASE_MOVEMENT_RANGE = 0.9; // More movement range
const MOVEMENT_VARIATION = 0.6; // More variation
const RETURN_FORCE = 0.0002; // Less return force for more freedom
const MAX_OFFSET = 45; // Larger movement radius
const GLOW_VARIATION = 0.35; // More glow variation

// Add these new constants for more complex movement
const MICRO_MOVEMENT_SPEED = 0.003; // Speed of micro-movements
const WAVE_MOVEMENT_SPEED = 0.001; // Speed of wave-like movements
const MOVEMENT_AMPLITUDE = 0.6; // Amplitude of movements

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
  const prevMousePosition = useRef({ x: 0, y: 0 });
  const mouseVelocity = useRef({ x: 0, y: 0 });

  const initNodes = (width: number, height: number) => {
    return Array.from({ length: NODE_COUNT }, () => {
      const baseRadius = Math.random() * 2 + 2;
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
        glowDirection: Math.random() > 0.5 ? 1 : -1,
        connections: 0,
        oscillationOffset: Math.random() * Math.PI * 2,
        oscillationSpeed:
          OSCILLATION_SPEED_RANGE[0] +
          Math.random() *
            (OSCILLATION_SPEED_RANGE[1] - OSCILLATION_SPEED_RANGE[0]),
        initialScale: 0, // Start at 0 for fade-in animation
        movementOffset: Math.random() * Math.PI * 2,
        glowWaveOffset: Math.random() * Math.PI * 2,
      };
    });
  };

  const calculateScale = (z: number) => {
    return 1 + (z / Z_RANGE) * 0.5; // Scale between 0.5 and 1.5 based on Z position
  };

  const applyMouseInfluence = (node: Node, deltaTime: number) => {
    if (!mousePositionRef.current.active) {
      // Gradual return to normal state when mouse leaves
      node.glowIntensity = Math.max(
        MIN_GLOW,
        node.glowIntensity - deltaTime * 0.1
      );
      return;
    }

    // Calculate mouse velocity with smoothing
    mouseVelocity.current.x = mouseVelocity.current.x * MOUSE_VELOCITY_MEMORY + 
      (mousePositionRef.current.x - prevMousePosition.current.x) * (1 - MOUSE_VELOCITY_MEMORY);
    mouseVelocity.current.y = mouseVelocity.current.y * MOUSE_VELOCITY_MEMORY + 
      (mousePositionRef.current.y - prevMousePosition.current.y) * (1 - MOUSE_VELOCITY_MEMORY);

    const mouseSpeed = Math.sqrt(
      mouseVelocity.current.x ** 2 + mouseVelocity.current.y ** 2
    );

    const scale = calculateScale(node.z);
    const dx = mousePositionRef.current.x - node.x;
    const dy = mousePositionRef.current.y - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy) / scale;

    if (distance < MOUSE_INFLUENCE_RADIUS) {
      // Smooth influence falloff
      const influence = Math.pow(1 - distance / MOUSE_INFLUENCE_RADIUS, 2);
      
      // Dynamic force field effect
      const angle = Math.atan2(dy, dx);
      const forceFieldX = Math.cos(angle + Math.PI / 2);
      const forceFieldY = Math.sin(angle + Math.PI / 2);

      // Calculate repel/attract strength based on distance
      const transitionPoint = MOUSE_INFLUENCE_RADIUS * MOUSE_FORCE_TRANSITION;
      const strength = distance < transitionPoint
        ? -MOUSE_REPEL_STRENGTH * (1 - distance / transitionPoint)
        : MOUSE_ATTRACT_STRENGTH * (distance - transitionPoint) / (MOUSE_INFLUENCE_RADIUS - transitionPoint);

      // Apply forces with mouse velocity influence
      const velocityEffect = Math.min(0.1, mouseSpeed * 0.03); // Cap the velocity effect
      node.vx += (
        (dx / distance) * influence * strength + 
        forceFieldX * FORCE_FIELD_STRENGTH * influence +
        mouseVelocity.current.x * velocityEffect
      ) * deltaTime;
      
      node.vy += (
        (dy / distance) * influence * strength + 
        forceFieldY * FORCE_FIELD_STRENGTH * influence +
        mouseVelocity.current.y * velocityEffect
      ) * deltaTime;

      // Dynamic Z-axis movement
      if (distance < transitionPoint) {
        const zForce = (Math.sin(distance / transitionPoint * Math.PI) * 
          Z_FORCE_MULTIPLIER * influence * strength);
        node.vz += zForce * deltaTime;
      }

      // Enhanced glow effect
      const targetGlow = MAX_GLOW * MOUSE_GLOW_INTENSITY * influence;
      node.glowIntensity = node.glowIntensity * 0.9 + targetGlow * 0.1;
    }

    // Update previous mouse position
    prevMousePosition.current.x = mousePositionRef.current.x;
    prevMousePosition.current.y = mousePositionRef.current.y;
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
      `${node.color}${Math.floor(alpha * 25)
        .toString(16)
        .padStart(2, "0")}`
    );
    outerGradient.addColorStop(
      0.5,
      `${node.color}${Math.floor(alpha * 12)
        .toString(16)
        .padStart(2, "0")}`
    );
    outerGradient.addColorStop(1, "transparent");

    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Core glow with depth effect
    ctx.shadowBlur = 12 * node.glowIntensity * currentScale;
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
      `${node.color}${Math.floor(alpha * 200)
        .toString(16)
        .padStart(2, "0")}`
    );
    innerGradient.addColorStop(
      1,
      `${node.color}${Math.floor(alpha * 80)
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
      `#ffffff${Math.floor(alpha * 200)
        .toString(16)
        .padStart(2, "0")}`
    );
    highlightGradient.addColorStop(
      1,
      `${node.color}${Math.floor(alpha * 40)
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

    // Update existing connections
    currentConnections.forEach((conn) => {
      conn.lifetime--;
      conn.drawProgress = Math.min(1, conn.drawProgress + LINE_DRAW_SPEED);
    });

    // Filter out dead connections
    connectionsRef.current = currentConnections.filter(
      (conn) => conn.lifetime > 0
    );

    // Reset connection counts
    nodes.forEach((node) => (node.connections = 0));
    connectionsRef.current.forEach((conn) => {
      conn.nodeA.connections++;
      conn.nodeB.connections++;
    });

    // Create new connections
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
              lifetime: MIN_CONNECTION_LIFETIME + Math.random() * 3000,
              width: Math.random() * 2 + 1.5,
              initialOpacity: 0.6, // Higher initial opacity
              drawProgress: 0.3, // Start with more progress
            });
          }
        }
      });
    });
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
      const { nodeA, nodeB, strength, width } = connection;
      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const dz = nodeB.z - nodeB.z;

      // Safety check for zero distance
      const distance = Math.max(0.001, Math.sqrt(dx * dx + dy * dy + dz * dz));

      const avgZ = (nodeA.z + nodeB.z) / 2;
      const depthAlpha = Math.max(0, 1 - Math.abs(avgZ) / Z_RANGE);

      connection.initialOpacity = Math.min(1, connection.initialOpacity + deltaTime * 0.01);
      const opacity = Math.min(1, progress * connection.initialOpacity * depthAlpha * 3); // Reduced from 4
      const alpha = Math.floor(
        Math.max(0, Math.min(255, strength * 0.7 * opacity * 255 * connection.drawProgress)) // Reduced from 0.9
      ).toString(16).padStart(2, "0");
      
      // Calculate curve control point with safety checks
      const midX = (nodeA.x + nodeB.x) / 2;
      const midY = (nodeA.y + nodeB.y) / 2;
      const waveAmplitude = Math.min(15, distance * 0.1) * depthAlpha;
      const waveOffset = Math.sin(timestamp * WAVE_FREQUENCY + nodeA.oscillationOffset) * waveAmplitude;
      
      // Calculate control points for the curve
      const perpX = -dy / distance;
      const perpY = dx / distance;
      const controlX = midX + perpX * waveOffset;
      const controlY = midY + perpY * waveOffset;

      // Draw the connection line with animation
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(0.5, width * depthAlpha); // Increased minimum line width
      
      // Create gradient with higher opacity
      const gradient = ctx.createLinearGradient(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
      gradient.addColorStop(0, `${nodeA.color}${alpha}`);
      gradient.addColorStop(0.5, `${nodeA.color}${alpha}`);
      gradient.addColorStop(1, `${nodeB.color}${alpha}`);
      
      ctx.strokeStyle = gradient;
      
      // Draw the path
      ctx.beginPath();
      ctx.moveTo(nodeA.x, nodeA.y);
      ctx.quadraticCurveTo(controlX, controlY, nodeB.x, nodeB.y);
      ctx.stroke();
      ctx.restore();

      // Only draw pulses if the line is mostly drawn
      if (connection.drawProgress > 0.3) {
        // More random and rare pulse creation
        if (connection.pulses.length === 0 && 
            Math.random() < PULSE_SPAWN_CHANCE) { // Removed deltaTime multiplication
          connection.pulses.push({
            position: 0,
            opacity: 1
          });
        }

        // Update and draw each pulse
        connection.pulses = connection.pulses.filter(pulse => {
          const t = Math.max(0, Math.min(1, pulse.position));
          
          // Calculate pulse position along the curve
          const pulseX = Math.pow(1 - t, 2) * nodeA.x + 
                         2 * (1 - t) * t * controlX + 
                         Math.pow(t, 2) * nodeB.x;
          const pulseY = Math.pow(1 - t, 2) * nodeA.y + 
                         2 * (1 - t) * t * controlY + 
                         Math.pow(t, 2) * nodeB.y;

          // Calculate pulse size with smooth animation
          const pulseSize = Math.max(PULSE_SIZE_MIN, 
            (PULSE_SIZE_MIN + Math.sin(pulse.position * Math.PI) * 
            (PULSE_SIZE_MAX - PULSE_SIZE_MIN)) * depthAlpha);

          // Draw the pulse with enhanced visibility
          const pulseGradient = ctx.createRadialGradient(
            pulseX, pulseY, 0,
            pulseX, pulseY, pulseSize
          );
          
          const pulseOpacity = Math.max(0, Math.min(1, 
            pulse.opacity * Math.sin(pulse.position * Math.PI) * opacity * 2)); // More visibility
          
          pulseGradient.addColorStop(0, `${nodeA.color}${Math.floor(255 * pulseOpacity)
            .toString(16)
            .padStart(2, "0")}`);
          pulseGradient.addColorStop(0.5, `${nodeA.color}${Math.floor(150 * pulseOpacity)
            .toString(16)
            .padStart(2, "0")}`);
          pulseGradient.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.fillStyle = pulseGradient;
          ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
          ctx.fill();

          // Update pulse position and opacity
          pulse.position += PULSE_SPEED * deltaTime;
          pulse.opacity = Math.max(0, pulse.opacity - PULSE_FADE_SPEED * deltaTime);

          return pulse.position < 1 && pulse.opacity > 0;
        });
      }
    });
  };

  const updateNodes = (
    deltaTime: number,
    width: number,
    height: number,
    progress: number,
    timestamp: number
  ) => {
    const nodes = nodesRef.current;
    const padding = 50;

    nodes.forEach((node) => {
      const timeOffset = timestamp * NODE_MOVEMENT_FREQUENCY + node.movementOffset;
      
      // More complex, organic movement pattern
      const dx = (
        // Base movement
        Math.sin(timeOffset) * Math.cos(timeOffset * 0.7) * BASE_MOVEMENT_RANGE +
        // Medium frequency movements
        Math.sin(timeOffset * 0.4) * MOVEMENT_VARIATION +
        Math.cos(timeOffset * 0.3) * MOVEMENT_VARIATION * 0.8 +
        // Fast micro-movements
        Math.sin(timeOffset * 2.2) * MOVEMENT_VARIATION * 0.3 +
        Math.cos(timeOffset * 2.5) * MOVEMENT_VARIATION * 0.2 +
        // Slow wave-like movement
        Math.sin(timeOffset * 0.1 + node.oscillationOffset) * MOVEMENT_AMPLITUDE
      );
      const dy = (
        // Base movement
        Math.cos(timeOffset * 0.8) * Math.sin(timeOffset * 0.5) * BASE_MOVEMENT_RANGE +
        // Medium frequency movements
        Math.cos(timeOffset * 0.6) * MOVEMENT_VARIATION +
        Math.sin(timeOffset * 0.4) * MOVEMENT_VARIATION * 0.8 +
        // Fast micro-movements
        Math.cos(timeOffset * 2.3) * MOVEMENT_VARIATION * 0.3 +
        Math.sin(timeOffset * 2.6) * MOVEMENT_VARIATION * 0.2 +
        // Slow wave-like movement
        Math.cos(timeOffset * 0.1 + node.oscillationOffset) * MOVEMENT_AMPLITUDE
      );
      const dz = (
        Math.sin(timeOffset * 0.3) * 0.6 +
        Math.cos(timeOffset * 0.5) * 0.4 +
        Math.sin(timeOffset * 0.8) * 0.3 +
        Math.cos(timeOffset * 1.6) * 0.2 +
        // Add more varied Z movement
        Math.sin(timeOffset * 2.2 + node.oscillationOffset) * 0.15
      );

      // Calculate return force to original position with easing
      const distanceX = node.originalX - node.x;
      const distanceY = node.originalY - node.y;
      const returnForceX = distanceX * RETURN_FORCE * (1 + Math.abs(distanceX) / MAX_OFFSET);
      const returnForceY = distanceY * RETURN_FORCE * (1 + Math.abs(distanceY) / MAX_OFFSET);

      // Apply forces with reduced strength
      node.vx += (dx * deltaTime * 0.01) + returnForceX;
      node.vy += (dy * deltaTime * 0.01) + returnForceY;
      node.vz += dz * deltaTime * 0.01;

      // Update initial scale for fade-in animation
      if (progress < 1) {
        node.initialScale = Math.min(1, node.initialScale + deltaTime * 0.01);
      }

      applyMouseInfluence(node, deltaTime);

      // Apply movement with smooth transitions
      node.x += node.vx * deltaTime;
      node.y += node.vy * deltaTime;
      node.z += node.vz * deltaTime;

      // Enhanced glow animation with more variation
      const glowWave = 
        Math.sin(timestamp * GLOW_WAVE_FREQUENCY + node.glowWaveOffset) * 0.7 + 
        Math.sin(timestamp * GLOW_SECONDARY_FREQUENCY + node.glowWaveOffset * 1.5) * 0.4 +
        Math.sin(timestamp * GLOW_TERTIARY_FREQUENCY + node.glowWaveOffset * 0.7) * 0.3 +
        Math.sin(timestamp * 0.003 + node.glowWaveOffset * 0.3) * 0.2;

      // More dynamic position variation
      const positionVariation = 
        Math.sin(node.x * 0.01 + timestamp * 0.0003) * 
        Math.cos(node.y * 0.01 + timestamp * 0.0004) * 
        GLOW_VARIATION * 
        (1 + Math.sin(timestamp * 0.0001) * 0.3); // Added slow modulation

      const baseGlow = (MAX_GLOW + MIN_GLOW) / 2;
      const glowRange = (MAX_GLOW - MIN_GLOW) / 2;
      node.glowIntensity = 
        baseGlow + 
        (glowWave * glowRange * 0.7) + 
        positionVariation;

      // Add subtle random variation
      node.glowIntensity += (Math.random() - 0.5) * 0.02;

      // Ensure glow stays within bounds with smooth clamping
      node.glowIntensity = MIN_GLOW + 
        (MAX_GLOW - MIN_GLOW) * 
        (1 - Math.cos(Math.max(0, Math.min(1, (node.glowIntensity - MIN_GLOW) / (MAX_GLOW - MIN_GLOW))) * Math.PI)) / 2;

      // Stronger velocity dampening
      node.vx *= Math.pow(VELOCITY_DAMPENING, deltaTime);
      node.vy *= Math.pow(VELOCITY_DAMPENING, deltaTime);
      node.vz *= Math.pow(VELOCITY_DAMPENING, deltaTime);

      // Keep within tighter bounds relative to original position
      node.x = Math.max(node.originalX - MAX_OFFSET, Math.min(node.originalX + MAX_OFFSET, node.x));
      node.y = Math.max(node.originalY - MAX_OFFSET, Math.min(node.originalY + MAX_OFFSET, node.y));
      node.z = Math.max(-Z_RANGE / 6, Math.min(Z_RANGE / 6, node.z));
    });
  };

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

    // Calculate animation progress
    const progress = Math.min(
      1,
      (timestamp - startTimeRef.current) / INITIAL_ANIMATION_DURATION
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateNodes(deltaTime, canvas.width, canvas.height, progress, timestamp);

    if (frameCountRef.current % CONNECTION_UPDATE_INTERVAL === 0) {
      updateConnections(progress);
    }

    // Sort nodes by Z-depth for proper rendering
    const sortedNodes = [...nodesRef.current].sort((a, b) => b.z - a.z);

    drawConnections(ctx, deltaTime, timestamp, progress);
    sortedNodes.forEach((node) => drawNode(ctx, node, timestamp, progress));

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full bg-neural-bg opacity-50"
      style={{
        WebkitBackdropFilter: "blur(8px)",
        backdropFilter: "blur(8px)",
      }}
    />
  );
};
