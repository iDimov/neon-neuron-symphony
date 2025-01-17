// Constants
const COLORS = [
  "#67E8F9", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#A855F7", // Violet
  "#EC4899", // Pink
];

const NODE_COUNT = 35;
const CONNECTION_DISTANCE = 200;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_CONNECTIONS_PER_NODE = 2;
const BASE_SPEED = 0.001;
const MAX_SPEED = 0.3;
const PULSE_SPEED = 0.0002;
const PULSE_SPAWN_RATE = 0.00005;
const PULSE_MIN_SPACING = 0.9;
const MAX_PULSES_PER_CONNECTION = 1;
const MAX_GLOW = 1.5;
const MIN_GLOW = 0.6;
const GLOW_SPEED = 0.0003;
const CURVE_INTENSITY = 0.15;
const MOUSE_INFLUENCE_RADIUS = 180;
const MOUSE_REPEL_STRENGTH = 0.15;
const MOUSE_ATTRACT_STRENGTH = 0.08;

let nodes = [];
let connections = [];
let lastTime = 0;
let startTime = 0;
let frameCount = 0;
let width = 0;
let height = 0;
let mouseX = null;
let mouseY = null;
let isMouseOver = false;

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
      radius: Math.random() * 1.5 + 2.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      connections: 0,
    //   glowIntensity: Math.random() * (MAX_GLOW - MIN_GLOW) + MIN_GLOW,
    //   glowOffset: Math.random() * Math.PI * 2
    });
  }
}

function updateNodes(deltaTime, timestamp) {
  nodes.forEach(node => {
    // Basic movement
    node.x += node.vx * deltaTime;
    node.y += node.vy * deltaTime;

    // Mouse interaction
    if (isMouseOver && mouseX !== null && mouseY !== null) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < MOUSE_INFLUENCE_RADIUS * MOUSE_INFLUENCE_RADIUS) {
        const dist = Math.sqrt(distSq);
        const influence = Math.pow(1 - (dist / MOUSE_INFLUENCE_RADIUS), 2);
        
        // Repel when close, attract when further
        const strength = dist < MOUSE_INFLUENCE_RADIUS * 0.5 ? 
          MOUSE_REPEL_STRENGTH : -MOUSE_ATTRACT_STRENGTH;
        
        node.vx += (dx / dist) * strength * influence * deltaTime;
        node.vy += (dy / dist) * strength * influence * deltaTime;
      }
    }

    // Bounce off walls with damping
    if (node.x < 0 || node.x > width) {
      node.vx *= -0.8;
      node.x = Math.max(0, Math.min(width, node.x));
    }
    if (node.y < 0 || node.y > height) {
      node.vy *= -0.8;
      node.y = Math.max(0, Math.min(height, node.y));
    }

    // Random velocity changes (less frequent)
    if (Math.random() < 0.005) {
      node.vx += (Math.random() - 0.5) * BASE_SPEED;
      node.vy += (Math.random() - 0.5) * BASE_SPEED;
    }

    // Smoother speed limiting
    const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
    if (speed > MAX_SPEED) {
      const dampingFactor = 1 - Math.min(1, (speed - MAX_SPEED) / MAX_SPEED);
      node.vx *= dampingFactor;
      node.vy *= dampingFactor;
    }
  });
}

function updateConnections(deltaTime) {
  // Reset connections
  nodes.forEach(node => node.connections = 0);
  
  // Update existing connections
  for (let i = connections.length - 1; i >= 0; i--) {
    const conn = connections[i];
    
    // Update pulses with smooth easing
    for (let j = conn.pulses.length - 1; j >= 0; j--) {
      const pulse = conn.pulses[j];
      // Linear movement for consistent speed
      pulse.progress += PULSE_SPEED * deltaTime;
      
      // Enhanced opacity curve with longer visible period
      let opacityProgress;
      if (pulse.progress < 0.15) {
        // Slower fade in
        opacityProgress = pulse.progress / 0.15;
      } else if (pulse.progress > 0.85) {
        // Slower fade out
        opacityProgress = (1 - pulse.progress) / 0.15;
      } else {
        // Hold full opacity longer
        opacityProgress = 1;
      }
      
      // Add slight pulse size variation
      const pulsePhase = Math.sin(pulse.progress * Math.PI);
      pulse.size = 1 + pulsePhase * 0.5;
      pulse.opacity = Math.max(0, Math.min(1, opacityProgress));
      
      if (pulse.progress >= 1) {
        conn.pulses.splice(j, 1);
      }
    }
    
    // Add new pulses with spacing check and reduced probability
    if (Math.random() < PULSE_SPAWN_RATE * deltaTime && conn.pulses.length < MAX_PULSES_PER_CONNECTION) {
      const lastPulse = conn.pulses[conn.pulses.length - 1];
      const canSpawn = !lastPulse || lastPulse.progress > PULSE_MIN_SPACING;
      
      if (canSpawn) {
        conn.pulses.push({
          progress: 0,
          opacity: 0,
          size: 1.5
        });
      }
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
    // Adjust curve based on distance for more natural look
    const curveFactor = Math.min(1, dist / (CONNECTION_DISTANCE * 0.7));
    const midX = (conn.nodeA.x + conn.nodeB.x) / 2;
    const midY = (conn.nodeA.y + conn.nodeB.y) / 2;
    const perpX = -dy * CURVE_INTENSITY * curveFactor;
    const perpY = dx * CURVE_INTENSITY * curveFactor;
    const cpX = midX + perpX;
    const cpY = midY + perpY;

    drawCommands.push({ type: 'beginPath' });
    drawCommands.push({ 
      type: 'strokeStyle',
      value: `${conn.nodeA.color}${Math.floor(strength * 180).toString(16).padStart(2, '0')}`
    });
    drawCommands.push({ type: 'lineWidth', value: 0.7 });
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

  // Draw nodes
  nodes.forEach(node => {
    drawCommands.push({ type: 'beginPath' });
    drawCommands.push({ 
      type: 'fillStyle', 
      value: `${node.color}cc` // Fixed 80% opacity for nodes
    });
    drawCommands.push({ 
      type: 'arc',
      x: node.x,
      y: node.y,
      radius: node.radius * 0.8, // Slightly smaller nodes
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
    case 'mousemove':
      mouseX = e.data.x;
      mouseY = e.data.y;
      break;
    case 'mouseenter':
      isMouseOver = true;
      break;
    case 'mouseleave':
      isMouseOver = false;
      mouseX = null;
      mouseY = null;
      break;
  }
}; 