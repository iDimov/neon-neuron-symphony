// Constants
const COLORS = [
  "#67E8F9", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#A855F7", // Violet
  "#EC4899", // Pink
];

const NODE_COUNT = 33;
const CONNECTION_DISTANCE = 250;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_CONNECTIONS_PER_NODE = 2;
const BASE_SPEED = 0.001;
const MAX_SPEED = 0.2;
const PULSE_SPEED = 0.0005;
const PULSE_SPAWN_RATE = 0.00004;
const PULSE_MIN_SPACING = 0.9;
const MAX_PULSES_PER_CONNECTION = 1;
const MAX_GLOW = 1.8;
const MIN_GLOW = 0.7;
const GLOW_SPEED = 0.0003;
const CURVE_INTENSITY = 0.08;
const BREATH_SPEED = 0.0006;
const LINE_WIDTH = 0.9;
const CLICK_RADIUS = 30; // Radius for clicking nodes
const RIPPLE_DURATION = 2000; // Duration of ripple animation in ms (increased)
const RIPPLE_MAX_RADIUS = 200; // Maximum radius of ripple (increased)
const SELECTED_NODE_PULSE_INTENSITY = 0.6; // Intensity of selected node pulse (increased)
const RIPPLE_COUNT = 3; // Number of ripples to create on click
const RIPPLE_DELAY = 100; // Delay between ripples in ms
const NODE_EXPLOSION_FORCE = 0.5; // Force to push nearby nodes on click

let nodes = [];
let connections = [];
let lastTime = 0;
let startTime = 0;
let frameCount = 0;
let width = 0;
let height = 0;
let selectedNode = null;
let ripples = []; // Array to store ripple animations

function initNodes(w, h) {
  width = w;
  height = h;
  nodes = [];
  connections = [];
  ripples = [];
  
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * BASE_SPEED,
      vy: (Math.random() - 0.5) * BASE_SPEED,
      radius: Math.random() * 1.5 + 2.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      connections: 0,
      isSelected: false,
      targetX: null,
      targetY: null,
      breathPhase: Math.random() * Math.PI * 2,
      pulseIntensity: 1
    });
  }
}

function updateNodes(deltaTime, timestamp) {
  nodes.forEach(node => {
    // Basic movement
    node.x += node.vx * deltaTime;
    node.y += node.vy * deltaTime;

    // Wall bouncing
    if (node.x < 0 || node.x > width) {
      node.vx *= -0.7;
      node.x = Math.max(0, Math.min(width, node.x));
    }
    if (node.y < 0 || node.y > height) {
      node.vy *= -0.7;
      node.y = Math.max(0, Math.min(height, node.y));
    }

    // Occasional random movement
    if (Math.random() < 0.001) {
      node.vx += (Math.random() - 0.5) * BASE_SPEED;
      node.vy += (Math.random() - 0.5) * BASE_SPEED;
    }

    // Simple speed limiting
    const speedSq = node.vx * node.vx + node.vy * node.vy;
    if (speedSq > MAX_SPEED * MAX_SPEED) {
      const scale = MAX_SPEED / Math.sqrt(speedSq);
      node.vx *= scale;
      node.vy *= scale;
    }

    // Update breath phases and pulse intensities
    node.breathPhase = (node.breathPhase + deltaTime * 0.002) % (Math.PI * 2);
    if (node.isSelected) {
      node.pulseIntensity = 1 + SELECTED_NODE_PULSE_INTENSITY + Math.sin(node.breathPhase) * 0.2;
    }
  });

  // Update ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    const ripple = ripples[i];
    const age = timestamp - ripple.startTime;
    if (age >= RIPPLE_DURATION) {
      ripples.splice(i, 1);
    }
  }
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

  // Draw ripples with enhanced effect
  ripples.forEach(ripple => {
    const age = timestamp - ripple.startTime;
    const progress = age / RIPPLE_DURATION;
    const radius = RIPPLE_MAX_RADIUS * progress * (ripple.scale || 1);
    const opacity = (1 - progress) * 0.7; // Increased base opacity

    // Draw multiple circles for each ripple
    for (let i = 0; i < 3; i++) {
      const scaledRadius = radius * (1 - i * 0.1);
      const scaledOpacity = opacity * (1 - i * 0.3);
      
      drawCommands.push({ type: 'beginPath' });
      drawCommands.push({ 
        type: 'strokeStyle',
        value: `${ripple.color}${Math.floor(scaledOpacity * 255).toString(16).padStart(2, '0')}`
      });
      drawCommands.push({ type: 'lineWidth', value: 2 - i * 0.5 });
      drawCommands.push({ 
        type: 'arc',
        x: ripple.x,
        y: ripple.y,
        radius: scaledRadius,
        startAngle: 0,
        endAngle: Math.PI * 2
      });
      drawCommands.push({ type: 'stroke' });
    }
  });

  // Draw nodes with enhanced glow effect
  nodes.forEach(node => {
    const breathFactor = node.pulseIntensity * (1 + Math.sin(node.breathPhase) * 0.15);
    
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