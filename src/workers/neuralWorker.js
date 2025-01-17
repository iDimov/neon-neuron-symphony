// Constants
const COLORS = [
  "#67E8F9", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#A855F7", // Violet
  "#EC4899", // Pink
];

const NODE_COUNT = 77;
const CONNECTION_DISTANCE = 150;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_CONNECTIONS_PER_NODE = 3;
const BASE_SPEED = 0.005;
const MAX_SPEED = 1;
const PULSE_SPEED = 0.001;
const PULSE_SPAWN_RATE = 0.002;
const PULSE_FADE_SPEED = 0.009;

let nodes = [];
let connections = [];
let lastTime = 0;
let startTime = 0;
let frameCount = 0;
let width = 0;
let height = 0;

function initNodes(w, h) {
  width = w;
  height = h;
  nodes = [];
  connections = [];
  
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * BASE_SPEED,
      vy: (Math.random() - 0.5) * BASE_SPEED,
      radius: Math.random() * 2 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      connections: 0
    });
  }
}

function updateNodes(deltaTime) {
  nodes.forEach(node => {
    node.x += node.vx * deltaTime;
    node.y += node.vy * deltaTime;

    // Bounce off walls
    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;

    // Keep within bounds
    node.x = Math.max(0, Math.min(width, node.x));
    node.y = Math.max(0, Math.min(height, node.y));

    // Random velocity changes
    if (Math.random() < 0.01) {
      node.vx += (Math.random() - 0.5) * BASE_SPEED;
      node.vy += (Math.random() - 0.5) * BASE_SPEED;
    }

    // Limit speed
    const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
    if (speed > MAX_SPEED) {
      node.vx = (node.vx / speed) * MAX_SPEED;
      node.vy = (node.vy / speed) * MAX_SPEED;
    }
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
      pulse.opacity = Math.max(0, pulse.opacity - PULSE_FADE_SPEED * deltaTime);
      
      if (pulse.progress >= 1 || pulse.opacity <= 0) {
        conn.pulses.splice(j, 1);
      }
    }
    
    // Add new pulses
    if (Math.random() < PULSE_SPAWN_RATE * deltaTime && conn.pulses.length < 3) {
      conn.pulses.push({
        progress: 0,
        opacity: 1
      });
    }
    
    // Check if nodes are still close enough
    const dx = conn.nodeA.x - conn.nodeB.x;
    const dy = conn.nodeA.y - conn.nodeB.y;
    const distSq = dx * dx + dy * dy;
    
    if (distSq > CONNECTION_DISTANCE_SQ) {
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

  updateNodes(deltaTime);
  updateConnections(deltaTime);

  // Generate drawing commands
  const drawCommands = [];
  
  drawCommands.push({ type: 'clear' });

  // Draw connections and pulses
  connections.forEach(conn => {
    const dx = conn.nodeB.x - conn.nodeA.x;
    const dy = conn.nodeB.y - conn.nodeA.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const strength = 1 - (dist / CONNECTION_DISTANCE);

    // Draw connection line
    drawCommands.push({ type: 'beginPath' });
    drawCommands.push({ 
      type: 'strokeStyle',
      value: `${conn.nodeA.color}${Math.floor(strength * 255).toString(16).padStart(2, '0')}`
    });
    drawCommands.push({ type: 'lineWidth', value: 1 });
    drawCommands.push({ type: 'moveTo', x: conn.nodeA.x, y: conn.nodeA.y });
    drawCommands.push({ type: 'lineTo', x: conn.nodeB.x, y: conn.nodeB.y });
    drawCommands.push({ type: 'stroke' });

    // Draw pulses
    conn.pulses.forEach(pulse => {
      const t = pulse.progress;
      const x = conn.nodeA.x + dx * t;
      const y = conn.nodeA.y + dy * t;
      
      drawCommands.push({ type: 'beginPath' });
      drawCommands.push({ 
        type: 'fillStyle',
        value: `${conn.nodeA.color}${Math.floor(pulse.opacity * 255).toString(16).padStart(2, '0')}`
      });
      drawCommands.push({ 
        type: 'arc',
        x,
        y,
        radius: 2,
        startAngle: 0,
        endAngle: Math.PI * 2
      });
      drawCommands.push({ type: 'fill' });
    });
  });

  // Draw nodes
  nodes.forEach(node => {
    drawCommands.push({ type: 'beginPath' });
    drawCommands.push({ type: 'fillStyle', value: node.color });
    drawCommands.push({ 
      type: 'arc',
      x: node.x,
      y: node.y,
      radius: node.radius,
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