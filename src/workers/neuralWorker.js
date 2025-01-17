// Constants
const COLORS = [
  "#67E8F9", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#A855F7", // Violet
  "#EC4899", // Pink
];

const NODE_COUNT = 20;
const CONNECTION_DISTANCE = 250;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_CONNECTIONS_PER_NODE = 2;
const BASE_SPEED = 0.03;
const MAX_GLOW = 1.2;
const MIN_GLOW = 0.3;
const PULSE_SPEED = 0.03;
const MIN_CONNECTION_LIFETIME = 15000;
const CONNECTION_UPDATE_INTERVAL = 15;
const LINE_DRAW_SPEED = 0.03;
const VELOCITY_DAMPENING = 0.97;
const INITIAL_ANIMATION_DURATION = 900;
const WAVE_FREQUENCY = 0.0001;
const PULSE_SIZE_MIN = 0.5;
const PULSE_SIZE_MAX = 4;
const PULSE_SPAWN_CHANCE = 0.05;
const PULSE_FADE_SPEED = 0.015;
const OSCILLATION_SPEED_RANGE = [0.0003, 0.0006];
const NODE_MOVEMENT_FREQUENCY = 0.00015;
const GLOW_WAVE_FREQUENCY = 0.0003;
const BASE_MOVEMENT_RANGE = 0.8;
const MOVEMENT_VARIATION = 0.4;
const RETURN_FORCE = 0.00008;
const MAX_OFFSET = 40;

let nodes = [];
let connections = [];
let lastTime = 0;
let startTime = 0;
let frameCount = 0;
let width = 0;
let height = 0;

// Pre-calculate sin/cos tables
const sinTable = new Float32Array(1000);
const cosTable = new Float32Array(1000);
for (let i = 0; i < 1000; i++) {
  sinTable[i] = Math.sin((i / 1000) * Math.PI * 2);
  cosTable[i] = Math.cos((i / 1000) * Math.PI * 2);
}

function lookupSin(angle) {
  const index = Math.floor(((angle % (Math.PI * 2)) / (Math.PI * 2)) * 1000);
  return sinTable[index];
}

function lookupCos(angle) {
  const index = Math.floor(((angle % (Math.PI * 2)) / (Math.PI * 2)) * 1000);
  return cosTable[index];
}

function initNodes(w, h) {
  width = w;
  height = h;
  nodes = [];
  const baseRadiusRange = 1.5;
  const colorCount = COLORS.length;
  const glowRange = MAX_GLOW - MIN_GLOW;
  const oscillationRange = OSCILLATION_SPEED_RANGE[1] - OSCILLATION_SPEED_RANGE[0];

  for (let i = 0; i < NODE_COUNT; i++) {
    const baseRadius = Math.random() * baseRadiusRange + 1.5;
    const x = Math.random() * width;
    const y = Math.random() * height;

    nodes.push({
      x,
      y,
      originalX: x,
      originalY: y,
      vx: (Math.random() - 0.5) * BASE_SPEED,
      vy: (Math.random() - 0.5) * BASE_SPEED,
      radius: baseRadius,
      baseRadius,
      color: COLORS[Math.floor(Math.random() * colorCount)],
      glowIntensity: Math.random() * glowRange + MIN_GLOW,
      oscillationOffset: Math.random() * Math.PI * 2,
      oscillationSpeed: OSCILLATION_SPEED_RANGE[0] + Math.random() * oscillationRange,
      initialScale: 0,
      movementOffset: Math.random() * Math.PI * 2,
      glowWaveOffset: Math.random() * Math.PI * 2,
      connections: 0,
    });
  }
}

function updateNodes(deltaTime, progress, timestamp) {
  const batchSize = 5;
  const batches = Math.ceil(nodes.length / batchSize);

  for (let b = 0; b < batches; b++) {
    const start = b * batchSize;
    const end = Math.min(start + batchSize, nodes.length);

    for (let i = start; i < end; i++) {
      const node = nodes[i];
      const timeOffset = timestamp * NODE_MOVEMENT_FREQUENCY + node.movementOffset;

      const dx = lookupSin(timeOffset) * lookupCos(timeOffset * 0.7) * BASE_MOVEMENT_RANGE +
                 lookupSin(timeOffset * 0.4) * MOVEMENT_VARIATION;
      const dy = lookupCos(timeOffset * 0.8) * lookupSin(timeOffset * 0.5) * BASE_MOVEMENT_RANGE +
                 lookupCos(timeOffset * 0.6) * MOVEMENT_VARIATION;

      const distanceX = node.originalX - node.x;
      const distanceY = node.originalY - node.y;
      const returnForceX = distanceX * RETURN_FORCE * (1 + Math.abs(distanceX) / MAX_OFFSET);
      const returnForceY = distanceY * RETURN_FORCE * (1 + Math.abs(distanceY) / MAX_OFFSET);

      node.vx += dx * deltaTime * 0.01 + returnForceX;
      node.vy += dy * deltaTime * 0.01 + returnForceY;

      if (progress < 1) {
        node.initialScale = Math.min(1, node.initialScale + deltaTime * 0.01);
      }

      node.x += node.vx * deltaTime;
      node.y += node.vy * deltaTime;

      const glowWave = Math.sin(timestamp * GLOW_WAVE_FREQUENCY + node.glowWaveOffset) * 0.5;
      node.glowIntensity = MIN_GLOW + (MAX_GLOW - MIN_GLOW) * (0.5 + glowWave * 0.5);

      const dampenFactor = Math.pow(VELOCITY_DAMPENING, deltaTime);
      node.vx *= dampenFactor;
      node.vy *= dampenFactor;

      node.x = Math.max(node.originalX - MAX_OFFSET, Math.min(node.originalX + MAX_OFFSET, node.x));
      node.y = Math.max(node.originalY - MAX_OFFSET, Math.min(node.originalY + MAX_OFFSET, node.y));
    }
  }
}

