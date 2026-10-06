/** Overhead realm. World Y grows south. */
import { beaconLit, captiveCount, intelFresh, seasonName } from "./sim.js";

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

export function hitSite(sites, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const site of sites || []) {
    const d = Math.hypot(x - site.x, y - site.y);
    if (d <= 42 && d < bestD) {
      best = site.id;
      bestD = d;
    }
  }
  return best;
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
  grd.addColorStop(0, "#0e2c34");
  grd.addColorStop(0.5, "#12343c");
  grd.addColorStop(1, "#0c242c");
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

const HEX = 62;
const HEX_DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const FACTION_INK = {
  marcher: "#c45a48",
  warden: "#7d9a72",
  veil: "#9a86c8",
  cutpurse: "#d2b15a",
  hearth: "#f0e2c4",
};
const TERRAIN_INK = {
  grass: "#3f7a3c",
  plain: "#c6a15a",
  wood: "#1e4e30",
  hill: "#a08a62",
  mount: "#6e675f",
  marsh: "#4d6844",
  river: "#17616c",
  coast: "#2f7c74",
  sea: "#12343c",
};
const YIELD = {
  grass: [2, 0, 0],
  plain: [1, 0, 1],
  wood: [1, 1, 0],
  hill: [0, 2, 0],
  mount: [0, 1, 0],
  marsh: [1, 0, 0],
  river: [2, 0, 1],
  coast: [1, 0, 1],
  sea: [1, 0, 0],
};

function axialToWorld(q, r) {
  return {
    x: HEX * 1.5 * q,
    y: HEX * Math.sqrt(3) * (r + q / 2),
  };
}

function worldToAxial(x, y) {
  const q = (2 / 3 * x) / HEX;
  const r = (-1 / 3 * x + (Math.sqrt(3) / 3) * y) / HEX;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(-q - r);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs + q + r);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return { q: rq, r: rr };
}

function hexPath(ctx, x, y) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = Math.PI / 180 * (60 * i - 30);
    const px = x + HEX * Math.cos(ang);
    const py = y + HEX * Math.sin(ang);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function riverDist(x, y) {
  const t = Math.max(0, Math.min(1, (x + 2200) / 4400));
  let best = Infinity;
  for (let i = -3; i <= 3; i++) {
    const p = riverPoint(Math.max(0, Math.min(1, t + i * 0.012)));
    best = Math.min(best, Math.hypot(x - p.x, y - p.y));
  }
  return best;
}

const HILL_OVALS = [[-900, -700, 520, 180], [400, 500, 640, 200], [-200, 900, 480, 150], [1100, -200, 400, 140]];

function terrainAt(q, r) {
  const { x, y } = axialToWorld(q, r);
  const n = hash(`hex:${q},${r}`);
  const edge = Math.hypot(x, y);
  if (edge > 2480) return "sea";
  if (edge > 2140) return "coast";
  if (riverDist(x, y) < 34) return "river";
  for (const [hx, hy, rx, ry] of HILL_OVALS) {
    const nx = (x - hx) / rx;
    const ny = (y - hy) / ry;
    const inside = nx * nx + ny * ny;
    if (inside < 0.28 && n % 3 === 0) return "mount";
    if (inside < 1) return "hill";
  }
  if (n % 11 === 0) return "marsh";
  if (n % 4 === 0) return "wood";
  if (n % 5 === 0) return "plain";
  return "grass";
}

function claimReach(p) {
  return 92 + Math.min(280, (p.land || 40) * 0.55);
}

function claimOf(provinces, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const p of provinces) {
    const g = provinceGeom(p);
    const d = Math.hypot(x - g.x, y - g.y);
    if (d <= claimReach(p) && d < bestD) {
      best = p;
      bestD = d;
    }
  }
  return best;
}

function drawHexFeature(ctx, kind, x, y, n) {
  if (kind === "wood") {
    for (let i = 0; i < 3; i++) {
      const ox = ((n >> i) % 7) - 3;
      const oy = ((n >> (i + 3)) % 7) - 6;
      drawTree(ctx, x + ox * 3, y + oy, 5 + (n % 3), n + i);
    }
  } else if (kind === "hill") {
    ctx.fillStyle = "#cbb892";
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 4);
    ctx.lineTo(x, y - 8);
    ctx.lineTo(x + 12, y + 4);
    ctx.fill();
  } else if (kind === "mount") {
    ctx.fillStyle = "#8d8478";
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 8);
    ctx.lineTo(x - 2, y - 14);
    ctx.lineTo(x + 6, y + 8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 2, y + 8);
    ctx.lineTo(x + 8, y - 10);
    ctx.lineTo(x + 16, y + 8);
    ctx.fill();
    ctx.fillStyle = "#f4efe2";
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 6);
    ctx.lineTo(x - 2, y - 14);
    ctx.lineTo(x + 1, y - 5);
    ctx.fill();
  } else if (kind === "plain") {
    ctx.strokeStyle = "#e6d39a";
    ctx.lineWidth = 1.2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 6, y + 6);
      ctx.quadraticCurveTo(x + i * 6 + 2, y, x + i * 6, y - 7);
      ctx.stroke();
    }
  } else if (kind === "marsh") {
    ctx.strokeStyle = "#d7e4c4";
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 4; i++) {
      const ox = -8 + i * 5;
      ctx.beginPath();
      ctx.moveTo(x + ox, y + 4);
      ctx.lineTo(x + ox + 1, y - 6);
      ctx.stroke();
    }
  }
}

