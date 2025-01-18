// Constants
const COLORS = [
  "#67E8F9", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#A855F7", // Violet
  "#EC4899", // Pink
];

const NODE_COUNT = 40;
const CONNECTION_DISTANCE = 280;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_CONNECTIONS_PER_NODE = 3;
const BASE_MOVEMENT_SPEED = 0.002; // Increased for more movement
const PULSE_SPEED = 0.0006;
const PULSE_SPAWN_RATE = 0.00008; // Increased for more pulses
const PULSE_MIN_SPACING = 0.8;
const MAX_PULSES_PER_CONNECTION = 2;
const MAX_GLOW = 2.0;
const MIN_GLOW = 0.8;
const GLOW_SPEED = 0.0003;
const CURVE_INTENSITY = 0.09;
const BREATH_SPEED = 0.0008;
const LINE_WIDTH = 0.8;
const MOVEMENT_RADIUS = 5000; // Increased for wider orbits
const DIRECTION_CHANGE_INTERVAL = 8000; // Reduced for more frequent changes
const MAX_ORBIT_SPEED = 0.002; // Increased for more movement
const MIN_ORBIT_SPEED = 0.0001; // Increased for more movement

let nodes = [];
let connections = [];
let lastTime = 0;
let startTime = 0;
let width = 0;
let height = 0;
let selectedNode = null;

function initNodes(w, h) {
  width = w;
  height = h;
  nodes = [];
  connections = [];
  
  for (let i = 0; i < NODE_COUNT; i++) {
    const node = {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: Math.random() * 1.5 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      connections: 0,
      breathPhase: Math.random() * Math.PI * 2,
      lastDirectionChange: Math.random() * DIRECTION_CHANGE_INTERVAL,
      targetX: null,
      targetY: null,
      baseX: 0,
      baseY: 0,
      angle: Math.random() * Math.PI * 2,
      orbitSpeed: MIN_ORBIT_SPEED + Math.random() * (MAX_ORBIT_SPEED - MIN_ORBIT_SPEED),
      orbitRadius: MOVEMENT_RADIUS * (0.3 + Math.random() * 0.7)
    };
    
    // Set initial base position
    node.baseX = node.x;
    node.baseY = node.y;
    
    nodes.push(node);
  }
}

function updateNodes(deltaTime, timestamp) {
  const maxDelta = 50;
  const normalizedDelta = Math.min(deltaTime, maxDelta);

  nodes.forEach(node => {
    // Update orbital movement with normalized delta
    node.angle += node.orbitSpeed * normalizedDelta;
    const targetX = node.baseX + Math.cos(node.angle) * node.orbitRadius;
    const targetY = node.baseY + Math.sin(node.angle) * node.orbitRadius;
    
    // Smooth movement towards target with speed limit
    const dx = targetX - node.x;
    const dy = targetY - node.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0.01) {
      const speed = Math.min(BASE_MOVEMENT_SPEED * normalizedDelta, dist);
      node.x += (dx / dist) * speed;
      node.y += (dy / dist) * speed;
    }

    // Occasionally change base position with more dynamic movement
    if (timestamp - node.lastDirectionChange > DIRECTION_CHANGE_INTERVAL) {
      // More dynamic base position change
      const newBaseX = Math.random() * width;
      const newBaseY = Math.random() * height;
      node.baseX = node.baseX * 0.6 + newBaseX * 0.4; // More aggressive movement
      node.baseY = node.baseY * 0.6 + newBaseY * 0.4;
      node.lastDirectionChange = timestamp;
      
      // Randomize orbit parameters for more variety
      node.orbitSpeed = MIN_ORBIT_SPEED + Math.random() * (MAX_ORBIT_SPEED - MIN_ORBIT_SPEED);
      node.orbitRadius = MOVEMENT_RADIUS * (0.3 + Math.random() * 0.7); // More varied radiuses
    }

    // Smooth boundary handling with larger padding
    const padding = 30;
    if (node.x < padding || node.x > width - padding || 
        node.y < padding || node.y > height - padding) {
      node.baseX = width / 2 + (Math.random() - 0.5) * 200; // Wider spread
      node.baseY = height / 2 + (Math.random() - 0.5) * 200;
    }

    // Update breathing effect
    node.breathPhase = (node.breathPhase + BREATH_SPEED * normalizedDelta) % (Math.PI * 2);
  });
}