function updateConnections() {
  // Reset node connection counters
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].connections = 0;
  }

  // Update existing connections
  for (let i = connections.length - 1; i >= 0; i--) {
    const conn = connections[i];
    conn.lifetime--;
    conn.drawProgress = Math.min(1, conn.drawProgress + LINE_DRAW_SPEED * (1 - conn.drawProgress));
    
    // Update existing pulses
    for (let p = conn.pulses.length - 1; p >= 0; p--) {
      const pulse = conn.pulses[p];
      pulse.position += PULSE_SPEED;
      pulse.opacity = Math.max(0, pulse.opacity - PULSE_FADE_SPEED);
      
      if (pulse.position >= 1 || pulse.opacity <= 0) {
        conn.pulses.splice(p, 1);
      }
    }

    // Spawn new pulses
    if (conn.drawProgress > 0.1 && conn.pulses.length < 2 && Math.random() < PULSE_SPAWN_CHANCE) {
      conn.pulses.push({
        position: 0,
        opacity: 1
      });
    }
    
    if (conn.lifetime <= 0) {
      connections.splice(i, 1);
      continue;
    }

    conn.nodeA.connections++;
    conn.nodeB.connections++;
  }

  // Create new connections
  for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    if (nodeA.connections >= MAX_CONNECTIONS_PER_NODE) continue;

    for (let j = i + 1; j < nodes.length; j++) {
      const nodeB = nodes[j];
      if (nodeB.connections >= MAX_CONNECTIONS_PER_NODE) continue;

      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq > CONNECTION_DISTANCE_SQ) continue;

      const existing = connections.some(
        conn => (conn.nodeA === nodeA && conn.nodeB === nodeB) ||
               (conn.nodeA === nodeB && conn.nodeB === nodeA)
      );
      
      if (existing) continue;

      const distance = Math.sqrt(distSq);
      if (distance < CONNECTION_DISTANCE) {
        connections.push({
          nodeA,
          nodeB,
          pulses: [],
          pulsePosition: Math.random(),
          strength: 1 - distance / CONNECTION_DISTANCE,
          lifetime: MIN_CONNECTION_LIFETIME + Math.random() * 2000,
          width: Math.random() * 1.5 + 1,
          initialOpacity: 0.4,
          drawProgress: 0.4,
        });
      }
    }
  }
}

function animate(timestamp) {
  if (startTime === 0) {
    startTime = timestamp;
  }

  const deltaTime = Math.min(32, timestamp - lastTime) / 16.67;
  lastTime = timestamp;
  frameCount++;

  const progress = Math.min(1, (timestamp - startTime) / INITIAL_ANIMATION_DURATION);

  updateNodes(deltaTime, progress, timestamp);

  if (frameCount % CONNECTION_UPDATE_INTERVAL === 0) {
    updateConnections();
  }

  // Send updated state back to main thread
  self.postMessage({
    type: 'update',
    data: {
      nodes: nodes.map(node => ({
        x: node.x,
        y: node.y,
        radius: node.radius,
        color: node.color,
        glowIntensity: node.glowIntensity,
        initialScale: node.initialScale,
      })),
      connections: connections.map(conn => ({
        nodeA: { x: conn.nodeA.x, y: conn.nodeA.y, color: conn.nodeA.color },
        nodeB: { x: conn.nodeB.x, y: conn.nodeB.y, color: conn.nodeB.color },
        strength: conn.strength,
        width: conn.width,
        drawProgress: conn.drawProgress,
        pulses: conn.pulses,
      })),
      progress,
    }
  });
}

// Message handler
self.onmessage = function(e) {
  switch (e.data.type) {
    case 'init':
      initNodes(e.data.width, e.data.height);
      break;
    case 'animate':
      animate(e.data.timestamp);
      break;
    case 'resize':
      initNodes(e.data.width, e.data.height);
      break;
  }
}; 