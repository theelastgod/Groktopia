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

const INK = {
  hearth: "#8a5a3a",
  field: "#6f8f45",
  workshop: "#b08a52",
  barracks: "#8d4038",
  keep: "#c8beb0",
  chapel: "#d9d3c4",
  den: "#2c2830",
  spire: "#e2c078",
};

export function provinceGeom(p) {
  const home = HOME[p.id] || [((hash(p.id) % 400) - 200), ((hash(p.id + "y") % 400) - 200)];
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

function drawGround(ctx, cam, viewW, viewH) {
  const left = cam.x - viewW / cam.z;
  const top = cam.y - viewH / cam.z;
  const right = cam.x + viewW / cam.z;
  const bottom = cam.y + viewH / cam.z;
  ctx.fillStyle = "#1a2418";
  ctx.fillRect(left - 40, top - 40, right - left + 80, bottom - top + 80);
  ctx.strokeStyle = "rgba(90, 110, 70, 0.18)";
  ctx.lineWidth = 1;
  const step = 36;
  const x0 = Math.floor(left / step) * step;
  const y0 = Math.floor(top / step) * step;
  for (let x = x0; x < right; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }
  for (let y = y0; y < bottom; y += step) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#16343c";
  ctx.beginPath();
  ctx.moveTo(left, 18);
  for (let x = left; x <= right; x += 24) {
    ctx.lineTo(x, 18 + Math.sin(x / 80) * 26);
  }
  ctx.lineTo(right, 70);
  for (let x = right; x >= left; x -= 24) {
    ctx.lineTo(x, 52 + Math.sin(x / 90) * 18);
  }
  ctx.closePath();
  ctx.fill();
}

function scatter(id, n, radius) {
  const rand = rng(hash(id + ":" + n));
  const spots = [];
  for (let i = 0; i < n; i++) {
    const ang = rand() * Math.PI * 2;
    const dist = (0.18 + rand() * 0.62) * radius;
    spots.push([Math.cos(ang) * dist, Math.sin(ang) * dist]);
  }
  return spots;
}

function blot(ctx, x, y, w, h, fill) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(x + 2, y + 3, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function drawHoldings(ctx, p, g) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r - 3, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = p.kind === "human" ? "#3e5a32" : "#35512f";
  ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
  const fields = Math.min(6, Math.max(1, Math.round(p.buildings.field / 8)));
  ctx.fillStyle = "#6d8a3e";
  for (let i = 0; i < fields; i++) {
    const y = g.y - g.r * 0.55 + i * 9;
    ctx.fillRect(g.x - g.r * 0.7, y, g.r * 1.15, 5);
  }
  const order = ["hearth", "workshop", "barracks", "den", "chapel", "keep", "spire"];
  for (const key of order) {
    const count = Math.min(7, p.buildings[key]);
    const spots = scatter(p.id + key, count, g.r);
    spots.forEach(([dx, dy], i) => {
      const x = g.x + dx;
      const y = g.y + dy;
      if (key === "keep") blot(ctx, x - 8, y - 8, 16, 16, INK.keep);
      else if (key === "barracks") blot(ctx, x - 10, y - 4, 20, 8, INK.barracks);
      else if (key === "spire") {
        blot(ctx, x - 3, y - 3, 6, 6, INK.spire);
      } else if (key === "chapel") {
        blot(ctx, x - 5, y - 5, 10, 10, INK.chapel);
      } else if (key === "workshop") blot(ctx, x - 6, y - 5, 12, 9, INK.workshop);
      else if (key === "den") blot(ctx, x - 4, y - 4, 8, 8, INK.den);
      else blot(ctx, x - 4, y - 4, 8, 7, i % 2 ? "#6e4630" : INK.hearth);
    });
  }
  const men = Math.min(10, Math.round(p.soldiers / 12));
  for (let i = 0; i < men; i++) {
    const x = g.x - 16 + (i % 5) * 7;
    const y = g.y + g.r * 0.35 + Math.floor(i / 5) * 6;
    ctx.fillStyle = "#e6d2a2";
    ctx.fillRect(x, y, 3, 3);
  }
  ctx.restore();
}

export function drawRealm(ctx, viewW, viewH, world, seatId, selectedId, cam, march) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, viewW, viewH);
  ctx.setTransform(cam.z, 0, 0, cam.z, viewW / 2 - cam.x * cam.z, viewH / 2 - cam.y * cam.z);
  drawGround(ctx, cam, viewW, viewH);
  const geoms = world.provinces.map(provinceGeom).sort((a, b) => a.y - b.y);
  for (const g of geoms) {
    const p = world.provinces.find((row) => row.id === g.id);
    ctx.beginPath();
    ctx.arc(g.x, g.y + 8, g.r * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();
    drawHoldings(ctx, p, g);
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
    ctx.lineWidth = p.id === seatId ? 5 : 3;
    ctx.strokeStyle = p.id === selectedId ? "#f3e6c8" : p.id === seatId ? "#e2c078" : "rgba(232, 214, 176, 0.45)";
    ctx.stroke();
    if (p.spells && (p.spells.bulwark > 0 || p.spells.fury > 0)) {
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = p.spells.fury > 0 ? "#e07a68" : "#7d9a72";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  if (march) {
    const x = march.ax + (march.bx - march.ax) * march.t;
    const y = march.ay + (march.by - march.ay) * march.t;
    ctx.fillStyle = "#f3e6c8";
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8d4038";
    ctx.fillRect(x - 2, y - 8, 4, 10);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = "14px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  for (const g of geoms) {
    const p = world.provinces.find((row) => row.id === g.id);
    const sx = viewW / 2 + (g.x - cam.x) * cam.z;
    const sy = viewH / 2 + (g.y - g.r - 8 - cam.y) * cam.z;
    ctx.fillStyle = "rgba(20,16,12,0.72)";
    const label = p.name;
    const width = ctx.measureText(label).width + 12;
    ctx.fillRect(sx - width / 2, sy - 14, width, 18);
    ctx.fillStyle = p.id === seatId ? "#e2c078" : "#f3e6c8";
    ctx.fillText(label, sx, sy);
  }
}
