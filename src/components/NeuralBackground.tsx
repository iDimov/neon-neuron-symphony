import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
// @ts-ignore
import NeuralWorker from '../workers/neuralWorker.js?worker';

const GRADIENT_COLORS = [
  { color: "#3B82F6", opacity: 0.05, speed: 0.00008, scale: 1.2 }, // Blue
  { color: "#8B5CF6", opacity: 0.05, speed: 0.0001, scale: 1.1 }, // Purple
  { color: "#EC4899", opacity: 0.05, speed: 0.00006, scale: 1.3 }, // Pink
];

export const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const animationFrameRef = useRef<number>();
  const gradientCacheRef = useRef<Map<string, CanvasGradient>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0,
  });

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
      node: any,
      timestamp: number
    ) => {
      const currentRadius = node.radius;

      ctx.save();

      // Outer glow
      const outerGradient = getOrCreateGradient(
        ctx,
        `outer-${node.color}`,
        () => {
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            currentRadius * 10
          );
          gradient.addColorStop(0, `${node.color}30`);
          gradient.addColorStop(0.5, `${node.color}15`);
          gradient.addColorStop(1, "transparent");
          return gradient;
        }
      );

      ctx.fillStyle = outerGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, currentRadius * 10, 0, Math.PI * 2);
      ctx.fill();

      // Enhanced glow effect
      ctx.shadowBlur = 15 * node.glowIntensity;
      ctx.shadowColor = node.color;

      // Inner bright core
      const innerGradient = getOrCreateGradient(
        ctx,
        `inner-${node.color}`,
        () => {
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            currentRadius * 2.5
          );
          gradient.addColorStop(0, `${node.color}ff`);
          gradient.addColorStop(0.6, `${node.color}b4`);
          gradient.addColorStop(1, `${node.color}64`);
          return gradient;
        }
      );

      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, currentRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
    [getOrCreateGradient]
  );

  const drawConnections = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      connections: any[],
      timestamp: number
    ) => {
      connections.forEach(connection => {
        const { nodeA, nodeB, strength, width, drawProgress, pulses } = connection;
        
        // Build a hex alpha from computed float
        const alpha = Math.floor(Math.max(0, Math.min(255, strength * 0.8 * drawProgress * 255)))
          .toString(16)
          .padStart(2, "0");

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(0.8, width * 1.2);

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
        ctx.shadowBlur = 8;
        ctx.shadowColor = nodeA.color;

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.stroke();

        // Draw pulses
        if (pulses && pulses.length > 0) {
          pulses.forEach(pulse => {
            const t = Math.max(0, Math.min(1, pulse.position));
            const pulseX = nodeA.x + (nodeB.x - nodeA.x) * t;
            const pulseY = nodeA.y + (nodeB.y - nodeA.y) * t;

            const pulseProgress = Math.sin(t * Math.PI);
            const pulseSize = Math.max(2, (2 + pulseProgress * 4) * 1.2);
            const pulseOpacity = Math.max(0, Math.min(1, pulse.opacity * pulseProgress * 2));

            const pulseGradient = ctx.createRadialGradient(
              pulseX,
              pulseY,
              0,
              pulseX,
              pulseY,
              pulseSize
            );

            const pulseAlpha = Math.floor(255 * pulseOpacity)
              .toString(16)
              .padStart(2, "0");
            const pulseAlphaMid = Math.floor(180 * pulseOpacity)
              .toString(16)
              .padStart(2, "0");

            pulseGradient.addColorStop(0, `${nodeA.color}${pulseAlpha}`);
            pulseGradient.addColorStop(0.5, `${nodeA.color}${pulseAlphaMid}`);
            pulseGradient.addColorStop(1, "transparent");

            ctx.fillStyle = pulseGradient;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        ctx.restore();
      });
    },
    []
  );

  const drawAnimatedGradients = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      timestamp: number,
      width: number,
      height: number
    ) => {
      ctx.save();
      GRADIENT_COLORS.forEach((gradientColor, index) => {
        const time = timestamp * gradientColor.speed;
        const angleOffset = ((Math.PI * 2) / GRADIENT_COLORS.length) * index;
        const angle = time + angleOffset;

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

        const colA = Math.floor(gradientColor.opacity * 255).toString(16).padStart(2, "0");
        const colB = Math.floor(gradientColor.opacity * 200).toString(16).padStart(2, "0");
        const colC = Math.floor(gradientColor.opacity * 127).toString(16).padStart(2, "0");

        gradient.addColorStop(0, `${gradientColor.color}${colA}`);
        gradient.addColorStop(0.3, `${gradientColor.color}${colB}`);
        gradient.addColorStop(0.6, `${gradientColor.color}${colC}`);
        gradient.addColorStop(1, "transparent");

        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });
      ctx.restore();
    },
    []
  );

  useEffect(() => {
    if (!inView) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize canvas context
    ctxRef.current = canvas.getContext("2d", { alpha: true });
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Initialize web worker
    workerRef.current = new NeuralWorker();

    const scaleFactor = 0.9;
    const width = window.innerWidth * scaleFactor;
    const height = window.innerHeight * scaleFactor;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";

    // Initialize worker
    workerRef.current.postMessage({
      type: 'init',
      width,
      height
    });

    // Handle worker messages
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'update') {
        const { nodes, connections, progress } = e.data.data;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawAnimatedGradients(ctx, performance.now(), canvas.width, canvas.height);
        drawConnections(ctx, connections, performance.now());
        
        nodes.forEach((node: any) => {
          drawNode(ctx, node, performance.now());
        });
      }
    };

    const animate = (timestamp: number) => {
      if (workerRef.current && inView) {
        workerRef.current.postMessage({
          type: 'animate',
          timestamp
        });
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate(performance.now());
    setIsInitialized(true);

    const handleResize = () => {
      const newWidth = window.innerWidth * scaleFactor;
      const newHeight = window.innerHeight * scaleFactor;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";

      gradientCacheRef.current.clear();
      
      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'resize',
          width: newWidth,
          height: newHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [inView, drawAnimatedGradients, drawConnections, drawNode]);

  return (
    <canvas
      ref={(el) => {
        canvasRef.current = el;
        inViewRef(el);
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: isInitialized ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
      }}
    />
  );
};
