import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
// @ts-ignore
import NeuralWorker from '../workers/neuralWorker.js?worker';
import BlobBackground from './BlobBackground';

export const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (!inView) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext("2d", { 
      alpha: true,
      willReadFrequently: false
    });
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Set up high-performance rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Initialize web worker
    workerRef.current = new NeuralWorker();

    // Set up canvas with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    ctx.scale(dpr, dpr);

    // Initialize worker
    workerRef.current.postMessage({
      type: 'init',
      width: rect.width,
      height: rect.height
    });

    // Handle mouse events
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas || !workerRef.current) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      
      workerRef.current.postMessage({
        type: 'mousemove',
        x,
        y
      });
    };

    const handleMouseEnter = () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'mouseenter' });
      }
    };

    const handleMouseLeave = () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'mouseleave' });
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Handle worker messages
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'draw') {
        const commands = e.data.commands;
        
        commands.forEach(cmd => {
          switch (cmd.type) {
            case 'clear':
              ctx.clearRect(0, 0, rect.width, rect.height);
              break;
            case 'beginPath':
              ctx.beginPath();
              break;
            case 'strokeStyle':
              ctx.strokeStyle = cmd.value;
              break;
            case 'fillStyle':
              ctx.fillStyle = cmd.value;
              break;
            case 'lineWidth':
              ctx.lineWidth = cmd.value;
              break;
            case 'moveTo':
              ctx.moveTo(cmd.x, cmd.y);
              break;
            case 'lineTo':
              ctx.lineTo(cmd.x, cmd.y);
              break;
            case 'quadraticCurveTo':
              ctx.quadraticCurveTo(cmd.cpX, cmd.cpY, cmd.x, cmd.y);
              break;
            case 'arc':
              ctx.arc(cmd.x, cmd.y, cmd.radius, cmd.startAngle, cmd.endAngle);
              break;
            case 'stroke':
              ctx.stroke();
              break;
            case 'fill':
              ctx.fill();
              break;
          }
        });
      }
    };

    let animationFrame: number;
    const animate = () => {
      if (workerRef.current && inView) {
        workerRef.current.postMessage({
          type: 'animate',
          timestamp: performance.now()
        });
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animate();

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      
      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'resize',
          width: rect.width,
          height: rect.height
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [inView]);

  return (
    <>
      <canvas
        ref={(el) => {
          canvasRef.current = el;
        inViewRef(el);
      }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      />
    </>
  );
};
