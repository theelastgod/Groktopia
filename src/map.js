/** Overhead realm. World Y grows south. */

export const HOME = {
  you: [0, 40],
  rival: [280, 60],
  harrow: [170, -210],
  sable: [300, 230],
  vellum: [-240, -160],
  brine: [30, 270],
  quill: [-220, 190],
  moss: [-20, -250],
};

export function provinceGeom(p) {
  const home = Number.isFinite(p.x) && Number.isFinite(p.y)
    ? [p.x, p.y]
    : (HOME[p.id] || [((hash(p.id) % 400) - 200), ((hash(p.id + "y") % 400) - 200)]);
  const r = Math.max(58, Math.min(138, 34 + p.land * 0.2));
  return { id: p.id, x: home[0], y: home[1], r };
}

export function hitProvince(provinces, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const p of provinces) {
    const g = provinceGeom(p);
    const d = Math.hypot(x - g.x, y - g.y);
    if (d <= g.r && d < bestD) {
      best = p.id;
      bestD = d;
    }
  }
  return best;
}

export function screenToWorld(sx, sy, cam, viewW, viewH) {
  return {
    x: (sx - viewW / 2) / cam.z + cam.x,
    y: (sy - viewH / 2) / cam.z + cam.y,
  };
}

export function fitCamera(provinces, viewW, viewH) {
  const geoms = provinces.map(provinceGeom);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const g of geoms) {
    minX = Math.min(minX, g.x - g.r);
    minY = Math.min(minY, g.y - g.r);
    maxX = Math.max(maxX, g.x + g.r);
    maxY = Math.max(maxY, g.y + g.r);
  }
  const span = Math.max(maxX - minX, maxY - minY, 1);
  const pad = Math.min(viewW, viewH) < 700 ? 28 : 80;
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    z: Math.max(0.45, Math.min(2.4, (Math.min(viewW, viewH) - pad) / span)),
  };
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let v = seed >>> 0;
  return () => {
    v = (Math.imul(v, 1664525) + 1013904223) >>> 0;
    return v / 4294967296;
  };
}

function worldTransform(ctx, cam, viewW, viewH, dpr) {
  ctx.setTransform(
    dpr * cam.z, 0, 0, dpr * cam.z,
    dpr * (viewW / 2 - cam.x * cam.z),
    dpr * (viewH / 2 - cam.y * cam.z),
  );
}

function screenTransform(ctx, dpr) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function viewBounds(cam, viewW, viewH) {
  const pad = 80;
  return {
    left: cam.x - viewW / cam.z / 2 - pad,
    top: cam.y - viewH / cam.z / 2 - pad,
    right: cam.x + viewW / cam.z / 2 + pad,
    bottom: cam.y + viewH / cam.z / 2 + pad,
  };
}