function updateConnections(deltaTime) {
  // Reset connections
  nodes.forEach(node => node.connections = 0);
  
  // Update existing connections
  for (let i = connections.length - 1; i >= 0; i--) {
    const conn = connections[i];
    
    // Update pulses
    for (let j = conn.pulses.length - 1; j >= 0; j--) {
      const pulse = conn.pulses[j];
      pulse.progress += PULSE_SPEED * deltaTime;
      
      // Simplified opacity calculation
      pulse.opacity = pulse.progress < 0.2 ? pulse.progress / 0.2 :
                     pulse.progress > 0.8 ? (1 - pulse.progress) / 0.2 :
                     1;
      
      if (pulse.progress >= 1) {
        conn.pulses.splice(j, 1);
      }
    }
    
    // Spawn new pulses
    if (Math.random() < PULSE_SPAWN_RATE * deltaTime && 
        conn.pulses.length < MAX_PULSES_PER_CONNECTION &&
        (!conn.pulses.length || conn.pulses[conn.pulses.length - 1].progress > PULSE_MIN_SPACING)) {
      conn.pulses.push({
        progress: 0,
        opacity: 0,
        size: 1.5
      });
    }
    
    // Check distance
    const dx = conn.nodeA.x - conn.nodeB.x;
    const dy = conn.nodeA.y - conn.nodeB.y;
    if (dx * dx + dy * dy > CONNECTION_DISTANCE_SQ) {
      connections.splice(i, 1);
      continue;
    }
    
    conn.nodeA.connections++;
    conn.nodeB.connections++;
  }
  
  // Create new connections
  nodes.forEach((nodeA, i) => {
    if (nodeA.connections >= MAX_CONNECTIONS_PER_NODE) return;
    
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeB = nodes[j];
      if (nodeB.connections >= MAX_CONNECTIONS_PER_NODE) continue;
      
      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq <= CONNECTION_DISTANCE_SQ) {
        const exists = connections.some(conn => 
          (conn.nodeA === nodeA && conn.nodeB === nodeB) ||
          (conn.nodeA === nodeB && conn.nodeB === nodeA)
        );
        
        if (!exists) {
          connections.push({
            nodeA,
            nodeB,
            pulses: []
          });
        }
      }
    }
  });
}

function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  updateNodes(deltaTime, timestamp);
  updateConnections(deltaTime);

  const drawCommands = [];
  drawCommands.push({ type: 'clear' });

  // Draw connections with curves
  connections.forEach(conn => {
    const dx = conn.nodeB.x - conn.nodeA.x;
    const dy = conn.nodeB.y - conn.nodeA.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const strength = Math.pow(1 - (dist / CONNECTION_DISTANCE), 1.5);

    // Calculate control point for quadratic curve
    const midX = (conn.nodeA.x + conn.nodeB.x) / 2;
    const midY = (conn.nodeA.y + conn.nodeB.y) / 2;
    const perpX = -dy * CURVE_INTENSITY;
    const perpY = dx * CURVE_INTENSITY;
    const cpX = midX + perpX;
    const cpY = midY + perpY;

    drawCommands.push({ type: 'beginPath' });
    drawCommands.push({ 
      type: 'strokeStyle',
      value: `${conn.nodeA.color}${Math.floor(strength * 200).toString(16).padStart(2, '0')}`
    });
    drawCommands.push({ type: 'lineWidth', value: LINE_WIDTH });
    drawCommands.push({ type: 'moveTo', x: conn.nodeA.x, y: conn.nodeA.y });
    drawCommands.push({ 
      type: 'quadraticCurveTo',
      cpX,
      cpY,
      x: conn.nodeB.x,
      y: conn.nodeB.y
    });
    drawCommands.push({ type: 'stroke' });

    // Draw pulses along the curve
    conn.pulses.forEach(pulse => {
      const t = pulse.progress;
      const mt = 1 - t;
      const x = mt * mt * conn.nodeA.x + 2 * mt * t * cpX + t * t * conn.nodeB.x;
      const y = mt * mt * conn.nodeA.y + 2 * mt * t * cpY + t * t * conn.nodeB.y;
      
      drawCommands.push({ type: 'beginPath' });
      drawCommands.push({ 
        type: 'fillStyle',
        value: `${conn.nodeA.color}${Math.floor(pulse.opacity * 160).toString(16).padStart(2, '0')}`
      });
      drawCommands.push({ 
        type: 'arc',
        x,
        y,
        radius: pulse.size * 0.7,
        startAngle: 0,
        endAngle: Math.PI * 2
      });
      drawCommands.push({ type: 'fill' });
    });
  });

  // Draw nodes with enhanced glow effect
  nodes.forEach(node => {
    const breathFactor = 1 + Math.sin(node.breathPhase) * 0.15;
    
    // Outer glow (largest, most transparent)
    drawCommands.push({ type: 'beginPath' });
    drawCommands.push({ 
      type: 'fillStyle', 
      value: `${node.color}30`
    });
    drawCommands.push({ 
      type: 'arc',
      x: node.x,
      y: node.y,
      radius: node.radius * 2.5 * breathFactor,
      startAngle: 0,
      endAngle: Math.PI * 2
    });
    drawCommands.push({ type: 'fill' });

    // Middle glow
    drawCommands.push({ type: 'beginPath' });
    drawCommands.push({ 
      type: 'fillStyle', 
      value: `${node.color}70`
    });
    drawCommands.push({ 
      type: 'arc',
      x: node.x,
      y: node.y,
      radius: node.radius * 1.7 * breathFactor,
      startAngle: 0,
      endAngle: Math.PI * 2
    });
    drawCommands.push({ type: 'fill' });

    // Core (smallest, most opaque)
    drawCommands.push({ type: 'beginPath' });
    drawCommands.push({ 
      type: 'fillStyle', 
      value: `${node.color}ff`
    });
    drawCommands.push({ 
      type: 'arc',
      x: node.x,
      y: node.y,
      radius: node.radius * breathFactor,
      startAngle: 0,
      endAngle: Math.PI * 2
    });
    drawCommands.push({ type: 'fill' });
  });

  self.postMessage({
    type: 'draw',
    commands: drawCommands
  });
}

self.onmessage = function(e) {
  switch (e.data.type) {
    case 'init':
      initNodes(e.data.width, e.data.height);
      lastTime = performance.now();
      break;
    case 'animate':
      animate(e.data.timestamp);
      break;
    case 'resize':
      initNodes(e.data.width, e.data.height);
      break;
  }
}; 