function drawYields(ctx, x, y, kind) {
  const [food, prod, gold] = YIELD[kind] || [0, 0, 0];
  const bits = [];
  for (let i = 0; i < food; i++) bits.push("#8fd15a");
  for (let i = 0; i < prod; i++) bits.push("#d4844e");
  for (let i = 0; i < gold; i++) bits.push("#f0d78a");
  if (!bits.length) return;
  const start = x - (bits.length - 1) * 3.1;
  for (let i = 0; i < bits.length; i++) {
    ctx.fillStyle = bits[i];
    ctx.beginPath();
    ctx.arc(start + i * 6.2, y + HEX * 0.46, 2.15, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHexMap(ctx, cam, viewW, viewH, world) {
  const b = viewBounds(cam, viewW, viewH);
  const corners = [[b.left, b.top], [b.right, b.top], [b.left, b.bottom], [b.right, b.bottom]];
  let qMin = Infinity;
  let qMax = -Infinity;
  let rMin = Infinity;
  let rMax = -Infinity;
  for (const [x, y] of corners) {
    const axial = worldToAxial(x, y);
    qMin = Math.min(qMin, axial.q);
    qMax = Math.max(qMax, axial.q);
    rMin = Math.min(rMin, axial.r);
    rMax = Math.max(rMax, axial.r);
  }
  qMin -= 2;
  qMax += 2;
  rMin -= 2;
  rMax += 2;
  const provinces = world.provinces || [];
  const cells = [];
  const owners = new Map();
  for (let q = qMin; q <= qMax; q++) {
    for (let r = rMin; r <= rMax; r++) {
      const pos = axialToWorld(q, r);
      if (pos.x < b.left - HEX || pos.x > b.right + HEX || pos.y < b.top - HEX || pos.y > b.bottom + HEX) continue;
      const kind = terrainAt(q, r);
      const owner = claimOf(provinces, pos.x, pos.y);
      const key = `${q},${r}`;
      owners.set(key, owner ? owner.id : "");
      cells.push({ q, r, pos, kind, owner, key });
    }
  }
  for (const cell of cells) {
    hexPath(ctx, cell.pos.x, cell.pos.y);
    ctx.fillStyle = TERRAIN_INK[cell.kind] || TERRAIN_INK.grass;
    ctx.fill();
    if (cell.owner) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = FACTION_INK[cell.owner.faction] || "#e2c078";
      ctx.fill();
      ctx.restore();
    }
  }
  for (const cell of cells) {
    let border = false;
    if (cell.owner) {
      for (const [dq, dr] of HEX_DIRS) {
        const other = owners.get(`${cell.q + dq},${cell.r + dr}`);
        if (other !== cell.owner.id) border = true;
      }
    }
    hexPath(ctx, cell.pos.x, cell.pos.y);
    ctx.strokeStyle = border ? (FACTION_INK[cell.owner.faction] || "#e2c078") : "rgba(8, 14, 8, 0.35)";
    ctx.lineWidth = border ? 3.2 : 1;
    ctx.stroke();
  }
  for (const cell of cells) {
    if (cell.kind === "sea" || cell.kind === "river" || cell.kind === "coast") continue;
    drawHexFeature(ctx, cell.kind, cell.pos.x, cell.pos.y, hash(cell.key));
    if (cam.z >= 1 && cell.owner) drawYields(ctx, cell.pos.x, cell.pos.y, cell.kind);
  }
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
  ctx.strokeStyle = "#0c3e46";
  ctx.lineWidth = 28;
  ctx.stroke();
  traceRiver(ctx);
  ctx.strokeStyle = "#1c5964";
  ctx.lineWidth = 14;
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

let terrainSheet;

function paintTuft(g) {
  g.lineCap = "round";
  const blades = [[6, 20, 4, 6], [12, 20, 11, 3], [16, 20, 20, 7], [10, 20, 8, 8], [14, 20, 18, 4]];
  g.strokeStyle = "#3d6a3a";
  g.lineWidth = 1.5;
  for (const [x, y, cx, cy] of blades) {
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo((x + cx) / 2, y - 6, cx, cy);
    g.stroke();
  }
  g.strokeStyle = "#8ea84a";
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(12, 20);
  g.quadraticCurveTo(13, 10, 15, 4);
  g.stroke();
}

function paintStone(g) {
  g.fillStyle = "rgba(0,0,0,0.28)";
  g.beginPath();
  g.ellipse(12, 13, 8, 3, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#6d6458";
  g.beginPath();
  g.ellipse(9, 9, 6, 4, -0.4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#8d8478";
  g.beginPath();
  g.ellipse(15, 10, 5, 3.2, 0.3, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(243,230,200,0.45)";
  g.beginPath();
  g.ellipse(8, 8, 2, 1, 0, 0, Math.PI * 2);
  g.fill();
}

function paintReed(g) {
  g.strokeStyle = "#6a7a48";
  g.lineWidth = 1.3;
  g.lineCap = "round";
  for (const x of [6, 10, 14]) {
    g.beginPath();
    g.moveTo(x, 30);
    g.quadraticCurveTo(x + 2, 16, x - 1, 4);
    g.stroke();
    g.fillStyle = "#c6a15a";
    g.beginPath();
    g.ellipse(x - 1, 4, 1.6, 3.2, 0, 0, Math.PI * 2);
    g.fill();
  }
}

function paintBloom(g) {
  g.fillStyle = "#3d5630";
  g.beginPath();
  g.ellipse(11, 14, 8, 3, 0, 0, Math.PI * 2);
  g.fill();
  for (const [x, y, color] of [[6, 10, "#e07a68"], [12, 7, "#e2c078"], [16, 12, "#f3e6c8"], [9, 14, "#c6a15a"]]) {
    g.fillStyle = color;
    g.beginPath();
    g.arc(x, y, 2.1, 0, Math.PI * 2);
    g.fill();
  }
}

function paintBrush(g) {
  g.fillStyle = "#1d3a22";
  g.beginPath();
  g.ellipse(16, 16, 14, 6, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#244628";
  g.beginPath();
  g.arc(10, 12, 7, 0, Math.PI * 2);
  g.arc(20, 11, 8, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#4e7d44";
  g.beginPath();
  g.arc(14, 9, 5, 0, Math.PI * 2);
  g.fill();
}

function terrainSprites() {
  if (terrainSheet !== undefined) return terrainSheet;
  try {
    if (typeof OffscreenCanvas === "undefined") {
      terrainSheet = null;
      return null;
    }
    const paint = (w, h, fn) => {
      const canvas = new OffscreenCanvas(w, h);
      fn(canvas.getContext("2d"));
      return canvas;
    };
    terrainSheet = {
      tuft: paint(24, 22, paintTuft),
      stone: paint(24, 16, paintStone),
      reed: paint(20, 32, paintReed),
      bloom: paint(22, 18, paintBloom),
      brush: paint(36, 24, paintBrush),
    };
  } catch {
    terrainSheet = null;
  }
  return terrainSheet;
}

function stampSprite(ctx, sprite, x, y, n, time, sway) {
  ctx.save();
  ctx.translate(x, y);
  if (sway) ctx.rotate(Math.sin(time * 1.4 + (n % 7)) * 0.1);
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height);
  ctx.restore();
}

function drawLitter(ctx, cam, viewW, viewH, time) {
  const sheet = terrainSprites();
  if (!sheet) return;
  const b = viewBounds(cam, viewW, viewH);
  const step = 84;
  const x0 = Math.max(-2300, Math.floor(b.left / step) * step);
  const y0 = Math.max(-2300, Math.floor(b.top / step) * step);
  const x1 = Math.min(2300, b.right);
  const y1 = Math.min(2300, b.bottom);
  const names = ["tuft", "tuft", "stone", "bloom", "brush", "tuft"];
  for (let x = x0; x < x1; x += step) {
    for (let y = y0; y < y1; y += step) {
      const n = hash(`litter:${x},${y}`);
      if (n % 3 !== 0) continue;
      const t = (x + 2200) / 4400;
      const ry = riverPoint(Math.max(0, Math.min(1, t))).y;
      if (Math.abs(y - ry) < 40) continue;
      const kind = names[n % names.length];
      const jx = (n % 30) - 15;
      const jy = ((n >>> 6) % 30) - 15;
      stampSprite(ctx, sheet[kind], x + jx, y + jy, n, time, kind === "tuft");
    }
  }
}

function drawBanks(ctx, time) {
  const sheet = terrainSprites();
  if (!sheet) return;
  for (let i = 0; i <= 96; i++) {
    const p = riverPoint(i / 96);
    const n = hash(`bank:${i}`);
    const side = i % 2 ? 1 : -1;
    const x = p.x + (n % 22) - 11;
    const y = p.y + side * (22 + (n % 16));
    stampSprite(ctx, sheet.reed, x, y, n, time, true);
  }
}

function drawPalisade(ctx, g) {
  const stakes = Math.max(16, Math.round(g.r / 6));
  for (let i = 0; i < stakes; i++) {
    const a = (i / stakes) * Math.PI * 2 + 0.2;
    const x = g.x + Math.cos(a) * (g.r * 0.9);
    const y = g.y + Math.sin(a) * (g.r * 0.9);
    ctx.fillStyle = "#3d3224";
    ctx.fillRect(x - 1.3, y - 8, 2.6, 11);
    ctx.fillStyle = "#cbb892";
    ctx.beginPath();
    ctx.moveTo(x - 2.2, y - 8);
    ctx.lineTo(x, y - 12);
    ctx.lineTo(x + 2.2, y - 8);
    ctx.fill();
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

function drawCottage(ctx, x, y) {
  roof(ctx, x, y, 16, 13, "#6a4632", "#a86848");
  ctx.fillStyle = "#2a1c14";
  ctx.fillRect(x - 2, y + 1, 4, 5);
  ctx.fillStyle = "rgba(243,230,200,0.85)";
  ctx.fillRect(x - 6, y, 3, 3);
  ctx.fillStyle = "#5c4a34";
  ctx.fillRect(x + 4, y - 8, 2, 6);
}

function drawShed(ctx, x, y, time) {
  roof(ctx, x, y, 20, 12, "#5c4a34", "#b8894e");
  ctx.fillStyle = "#3d3224";
  ctx.fillRect(x - 8, y + 1, 5, 4);
  const flick = 0.4 + Math.sin(time * 8 + x) * 0.28;
  ctx.fillStyle = `rgba(224,122,104,${flick})`;
  ctx.fillRect(x + 3, y + 1, 4, 3);
  ctx.fillStyle = "#5c4632";
  ctx.fillRect(x + 4, y - 9, 2, 6);
}

function drawHall(ctx, x, y, time) {
  roof(ctx, x, y, 24, 11, "#6a3030", "#8d4038");
  ctx.fillStyle = "#2a140f";
  ctx.fillRect(x - 3, y + 1, 5, 4);
  const wave = Math.sin(time * 3 + y) * 1.4;
  ctx.fillStyle = "#a14a3c";
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 6);
  ctx.lineTo(x - 2, y - 4 + wave);
  ctx.lineTo(x - 9, y - 1);
  ctx.fill();
}

function drawDen(ctx, x, y) {
  roof(ctx, x, y, 13, 9, "#241f28", "#3a3344");
  ctx.fillStyle = "#9a86c8";
  ctx.fillRect(x - 1, y + 1, 4, 2);
}

function drawChapel(ctx, x, y) {
  roof(ctx, x, y, 14, 12, "#d9d3c4", "#f4efe2");
  ctx.fillStyle = "#f4efe2";
  ctx.fillRect(x - 1.5, y - 14, 3, 9);
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(x - 3.5, y - 12, 7, 1.6);
  ctx.fillRect(x - 1, y - 15, 2, 6);
}

function drawKeep(ctx, x, y) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x - 7, y - 4, 18, 16);
  ctx.fillStyle = "#cfc4b2";
  ctx.fillRect(x - 9, y - 8, 18, 14);
  ctx.fillStyle = "#8d8478";
  for (let k = -8; k <= 6; k += 4) ctx.fillRect(x + k, y - 11, 2, 3);
  ctx.fillStyle = "#3d3224";
  ctx.fillRect(x - 2, y + 1, 5, 5);
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(x + 5, y - 16, 1.4, 6);
  ctx.beginPath();
  ctx.moveTo(x + 6.4, y - 16);
  ctx.lineTo(x + 11, y - 14);
  ctx.lineTo(x + 6.4, y - 12);
  ctx.fill();
}

function drawSpire(ctx, x, y) {
  const glow = ctx.createRadialGradient(x, y, 1, x, y, 14);
  glow.addColorStop(0, "rgba(226,192,120,0.9)");
  glow.addColorStop(1, "rgba(226,192,120,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8d8478";
  ctx.fillRect(x - 2, y - 2, 4, 10);
  ctx.fillStyle = "#f3e6c8";
  ctx.beginPath();
  ctx.arc(x, y - 4, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawCivic(ctx, p, g, time) {
  const x = g.x;
  const y = g.y - 2;
  if (p.doctrine === "granary") {
    ctx.fillStyle = "#8a5a32";
    ctx.fillRect(x - 8, y - 4, 16, 12);
    ctx.fillStyle = "#a86848";
    ctx.beginPath();
    ctx.arc(x, y - 4, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#c6a15a";
    ctx.fillRect(x - 6, y - 1, 12, 3);
  } else if (p.doctrine === "levy") {
    ctx.strokeStyle = "#e8d6b0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 7, y + 8);
    ctx.lineTo(x + 5, y - 12);
    ctx.moveTo(x + 7, y + 8);
    ctx.lineTo(x - 5, y - 12);
    ctx.stroke();
    ctx.fillStyle = "#a14a3c";
    ctx.beginPath();
    ctx.arc(x + 5, y - 12, 2.2, 0, Math.PI * 2);
    ctx.arc(x - 5, y - 12, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.doctrine === "mint") {
    ctx.fillStyle = "#5c4632";
    ctx.fillRect(x - 1, y - 2, 2, 14);
    const pulse = 6 + Math.sin(time * 3) * 0.6;
    ctx.fillStyle = "#e2c078";
    ctx.beginPath();
    ctx.arc(x, y - 8, pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6d5424";
    ctx.font = "700 8px Palatino, Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("G", x, y - 5);
  } else if (p.doctrine === "college") {
    const glow = ctx.createRadialGradient(x, y - 10, 1, x, y - 10, 16);
    glow.addColorStop(0, "rgba(243,230,200,0.9)");
    glow.addColorStop(1, "rgba(243,230,200,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - 10, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5c4632";
    ctx.fillRect(x - 1, y - 6, 2, 14);
    ctx.fillStyle = "#f3e6c8";
    ctx.beginPath();
    ctx.arc(x, y - 10, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFolk(ctx, x, y, ang, time, role) {
  const step = Math.sin(time * 8 + x * 0.05);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(1.35, 1.35);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 3.2, 3.4, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a2a1c";
  ctx.lineWidth = 1.35;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-1.1, 0.4);
  ctx.lineTo(-1.5 + step * 2.4, 4.6);
  ctx.moveTo(1.1, 0.4);
  ctx.lineTo(1.5 - step * 2.4, 4.6);
  ctx.stroke();
  const tunic = {
    soldier: "#8a3e32",
    elite: "#5f7d58",
    thief: "#2a2438",
    mystic: "#9a86c8",
    smith: "#6a5344",
    farmer: "#c6a15a",
    hauler: "#8a5a32",
    host: "#efe6d6",
  }[role] || "#c6a15a";
  ctx.fillStyle = tunic;
  ctx.fillRect(-2.3, -4.6, 4.6, 5.4);
  ctx.fillStyle = "#e6c7a2";
  ctx.beginPath();
  ctx.arc(0, -6.4, 2.15, 0, Math.PI * 2);
  ctx.fill();
  if (role === "host") {
    ctx.strokeStyle = "#5c4632";
    ctx.beginPath();
    ctx.moveTo(1.2, -2);
    ctx.lineTo(1.6, -11);
    ctx.stroke();
    ctx.fillStyle = "#a14a3c";
    ctx.beginPath();
    ctx.moveTo(1.6, -11);
    ctx.lineTo(3.4, -9);
    ctx.lineTo(1.6, -8);
    ctx.fill();
  } else if (role === "farmer") {
    ctx.strokeStyle = "#5c4632";
    ctx.beginPath();
    ctx.moveTo(2, -1);
    ctx.lineTo(6.5, -5 + Math.max(0, -step) * 2.4);
    ctx.stroke();
    ctx.fillStyle = "#7d9a72";
    ctx.fillRect(5.2, -6.2 + Math.max(0, -step) * 2.4, 2.4, 1.6);
  } else if (role === "smith") {
    const arm = Math.sin(time * 11);
    ctx.strokeStyle = "#5c4632";
    ctx.beginPath();
    ctx.moveTo(2, -1.5);
    ctx.lineTo(5.5, -4 + arm * 3);
    ctx.stroke();
    ctx.fillStyle = "#b9b3aa";
    ctx.fillRect(4.4, -5.2 + arm * 3, 2.4, 2);
  } else if (role === "hauler") {
    ctx.fillStyle = "#e2c078";
    ctx.fillRect(1.8, -3.2, 3.6, 3);
  } else if (role === "soldier" || role === "elite") {
    ctx.strokeStyle = "#e8d6b0";
    ctx.beginPath();
    ctx.moveTo(1.6, -2);
    ctx.lineTo(7.2, -0.6);
    ctx.stroke();
  } else if (role === "thief") {
    ctx.fillStyle = "#1a1420";
    ctx.fillRect(-2.6, -8.6, 5.2, 2.2);
  }
  ctx.restore();
}

function drawCrew(ctx, p, g, time, known) {
  const wander = (slot, radius, role) => {
    const lap = time * 0.35 + slot * 1.7;
    const x = g.x + Math.cos(lap) * radius;
    const y = g.y + Math.sin(lap) * radius * 0.72;
    drawFolk(ctx, x, y, lap + Math.PI / 2, time + slot, role);
  };
  if (!known) {
    wander(0, g.r * 0.28, "hauler");
    wander(1, g.r * 0.42, "farmer");
    return;
  }
  const fields = Math.min(7, Math.max(2, Math.round((p.buildings.field || 0) / 7)));
  const plotX = g.x - g.r * 0.58;
  const plotY = g.y - g.r * 0.44;
  const plotW = g.r * 0.96;
  const farmers = Math.min(3, Math.max(p.buildings.field ? 2 : 0, Math.round((p.peasants || 0) / 400)));
  for (let i = 0; i < farmers; i++) {
    const span = (time * 0.16 + i / Math.max(1, farmers)) % 1;
    const dir = Math.floor(time * 0.16 + i) % 2 === 0 ? 1 : -1;
    const along = dir > 0 ? span : 1 - span;
    const x = plotX + 8 + along * (plotW - 16);
    const y = plotY + 6 + (i % fields) * 9;
    drawFolk(ctx, x, y, dir > 0 ? 0 : Math.PI, time + i, "farmer");
  }
  const smiths = (p.buildings.workshop || 0) > 0 ? 1 : 0;
  for (let i = 0; i < smiths; i++) {
    const x = g.x + g.r * 0.42;
    const y = g.y + g.r * 0.08;
    drawFolk(ctx, x, y, -0.6, time, "smith");
  }
  const haulers = (p.buildings.hearth || 0) > 0 ? 1 : 0;
  for (let i = 0; i < haulers; i++) {
    const span = (time * 0.1) % 1;
    const x = g.x + (span - 0.5) * g.r * 0.7;
    const y = g.y + g.r * 0.38;
    drawFolk(ctx, x, y, span < 0.5 ? 0 : Math.PI, time, "hauler");
  }
  const soldiers = Math.min(4, Math.round((p.soldiers || 0) / 28));
  for (let i = 0; i < soldiers; i++) {
    const lap = time * 0.28 + (i / Math.max(1, soldiers)) * Math.PI * 2;
    const x = g.x + Math.cos(lap) * g.r * 0.7;
    const y = g.y + Math.sin(lap) * g.r * 0.7;
    drawFolk(ctx, x, y, lap + Math.PI / 2, time + i, "soldier");
  }
  const elites = Math.min(2, Math.round((p.elites || 0) / 16));
  for (let i = 0; i < elites; i++) {
    const lap = -time * 0.2 + i * Math.PI;
    const x = g.x + Math.cos(lap) * g.r * 0.22;
    const y = g.y + Math.sin(lap) * g.r * 0.22;
    drawFolk(ctx, x, y, lap + Math.PI / 2, time + i, "elite");
  }
}

function drawHoldings(ctx, p, g, time, known, hour) {
  ctx.save();
  blob(ctx, g);
  ctx.clip();
  const meadow = ctx.createRadialGradient(g.x - g.r * 0.2, g.y - g.r * 0.3, 8, g.x, g.y, g.r);
  meadow.addColorStop(0, p.kind === "human" ? "#6e8b45" : "#5d7a3e");
  meadow.addColorStop(1, "#3d5630");
  ctx.fillStyle = meadow;
  ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
  const sheet = terrainSprites();
  if (sheet) {
    for (const [dx, dy] of scatter(p.id + "sod", known ? 6 : 3, g.r * 0.62)) {
      ctx.drawImage(sheet.tuft, g.x + dx - 8, g.y + dy - 12, 16, 14);
      if ((hash(p.id + dx) % 3) === 0) ctx.drawImage(sheet.bloom, g.x + dx + 6, g.y + dy - 4, 12, 10);
    }
  }
  const fields = known ? Math.min(7, Math.max(2, Math.round((p.buildings.field || 0) / 7))) : 2;
  const plotX = g.x - g.r * 0.58;
  const plotY = g.y - g.r * 0.44;
  const plotW = g.r * 0.96;
  for (let i = 0; i < fields; i++) {
    const y = plotY + 2 + i * 7;
    ctx.fillStyle = i % 2 ? "#c6a15a" : "#8ea84a";
    ctx.fillRect(plotX + 3, y, plotW - 6, 4);
  }
  ctx.strokeStyle = "rgba(92, 70, 50, 0.85)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(plotX, plotY, plotW, fields * 7 + 4);
  const specs = {
    hearth: (x, y) => drawCottage(ctx, x, y),
    workshop: (x, y) => drawShed(ctx, x, y, time),
    barracks: (x, y) => drawHall(ctx, x, y, time),
    den: (x, y) => drawDen(ctx, x, y),
    chapel: (x, y) => drawChapel(ctx, x, y),
    keep: (x, y) => drawKeep(ctx, x, y),
    spire: (x, y) => drawSpire(ctx, x, y),
  };
  if (known) {
    const spots = [];
    for (const key of Object.keys(specs)) {
      const count = Math.min(6, p.buildings[key] || 0);
      if (!count) continue;
      for (const [dx, dy] of scatter(p.id + key, count, g.r * 0.72)) spots.push({ key, x: g.x + dx, y: g.y + dy });
    }
    spots.sort((a, b) => a.y - b.y);
    for (const spot of spots) specs[spot.key](spot.x, spot.y);
    if (p.doctrine) drawCivic(ctx, p, g, time);
    if (p.studies && p.studies.crown) {
      ctx.fillStyle = "#e2c078";
      ctx.fillRect(g.x - 2, g.y - 18, 4, 16);
      ctx.beginPath();
      ctx.moveTo(g.x - 5, g.y - 18);
      ctx.lineTo(g.x, g.y - 26);
      ctx.lineTo(g.x + 5, g.y - 18);
      ctx.fill();
    }
    if (p.marks && p.marks.mill) {
      ctx.strokeStyle = "#d7e4ea";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(g.x - 18, g.y + 8, 7, 0, Math.PI * 2);
      ctx.moveTo(g.x - 18, g.y + 1);
      ctx.lineTo(g.x - 18, g.y + 15);
      ctx.moveTo(g.x - 25, g.y + 8);
      ctx.lineTo(g.x - 11, g.y + 8);
      ctx.stroke();
    }
    if (p.marks && p.marks.archive) {
      ctx.fillStyle = "#241e30";
      ctx.fillRect(g.x + 12, g.y - 24, 6, 22);
      ctx.fillStyle = "#e2c078";
      ctx.fillRect(g.x + 13, g.y - 28, 4, 4);
    }
    if (p.marks && p.marks.bastion) {
      ctx.strokeStyle = "#f3e6c8";
      ctx.lineWidth = 2;
      ctx.strokeRect(g.x - 10, g.y - 30, 18, 10);
    }
    if (p.studies && p.studies.furrow) {
      for (let i = 0; i < 5; i++) {
        const lean = Math.sin(time * 1.6 + i) * 2.2;
        const x = g.x - g.r * 0.32 + i * (g.r * 0.14);
        const y = g.y + g.r * 0.05;
        ctx.strokeStyle = i % 2 ? "#e2c078" : "#c6a15a";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(x, y + 6);
        ctx.quadraticCurveTo(x + lean, y, x + lean * 0.35, y - 8);
        ctx.stroke();
      }
    }
    if (p.studies && p.studies.kiln) {
      const flicker = 0.5 + Math.sin(time * 7) * 0.28;
      ctx.fillStyle = "#6a3030";
      ctx.fillRect(g.x + g.r * 0.22, g.y + 4, 11, 8);
      ctx.fillStyle = `rgba(224, 122, 104, ${flicker})`;
      ctx.fillRect(g.x + g.r * 0.22 + 3, g.y + 6, 4, 3);
      ctx.fillStyle = "#5c4a34";
      ctx.fillRect(g.x + g.r * 0.22 + 4, g.y - 6, 3, 10);
    }
  } else {
    for (const [dx, dy] of scatter(p.id + "camp", 3, g.r * 0.4)) specs.hearth(g.x + dx, g.y + dy);
  }
  drawCrew(ctx, p, g, time, known);
  ctx.restore();
  ctx.save();
  blob(ctx, g);
  ctx.strokeStyle = "rgba(232, 214, 176, 0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  if (known && p.studies && p.studies.palisade) drawPalisade(ctx, g);
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
  if (beaconLit(p, hour)) drawBeaconFire(ctx, g, time);
  drawPen(ctx, g, time, captiveCount(p));
  drawMuster(ctx, g, time, p.muster || 0);
  if (p.stallHour === hour) drawStall(ctx, g, time);
}

function drawStall(ctx, g, time) {
  const x = g.x + g.r * 0.22;
  const y = g.y + g.r * 0.46;
  const flap = Math.sin(time * 2.4) * 0.8;
  ctx.fillStyle = "#8a3e32";
  ctx.beginPath();
  ctx.moveTo(x - 18, y);
  ctx.lineTo(x, y - 14 + flap);
  ctx.lineTo(x + 18, y);
  ctx.lineTo(x + 16, y + 5);
  ctx.lineTo(x - 16, y + 5);
  ctx.fill();
  ctx.fillStyle = "#6a3030";
  ctx.fillRect(x - 1, y + 5, 2, 12);
  ctx.fillStyle = "#c6a15a";
  ctx.fillRect(x - 14, y + 5, 28, 7);
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(x - 10, y + 7, 6, 4);
  ctx.fillRect(x + 2, y + 7, 6, 4);
}

function drawMuster(ctx, g, time, n) {
  if (!n) return;
  const count = Math.min(6, Math.max(2, Math.round(n / 8)));
  for (let i = 0; i < count; i++) {
    const bob = Math.sin(time * 3 + i) * 1.2;
    drawFolk(ctx, g.x - g.r * 0.58, g.y - g.r * 0.28 + i * 8 + bob, -0.5, time + i * 0.2, "host");
  }
}

function drawPen(ctx, g, time, n) {
  if (!n) return;
  const count = Math.min(5, n);
  const x0 = g.x - 6;
  const y0 = g.y + g.r * 0.78;
  ctx.fillStyle = "rgba(92, 70, 50, 0.35)";
  ctx.fillRect(x0 - 10, y0 - 8, 34, 18);
  ctx.strokeStyle = "#5c4632";
  ctx.lineWidth = 1.4;
  ctx.strokeRect(x0 - 10, y0 - 8, 34, 18);
  for (let i = 0; i < count; i++) {
    drawFolk(ctx, x0 + (i % 3) * 8, y0 - 1 + Math.floor(i / 3) * 7, -Math.PI / 2, time * 0.2 + i, "farmer");
  }
}

function drawBeaconFire(ctx, g, time) {
  const x = g.x + g.r * 0.62;
  const y = g.y - g.r * 0.55;
  ctx.fillStyle = "#3a2a22";
  ctx.fillRect(x - 1.4, y - 4, 2.8, 26);
  const flicker = 0.62 + Math.sin(time * 9) * 0.28;
  const glow = ctx.createRadialGradient(x, y - 8, 1, x, y - 8, 22);
  glow.addColorStop(0, `rgba(255, 196, 96, ${0.9 * flicker})`);
  glow.addColorStop(0.4, `rgba(196, 74, 42, ${0.4 * flicker})`);
  glow.addColorStop(1, "rgba(196, 74, 42, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y - 8, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f3e6c8";
  ctx.beginPath();
  ctx.moveTo(x, y - 20 - flicker * 4);
  ctx.lineTo(x + 6, y - 4);
  ctx.lineTo(x - 6, y - 4);
  ctx.fill();
  ctx.fillStyle = "#e07a68";
  ctx.beginPath();
  ctx.moveTo(x, y - 14);
  ctx.lineTo(x + 3.2, y - 4);
  ctx.lineTo(x - 3.2, y - 4);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const t = (time * 0.7 + i * 0.33) % 1;
    ctx.globalAlpha = 0.75 * (1 - t);
    ctx.fillStyle = "#e2c078";
    ctx.fillRect(x - 1 + Math.sin(time * 4 + i) * 5, y - 18 - t * 18, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawRoads(ctx, geoms) {
  ctx.lineCap = "round";
  const seen = new Set();
  for (const a of geoms) {
    const near = geoms
      .filter((b) => b.id !== a.id)
      .map((b) => ({ b, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { b, d } of near) {
      if (d > 1400) continue;
      const key = [a.id, b.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      ctx.strokeStyle = "rgba(92, 70, 42, 0.55)";
      ctx.lineWidth = 7;
      ctx.beginPath();
      const bend = roadBend(a, b);
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(bend.mx, bend.my, b.x, b.y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(176, 146, 96, 0.45)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

function roadBend(a, b) {
  return {
    mx: (a.x + b.x) / 2 + (hash(a.id + b.id) % 40) - 20,
    my: (a.y + b.y) / 2 + 24,
  };
}

function curvePoint(a, b, bend, t) {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * bend.mx + t * t * b.x,
    y: u * u * a.y + 2 * u * t * bend.my + t * t * b.y,
  };
}

function drawRoadFolk(ctx, geoms, time) {
  const seen = new Set();
  for (const a of geoms) {
    const near = geoms
      .filter((b) => b.id !== a.id)
      .map((b) => ({ b, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { b, d } of near) {
      if (d > 1400) continue;
      const key = [a.id, b.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const bend = roadBend(a, b);
      for (let i = 0; i < 2; i++) {
        const forward = i === 0;
        const t = (time * (forward ? 0.045 : -0.04) + (hash(key) % 80) / 80 + i * 0.5) % 1;
        const span = (t + 1) % 1;
        const here = curvePoint(a, b, bend, span);
        const ahead = curvePoint(a, b, bend, Math.min(0.98, span + 0.02));
        const ang = Math.atan2(ahead.y - here.y, ahead.x - here.x);
        const nx = Math.cos(ang + Math.PI / 2);
        const ny = Math.sin(ang + Math.PI / 2);
        const side = i === 0 ? 8 : -8;
        drawFolk(ctx, here.x + nx * side, here.y + ny * side, ang, time + i, i === 0 ? "hauler" : "farmer");
      }
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
    const secret = p.name === "Unscouted";
    ctx.fillStyle = p.id === seatId ? "#e2c078" : secret ? "#3e4a36" : p.kind === "human" ? "#f3e6c8" : "#7d9a72";
    ctx.beginPath();
    ctx.arc(sx, sy, p.id === seatId ? 4.5 : 3, 0, Math.PI * 2);
    ctx.fill();
    if (beaconLit(p, world.hour)) {
      ctx.strokeStyle = "#e07a68";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  for (const site of world.sites || []) {
    const [sx, sy] = to(site.x, site.y);
    ctx.fillStyle = site.clearedBy ? "#5c5344" : "#e2c078";
    ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
  }
  const [cx, cy] = to(cam.x, cam.y);
  ctx.strokeStyle = "#e2c078";
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 12, cy - 9, 24, 18);
}

function drawSites(ctx, world) {
  for (const site of world.sites || []) {
    const open = !site.clearedBy;
    ctx.fillStyle = open ? "#6d6248" : "#3a4034";
    ctx.beginPath();
    ctx.arc(site.x, site.y, open ? 18 : 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = open ? "#e2c078" : "#5c5344";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = open ? "#e2c078" : "#8a8070";
    if (site.id === "well") {
      ctx.beginPath();
      ctx.arc(site.x, site.y, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (site.id === "orchard") {
      ctx.beginPath();
      ctx.arc(site.x - 5, site.y + 2, 4, 0, Math.PI * 2);
      ctx.arc(site.x + 5, site.y + 1, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (site.id === "stacks") {
      ctx.fillRect(site.x - 7, site.y - 3, 4, 8);
      ctx.fillRect(site.x - 1, site.y - 6, 4, 11);
      ctx.fillRect(site.x + 5, site.y - 2, 4, 7);
    } else {
      ctx.fillRect(site.x - 2, site.y - 11, 4, 16);
      ctx.beginPath();
      ctx.moveTo(site.x - 7, site.y - 11);
      ctx.lineTo(site.x, site.y - 18);
      ctx.lineTo(site.x + 7, site.y - 11);
      ctx.fill();
    }
    ctx.font = "700 13px Palatino, Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(site.name, site.x, site.y + 32);
  }
}

function drawPacts(ctx, world, seatId, time) {
  const seat = world.provinces.find((row) => row.id === seatId);
  if (!seat || !seat.pacts) return;
  const hour = world.hour || 0;
  ctx.save();
  ctx.strokeStyle = "rgba(226, 192, 120, 0.8)";
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 9]);
  ctx.lineDashOffset = -time * 12;
  for (const [id, until] of Object.entries(seat.pacts)) {
    if (typeof until !== "number" || hour > until) continue;
    const other = world.provinces.find((row) => row.id === id);
    if (!other) continue;
    const a = provinceGeom(seat);
    const b = provinceGeom(other);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

const MARCH_INK = {
  envoy: "#f3e6c8",
  clear: "#d7c4a3",
  tribute: "#f0d7a4",
  ransom: "#e2c078",
  release: "#f3e6c8",
  trade: "#e2c078",
  seize: "#e07a68",
  sack: "#e2c078",
  raze: "#ffb15a",
  thief: "#9a86c8",
  meteor: "#e07a68",
  host: "#f0d7a4",
};

function marchPoint(march, t) {
  return {
    x: march.ax + (march.bx - march.ax) * t,
    y: march.ay + (march.by - march.ay) * t,
  };
}

function drawMarch(ctx, march, time) {
  const kind = march.kind || "host";
  const color = MARCH_INK[kind] || "#e2c078";
  const ang = Math.atan2(march.by - march.ay, march.bx - march.ax);
  const nx = Math.cos(ang + Math.PI / 2);
  const ny = Math.sin(ang + Math.PI / 2);
  const count = kind === "thief" || kind === "envoy" ? 2 : kind === "trade" || kind === "tribute" || kind === "ransom" || kind === "release" ? 4 : 7;
  const role = kind === "thief" ? "thief" : kind === "trade" || kind === "tribute" || kind === "ransom" ? "hauler" : kind === "release" ? "farmer" : kind === "meteor" ? "mystic" : "soldier";
  for (let i = count - 1; i >= 0; i--) {
    const t = march.t - i * 0.035;
    if (t <= 0.01) continue;
    const clamped = Math.min(0.99, t);
    const pos = marchPoint(march, clamped);
    const side = (i % 2 ? 7 : -7);
    ctx.globalAlpha = t > 1 ? Math.max(0, 1 - (t - 1) * 4) : 1;
    drawFolk(ctx, pos.x + nx * side, pos.y + ny * side, ang, time + i * 0.2, i === 0 && kind !== "trade" ? "elite" : role);
    if (kind === "trade" && i === 0) {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(ang);
      ctx.fillStyle = "#8a5a32";
      ctx.fillRect(-10, -5, 16, 9);
      ctx.fillStyle = "#e2c078";
      ctx.fillRect(2, -8, 8, 6);
      ctx.fillStyle = "#24180f";
      ctx.beginPath();
      ctx.arc(-5, 5, 2.3, 0, Math.PI * 2);
      ctx.arc(6, 5, 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
  if (kind === "meteor") {
    const drop = (1 - Math.min(1, march.t)) * 90;
    const pos = marchPoint(march, Math.min(0.98, march.t));
    ctx.fillStyle = "rgba(224,122,104,0.45)";
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y - drop);
    ctx.lineTo(pos.x - 7, pos.y - drop - 36);
    ctx.lineTo(pos.x + 7, pos.y - drop - 28);
    ctx.fill();
    ctx.fillStyle = "#4a3428";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - drop, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  const lead = marchPoint(march, Math.min(0.98, Math.max(0.02, march.t)));
  const pulse = 16 + Math.sin(time * 6) * 4;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 5]);
  ctx.lineDashOffset = -time * 18;
  ctx.beginPath();
  ctx.arc(march.bx, march.by, pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  const title = { trade: "CARAVAN", seize: "SEIZE", sack: "SACK", raze: "RAZE", thief: "THIEF", meteor: "METEOR", host: "MARCH", clear: "OPEN", tribute: "TRIBUTE", ransom: "RANSOM", release: "RELEASE" }[kind] || "MARCH";
  ctx.fillText(title, lead.x, lead.y - 18);
}

export function drawRealm(ctx, viewW, viewH, world, seatId, selectedId, cam, march, time = 0, hoverId = null, dpr = 1, motes = [], strikes = []) {
  screenTransform(ctx, dpr);
  ctx.clearRect(0, 0, viewW, viewH);
  worldTransform(ctx, cam, viewW, viewH, dpr);
  drawGround(ctx, cam, viewW, viewH);
  drawHexMap(ctx, cam, viewW, viewH, world);
  drawRiver(ctx, time);
  drawBanks(ctx, time);
  drawLitter(ctx, cam, viewW, viewH, time);
  drawClouds(ctx, time);
  drawBirds(ctx, time);
  const geoms = world.provinces.map(provinceGeom).sort((a, b) => a.y - b.y);
  drawRoads(ctx, geoms);
  drawSites(ctx, world);
  drawPacts(ctx, world, seatId, time);
  for (const g of geoms) {
    const p = world.provinces.find((row) => row.id === g.id);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(g.x + 6, g.y + 10, g.r * 0.72, g.r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    const viewer = world.provinces.find((row) => row.id === seatId);
    const known = p.id === seatId || Boolean(viewer && intelFresh(viewer, p.id, world.hour));
    drawHoldings(ctx, p, g, time, known, world.hour);
    const studied = p.studies ? Object.values(p.studies).filter(Boolean).length : 0;
    if (studied >= 2) {
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r + 16, 0, Math.PI * 2);
      ctx.lineWidth = studied >= 8 ? 2.6 : 1.4;
      ctx.strokeStyle = studied >= 8 ? "rgba(226,192,120,0.9)" : studied >= 5 ? "rgba(154,134,200,0.85)" : "rgba(198,161,90,0.8)";
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -time * 8;
      ctx.stroke();
      ctx.setLineDash([]);
    }
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
  drawRoadFolk(ctx, geoms, time);
  const parties = Array.isArray(march) ? march : march ? [march] : [];
  for (const party of parties) drawMarch(ctx, party, time);
  for (const mote of motes) {
    ctx.globalAlpha = Math.max(0, mote.life);
    ctx.fillStyle = mote.color;
    ctx.beginPath();
    ctx.arc(mote.x, mote.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  for (const hit of strikes) {
    ctx.globalAlpha = Math.max(0, hit.life);
    ctx.strokeStyle = hit.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(hit.x, hit.y, hit.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hit.x, hit.y, Math.max(4, hit.r * 0.45), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  screenTransform(ctx, dpr);
  ctx.fillStyle = hourTint(world.hour);
  ctx.fillRect(0, 0, viewW, viewH);
  const season = seasonName(world.hour);
  ctx.fillStyle = season === "Thaw" ? "rgba(92, 140, 70, 0.06)" : season === "High Sun" ? "rgba(232, 190, 90, 0.07)" : season === "Harvest" ? "rgba(176, 92, 40, 0.07)" : "rgba(150, 180, 210, 0.08)";
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