function drawGround(ctx, cam, viewW, viewH) {
  const b = viewBounds(cam, viewW, viewH);
  const grd = ctx.createLinearGradient(b.left, b.top, b.right, b.bottom);
  grd.addColorStop(0, "#2a3a28");
  grd.addColorStop(0.45, "#1d2a1c");
  grd.addColorStop(1, "#243024");
  ctx.fillStyle = grd;
  ctx.fillRect(b.left, b.top, b.right - b.left, b.bottom - b.top);
  const step = 46;
  const x0 = Math.floor(b.left / step) * step;
  const y0 = Math.floor(b.top / step) * step;
  for (let x = x0; x < b.right; x += step) {
    for (let y = y0; y < b.bottom; y += step) {
      const n = hash(`${x >> 1},${y >> 1}`);
      if (n % 4 !== 0) continue;
      ctx.fillStyle = n % 8 === 0 ? "rgba(92, 118, 70, 0.18)" : "rgba(20, 28, 16, 0.2)";
      ctx.beginPath();
      ctx.ellipse(x + (n % 20), y + ((n >> 3) % 18), 10 + (n % 14), 6 + (n % 8), n, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function riverPoint(t) {
  return {
    x: -2200 + t * 4400,
    y: Math.sin(t * 5.2) * 150 + Math.sin(t * 13) * 36,
  };
}

function traceRiver(ctx) {
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const p = riverPoint(i / 48);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
}

function drawHills(ctx) {
  const hills = [[-900, -700, 520, 180], [400, 500, 640, 200], [-200, 900, 480, 150], [1100, -200, 400, 140]];
  for (const [x, y, rx, ry] of hills) {
    const shade = ctx.createRadialGradient(x, y, 20, x, y, rx);
    shade.addColorStop(0, "rgba(86, 112, 68, 0.28)");
    shade.addColorStop(1, "rgba(86, 112, 68, 0)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawClouds(ctx, time) {
  ctx.fillStyle = "rgba(236, 232, 214, 0.07)";
  for (let i = 0; i < 6; i++) {
    const x = -2200 + ((time * 14 + i * 860) % 4800);
    const y = -1500 + i * 380;
    ctx.beginPath();
    ctx.ellipse(x, y, 200, 34, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 70, y - 8, 120, 26, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBirds(ctx, time) {
  ctx.strokeStyle = "rgba(244, 236, 214, 0.55)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 8; i++) {
    const x = -1900 + ((time * 36 + i * 540) % 4200);
    const y = -800 + Math.sin(time * 0.8 + i) * 70 + i * 110;
    const flap = Math.sin(time * 8 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.quadraticCurveTo(x - 2, y - 4 - flap, x, y);
    ctx.quadraticCurveTo(x + 2, y - 4 - flap, x + 6, y);
    ctx.stroke();
  }
}

function drawRiver(ctx, time) {
  ctx.lineCap = "round";
  traceRiver(ctx);
  ctx.strokeStyle = "#3d5a34";
  ctx.lineWidth = 58;
  ctx.stroke();
  traceRiver(ctx);
  ctx.strokeStyle = "#0e2c33";
  ctx.lineWidth = 34;
  ctx.stroke();
  traceRiver(ctx);
  ctx.strokeStyle = "#1c5964";
  ctx.lineWidth = 18;
  ctx.stroke();
  traceRiver(ctx);
  ctx.save();
  ctx.strokeStyle = "rgba(186, 230, 220, 0.35)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 22]);
  ctx.lineDashOffset = -time * 18;
  ctx.stroke();
  ctx.restore();
}

function drawTree(ctx, x, y, s, n) {
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 4, s * 0.8, s * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = n % 2 ? "#1d3a22" : "#244628";
  ctx.beginPath();
  ctx.arc(x, y, s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = n % 3 ? "#3d6a3a" : "#4e7d44";
  ctx.beginPath();
  ctx.arc(x - s * 0.25, y - s * 0.2, s * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

function drawWilds(ctx, cam, viewW, viewH) {
  const b = viewBounds(cam, viewW, viewH);
  const step = 78;
  const x0 = Math.max(-2200, Math.floor(b.left / step) * step);
  const y0 = Math.max(-2200, Math.floor(b.top / step) * step);
  const x1 = Math.min(2200, b.right);
  const y1 = Math.min(2200, b.bottom);
  for (let x = x0; x < x1; x += step) {
    for (let y = y0; y < y1; y += step) {
      const n = hash(`${x},${y}`);
      if (n % 3 !== 0) continue;
      if (Math.abs(y - riverPoint((x + 2200) / 4400).y) < 28) continue;
      drawTree(ctx, x + (n % 24) - 12, y + ((n >> 4) % 24) - 12, 6 + (n % 7), n);
    }
  }
}

function blob(ctx, g) {
  ctx.beginPath();
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const n = hash(`${g.id}:${i}`);
    const rad = g.r * (0.8 + (n % 18) / 100);
    const x = g.x + Math.cos(a) * rad;
    const y = g.y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function scatter(id, n, radius) {
  const rand = rng(hash(id + ":" + n));
  const spots = [];
  for (let i = 0; i < n; i++) {
    const ang = rand() * Math.PI * 2;
    const dist = (0.16 + rand() * 0.58) * radius;
    spots.push([Math.cos(ang) * dist, Math.sin(ang) * dist]);
  }
  return spots;
}

function roof(ctx, x, y, w, h, wall, cap) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(x + 2, y + h * 0.35, w * 0.48, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = wall;
  ctx.fillRect(x - w / 2, y - 1, w, h * 0.42);
  ctx.fillStyle = cap;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 2, y);
  ctx.lineTo(x, y - h * 0.62);
  ctx.lineTo(x + w / 2 + 2, y);
  ctx.closePath();
  ctx.fill();
}

function drawHoldings(ctx, p, g, time) {
  ctx.save();
  blob(ctx, g);
  ctx.clip();
  const meadow = ctx.createRadialGradient(g.x - g.r * 0.2, g.y - g.r * 0.3, 8, g.x, g.y, g.r);
  meadow.addColorStop(0, p.kind === "human" ? "#6e8b45" : "#5d7a3e");
  meadow.addColorStop(1, "#3d5630");
  ctx.fillStyle = meadow;
  ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
  const fields = Math.min(7, Math.max(2, Math.round((p.buildings.field || 0) / 7)));
  for (let i = 0; i < fields; i++) {
    const y = g.y - g.r * 0.42 + i * 7;
    ctx.fillStyle = i % 2 ? "#c6a15a" : "#8ea84a";
    ctx.fillRect(g.x - g.r * 0.62, y, g.r * 1.05, 4);
  }
  const specs = {
    hearth: [(x, y) => roof(ctx, x, y, 14, 12, "#6a4632", "#a86848")],
    workshop: [(x, y) => roof(ctx, x, y, 18, 12, "#5c4a34", "#b8894e")],
    barracks: [(x, y) => roof(ctx, x, y, 22, 11, "#6a3030", "#8d4038")],
    den: [(x, y) => roof(ctx, x, y, 12, 9, "#241f28", "#3a3344")],
    chapel: [(x, y) => roof(ctx, x, y, 14, 14, "#d9d3c4", "#f4efe2")],
    keep: [(x, y) => {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(x - 7, y - 4, 18, 16);
      ctx.fillStyle = "#cfc4b2";
      ctx.fillRect(x - 9, y - 8, 18, 14);
      ctx.fillStyle = "#8d8478";
      for (let k = -8; k <= 6; k += 4) ctx.fillRect(x + k, y - 11, 2, 3);
    }],
    spire: [(x, y) => {
      const glow = ctx.createRadialGradient(x, y, 1, x, y, 14);
      glow.addColorStop(0, "rgba(226,192,120,0.9)");
      glow.addColorStop(1, "rgba(226,192,120,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f3e6c8";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }],
  };
  for (const key of Object.keys(specs)) {
    const count = Math.min(6, p.buildings[key] || 0);
    if (!count) continue;
    for (const [dx, dy] of scatter(p.id + key, count, g.r * 0.78)) specs[key][0](g.x + dx, g.y + dy);
  }
  const men = Math.min(12, Math.round((p.soldiers || 0) / 10));
  for (let i = 0; i < men; i++) {
    const bob = Math.sin(time * 3 + i) * 0.8;
    const x = g.x - 18 + (i % 6) * 6;
    const y = g.y + g.r * 0.28 + Math.floor(i / 6) * 6 + bob;
    ctx.fillStyle = p.kind === "human" ? "#f0d7a4" : "#d7c4a2";
    ctx.beginPath();
    ctx.arc(x, y, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a3030";
    ctx.fillRect(x - 0.4, y - 3.2, 0.8, 2.2);
  }
  ctx.restore();
  ctx.save();
  blob(ctx, g);
  ctx.strokeStyle = "rgba(232, 214, 176, 0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  const banner = { marcher: "#a14a3c", warden: "#7d9a72", veil: "#9a86c8", cutpurse: "#c6a15a", hearth: "#f3e6c8" }[p.faction] || "#e2c078";
  ctx.fillStyle = "#5c4632";
  ctx.fillRect(g.x - 1, g.y - g.r * 0.55, 2, 16);
  ctx.fillStyle = banner;
  const wave = Math.sin(time * 2.2 + hash(p.id) % 5) * 1.4;
  ctx.beginPath();
  ctx.moveTo(g.x + 1, g.y - g.r * 0.55);
  ctx.lineTo(g.x + 12, g.y - g.r * 0.55 + 4 + wave);
  ctx.lineTo(g.x + 1, g.y - g.r * 0.55 + 8);
  ctx.fill();
  if (p.buildings.hearth) {
    for (let i = 0; i < 3; i++) {
      const t = (time * 0.35 + i * 0.33) % 1;
      ctx.globalAlpha = 0.28 * (1 - t);
      ctx.fillStyle = "#efe6d6";
      ctx.beginPath();
      ctx.arc(g.x + 10 + Math.sin(time + i) * 3, g.y - 8 - t * 26, 2 + t * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function drawRoads(ctx, geoms) {
  ctx.lineCap = "round";
  for (let i = 0; i < geoms.length; i++) {
    for (let j = i + 1; j < geoms.length; j++) {
      const a = geoms[i];
      const b = geoms[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 980) continue;
      const mx = (a.x + b.x) / 2 + (hash(a.id + b.id) % 40) - 20;
      const my = (a.y + b.y) / 2 + 24;
      ctx.strokeStyle = "rgba(92, 70, 42, 0.55)";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(176, 146, 96, 0.45)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

function hourTint(hour) {
  const phase = ((hour || 0) % 24) / 24;
  if (phase < 0.2) return "rgba(196, 112, 64, 0.13)";
  if (phase < 0.62) return "rgba(255, 236, 190, 0.04)";
  if (phase < 0.78) return "rgba(176, 78, 48, 0.16)";
  return "rgba(18, 28, 58, 0.28)";
}

export function drawMini(ctx, width, height, world, seatId, cam) {
  ctx.clearRect(0, 0, width, height);
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#243628");
  sky.addColorStop(1, "#12180f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  const scale = width / 4800;
  const to = (x, y) => [width / 2 + x * scale, height / 2 + y * scale];
  ctx.strokeStyle = "#1c5964";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const p = riverPoint(i / 24);
    const [sx, sy] = to(p.x, p.y);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  for (const p of world.provinces) {
    const g = provinceGeom(p);
    const [sx, sy] = to(g.x, g.y);
    ctx.fillStyle = p.id === seatId ? "#e2c078" : p.kind === "human" ? "#f3e6c8" : "#7d9a72";
    ctx.beginPath();
    ctx.arc(sx, sy, p.id === seatId ? 4.5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const [cx, cy] = to(cam.x, cam.y);
  ctx.strokeStyle = "#e2c078";
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 12, cy - 9, 24, 18);
}

export function drawRealm(ctx, viewW, viewH, world, seatId, selectedId, cam, march, time = 0, hoverId = null, dpr = 1, motes = []) {
  screenTransform(ctx, dpr);
  ctx.clearRect(0, 0, viewW, viewH);
  worldTransform(ctx, cam, viewW, viewH, dpr);
  drawGround(ctx, cam, viewW, viewH);
  drawHills(ctx);
  drawRiver(ctx, time);
  drawWilds(ctx, cam, viewW, viewH);
  drawClouds(ctx, time);
  drawBirds(ctx, time);
  const geoms = world.provinces.map(provinceGeom).sort((a, b) => a.y - b.y);
  drawRoads(ctx, geoms);
  for (const g of geoms) {
    const p = world.provinces.find((row) => row.id === g.id);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(g.x + 6, g.y + 10, g.r * 0.72, g.r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    drawHoldings(ctx, p, g, time);
    const selected = p.id === selectedId;
    const mine = p.id === seatId;
    const hover = p.id === hoverId;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r + 4, 0, Math.PI * 2);
    ctx.lineWidth = selected ? 3.5 : mine ? 2.5 : 1.5;
    ctx.strokeStyle = selected ? "#f6e7c1" : mine ? "#e2c078" : hover ? "rgba(243,230,200,0.8)" : "rgba(232,214,176,0.28)";
    if (selected) {
      ctx.setLineDash([7, 6]);
      ctx.lineDashOffset = -time * 16;
    }
    ctx.stroke();
    ctx.setLineDash([]);
    if (p.spells && p.spells.fury > 0) {
      ctx.strokeStyle = "rgba(224,122,104,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r + 9 + Math.sin(time * 4) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.spells && p.spells.bulwark > 0) {
      ctx.strokeStyle = "rgba(125,154,114,0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r + 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (march) {
    const x = march.ax + (march.bx - march.ax) * march.t;
    const y = march.ay + (march.by - march.ay) * march.t;
    for (let i = 1; i <= 6; i++) {
      const t = Math.max(0, march.t - i * 0.04);
      const px = march.ax + (march.bx - march.ax) * t;
      const py = march.ay + (march.by - march.ay) * t;
      ctx.fillStyle = `rgba(226, 196, 140, ${0.18 - i * 0.02})`;
      ctx.beginPath();
      ctx.arc(px, py, 6 - i * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    const ang = Math.atan2(march.by - march.ay, march.bx - march.ax);
    const nx = Math.cos(ang + Math.PI / 2);
    const ny = Math.sin(ang + Math.PI / 2);
    for (let i = 0; i < 5; i++) {
      const ox = nx * ((i - 2) * 4);
      const oy = ny * ((i - 2) * 4);
      ctx.fillStyle = i === 2 ? "#f0d7a4" : "#6a3030";
      ctx.beginPath();
      ctx.arc(x - Math.cos(ang) * i * 5 + ox, y - Math.sin(ang) * i * 5 + oy, i === 2 ? 3.2 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#e2c078";
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * 2, y + Math.sin(ang) * 2 - 12);
    ctx.lineTo(x + 9, y - 8);
    ctx.lineTo(x, y - 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(246, 231, 193, 0.7)";
    ctx.setLineDash([4, 5]);
    ctx.lineDashOffset = -time * 12;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(march.bx, march.by, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  for (const mote of motes) {
    ctx.globalAlpha = Math.max(0, mote.life);
    ctx.fillStyle = mote.color;
    ctx.beginPath();
    ctx.arc(mote.x, mote.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  screenTransform(ctx, dpr);
  ctx.fillStyle = hourTint(world.hour);
  ctx.fillRect(0, 0, viewW, viewH);
  const phase = ((world.hour || 0) % 24) / 24;
  if (phase >= 0.78) {
    for (let i = 0; i < 48; i++) {
      const n = hash("star" + i);
      const x = (n % 1000) / 1000 * viewW;
      const y = ((n >>> 10) % 1000) / 1000 * viewH * 0.72;
      ctx.fillStyle = `rgba(244, 236, 214, ${0.35 + Math.sin(time * 2 + i) * 0.28})`;
      ctx.fillRect(x, y, 1.6, 1.6);
    }
  }
  const vig = ctx.createRadialGradient(viewW / 2, viewH / 2, Math.min(viewW, viewH) * 0.35, viewW / 2, viewH / 2, Math.max(viewW, viewH) * 0.72);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, viewW, viewH);
  ctx.font = "600 14px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  for (const g of geoms) {
    const p = world.provinces.find((row) => row.id === g.id);
    const sx = viewW / 2 + (g.x - cam.x) * cam.z;
    const sy = viewH / 2 + (g.y - g.r - 12 - cam.y) * cam.z;
    if (sx < -40 || sy < -20 || sx > viewW + 40 || sy > viewH + 20) continue;
    const label = p.name;
    const width = ctx.measureText(label).width + 16;
    ctx.fillStyle = "rgba(16, 12, 8, 0.78)";
    ctx.beginPath();
    ctx.roundRect(sx - width / 2, sy - 14, width, 20, 6);
    ctx.fill();
    ctx.fillStyle = p.id === seatId ? "#e2c078" : "#f6e7c1";
    ctx.fillText(label, sx, sy);
  }
}
