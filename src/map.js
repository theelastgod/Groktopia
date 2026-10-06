/** Overhead realm. World Y grows south. */
import { intelFresh } from "./sim.js";

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

function drawHoldings(ctx, p, g, time, known) {
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
  if (known) {
    for (const key of Object.keys(specs)) {
      const count = Math.min(6, p.buildings[key] || 0);
      if (!count) continue;
      for (const [dx, dy] of scatter(p.id + key, count, g.r * 0.78)) specs[key][0](g.x + dx, g.y + dy);
    }
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
    for (const [dx, dy] of scatter(p.id + "camp", 3, g.r * 0.4)) specs.hearth[0](g.x + dx, g.y + dy);
  }
  const men = known ? Math.min(12, Math.round((p.soldiers || 0) / 10)) : 0;
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
    const secret = p.name === "Unscouted";
    ctx.fillStyle = p.id === seatId ? "#e2c078" : secret ? "#3e4a36" : p.kind === "human" ? "#f3e6c8" : "#7d9a72";
    ctx.beginPath();
    ctx.arc(sx, sy, p.id === seatId ? 4.5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const [cx, cy] = to(cam.x, cam.y);
  ctx.strokeStyle = "#e2c078";
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - 12, cy - 9, 24, 18);
}

const MARCH_INK = {
  trade: "#e2c078",
  seize: "#e07a68",
  sack: "#e2c078",
  raze: "#ffb15a",
  thief: "#9a86c8",
  meteor: "#e07a68",
  host: "#f0d7a4",
};

function drawMarch(ctx, march, time) {
  const kind = march.kind || "host";
  const color = MARCH_INK[kind] || "#e2c078";
  const x = march.ax + (march.bx - march.ax) * march.t;
  const y = march.ay + (march.by - march.ay) * march.t;
  const ang = Math.atan2(march.by - march.ay, march.bx - march.ax);
  const nx = Math.cos(ang + Math.PI / 2);
  const ny = Math.sin(ang + Math.PI / 2);
  for (let i = 1; i <= 8; i++) {
    const t = Math.max(0, march.t - i * 0.035);
    const px = march.ax + (march.bx - march.ax) * t;
    const py = march.ay + (march.by - march.ay) * t;
    ctx.globalAlpha = Math.max(0, 0.22 - i * 0.022);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px - nx * (i % 2 ? 4 : -4), py - ny * (i % 2 ? 4 : -4), 5 - i * 0.3, 2.4, ang, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  if (kind === "trade") {
    ctx.fillStyle = "#8a5a32";
    ctx.fillRect(-8, -4, 14, 8);
    ctx.fillStyle = "#e2c078";
    ctx.fillRect(4, -7, 7, 7);
    ctx.fillStyle = "#24180f";
    ctx.beginPath();
    ctx.arc(-4, 5, 2.2, 0, Math.PI * 2);
    ctx.arc(6, 5, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "meteor") {
    const drop = (1 - march.t) * 86;
    ctx.rotate(-ang);
    ctx.fillStyle = "rgba(224,122,104,0.4)";
    ctx.beginPath();
    ctx.moveTo(0, -drop);
    ctx.lineTo(-6, -drop - 40);
    ctx.lineTo(6, -drop - 30);
    ctx.fill();
    ctx.fillStyle = "#4a3428";
    ctx.beginPath();
    ctx.arc(0, -drop, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e07a68";
    ctx.beginPath();
    ctx.arc(-2, -drop - 2, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "thief") {
    ctx.fillStyle = "#1a1420";
    ctx.beginPath();
    ctx.ellipse(0, 2, 8, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9a86c8";
    ctx.fillRect(-1, -9, 2, 8);
    ctx.beginPath();
    ctx.arc(6, -1, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "raze") {
    for (let i = 0; i < 4; i++) {
      const ox = -i * 7;
      const oy = (i - 1.5) * 5;
      ctx.fillStyle = "#6a3030";
      ctx.beginPath();
      ctx.arc(ox, oy, 2.2, 0, Math.PI * 2);
      ctx.fill();
      const flick = Math.sin(time * 14 + i) * 2;
      ctx.fillStyle = "#ffb15a";
      ctx.beginPath();
      ctx.moveTo(ox + 2, oy - 3);
      ctx.lineTo(ox + 6, oy - 10 - flick);
      ctx.lineTo(ox - 1, oy - 4);
      ctx.fill();
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const ox = -i * 6;
      const oy = (i - 2.5) * 3.5;
      ctx.fillStyle = i === 0 ? "#f0d7a4" : "#6a3030";
      ctx.beginPath();
      ctx.arc(ox, oy, i === 0 ? 3 : 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e8d6b0";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ox + 2, oy);
      ctx.lineTo(ox + 11, oy - 2);
      ctx.stroke();
    }
    if (kind === "sack") {
      ctx.fillStyle = "#e2c078";
      ctx.fillRect(-28, -4, 8, 6);
      ctx.fillStyle = "#8a5a32";
      ctx.fillRect(-29, -6, 10, 3);
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(8, -14);
    ctx.lineTo(18, -8);
    ctx.lineTo(8, -4);
    ctx.fill();
    ctx.strokeStyle = "#5c4632";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(8, -14);
    ctx.lineTo(8, 2);
    ctx.stroke();
  }
  ctx.restore();
  if (kind === "seize" || kind === "host") {
    ctx.strokeStyle = "rgba(240, 215, 164, 0.8)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const ahead = Math.min(1, march.t + 0.08 + i * 0.05);
      const ax = march.ax + (march.bx - march.ax) * ahead;
      const ay = march.ay + (march.by - march.ay) * ahead;
      ctx.beginPath();
      ctx.moveTo(ax - Math.cos(ang) * 8, ay - Math.sin(ang) * 8);
      ctx.lineTo(ax + Math.cos(ang) * 6, ay + Math.sin(ang) * 6);
      ctx.stroke();
    }
  }
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
  const title = { trade: "CARAVAN", seize: "SEIZE", sack: "SACK", raze: "RAZE", thief: "THIEF", meteor: "METEOR", host: "MARCH" }[kind] || "MARCH";
  ctx.fillText(title, x, y - 18);
}

export function drawRealm(ctx, viewW, viewH, world, seatId, selectedId, cam, march, time = 0, hoverId = null, dpr = 1, motes = [], strikes = []) {
  screenTransform(ctx, dpr);
  ctx.clearRect(0, 0, viewW, viewH);
  worldTransform(ctx, cam, viewW, viewH, dpr);
  drawGround(ctx, cam, viewW, viewH);
  drawHills(ctx);
  drawLitter(ctx, cam, viewW, viewH, time);
  drawRiver(ctx, time);
  drawBanks(ctx, time);
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
    const viewer = world.provinces.find((row) => row.id === seatId);
    const known = p.id === seatId || Boolean(viewer && intelFresh(viewer, p.id, world.hour));
    drawHoldings(ctx, p, g, time, known);
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
  if (march) drawMarch(ctx, march, time);
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
