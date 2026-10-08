/** Overhead realm. World Y grows south. */
import { ageName, beaconLit, bountyOn, captiveCount, curfewUp, feastLive, foldLive, hospiceUp, innUp, intelFresh, keelUp, leveeUp, patrolUp, quarryPits, roadLive, seasonName, seatPoint, siegeLive, studyCount, terrainKind, timberYards, weirLive, worldToAxial } from "./sim.js";

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
  const home = seatPoint(p);
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

export function hitBand(bands, x, y) {
  let best = null;
  let bestD = Infinity;
  for (const band of bands || []) {
    const d = Math.hypot(x - band.x, y - band.y);
    if (d <= 48 && d < bestD) {
      best = band.id;
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

function terrainAt(q, r) {
  return terrainKind(q, r);
}

function claimReach(p) {
  return 92 + Math.min(280, (p.land || 40) * 0.55);
}

function claimOf(provinces, x, y) {
  const axial = worldToAxial(x, y);
  for (const p of provinces) {
    if ((p.plots || []).some((tile) => tile.q === axial.q && tile.r === axial.r)) return p;
  }
  let best = null;
  let bestD = Infinity;
  for (const p of provinces) {
    if (p.plots && p.plots.length) continue;
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

function drawTimberCamp(ctx, x, y, time) {
  const swing = Math.sin(time * 3) * 0.4;
  ctx.fillStyle = "#6a4a32";
  ctx.fillRect(x - 14, y + 2, 18, 5);
  ctx.fillRect(x - 10, y - 3, 16, 5);
  ctx.fillStyle = "#8a5a32";
  ctx.fillRect(x - 6, y - 8, 14, 5);
  ctx.strokeStyle = "#cbb892";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 4 - i * 5);
    ctx.lineTo(x + 4, y + 4 - i * 5);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(x + 10, y - 2);
  ctx.rotate(swing);
  ctx.strokeStyle = "#3a2a22";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6, 6);
  ctx.lineTo(4, -8);
  ctx.stroke();
  ctx.fillStyle = "#c6a15a";
  ctx.fillRect(3, -10, 4, 3);
  ctx.restore();
  ctx.fillStyle = "#3d3224";
  ctx.beginPath();
  ctx.arc(x - 8, y + 8, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawDye(ctx, x, y, time) {
  const sway = Math.sin(time * 2.2 + y) * 0.18;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#3a2a22";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-11, -8);
  ctx.lineTo(11, -8);
  ctx.stroke();
  ctx.fillStyle = "#2a241c";
  ctx.fillRect(-12, -10, 2, 16);
  ctx.fillRect(10, -10, 2, 16);
  const cloth = ["#3d4e8a", "#6a3d78", "#2f6a62"];
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(-7 + i * 6, -8);
    ctx.rotate(sway * (i === 1 ? -1 : 1));
    ctx.fillStyle = cloth[i];
    ctx.fillRect(-2, 0, 4, 9);
    ctx.fillStyle = "rgba(243, 230, 200, 0.35)";
    ctx.fillRect(-2, 6, 4, 2);
    ctx.restore();
  }
  ctx.fillStyle = "#5a4638";
  ctx.beginPath();
  ctx.ellipse(0, 8, 7, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("DYE", 0, 18);
  ctx.restore();
}

function drawSoap(ctx, x, y, time) {
  const bubble = Math.sin(time * 3) * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#8a9aa4";
  ctx.beginPath();
  ctx.ellipse(0, 4, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cfd8dc";
  ctx.beginPath();
  ctx.ellipse(0, 1, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f3e6c8";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-3, -4 + bubble, 1.4, 0, Math.PI * 2);
  ctx.arc(2, -6 - bubble, 1.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f7f1e4";
  ctx.fillRect(6, 2, 4, 3);
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("SOAP", 0, 18);
  ctx.restore();
}

function drawWick(ctx, x, y, time) {
  const flicker = 0.45 + Math.sin(time * 8) * 0.3;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#f3e6c8";
  for (let i = 0; i < 3; i++) {
    const cx = -6 + i * 6;
    ctx.fillRect(cx - 1.2, -2, 2.4, 8);
    ctx.fillStyle = `rgba(224, 160, 70, ${flicker})`;
    ctx.beginPath();
    ctx.arc(cx, -4, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f3e6c8";
  }
  ctx.fillStyle = "#5a4638";
  ctx.fillRect(-9, 6, 18, 2);
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("WICK", 0, 18);
  ctx.restore();
}

function drawWarp(ctx, x, y, time) {
  const shuttle = Math.sin(time * 3) * 8;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#6a4a32";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.lineTo(-10, 8);
  ctx.moveTo(10, -8);
  ctx.lineTo(10, 8);
  ctx.moveTo(-10, -8);
  ctx.lineTo(10, -8);
  ctx.stroke();
  ctx.strokeStyle = "#cbb892";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-10, -6 + i * 3);
    ctx.lineTo(10, -6 + i * 3);
    ctx.stroke();
  }
  ctx.fillStyle = "#3d4e8a";
  ctx.fillRect(-8, -2, 7, 8);
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(shuttle - 3, -1, 6, 3);
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("WARP", 0, 18);
  ctx.restore();
}

function drawPot(ctx, x, y, time) {
  const spin = time * 2.4;
  const glow = 0.4 + Math.sin(time * 4) * 0.25;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#6a4638";
  ctx.beginPath();
  ctx.moveTo(-8, 6);
  ctx.lineTo(-5, -4);
  ctx.lineTo(5, -4);
  ctx.lineTo(8, 6);
  ctx.fill();
  ctx.fillStyle = `rgba(224, 122, 60, ${glow})`;
  ctx.fillRect(-3, -2, 6, 4);
  ctx.strokeStyle = "#3a2a22";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(8, 2, 4, spin, spin + Math.PI * 1.4);
  ctx.stroke();
  ctx.fillStyle = "#c6a15a";
  ctx.beginPath();
  ctx.ellipse(-9, 4, 2.2, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(-4, 6, 2, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("POT", 0, 18);
  ctx.restore();
}

function drawTan(ctx, x, y, time) {
  const sway = Math.sin(time * 1.5 + x) * 0.12;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#3a2a22";
  ctx.beginPath();
  ctx.ellipse(-5, 4, 4, 2.4, 0, 0, Math.PI * 2);
  ctx.ellipse(5, 5, 4, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a5a3a";
  ctx.lineWidth = 1.4;
  ctx.save();
  ctx.rotate(sway);
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.lineTo(-8, -8);
  ctx.lineTo(2, -8);
  ctx.lineTo(2, 2);
  ctx.stroke();
  ctx.fillStyle = "#a14a3c";
  ctx.fillRect(-7, -7, 8, 6);
  ctx.restore();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("TAN", 0, 18);
  ctx.restore();
}

function drawChurn(ctx, x, y, time) {
  const dash = Math.sin(time * 4) * 3;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#f3e6c8";
  ctx.beginPath();
  ctx.ellipse(0, 4, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6a5648";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(0, -8 + dash);
  ctx.stroke();
  ctx.fillStyle = "#c6a15a";
  ctx.fillRect(-3, -10 + dash, 6, 2);
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("CHURN", 0, 18);
  ctx.restore();
}

function drawOven(ctx, x, y, time) {
  const glow = 0.45 + Math.sin(time * 5) * 0.25;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#6a4638";
  ctx.fillRect(-10, -2, 20, 10);
  ctx.fillStyle = "#4a3028";
  ctx.beginPath();
  ctx.arc(0, 0, 6, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = `rgba(224, 122, 60, ${glow})`;
  ctx.beginPath();
  ctx.arc(0, 1, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(7, 2, 5, 3);
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("OVEN", 0, 18);
  ctx.restore();
}

function drawDove(ctx, x, y, time) {
  const wing = Math.sin(time * 6) * 3;
  const ring = time * 1.8;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#6a5648";
  ctx.fillRect(-2, -2, 4, 12);
  ctx.fillStyle = "#f3e6c8";
  ctx.fillRect(-7, -8, 14, 8);
  ctx.fillStyle = "#a14a3c";
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(0, -14);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a1612";
  for (const bird of [0, 2.1, 4.2]) {
    const a = ring + bird;
    const bx = Math.cos(a) * 11;
    const by = Math.sin(a) * 5 - 12;
    ctx.beginPath();
    ctx.moveTo(bx - 2, by);
    ctx.lineTo(bx, by - wing * 0.3);
    ctx.lineTo(bx + 2, by);
    ctx.fill();
  }
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("DOVE", 0, 18);
  ctx.restore();
}

function drawMalt(ctx, x, y, time) {
  const turn = time * 1.4;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#8a4a3a";
  ctx.beginPath();
  ctx.ellipse(0, 4, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a3830";
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.lineTo(0, -8);
  ctx.lineTo(8, 2);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.translate(0, -8);
  ctx.rotate(turn);
  ctx.strokeStyle = "#f3e6c8";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(6, 0);
  ctx.moveTo(0, -4);
  ctx.quadraticCurveTo(5, -1, 0, 3);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("MALT", 0, 18);
  ctx.restore();
}

function drawReed(ctx, x, y, time) {
  const sway = Math.sin(time * 1.6 + x) * 0.18;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sway);
  ctx.strokeStyle = "#7d9a62";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  for (const col of [-8, -3, 2, 7]) {
    ctx.beginPath();
    ctx.moveTo(col, 8);
    ctx.quadraticCurveTo(col + 3, -2, col - 1, -12);
    ctx.stroke();
  }
  ctx.fillStyle = "#c6a15a";
  for (const col of [-8, -3, 2, 7]) {
    ctx.beginPath();
    ctx.ellipse(col - 1, -12, 1.7, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("REED", 0, 20);
  ctx.restore();
}

function drawChar(ctx, x, y, time) {
  const puff = (time * 18) % 16;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#3a2a22";
  ctx.beginPath();
  ctx.moveTo(-12, 6);
  ctx.lineTo(0, -2);
  ctx.lineTo(12, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#6a4632";
  ctx.fillRect(-8, 2, 10, 3);
  ctx.fillRect(-5, -1, 8, 3);
  ctx.fillStyle = "#e07a3c";
  ctx.beginPath();
  ctx.arc(1, 1, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(203, 184, 146, 0.75)";
  ctx.beginPath();
  ctx.arc(2, -4 - puff * 0.45, 2.4 + puff * 0.08, 0, Math.PI * 2);
  ctx.arc(-2, -10 - puff * 0.2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cbb892";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("CHAR", 0, 18);
  ctx.restore();
}

function drawCistern(ctx, x, y, time, store) {
  const held = Math.max(0, Math.min(80, store || 0));
  const ripple = Math.sin(time * 2.2 + x) * 0.6;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#6a5648";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 2, 11, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#3a4c58";
  ctx.beginPath();
  ctx.ellipse(0, 2 + ripple, 8, 3 + held / 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(226, 192, 120, 0.7)";
  ctx.beginPath();
  ctx.ellipse(-2, 1, 3, 1.2, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7fb0b8";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("WELL", 0, 18);
  ctx.restore();
}

function drawSail(ctx, x, y, time) {
  const spin = time * 1.4;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#8d7b68";
  ctx.fillRect(-4, -2, 8, 14);
  ctx.fillStyle = "#6a4632";
  ctx.fillRect(-5, -6, 10, 5);
  ctx.save();
  ctx.translate(0, -8);
  ctx.rotate(spin);
  ctx.strokeStyle = "#f3e6c8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.moveTo(0, 0);
    ctx.lineTo(11, 2);
  }
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#e2c078";
  ctx.beginPath();
  ctx.arc(0, -8, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("SAIL", 0, 22);
  ctx.restore();
}

function drawBell(ctx, x, y, time) {
  const swing = Math.sin(time * 3) * 0.35;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#5c564c";
  ctx.fillRect(-3, -2, 6, 12);
  ctx.strokeStyle = "#2a2620";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(0, -10);
  ctx.stroke();
  ctx.save();
  ctx.translate(0, -10);
  ctx.rotate(swing);
  ctx.fillStyle = "#c4a15a";
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(4, 0);
  ctx.lineTo(2.5, 7);
  ctx.lineTo(-2.5, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#c4a15a";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("BELL", 0, 20);
  ctx.restore();
}

function drawGrove(ctx, x, y, time) {
  const bob = Math.sin(time * 1.6 + y) * 1.1;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = "#2f6a3a";
  ctx.beginPath();
  ctx.arc(-7, -2, 6, 0, Math.PI * 2);
  ctx.arc(6, -1, 7, 0, Math.PI * 2);
  ctx.arc(0, 4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c4483a";
  ctx.beginPath();
  ctx.arc(-8, -3, 1.4, 0, Math.PI * 2);
  ctx.arc(5, -4, 1.4, 0, Math.PI * 2);
  ctx.arc(8, 1, 1.4, 0, Math.PI * 2);
  ctx.arc(-1, 3, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7d9a62";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("GROVE", 0, 18);
  ctx.restore();
}

function drawDrift(ctx, x, y, time) {
  const wash = Math.sin(time * 1.7) * 1.2;
  ctx.save();
  ctx.translate(x, y + wash);
  ctx.fillStyle = "#6a4632";
  ctx.fillRect(-10, -2, 14, 4);
  ctx.fillRect(-6, -6, 12, 4);
  ctx.fillRect(-2, -10, 10, 4);
  ctx.strokeStyle = "#cbb892";
  ctx.lineWidth = 1;
  ctx.strokeRect(-10, -2, 14, 4);
  ctx.strokeRect(-6, -6, 12, 4);
  ctx.fillStyle = "#7d9a72";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("DRIFT", 0, 14);
  ctx.restore();
}

function drawVine(ctx, x, y, time) {
  const sway = Math.sin(time * 1.8 + x) * 0.12;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sway);
  ctx.strokeStyle = "#6a4632";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-10, 6);
  ctx.lineTo(-10, -2);
  ctx.moveTo(0, 6);
  ctx.lineTo(0, -4);
  ctx.moveTo(10, 6);
  ctx.lineTo(10, -1);
  ctx.stroke();
  ctx.strokeStyle = "#3f7a45";
  ctx.lineWidth = 2;
  for (const col of [-10, 0, 10]) {
    ctx.beginPath();
    ctx.moveTo(col, 2);
    ctx.quadraticCurveTo(col - 5, -2, col, -6);
    ctx.quadraticCurveTo(col + 5, -2, col, 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#6b2d4a";
  ctx.beginPath();
  ctx.arc(-10, -4, 1.5, 0, Math.PI * 2);
  ctx.arc(0, -6, 1.5, 0, Math.PI * 2);
  ctx.arc(10, -3, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8d7b68";
  ctx.fillRect(6, 2, 7, 5);
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("VINE", 0, 18);
  ctx.restore();
}

function drawHive(ctx, x, y, time) {
  const buzz = Math.sin(time * 8) * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#c4a15a";
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(8, 6);
  ctx.lineTo(-8, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6a4632";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(5, 0);
  ctx.moveTo(-6, 3);
  ctx.lineTo(6, 3);
  ctx.stroke();
  ctx.fillStyle = "#1a1612";
  ctx.beginPath();
  ctx.arc(4 + buzz, -8, 1.3, 0, Math.PI * 2);
  ctx.arc(-6, -6 + buzz * 0.4, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("HIVE", 0, 18);
  ctx.restore();
}

function drawPan(ctx, x, y, time) {
  const glint = 0.45 + Math.sin(time * 2.4 + x) * 0.2;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#d9d3c4";
  ctx.fillRect(-12, -4, 10, 7);
  ctx.fillRect(-1, 2, 11, 7);
  ctx.fillStyle = `rgba(255, 252, 240, ${glint})`;
  ctx.fillRect(-10, -2, 6, 3);
  ctx.fillRect(1, 4, 7, 3);
  ctx.strokeStyle = "#8a7a62";
  ctx.lineWidth = 1;
  ctx.strokeRect(-12, -4, 10, 7);
  ctx.strokeRect(-1, 2, 11, 7);
  ctx.fillStyle = "#efe6c8";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("SALT", 0, 20);
  ctx.restore();
}

function drawPale(ctx, x, y, time) {
  const sway = Math.sin(time * 1.4 + x) * 0.8;
  ctx.save();
  ctx.translate(x, y + sway);
  ctx.strokeStyle = "#6a4632";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, 6);
  ctx.lineTo(-6, -8);
  ctx.moveTo(0, 7);
  ctx.lineTo(0, -10);
  ctx.moveTo(8, 6);
  ctx.lineTo(6, -8);
  ctx.stroke();
  ctx.strokeStyle = "#cbb892";
  ctx.beginPath();
  ctx.moveTo(-8, -1);
  ctx.lineTo(8, -2);
  ctx.stroke();
  ctx.fillStyle = "#c4a15a";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("PALE", 0, 18);
  ctx.restore();
}

function drawLookout(ctx, x, y, time) {
  const sweep = time * 0.8;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#5c564c";
  ctx.fillRect(-5, -8, 10, 16);
  ctx.fillStyle = "#2a2620";
  ctx.fillRect(-6, -10, 12, 3);
  ctx.save();
  ctx.translate(0, -10);
  ctx.rotate(sweep);
  ctx.strokeStyle = "rgba(226, 192, 120, 0.85)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(16, 0);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("LOOK", 0, 18);
  ctx.restore();
}

function drawWheel(ctx, x, y, time) {
  const spin = time * 1.8;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#6a4632";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.rotate(spin);
  ctx.strokeStyle = "#e2c078";
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.lineTo(9, 0);
  ctx.moveTo(0, -9);
  ctx.lineTo(0, 9);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#7fb0b8";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("WHEEL", 0, 18);
  ctx.restore();
}

function drawHamlet(ctx, x, y) {
  ctx.fillStyle = "#8a5a32";
  ctx.fillRect(x - 12, y - 2, 9, 7);
  ctx.fillRect(x + 1, y - 5, 10, 8);
  ctx.fillStyle = "#6a3030";
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 2);
  ctx.lineTo(x - 7, y - 9);
  ctx.lineTo(x - 1, y - 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 1, y - 5);
  ctx.lineTo(x + 6, y - 12);
  ctx.lineTo(x + 13, y - 5);
  ctx.fill();
  ctx.fillStyle = "#e6c7a2";
  ctx.fillRect(x + 4, y - 1, 3, 4);
}

function drawLot(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = "rgba(226, 192, 120, 0.9)";
  ctx.strokeStyle = "#1a1612";
  ctx.lineWidth = 1.2;
  ctx.fillRect(x - 7, y - 7, 14, 14);
  ctx.strokeRect(x - 7, y - 7, 14, 14);
  ctx.restore();
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

function drawStructure(ctx, x, y, key, time) {
  const bob = Math.sin(time * 1.6 + x) * 0.35;
  ctx.save();
  ctx.translate(x, y + bob);
  if (key === "field") {
    ctx.fillStyle = "#c4a15a";
    ctx.fillRect(-9, -2, 18, 7);
    ctx.fillStyle = "#7d9a72";
    ctx.fillRect(-8, -6, 3, 5);
    ctx.fillRect(-2, -7, 3, 6);
    ctx.fillRect(4, -6, 3, 5);
  } else if (key === "keep" || key === "barracks") {
    ctx.fillStyle = "#8d4a3a";
    ctx.fillRect(-8, -10, 16, 14);
    ctx.fillStyle = "#e2c078";
    ctx.fillRect(-2, -16, 4, 6);
  } else if (key === "spire" || key === "chapel") {
    ctx.fillStyle = "#7d9a72";
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(8, 4);
    ctx.lineTo(-8, 4);
    ctx.fill();
  } else if (key === "workshop" || key === "den") {
    ctx.fillStyle = "#3d3224";
    ctx.fillRect(-9, -6, 18, 11);
    ctx.fillStyle = "#a14a3c";
    ctx.fillRect(3, -12, 3, 6);
  } else {
    ctx.fillStyle = "#cbb892";
    ctx.beginPath();
    ctx.moveTo(-8, 4);
    ctx.lineTo(0, -8);
    ctx.lineTo(8, 4);
    ctx.fill();
  }
  ctx.restore();
}

function drawHexMap(ctx, cam, viewW, viewH, world, time) {
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
    const plot = cell.owner && (cell.owner.plots || []).find((tile) => tile.q === cell.q && tile.r === cell.r);
    if (plot && plot.crew === "lot") drawLot(ctx, cell.pos.x, cell.pos.y);
    if (plot && plot.crew === "pale") drawPale(ctx, cell.pos.x, cell.pos.y, time || 0);
    if (plot && plot.crew === "pan") drawPan(ctx, cell.pos.x, cell.pos.y, time || 0);
    if (plot && plot.crew === "drift") drawDrift(ctx, cell.pos.x, cell.pos.y, time || 0);
    if (cell.kind === "sea" || cell.kind === "river" || cell.kind === "coast") continue;
    drawHexFeature(ctx, cell.kind, cell.pos.x, cell.pos.y, hash(cell.key));
    if (cam.z >= 1 && cell.owner && !(plot && plot.crew === "lot")) drawYields(ctx, cell.pos.x, cell.pos.y, cell.kind);
    if (plot && plot.crew === "lot") continue;
    if (plot && plot.structure) drawStructure(ctx, cell.pos.x, cell.pos.y, plot.structure, time || 0);
    else if (plot && plot.crew === "hamlet") drawHamlet(ctx, cell.pos.x, cell.pos.y);
    else if (plot && plot.crew === "timber") drawTimberCamp(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "quarry") drawQuarry(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "look") drawLookout(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "pale") { /* stakes already drawn */ }
    else if (plot && plot.crew === "pan") { /* pans already drawn */ }
    else if (plot && plot.crew === "grove") drawGrove(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "hive") drawHive(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "vine") drawVine(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "drift") { /* stacks already drawn, including on the shore */ }
    else if (plot && plot.crew === "bell") drawBell(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "sail") drawSail(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "cistern") drawCistern(ctx, cell.pos.x, cell.pos.y, time || 0, plot.store || 0);
    else if (plot && plot.crew === "char") drawChar(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "reed") drawReed(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "malt") drawMalt(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "dove") drawDove(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "oven") drawOven(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "churn") drawChurn(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "tan") drawTan(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "dye") drawDye(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "pot") drawPot(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "warp") drawWarp(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "wick") drawWick(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew === "soap") drawSoap(ctx, cell.pos.x, cell.pos.y, time || 0);
    else if (plot && plot.crew) {
      const role = plot.crew === "hand" ? "hand" : plot.crew;
      const arms = role === "foot" || role === "soldier" || role === "elite" ? cell.owner.weapon : "";
      drawFolk(ctx, cell.pos.x, cell.pos.y - 4, 0.4, time || 0, role, cell.kind, arms);
    }
    if (plot && plot.net && weirLive(cell.owner, world.hour)) drawSkiff(ctx, cell.q, cell.r, time);
  }
  for (const cell of cells) {
    const plot = cell.owner && (cell.owner.plots || []).find((tile) => tile.q === cell.q && tile.r === cell.r);
    if (plot && plot.keel && keelUp(cell.owner, world.hour)) drawKeel(ctx, cell.q, cell.r, time || 0);
    if (plot && plot.crew === "wheel") drawWheel(ctx, cell.pos.x, cell.pos.y, time || 0);
    if (plot && plot.crew === "look") {
      for (const other of world.provinces || []) {
        if (!other || other.id === cell.owner.id) continue;
        for (const ship of other.ships || []) {
          const dist = (Math.abs(ship.q - cell.q) + Math.abs(ship.r - cell.r) + Math.abs(ship.q + ship.r - (cell.q + cell.r))) / 2;
          if (dist > 6) continue;
          const there = axialToWorld(ship.q, ship.r);
          ctx.strokeStyle = "rgba(226, 192, 120, 0.8)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 5]);
          ctx.lineDashOffset = -(time || 0) * 16;
          ctx.beginPath();
          ctx.moveTo(cell.pos.x, cell.pos.y);
          ctx.lineTo(there.x, there.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#e2c078";
          ctx.font = "700 11px Palatino, Georgia, serif";
          ctx.textAlign = "center";
          ctx.fillText("SIGHTED", (cell.pos.x + there.x) / 2, (cell.pos.y + there.y) / 2 - 8);
        }
      }
    }
  }
}

function wetBeside(q, r) {
  const here = terrainAt(q, r);
  if (here === "coast" || here === "river") return { q, r };
  for (const [dq, dr] of HEX_DIRS) {
    const kind = terrainAt(q + dq, r + dr);
    if (kind === "river" || kind === "sea" || kind === "coast") return { q: q + dq, r: r + dr };
  }
  return null;
}

function drawSkiff(ctx, q, r, time) {
  const wet = wetBeside(q, r);
  if (!wet) return;
  const pos = axialToWorld(wet.q, wet.r);
  const bob = Math.sin(time * 2.1 + q + r) * 1.6;
  ctx.save();
  ctx.translate(pos.x, pos.y + bob);
  ctx.strokeStyle = "rgba(214, 232, 236, 0.9)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(-6, 2, 9, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(7, 3, 7, 0.3, Math.PI - 0.3);
  ctx.stroke();
  ctx.fillStyle = "#6a4a32";
  ctx.beginPath();
  ctx.moveTo(-9, 5);
  ctx.lineTo(11, 5);
  ctx.lineTo(7, 0);
  ctx.lineTo(-6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3a2a22";
  ctx.beginPath();
  ctx.moveTo(1, 2);
  ctx.lineTo(1, -13);
  ctx.stroke();
  ctx.fillStyle = "#f3e6c8";
  ctx.beginPath();
  ctx.moveTo(1, -12);
  ctx.lineTo(9, -3);
  ctx.lineTo(1, -4);
  ctx.fill();
  ctx.restore();
}

function drawKeel(ctx, q, r, time) {
  const wet = wetBeside(q, r);
  if (!wet) return;
  const pos = axialToWorld(wet.q, wet.r);
  const bob = Math.sin(time * 1.6 + q) * 2;
  ctx.save();
  ctx.translate(pos.x, pos.y + bob);
  ctx.fillStyle = "#3a2a22";
  ctx.beginPath();
  ctx.moveTo(-16, 4);
  ctx.lineTo(16, 4);
  ctx.lineTo(11, -3);
  ctx.lineTo(-11, -3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#24180f";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(-2, -18);
  ctx.stroke();
  ctx.fillStyle = "#9ec4cc";
  ctx.beginPath();
  ctx.moveTo(-2, -18);
  ctx.lineTo(12, -7);
  ctx.lineTo(-2, -4);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(-14, 1, 5, 2);
  ctx.restore();
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

function eraOf(p) {
  const n = studyCount(p);
  if (n >= 9) return 4;
  if (n >= 8) return 3;
  if (n >= 5) return 2;
  if (n >= 2) return 1;
  return 0;
}

function drawPalisade(ctx, g, era = 0) {
  if (era >= 2) {
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r * 0.9, 0, Math.PI * 2);
    ctx.strokeStyle = era >= 3 ? "#e7dfd0" : "#8d8478";
    ctx.lineWidth = era >= 3 ? 4.5 : 3;
    ctx.stroke();
    if (era >= 3) {
      const merlons = Math.max(12, Math.round(g.r / 8));
      for (let i = 0; i < merlons; i++) {
        const a = (i / merlons) * Math.PI * 2;
        const x = g.x + Math.cos(a) * (g.r * 0.9);
        const y = g.y + Math.sin(a) * (g.r * 0.9);
        ctx.fillStyle = "#f3eee4";
        ctx.fillRect(x - 2.2, y - 3, 4.4, 5);
      }
    }
  }
  const stakes = Math.max(16, Math.round(g.r / 6));
  for (let i = 0; i < stakes; i++) {
    const a = (i / stakes) * Math.PI * 2 + 0.2;
    const x = g.x + Math.cos(a) * (g.r * 0.9);
    const y = g.y + Math.sin(a) * (g.r * 0.9);
    const tall = era >= 1 ? 13 : 11;
    ctx.fillStyle = era >= 2 ? "#6e675f" : "#3d3224";
    ctx.fillRect(x - 1.3, y - (tall - 3), 2.6, tall);
    ctx.fillStyle = era >= 2 ? "#cfc6b8" : "#cbb892";
    ctx.beginPath();
    ctx.moveTo(x - 2.2, y - (tall - 3));
    ctx.lineTo(x, y - (tall + 1));
    ctx.lineTo(x + 2.2, y - (tall - 3));
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

function drawCottage(ctx, x, y, era = 0) {
  if (era >= 3) {
    roof(ctx, x, y, 22, 16, "#e4dccb", "#c6a15a");
    ctx.fillStyle = "#e4dccb";
    ctx.fillRect(x + 6, y - 16, 6, 14);
    ctx.fillStyle = "#8d8478";
    ctx.fillRect(x + 7, y - 19, 4, 3);
    ctx.fillStyle = "#2a1c14";
    ctx.fillRect(x - 2, y + 1, 4, 6);
    ctx.fillStyle = "#e2c078";
    ctx.fillRect(x - 7, y - 1, 3, 4);
    return;
  }
  if (era >= 2) {
    roof(ctx, x, y, 18, 14, "#d9d3c4", "#6e675f");
    ctx.fillStyle = "#3d3224";
    ctx.fillRect(x - 2, y + 1, 4, 5);
    ctx.fillStyle = "#9ec4d4";
    ctx.fillRect(x - 6, y - 1, 3, 3);
    ctx.fillStyle = "#8d8478";
    ctx.fillRect(x + 5, y - 10, 2, 7);
    return;
  }
  if (era >= 1) {
    roof(ctx, x, y, 18, 14, "#6a4632", "#8d4038");
    ctx.fillStyle = "#3d3224";
    ctx.fillRect(x - 7, y - 2, 14, 2);
    ctx.fillStyle = "#2a1c14";
    ctx.fillRect(x - 2, y + 1, 4, 5);
    ctx.fillStyle = "rgba(243,230,200,0.85)";
    ctx.fillRect(x - 6, y, 3, 3);
    return;
  }
  roof(ctx, x, y, 16, 13, "#6a4632", "#a86848");
  ctx.fillStyle = "#2a1c14";
  ctx.fillRect(x - 2, y + 1, 4, 5);
  ctx.fillStyle = "rgba(243,230,200,0.85)";
  ctx.fillRect(x - 6, y, 3, 3);
  ctx.fillStyle = "#5c4a34";
  ctx.fillRect(x + 4, y - 8, 2, 6);
}

function drawShed(ctx, x, y, time, era = 0) {
  const flick = 0.4 + Math.sin(time * 8 + x) * 0.28;
  if (era >= 3) {
    roof(ctx, x, y, 24, 14, "#d9d3c4", "#c6a15a");
    ctx.fillStyle = "#6e675f";
    ctx.fillRect(x - 6, y - 16, 3, 10);
    ctx.fillRect(x + 5, y - 18, 3, 12);
    ctx.fillStyle = `rgba(224,122,104,${flick})`;
    ctx.fillRect(x - 1, y + 1, 5, 3);
    return;
  }
  if (era >= 2) {
    roof(ctx, x, y, 22, 13, "#8d8478", "#5c4a34");
    ctx.fillStyle = "#6e675f";
    ctx.beginPath();
    ctx.arc(x - 6, y + 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3d3224";
    ctx.fillRect(x + 4, y - 14, 3, 12);
    ctx.fillStyle = `rgba(224,122,104,${flick})`;
    ctx.fillRect(x + 1, y + 1, 4, 3);
    return;
  }
  if (era >= 1) {
    roof(ctx, x, y, 22, 13, "#4a3a28", "#8d5a32");
    ctx.fillStyle = "#3d3224";
    ctx.fillRect(x - 9, y + 1, 6, 4);
    ctx.fillStyle = `rgba(224,122,104,${flick})`;
    ctx.fillRect(x + 3, y + 1, 5, 3);
    ctx.fillStyle = "#5c4632";
    ctx.fillRect(x + 5, y - 11, 2, 8);
    return;
  }
  roof(ctx, x, y, 20, 12, "#5c4a34", "#b8894e");
  ctx.fillStyle = "#3d3224";
  ctx.fillRect(x - 8, y + 1, 5, 4);
  ctx.fillStyle = `rgba(224,122,104,${flick})`;
  ctx.fillRect(x + 3, y + 1, 4, 3);
  ctx.fillStyle = "#5c4632";
  ctx.fillRect(x + 4, y - 9, 2, 6);
}

function drawHall(ctx, x, y, time, era = 0) {
  const wave = Math.sin(time * 3 + y) * 1.4;
  if (era >= 3) {
    ctx.fillStyle = "#cfc6b8";
    ctx.fillRect(x - 14, y - 6, 28, 12);
    ctx.fillStyle = "#8d8478";
    for (let k = -12; k <= 10; k += 4) ctx.fillRect(x + k, y - 10, 2.4, 4);
    ctx.fillStyle = "#a14a3c";
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x + 18, y - 7 + wave);
    ctx.lineTo(x + 10, y - 4);
    ctx.fill();
    ctx.fillStyle = "#2a140f";
    ctx.fillRect(x - 3, y + 1, 6, 5);
    return;
  }
  if (era >= 2) {
    roof(ctx, x, y, 26, 13, "#d9d3c4", "#6e675f");
    ctx.fillStyle = "#3d3224";
    ctx.fillRect(x - 3, y + 1, 6, 5);
    ctx.fillStyle = "#8d4038";
    ctx.fillRect(x - 10, y - 2, 4, 6);
    ctx.fillRect(x + 6, y - 2, 4, 6);
    return;
  }
  if (era >= 1) {
    roof(ctx, x, y, 26, 13, "#6a3030", "#5c241c");
    ctx.fillStyle = "#2a140f";
    ctx.fillRect(x - 3, y + 1, 6, 5);
    ctx.fillStyle = "#a14a3c";
    ctx.beginPath();
    ctx.moveTo(x - 11, y - 8);
    ctx.lineTo(x - 2, y - 5 + wave);
    ctx.lineTo(x - 11, y - 2);
    ctx.fill();
    return;
  }
  roof(ctx, x, y, 24, 11, "#6a3030", "#8d4038");
  ctx.fillStyle = "#2a140f";
  ctx.fillRect(x - 3, y + 1, 5, 4);
  ctx.fillStyle = "#a14a3c";
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 6);
  ctx.lineTo(x - 2, y - 4 + wave);
  ctx.lineTo(x - 9, y - 1);
  ctx.fill();
}

function drawDen(ctx, x, y, era = 0) {
  if (era >= 3) {
    roof(ctx, x, y, 16, 12, "#3a3344", "#c6a15a");
    ctx.fillStyle = "#e2c078";
    ctx.fillRect(x - 1, y - 8, 2, 6);
    ctx.fillStyle = "#9a86c8";
    ctx.fillRect(x - 4, y + 1, 8, 2);
    return;
  }
  if (era >= 2) {
    roof(ctx, x, y, 15, 11, "#4a4458", "#2a2438");
    ctx.fillStyle = "#e2c078";
    ctx.beginPath();
    ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9a86c8";
    ctx.fillRect(x - 3, y + 1, 5, 2);
    return;
  }
  if (era >= 1) {
    roof(ctx, x, y, 16, 11, "#241f28", "#1a1420");
    ctx.fillStyle = "#9a86c8";
    ctx.fillRect(x - 2, y + 1, 6, 2);
    return;
  }
  roof(ctx, x, y, 13, 9, "#241f28", "#3a3344");
  ctx.fillStyle = "#9a86c8";
  ctx.fillRect(x - 1, y + 1, 4, 2);
}

function drawChapel(ctx, x, y, era = 0) {
  if (era >= 3) {
    ctx.fillStyle = "#e7dfd0";
    ctx.fillRect(x - 8, y - 2, 16, 10);
    ctx.beginPath();
    ctx.arc(x, y - 2, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#c6a15a";
    ctx.beginPath();
    ctx.arc(x, y - 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 1, y - 18, 2, 8);
    return;
  }
  if (era >= 2) {
    roof(ctx, x, y, 16, 16, "#d9d3c4", "#8d8478");
    ctx.fillStyle = "#f4efe2";
    ctx.fillRect(x - 1.5, y - 20, 3, 12);
    ctx.fillStyle = "#e2c078";
    ctx.fillRect(x - 4, y - 16, 8, 1.6);
    return;
  }
  if (era >= 1) {
    roof(ctx, x, y, 16, 14, "#efe6d6", "#f4efe2");
    ctx.fillStyle = "#5c4632";
    ctx.fillRect(x - 1.2, y - 16, 2.4, 10);
    ctx.fillStyle = "#e2c078";
    ctx.fillRect(x - 4, y - 14, 8, 1.6);
    return;
  }
  roof(ctx, x, y, 14, 12, "#d9d3c4", "#f4efe2");
  ctx.fillStyle = "#f4efe2";
  ctx.fillRect(x - 1.5, y - 14, 3, 9);
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(x - 3.5, y - 12, 7, 1.6);
  ctx.fillRect(x - 1, y - 15, 2, 6);
}

function drawKeep(ctx, x, y, era = 0) {
  const wall = era >= 3 ? "#f3eee4" : era >= 2 ? "#d9d3c4" : era >= 1 ? "#8d734c" : "#cfc4b2";
  const wide = era >= 3 ? 24 : era >= 1 ? 20 : 18;
  const tall = era >= 3 ? 16 : 14;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x - wide / 2 + 2, y - 4, wide + 2, tall + 2);
  ctx.fillStyle = wall;
  ctx.fillRect(x - wide / 2, y - 8, wide, tall);
  ctx.fillStyle = era >= 3 ? "#e2c078" : "#8d8478";
  const step = era >= 3 ? 3 : 4;
  for (let k = -wide / 2 + 1; k <= wide / 2 - 3; k += step) ctx.fillRect(x + k, y - 12, 2, 4);
  if (era >= 2) {
    ctx.fillStyle = wall;
    ctx.fillRect(x - wide / 2 - 3, y - 14, 6, 12);
    ctx.fillRect(x + wide / 2 - 3, y - 14, 6, 12);
    ctx.fillStyle = era >= 3 ? "#e2c078" : "#8d8478";
    ctx.fillRect(x - wide / 2 - 2, y - 17, 4, 3);
    ctx.fillRect(x + wide / 2 - 2, y - 17, 4, 3);
  }
  ctx.fillStyle = "#3d3224";
  ctx.fillRect(x - 2, y + 1, 5, 5);
  if (era < 2) {
    ctx.fillStyle = "#e2c078";
    ctx.fillRect(x + 5, y - 16, 1.4, 6);
    ctx.beginPath();
    ctx.moveTo(x + 6.4, y - 16);
    ctx.lineTo(x + 11, y - 14);
    ctx.lineTo(x + 6.4, y - 12);
    ctx.fill();
  }
}

function drawSpire(ctx, x, y, era = 0) {
  const reach = era >= 3 ? 22 : era >= 2 ? 18 : 14;
  const glow = ctx.createRadialGradient(x, y, 1, x, y, reach);
  glow.addColorStop(0, era >= 3 ? "rgba(226,192,120,0.95)" : "rgba(226,192,120,0.9)");
  glow.addColorStop(1, "rgba(226,192,120,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, reach, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = era >= 2 ? "#d9d3c4" : "#8d8478";
  ctx.fillRect(x - (era >= 1 ? 2.4 : 2), y - (era >= 2 ? 8 : 2), era >= 1 ? 4.8 : 4, era >= 2 ? 16 : 10);
  ctx.fillStyle = era >= 3 ? "#e2c078" : "#f3e6c8";
  ctx.beginPath();
  ctx.arc(x, y - (era >= 2 ? 10 : 4), era >= 3 ? 4.2 : 3, 0, Math.PI * 2);
  ctx.fill();
  if (era >= 3) {
    ctx.beginPath();
    ctx.arc(x, y - 16, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
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

function drawArms(ctx, weapon, time) {
  if (weapon === "bow") {
    ctx.strokeStyle = "#6a4632";
    ctx.beginPath();
    ctx.arc(4.2, -2, 3.2, -1.1, 1.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4.2, -5.1);
    ctx.lineTo(4.2, 1.1);
    ctx.stroke();
  } else if (weapon === "lock") {
    ctx.strokeStyle = "#2a241c";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(1.4, -2);
    ctx.lineTo(8.4, -3.2);
    ctx.stroke();
    ctx.fillStyle = "#6e675f";
    ctx.fillRect(2.2, -3.4, 2.2, 1.6);
  } else if (weapon === "cannon") {
    ctx.fillStyle = "#3a2a1c";
    ctx.fillRect(1, -1.2, 8, 2.4);
    ctx.fillStyle = "#6e675f";
    ctx.beginPath();
    ctx.arc(1.2, 1.6, 1.3, 0, Math.PI * 2);
    ctx.arc(6.2, 1.6, 1.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (weapon === "car") {
    const roll = (time * 3) % 2;
    ctx.fillStyle = "#3d3224";
    ctx.fillRect(-1, -2.4, 11, 4.2);
    ctx.fillStyle = "#6e675f";
    ctx.fillRect(6, -4.2, 3.2, 2);
    ctx.beginPath();
    ctx.arc(1.2 + roll, 2.2, 1.6, 0, Math.PI * 2);
    ctx.arc(7.2 + roll, 2.2, 1.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "#e8d6b0";
    ctx.beginPath();
    ctx.moveTo(1.6, -2);
    ctx.lineTo(7.2, -0.6);
    ctx.stroke();
  }
}

function drawFolk(ctx, x, y, ang, time, role, terrain, weapon) {
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
    hand: "#c6a15a",
    foot: "#8a3e32",
    rider: "#6a3030",
    sapper: "#6e675f",
    engine: "#5c4632",
  }[role] || "#c6a15a";
  const coat = terrain === "wood" ? "#1e4e30" : terrain === "marsh" ? "#3e5c48" : terrain === "hill" || terrain === "mount" ? "#8a7a58" : terrain === "plain" ? "#c6a15a" : terrain === "coast" ? "#2f7c74" : tunic;
  ctx.fillStyle = role === "engine" ? "#5c4632" : coat;
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
  } else if (role === "rider") {
    ctx.fillStyle = terrain === "plain" ? "#d2b15a" : "#6a4a32";
    ctx.beginPath();
    ctx.ellipse(3, 1.5, 7.2, 3.1, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(7, 1, 1.6, 3.4);
    ctx.fillRect(-1, 1.2, 1.6, 3.4);
    ctx.fillStyle = "#e6c7a2";
    ctx.beginPath();
    ctx.arc(-2, -3.2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8a3e32";
    ctx.fillRect(-3.2, -2.2, 2.6, 2.4);
  } else if (role === "engine") {
    ctx.fillStyle = "#5c4632";
    ctx.fillRect(-7, -1, 14, 3.2);
    ctx.beginPath();
    ctx.arc(-5, 2.4, 2.1, 0, Math.PI * 2);
    ctx.arc(5, 2.4, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a2a1c";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-1, -1);
    ctx.lineTo(7, -9);
    ctx.stroke();
    ctx.fillStyle = "#6e675f";
    ctx.beginPath();
    ctx.arc(8, -9, 2.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (role === "sapper") {
    ctx.strokeStyle = "#8d8478";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(2, -1);
    ctx.lineTo(7, -7);
    ctx.stroke();
    ctx.fillStyle = "#b9b3aa";
    ctx.beginPath();
    ctx.moveTo(6, -8);
    ctx.lineTo(9, -6);
    ctx.lineTo(5, -5);
    ctx.fill();
  } else if (role === "soldier" || role === "elite" || role === "foot") {
    drawArms(ctx, weapon, time);
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
    drawFolk(ctx, x, y, lap + Math.PI / 2, time + i, "soldier", "", p.weapon);
  }
  const elites = Math.min(2, Math.round((p.elites || 0) / 16));
  for (let i = 0; i < elites; i++) {
    const lap = -time * 0.2 + i * Math.PI;
    const x = g.x + Math.cos(lap) * g.r * 0.22;
    const y = g.y + Math.sin(lap) * g.r * 0.22;
    drawFolk(ctx, x, y, lap + Math.PI / 2, time + i, "elite", "", p.weapon);
  }
  if (p.weapon === "cannon" || p.weapon === "car") {
    drawFolk(ctx, g.x + g.r * 0.15, g.y + g.r * 0.55, 0.2, time, "soldier", "", p.weapon);
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
  const era = known ? eraOf(p) : 0;
  const fields = known ? Math.min(7, Math.max(2, Math.round((p.buildings.field || 0) / 7))) : 2;
  const plotX = g.x - g.r * 0.58;
  const plotY = g.y - g.r * 0.44;
  const plotW = g.r * 0.96;
  for (let i = 0; i < fields; i++) {
    const y = plotY + 2 + i * 7;
    ctx.fillStyle = era >= 2 ? (i % 2 ? "#d2b15a" : "#9bb85a") : (i % 2 ? "#c6a15a" : "#8ea84a");
    ctx.fillRect(plotX + 3, y, plotW - 6, 4);
    if (era >= 3 && i % 2 === 0) {
      ctx.fillStyle = "#2f6a34";
      ctx.beginPath();
      ctx.arc(plotX + 12 + ((i * 11) % Math.max(8, plotW - 24)), y + 2, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = "rgba(92, 70, 50, 0.85)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(plotX, plotY, plotW, fields * 7 + 4);
  const specs = {
    hearth: (x, y) => drawCottage(ctx, x, y, era),
    workshop: (x, y) => drawShed(ctx, x, y, time, era),
    barracks: (x, y) => drawHall(ctx, x, y, time, era),
    den: (x, y) => drawDen(ctx, x, y, era),
    chapel: (x, y) => drawChapel(ctx, x, y, era),
    keep: (x, y) => drawKeep(ctx, x, y, era),
    spire: (x, y) => drawSpire(ctx, x, y, era),
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
  if (known && p.studies && p.studies.palisade) drawPalisade(ctx, g, eraOf(p));
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
  if (feastLive(p, hour)) drawFeast(ctx, g, time);
  if (p.vein) drawVein(ctx, g, time, p.vein);
  if ((p.smithUntil || 0) > (hour || 0)) drawSmith(ctx, g, time);
  if ((p.sealUntil || 0) > (hour || 0)) drawSeal(ctx, g);
  if (leveeUp(p, hour)) drawLevee(ctx, g, time);
  if (foldLive(p, hour)) drawFold(ctx, g, time);
  if (curfewUp(p, hour)) drawCurfew(ctx, g, time);
  if (hospiceUp(p, hour)) drawHospice(ctx, g, time);
  if (innUp(p, hour)) drawInn(ctx, g, time);
  if (weirLive(p, hour)) drawWeirMark(ctx, g, time);
  if (timberYards(p) > 0) drawLogPile(ctx, g, timberYards(p));
  if (quarryPits(p) > 0) drawCairn(ctx, g, quarryPits(p));
  if (patrolUp(p, hour)) drawOutriders(ctx, g, time, p.patrol);
  if (keelUp(p, hour)) drawKeelMark(ctx, g, time);
  if (siegeLive(p, hour)) drawSiegePennant(ctx, g, time);
  if ((p.standards || 0) > 0) drawStandards(ctx, g, p.standards, time);
  if ((p.pelts || 0) > 0) drawPelt(ctx, g, p.pelts);
}

function drawKeelMark(ctx, g, time) {
  const x = g.x + g.r * 0.2;
  const y = g.y + g.r * 0.42;
  const bob = Math.sin(time * 1.7) * 1.1;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.strokeStyle = "#3a2a22";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(0, -14);
  ctx.stroke();
  ctx.fillStyle = "#9ec4cc";
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(11, -5);
  ctx.lineTo(0, -3);
  ctx.fill();
  ctx.restore();
}

function drawOutriders(ctx, g, time, n) {
  const count = Math.max(3, Math.min(5, Math.ceil((n || 4) / 2)));
  for (let i = 0; i < count; i++) {
    const ang = time * 0.65 + i * ((Math.PI * 2) / count);
    const rx = Math.cos(ang) * (g.r + 16);
    const ry = Math.sin(ang) * (g.r * 0.62 + 12);
    ctx.save();
    ctx.translate(g.x + rx, g.y + ry);
    ctx.rotate(ang + Math.PI / 2);
    ctx.fillStyle = "#24180f";
    ctx.fillRect(-7, -2, 14, 4);
    ctx.fillStyle = "#e2c078";
    ctx.fillRect(5, -9, 3, 8);
    ctx.restore();
  }
}

function drawPelt(ctx, g, n) {
  const x = g.x + g.r * 0.42;
  const y = g.y - g.r * 0.2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.4);
  ctx.fillStyle = "#6a3a28";
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(-1, -12, 2, 8);
  if (n > 1) {
    ctx.fillStyle = "#f3e6c8";
    ctx.font = "700 10px Palatino, Georgia, serif";
    ctx.textAlign = "left";
    ctx.fillText(String(Math.min(9, n)), 8, 3);
  }
  ctx.restore();
}

function drawStandards(ctx, g, n, time) {
  const x = g.x - g.r * 0.1;
  const y = g.y - g.r * 0.78;
  const count = Math.max(1, Math.min(3, n));
  for (let i = 0; i < count; i++) {
    const ox = (i - (count - 1) / 2) * 9;
    const snap = Math.sin(time * 2.6 + i) * 0.12;
    ctx.save();
    ctx.translate(x + ox, y);
    ctx.rotate(snap);
    ctx.strokeStyle = "#5c4632";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.fillStyle = i % 2 ? "#e2c078" : "#c45a48";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(11, 3);
    ctx.lineTo(0, 7);
    ctx.fill();
    ctx.restore();
  }
}

function drawSiegePennant(ctx, g, time) {
  const x = g.x + g.r * 0.62;
  const y = g.y - g.r * 0.55;
  const snap = Math.sin(time * 3.2) * 0.18;
  ctx.strokeStyle = "#5c4632";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y + 16);
  ctx.lineTo(x, y - 8);
  ctx.stroke();
  ctx.save();
  ctx.translate(x, y - 8);
  ctx.rotate(snap);
  ctx.fillStyle = "#e07a68";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(14, 4);
  ctx.lineTo(0, 8);
  ctx.fill();
  ctx.restore();
}

function drawQuarry(ctx, x, y, time) {
  const swing = Math.sin(time * 1.6) * 0.35;
  ctx.fillStyle = "#3a342c";
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6e675f";
  ctx.fillRect(x - 8, y + 1, 5, 4);
  ctx.fillRect(x + 2, y + 2, 6, 3);
  ctx.strokeStyle = "#8d8478";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 6);
  ctx.lineTo(x + 8, y - 10);
  ctx.stroke();
  ctx.save();
  ctx.translate(x + 8, y - 10);
  ctx.rotate(swing);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-14, 4);
  ctx.stroke();
  ctx.fillStyle = "#5c4632";
  ctx.fillRect(-16, 2, 4, 5);
  ctx.restore();
}

function drawCairn(ctx, g, n) {
  const x = g.x - g.r * 0.55;
  const y = g.y - g.r * 0.2;
  ctx.fillStyle = "#8d8478";
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 6);
  ctx.lineTo(x, y - 6);
  ctx.lineTo(x + 8, y + 6);
  ctx.fill();
  ctx.fillStyle = "#cfc6b8";
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 2);
  ctx.lineTo(x + 1, y - 10);
  ctx.lineTo(x + 6, y - 1);
  ctx.fill();
  if (n > 1) {
    ctx.fillStyle = "#6e675f";
    ctx.fillRect(x + 8, y + 1, 6, 5);
  }
}

function drawLogPile(ctx, g, n) {
  const x = g.x - g.r * 0.72;
  const y = g.y + g.r * 0.28;
  ctx.fillStyle = "#5c4632";
  ctx.fillRect(x, y, 16, 5);
  ctx.fillStyle = "#8a5a32";
  ctx.fillRect(x + 2, y - 5, 14, 5);
  if (n > 1) {
    ctx.fillStyle = "#6a4a32";
    ctx.fillRect(x + 4, y - 10, 12, 5);
  }
  ctx.strokeStyle = "#cbb892";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 2);
  ctx.lineTo(x + 14, y + 2);
  ctx.moveTo(x + 4, y - 3);
  ctx.lineTo(x + 14, y - 3);
  ctx.stroke();
}

function drawWeirMark(ctx, g, time) {
  const x = g.x - g.r * 0.08;
  const y = g.y + g.r * 0.78;
  const bob = Math.sin(time * 2) * 1.3;
  ctx.save();
  ctx.fillStyle = "#5c4632";
  ctx.fillRect(x - 16, y, 18, 4);
  ctx.fillRect(x - 16, y - 6, 3, 10);
  ctx.strokeStyle = "rgba(214, 232, 236, 0.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x + 8, y + 2, 8, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.fillStyle = "#6a4a32";
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 6 + bob);
  ctx.lineTo(x + 16, y + 6 + bob);
  ctx.lineTo(x + 13, y + 2 + bob);
  ctx.lineTo(x + 5, y + 2 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawInn(ctx, g, time) {
  const x = g.x + g.r * 0.82;
  const y = g.y + g.r * 0.62;
  const swing = Math.sin(time * 1.4) * 0.35;
  ctx.save();
  ctx.fillStyle = "#5c4632";
  ctx.fillRect(x - 16, y - 6, 32, 18);
  ctx.fillStyle = "#8d734c";
  ctx.beginPath();
  ctx.moveTo(x - 20, y - 6);
  ctx.lineTo(x, y - 20);
  ctx.lineTo(x + 20, y - 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a2a22";
  ctx.fillRect(x + 8, y - 18, 4, 8);
  const puff = (time * 0.55) % 1;
  ctx.globalAlpha = 0.45 * (1 - puff);
  ctx.fillStyle = "#efe6d6";
  ctx.beginPath();
  ctx.arc(x + 10, y - 22 - puff * 12, 2.4 + puff * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  const glow = 0.55 + Math.sin(time * 3) * 0.25;
  ctx.fillStyle = `rgba(226, 192, 120, ${glow})`;
  ctx.fillRect(x - 10, y - 1, 6, 6);
  ctx.fillRect(x + 2, y - 1, 6, 6);
  ctx.strokeStyle = "#2a241c";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 4);
  ctx.lineTo(x - 18, y - 16);
  ctx.stroke();
  ctx.save();
  ctx.translate(x - 18, y - 14);
  ctx.rotate(swing);
  ctx.fillStyle = "#a14a3c";
  ctx.fillRect(0, 0, 10, 7);
  ctx.fillStyle = "#f3e6c8";
  ctx.fillRect(2, 2, 6, 1.4);
  ctx.restore();
  ctx.fillStyle = "#6a4a32";
  ctx.fillRect(x + 16, y + 4, 3, 10);
  ctx.strokeStyle = "#3a2a22";
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 6);
  ctx.quadraticCurveTo(x + 22, y + 2, x + 24, y + 8);
  ctx.stroke();
  ctx.restore();
}

function drawHospice(ctx, g, time) {
  const x = g.x + g.r * 0.58;
  const y = g.y + g.r * 0.46;
  const flap = Math.sin(time * 1.6) * 1.2;
  ctx.save();
  ctx.fillStyle = "#f4efe2";
  ctx.beginPath();
  ctx.moveTo(x - 14, y + 8);
  ctx.lineTo(x, y - 14 + flap);
  ctx.lineTo(x + 14, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6a4a32";
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = "#7d9a72";
  ctx.beginPath();
  ctx.ellipse(x, y - 1, 3, 5.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3d5630";
  ctx.beginPath();
  ctx.moveTo(x, y - 6);
  ctx.lineTo(x, y + 4);
  ctx.stroke();
  ctx.restore();
}

function drawCurfew(ctx, g, time) {
  const y = g.y - g.r * 0.78;
  ctx.save();
  ctx.strokeStyle = "#3a2a22";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(g.x - 24, y);
  ctx.lineTo(g.x + 24, y);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const x = g.x - 18 + i * 9;
    const glow = 0.4 + 0.4 * Math.sin(time * 3 + i * 0.7);
    ctx.globalAlpha = 0.22 * glow;
    ctx.fillStyle = "#e2c078";
    ctx.beginPath();
    ctx.arc(x, y + 5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = glow;
    ctx.beginPath();
    ctx.arc(x, y + 5, 2.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFold(ctx, g, time) {
  const x = g.x - g.r * 0.7;
  const y = g.y + g.r * 0.38;
  ctx.save();
  ctx.strokeStyle = "#6a4a32";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 18, y - 12, 36, 24);
  ctx.beginPath();
  ctx.moveTo(x - 18, y - 12);
  ctx.lineTo(x - 12, y - 18);
  ctx.lineTo(x + 18, y - 18);
  ctx.lineTo(x + 18, y - 12);
  ctx.stroke();
  const spots = [[-8, 0], [0, -3], [8, 2], [-2, 6], [6, -7]];
  spots.forEach((spot, i) => {
    const bob = Math.sin(time * 2.2 + i) * 1.3;
    ctx.fillStyle = i % 2 ? "#f7f1e4" : "#e7dcc4";
    ctx.beginPath();
    ctx.ellipse(x + spot[0], y + spot[1] + bob, 4.4, 2.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2a241c";
    ctx.fillRect(x + spot[0] + 3, y + spot[1] + bob - 1, 1.5, 1.5);
  });
  ctx.restore();
}

function drawLevee(ctx, g, time) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r * 1.16, 0, Math.PI * 2);
  ctx.strokeStyle = "#6e97a4";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r * 1.28, 0, Math.PI * 2);
  ctx.strokeStyle = "#c4b08a";
  ctx.lineWidth = 2.2;
  ctx.setLineDash([5, 4]);
  ctx.lineDashOffset = -time * 10;
  ctx.stroke();
  ctx.setLineDash([]);
  const gateX = g.x + g.r * 1.02;
  const gateY = g.y - 5;
  ctx.fillStyle = "#5c4632";
  ctx.fillRect(gateX, gateY, 16, 10);
  ctx.fillStyle = "#3d5630";
  ctx.fillRect(gateX + 6, gateY - 7, 3, 8);
  ctx.globalAlpha = 0.45 + 0.25 * Math.sin(time * 2.4);
  ctx.fillStyle = "#d5eef5";
  ctx.beginPath();
  ctx.arc(g.x - g.r * 0.82, g.y + g.r * 0.72, 3.2, 0, Math.PI * 2);
  ctx.arc(g.x + g.r * 0.2, g.y - g.r * 1.05, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSeal(ctx, g) {
  const x = g.x + g.r * 0.42;
  const y = g.y - g.r * 0.58;
  ctx.fillStyle = "#6a4a32";
  ctx.fillRect(x - 9, y - 7, 18, 16);
  ctx.strokeStyle = "#e2c078";
  ctx.lineWidth = 1.4;
  ctx.strokeRect(x - 9, y - 7, 18, 16);
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 2);
  ctx.lineTo(x + 7, y - 2);
  ctx.moveTo(x - 7, y + 3);
  ctx.lineTo(x + 7, y + 3);
  ctx.stroke();
  ctx.fillStyle = "#a14a3c";
  ctx.beginPath();
  ctx.arc(x, y + 7, 3.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawSmith(ctx, g, time) {
  const x = g.x - g.r * 0.35;
  const y = g.y - g.r * 0.55;
  ctx.fillStyle = "#3a2a22";
  ctx.fillRect(x - 8, y, 16, 7);
  ctx.fillStyle = "#5c4632";
  ctx.fillRect(x - 3, y - 8, 6, 8);
  ctx.fillStyle = "#a14a3c";
  ctx.fillRect(x - 5, y + 1, 10, 3);
  const puff = (time * 0.7) % 1;
  ctx.globalAlpha = 0.55 * (1 - puff);
  ctx.fillStyle = "#efe6d6";
  ctx.beginPath();
  ctx.arc(x + Math.sin(time * 2) * 2, y - 12 - puff * 14, 3 + puff * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawVein(ctx, g, time, kind) {
  const x = g.x - g.r * 0.74;
  const y = g.y + g.r * 0.22;
  if (kind === "spring") {
    ctx.fillStyle = "#6e8f9a";
    ctx.beginPath();
    ctx.ellipse(x, y, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(243, 230, 200, 0.75)";
    ctx.beginPath();
    ctx.ellipse(x - 1, y - 1 + Math.sin(time * 3) * 0.6, 3, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (kind === "iron") {
    ctx.fillStyle = "#3a2a22";
    ctx.beginPath();
    ctx.moveTo(x - 9, y + 5);
    ctx.lineTo(x, y - 9);
    ctx.lineTo(x + 9, y + 5);
    ctx.fill();
    ctx.fillStyle = "#a14a3c";
    ctx.fillRect(x - 2, y - 1, 3, 3);
    return;
  }
  ctx.fillStyle = "#efe6d6";
  ctx.beginPath();
  ctx.ellipse(x, y, 10, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f3e6c8";
  ctx.fillRect(x - 4, y - 7, 2, 4);
  ctx.fillRect(x + 2, y - 8, 2, 5);
}

function drawBountyMark(ctx, g, time) {
  const x = g.x + g.r * 0.7;
  const y = g.y - g.r * 0.08;
  const pulse = 8 + Math.sin(time * 4) * 0.7;
  ctx.fillStyle = "#6d5424";
  ctx.beginPath();
  ctx.arc(x, y, pulse + 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.beginPath();
  ctx.arc(x, y, pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6d5424";
  ctx.font = "700 9px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("B", x, y + 3);
}

function drawFeast(ctx, g, time) {
  const x = g.x - g.r * 0.02;
  const y = g.y - g.r * 0.82;
  ctx.fillStyle = "#5c4632";
  ctx.fillRect(x - 18, y, 36, 4);
  ctx.fillStyle = "#f3e6c8";
  ctx.fillRect(x - 20, y - 3, 40, 5);
  for (let i = 0; i < 3; i++) {
    const fx = x - 14 + i * 14;
    const wave = Math.sin(time * 3 + i) * 1.6;
    ctx.fillStyle = i === 1 ? "#a14a3c" : "#e2c078";
    ctx.beginPath();
    ctx.moveTo(fx, y - 3);
    ctx.lineTo(fx, y - 16);
    ctx.lineTo(fx + 7 + wave, y - 11);
    ctx.lineTo(fx, y - 8);
    ctx.fill();
  }
  ctx.fillStyle = "#c6a15a";
  ctx.fillRect(x - 8, y - 1, 5, 2);
  ctx.fillRect(x + 3, y - 1, 5, 2);
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
  const scale = width / 24000;
  const to = (x, y) => [width / 2 + x * scale, height / 2 + y * scale];
  ctx.strokeStyle = "rgba(28, 89, 100, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 3000 * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 5600 * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 11000 * scale, 0, Math.PI * 2);
  ctx.stroke();
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
    if (bountyOn(world, p.id, world.hour)) {
      ctx.fillStyle = "#e2c078";
      ctx.fillRect(sx + 3, sy - 5, 3, 3);
    }
    if (innUp(p, world.hour)) {
      ctx.fillStyle = "#a14a3c";
      ctx.fillRect(sx - 2, sy + 4, 5, 3);
    }
  }
  for (const site of world.sites || []) {
    const [sx, sy] = to(site.x, site.y);
    ctx.fillStyle = site.clearedBy ? "#5c5344" : "#e2c078";
    ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
  }
  for (const band of world.bands || []) {
    const [sx, sy] = to(band.x, band.y);
    const live = (band.men || 0) >= 8 && (band.downUntil || 0) <= (world.hour || 0);
    ctx.fillStyle = live ? "#a14a3c" : "#5c5344";
    ctx.beginPath();
    ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
    ctx.fill();
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

function drawBands(ctx, world, time) {
  const hour = world.hour || 0;
  for (const band of world.bands || []) {
    const live = (band.men || 0) >= 8 && (band.downUntil || 0) <= hour;
    ctx.save();
    ctx.translate(band.x, band.y);
    ctx.fillStyle = live ? "rgba(90, 42, 28, 0.38)" : "rgba(50, 44, 36, 0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 8, 30, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    const tents = live ? 3 : 1;
    for (let i = 0; i < tents; i++) {
      const ox = (i - (tents - 1) / 2) * 16;
      ctx.fillStyle = !live ? "#4a4038" : i === 1 ? "#a14a3c" : "#6d5344";
      ctx.beginPath();
      ctx.moveTo(ox - 8, 6);
      ctx.lineTo(ox, -14);
      ctx.lineTo(ox + 8, 6);
      ctx.fill();
    }
    if (live) {
      const flick = 5 + Math.sin(time * 7) * 2;
      ctx.fillStyle = "#e2c078";
      ctx.beginPath();
      ctx.moveTo(20, 5);
      ctx.lineTo(24, 5 - flick);
      ctx.lineTo(28, 5);
      ctx.fill();
      ctx.fillStyle = "#e07a68";
      ctx.beginPath();
      ctx.arc(24, 6, 2.2, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        const ang = time * 0.85 + i * 2.1;
        const rx = Math.cos(ang) * 36;
        const ry = Math.sin(ang) * 16;
        ctx.fillStyle = "#24180f";
        ctx.fillRect(rx - 5, ry - 2, 10, 4);
        ctx.fillStyle = "#c45a48";
        ctx.fillRect(rx + 3, ry - 7, 3, 6);
      }
    }
    ctx.fillStyle = live ? "#f3e6c8" : "#8a8070";
    ctx.font = "700 13px Palatino, Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(live ? `${band.name} · ${band.men}` : `${band.name} · ash`, 0, 38);
    ctx.restore();
    if (live && band.raid && band.raid.hour === hour && band.raid.target) {
      const target = (world.provinces || []).find((row) => row.id === band.raid.target);
      if (!target) continue;
      const [tx, ty] = seatPoint(target);
      ctx.save();
      ctx.strokeStyle = band.raid.met === "patrol" ? "rgba(226, 192, 120, 0.9)" : band.raid.met === "keel" ? "rgba(158, 196, 204, 0.95)" : "rgba(196, 90, 72, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 8]);
      ctx.lineDashOffset = -time * 22;
      ctx.beginPath();
      ctx.moveTo(band.x, band.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.restore();
    }
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

function drawSieges(ctx, world, time) {
  const hour = world.hour || 0;
  for (const from of world.provinces) {
    if (!siegeLive(from, hour)) continue;
    const other = world.provinces.find((row) => row.id === from.siege.target);
    if (!other) continue;
    const a = provinceGeom(from);
    const b = provinceGeom(other);
    ctx.save();
    ctx.strokeStyle = "rgba(224, 122, 104, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 7]);
    ctx.lineDashOffset = -time * 14;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);
    const t = 0.74;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = "#8a5a32";
    ctx.beginPath();
    ctx.moveTo(-16, 8);
    ctx.lineTo(-4, -6);
    ctx.lineTo(8, 8);
    ctx.fill();
    ctx.fillStyle = "#c45a48";
    ctx.fillRect(-2, -10, 12, 7);
    const ram = Math.sin(time * 2.4) * 3;
    ctx.fillStyle = "#5c4632";
    ctx.fillRect(-18 + ram, -2, 22, 4);
    ctx.fillStyle = "#3a342c";
    ctx.beginPath();
    ctx.arc(6 + ram, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawFolk(ctx, x - 10, y + 12, ang, time, "soldier");
    drawFolk(ctx, x + 8, y + 14, ang, time + 0.4, "soldier");
  }
}

function drawInnTraffic(ctx, world, time) {
  const hour = world.hour || 0;
  for (const from of world.provinces) {
    if (!innUp(from, hour)) continue;
    const a = provinceGeom(from);
    const links = [];
    for (const [id, until] of Object.entries(from.pacts || {})) {
      if (typeof until === "number" && hour <= until) links.push(id);
    }
    for (const [id, until] of Object.entries(from.roads || {})) {
      if (typeof until === "number" && until > hour) links.push(id);
    }
    const seen = new Set();
    links.forEach((id, index) => {
      if (seen.has(id)) return;
      seen.add(id);
      const other = world.provinces.find((row) => row.id === id);
      if (!other) return;
      const b = provinceGeom(other);
      const t = ((time * 0.05) + index * 0.27) % 1;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      drawFolk(ctx, x, y, ang, time + index, "hauler");
    });
  }
}

function drawCauseways(ctx, world) {
  const hour = world.hour || 0;
  ctx.save();
  for (const from of world.provinces) {
    for (const [id, until] of Object.entries(from.roads || {})) {
      if (!roadLive({ roads: { [id]: until } }, id, hour)) continue;
      const other = world.provinces.find((row) => row.id === id);
      if (!other) continue;
      const a = provinceGeom(from);
      const b = provinceGeom(other);
      ctx.strokeStyle = "#8d734c";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.strokeStyle = "#e6d3ae";
      ctx.lineWidth = 2;
      ctx.stroke();
      for (let i = 1; i <= 3; i++) {
        const t = i / 4;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        ctx.fillStyle = "#5c4632";
        ctx.fillRect(x - 2, y - 7, 4, 14);
        ctx.fillStyle = "#f3e6c8";
        ctx.fillRect(x - 1, y - 9, 2, 3);
      }
    }
  }
  ctx.restore();
}

const MARCH_INK = {
  envoy: "#f3e6c8",
  clear: "#d7c4a3",
  tribute: "#f0d7a4",
  bounty: "#e2c078",
  relief: "#d7c4a3",
  road: "#c4b08a",
  siege: "#e07a68",
  sally: "#f3e6c8",
  ride: "#f3e6c8",
  bribe: "#e2c078",
  band: "#c45a48",
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
  const count = kind === "thief" || kind === "envoy" || kind === "bounty" ? 2 : kind === "trade" || kind === "tribute" || kind === "ransom" || kind === "release" || kind === "relief" || kind === "road" ? 4 : 7;
  const role = kind === "thief" ? "thief" : kind === "bounty" || kind === "trade" || kind === "tribute" || kind === "ransom" || kind === "relief" || kind === "road" ? "hauler" : kind === "release" ? "farmer" : kind === "meteor" ? "mystic" : "soldier";
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
  const title = { trade: "CARAVAN", seize: "SEIZE", sack: "SACK", raze: "RAZE", thief: "THIEF", meteor: "METEOR", host: "MARCH", clear: "OPEN", tribute: "TRIBUTE", ransom: "RANSOM", release: "RELEASE", bounty: "BOUNTY", relief: "RELIEF", road: "CAUSEWAY", ride: "RIDE", bribe: "PARLEY", band: "BAND", siege: "SIEGE", sally: "SALLY" }[kind] || "MARCH";
  ctx.fillText(title, lead.x, lead.y - 18);
}

function drawTown(ctx, x, y, port) {
  ctx.fillStyle = port ? "#d9d3c4" : "#6a4632";
  ctx.fillRect(x - 10, y - 6, 12, 10);
  ctx.fillRect(x + 4, y - 4, 9, 8);
  ctx.fillStyle = port ? "#e2c078" : "#8d4038";
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 6);
  ctx.lineTo(x - 4, y - 14);
  ctx.lineTo(x + 4, y - 6);
  ctx.fill();
  if (port) {
    ctx.fillStyle = "#5c4632";
    ctx.fillRect(x - 16, y + 8, 28, 3);
    ctx.fillStyle = "#2f7c74";
    ctx.fillRect(x + 14, y + 6, 8, 6);
  }
}

function drawSlip(ctx, x, y, time) {
  const dart = Math.sin(time * 4) * 10;
  ctx.save();
  ctx.translate(x + dart, y + 16);
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(-9, -2, 18, 4);
  ctx.fillStyle = "#7fb0b8";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("SLIP", 0, -8);
  ctx.restore();
}

function drawBoom(ctx, x, y, time) {
  const sway = Math.sin(time * 2) * 1.2;
  ctx.strokeStyle = "#24180f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 18, y + 10 + sway);
  ctx.lineTo(x + 18, y + 10 - sway);
  ctx.stroke();
  ctx.fillStyle = "#6a4632";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(x + i * 8, y + 10, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function portHeld(world, ownerId, colony) {
  for (const realm of world.provinces || []) {
    if (realm.id === ownerId) continue;
    for (const ship of realm.ships || []) {
      if (!ship.block || ship.block.owner !== ownerId || ship.block.id !== colony.id) continue;
      const dist = (Math.abs(ship.q - colony.q) + Math.abs(ship.r - colony.r) + Math.abs(ship.q + ship.r - (colony.q + colony.r))) / 2;
      if (dist <= 2) return true;
    }
  }
  return false;
}

function drawFounder(ctx, x, y, time) {
  const bob = Math.sin(time * 6) * 1.4;
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(x + 4, y - 16 + bob, 2, 12);
  ctx.beginPath();
  ctx.moveTo(x + 6, y - 16 + bob);
  ctx.lineTo(x + 14, y - 12 + bob);
  ctx.lineTo(x + 6, y - 8 + bob);
  ctx.fill();
  ctx.fillStyle = "#cbb892";
  ctx.beginPath();
  ctx.arc(x, y - 6 + bob, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a4632";
  ctx.fillRect(x - 3, y - 3 + bob, 6, 8);
}

function drawFerry(ctx, x, y, time) {
  const rock = Math.sin(time * 2.4 + x) * 1.4;
  ctx.save();
  ctx.translate(x, y + rock);
  ctx.fillStyle = "#2f5c6e";
  ctx.fillRect(-12, -3, 24, 7);
  ctx.fillStyle = "#e2c078";
  ctx.fillRect(-1, -14, 2, 12);
  ctx.beginPath();
  ctx.moveTo(1, -14);
  ctx.lineTo(10, -8);
  ctx.lineTo(1, -4);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("FERRY", 0, 16);
  ctx.restore();
}

function drawHull(ctx, x, y, kind, time, hunting) {
  const rock = Math.sin(time * 2 + x) * 1.2;
  ctx.save();
  ctx.translate(x, y + rock);
  ctx.fillStyle = kind === "hulk" || kind === "dromon" ? "#3d3224" : "#6a4632";
  if (kind === "galley" || kind === "dromon") ctx.fillRect(-16, -4, 32, 8);
  else if (kind === "hulk") ctx.fillRect(-14, -7, 28, 14);
  else ctx.fillRect(-10, -4, 20, 8);
  ctx.fillStyle = "#e2c078";
  if (kind === "fisher" || kind === "cog" || kind === "dromon") {
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(8, -16);
    ctx.lineTo(0, -16);
    ctx.fill();
  }
  if (kind === "dromon") {
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-2, -18);
    ctx.lineTo(-8, -18);
    ctx.fill();
  }
  if (kind === "galley") {
    ctx.strokeStyle = "#cbb892";
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 5, 4);
      ctx.lineTo(i * 5 + 6, 9);
      ctx.stroke();
    }
  }
  if (hunting) {
    ctx.fillStyle = "#a33b32";
    ctx.beginPath();
    ctx.moveTo(6, -4);
    ctx.lineTo(16, -12);
    ctx.lineTo(6, -8);
    ctx.fill();
  }
  ctx.restore();
}

function drawCompany(ctx, x, y, time) {
  const bob = Math.sin(time * 4) * 1.2;
  ctx.save();
  ctx.translate(x - 14, y - 12 + bob);
  ctx.strokeStyle = "#cbb892";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 4, 6);
    ctx.lineTo(i * 4 + 2, -6);
    ctx.stroke();
  }
  ctx.fillStyle = "#a14a3c";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("COMPANY", 6, 16);
  ctx.restore();
}

function drawPrize(ctx, x, y, time) {
  const wave = Math.sin(time * 3) * 2;
  ctx.save();
  ctx.translate(x + 14, y - 8);
  ctx.strokeStyle = "#1a1612";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(0, -16);
  ctx.stroke();
  ctx.fillStyle = "#a14a3c";
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(12, -11 + wave);
  ctx.lineTo(0, -6);
  ctx.fill();
  ctx.fillStyle = "#a14a3c";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText("PRIZE", 2, 14);
  ctx.restore();
}

function drawBuoy(ctx, x, y, time) {
  const blink = Math.sin(time * 5) > 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#6a4632";
  ctx.fillRect(-2, -2, 4, 14);
  ctx.fillStyle = blink ? "#e2c078" : "#a68445";
  ctx.beginPath();
  ctx.arc(0, -6, blink ? 4 : 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("BUOY", 0, -16);
  ctx.restore();
}

function drawNet(ctx, x, y, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(47, 92, 110, 0.9)";
  ctx.lineWidth = 1.2;
  for (let i = -2; i <= 2; i++) {
    const sway = Math.sin(time * 2 + i) * 1.4;
    ctx.beginPath();
    ctx.moveTo(-16, i * 4 + sway);
    ctx.lineTo(16, i * 4 - sway);
    ctx.stroke();
  }
  ctx.fillStyle = "#7fb0b8";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("NET", 0, -16);
  ctx.restore();
}

function drawWreck(ctx, x, y, time) {
  const rock = Math.sin(time * 1.3 + x) * 0.7;
  ctx.save();
  ctx.translate(x, y + rock);
  ctx.rotate(-0.45);
  ctx.fillStyle = "rgba(36, 28, 22, 0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 4, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a2a22";
  ctx.fillRect(-12, -3, 22, 6);
  ctx.strokeStyle = "#8d4038";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(6, -12);
  ctx.stroke();
  ctx.fillStyle = "#e2c078";
  ctx.beginPath();
  ctx.arc(8, -7 + Math.sin(time * 4) * 1.2, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLee(ctx, x, y, time) {
  const sway = Math.sin(time * 1.6) * 1.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(127, 176, 184, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-10, 6 + sway, 22, Math.PI * 0.2, Math.PI * 1.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-10, 6, 28, Math.PI * 0.28, Math.PI * 1.05);
  ctx.stroke();
  ctx.fillStyle = "#7fb0b8";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("LEE", -22, -8);
  ctx.restore();
}

function drawChain(ctx, x, y, time) {
  const sag = Math.sin(time * 2.2) * 1.6;
  ctx.save();
  ctx.translate(x - 26, y + 18);
  ctx.fillStyle = "#2a2620";
  ctx.fillRect(-2, -8, 4, 14);
  ctx.fillRect(28, -8, 4, 14);
  ctx.strokeStyle = "#6a5a42";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.quadraticCurveTo(15, 8 + sag, 30, -4);
  ctx.stroke();
  ctx.fillStyle = "#cbb892";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("CHAIN", 15, 20);
  ctx.restore();
}

function drawLamp(ctx, x, y, time) {
  ctx.save();
  ctx.translate(x, y - 16);
  ctx.fillStyle = "#3d3224";
  ctx.fillRect(-3, -4, 6, 20);
  ctx.fillStyle = "#e2c078";
  ctx.beginPath();
  ctx.arc(0, -6, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(0, -6);
  ctx.rotate(time * 0.9);
  ctx.strokeStyle = "rgba(226, 192, 120, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(42, 0);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("LAMP", 0, 28);
  ctx.restore();
}

function drawDues(ctx, x, y, time) {
  const wave = Math.sin(time * 2) * 1.2;
  ctx.save();
  ctx.translate(x + 16, y + 10);
  ctx.fillStyle = "#6a4632";
  ctx.fillRect(-8, -2, 16, 10);
  ctx.fillStyle = "#e2c078";
  ctx.beginPath();
  ctx.moveTo(-10, -2 + wave);
  ctx.lineTo(0, -8 + wave);
  ctx.lineTo(10, -2 + wave);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("DUES", 0, 20);
  ctx.restore();
}

function drawQuay(ctx, x, y, time) {
  const bob = Math.sin(time * 3) * 1.4;
  ctx.save();
  ctx.translate(x - 20, y + 8 + bob);
  ctx.strokeStyle = "#cbb892";
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 4, 8);
    ctx.lineTo(i * 4 + 1, -6);
    ctx.stroke();
  }
  ctx.fillStyle = "#2f5c6e";
  ctx.fillRect(-2, 6, 16, 3);
  ctx.fillStyle = "#2f5c6e";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("WATCH", 6, 22);
  ctx.restore();
}

function drawMole(ctx, x, y, time) {
  const flash = Math.sin(time * 5) > 0.35;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#5c5648";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(6, 14, 18, 0.15, 2.2);
  ctx.stroke();
  ctx.fillStyle = "#2a2620";
  ctx.fillRect(16, 6, 10, 4);
  if (flash) {
    ctx.fillStyle = "rgba(226, 192, 120, 0.9)";
    ctx.beginPath();
    ctx.arc(28, 6, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#2f5c6e";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("MOLE", 8, 30);
  ctx.restore();
}

function drawCrane(ctx, x, y, time) {
  const swing = Math.sin(time * 1.4) * 0.4;
  ctx.save();
  ctx.translate(x + 18, y + 6);
  ctx.fillStyle = "#6a4632";
  ctx.fillRect(-2, -4, 5, 16);
  ctx.save();
  ctx.translate(0, -4);
  ctx.rotate(swing);
  ctx.strokeStyle = "#3a2a22";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(16, -12);
  ctx.stroke();
  ctx.strokeStyle = "#cbb892";
  ctx.beginPath();
  ctx.moveTo(16, -12);
  ctx.lineTo(16, -3 + Math.sin(time * 3) * 1.5);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawCooper(ctx, x, y, time) {
  const bob = Math.sin(time * 2.2) * 1.2;
  ctx.save();
  ctx.translate(x - 22, y + 8 + bob);
  ctx.fillStyle = "#6a3e28";
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(9, 3, 6, 4.4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#cbb892";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(5, 0);
  ctx.moveTo(5, 3);
  ctx.lineTo(13, 3);
  ctx.stroke();
  ctx.fillStyle = "#8a5a32";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("COOPER", 4, 18);
  ctx.restore();
}

function drawSmoke(ctx, x, y, time, cured) {
  const puff = Math.sin(time * 2.4) * 2;
  ctx.save();
  ctx.translate(x, y - 18);
  ctx.fillStyle = "#5c4034";
  ctx.fillRect(-8, 2, 16, 10);
  ctx.fillStyle = "#3a2a22";
  ctx.fillRect(-2, -6, 4, 8);
  ctx.fillStyle = "rgba(203, 184, 146, 0.75)";
  ctx.beginPath();
  ctx.arc(0, -10 + puff, 3.2, 0, Math.PI * 2);
  ctx.arc(3, -16 + puff * 0.4, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c4a15a";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(cured ? `SMOKE ${cured}` : "SMOKE", 0, 24);
  ctx.restore();
}

function drawPilot(ctx, x, y, time) {
  const wave = Math.sin(time * 2.6) * 2;
  ctx.save();
  ctx.translate(x + 16, y - 22);
  ctx.strokeStyle = "#c4a15a";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(0, -8);
  ctx.stroke();
  ctx.fillStyle = "#7d9a72";
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(8, -2 + wave * 0.3);
  ctx.lineTo(0, -1);
  ctx.fill();
  ctx.fillStyle = "#e2c078";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("PILOT", 0, 16);
  ctx.restore();
}

function drawMonger(ctx, x, y, time) {
  const sway = Math.sin(time * 2.1) * 1.4;
  ctx.save();
  ctx.translate(x - 20, y + 16);
  ctx.fillStyle = "#6a4632";
  ctx.fillRect(-9, 0, 18, 7);
  ctx.fillStyle = "#c4a15a";
  ctx.beginPath();
  ctx.ellipse(-5, -1 + sway * 0.2, 3, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(2, -2, 3.2, 2.1, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7d9a72";
  ctx.font = "700 10px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("FISH", 0, 16);
  ctx.restore();
}

function drawRope(ctx, x, y, time) {
  const spin = Math.sin(time * 1.8) * 0.2;
  ctx.save();
  ctx.translate(x + 22, y + 8);
  ctx.rotate(spin);
  ctx.strokeStyle = "#c4a15a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 1.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0.5, Math.PI * 1.8);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#c4a15a";
  ctx.font = "700 11px Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("ROPE", x + 22, y + 26);
}

function drawColonies(ctx, world, time) {
  for (const realm of world.provinces || []) {
    for (const ship of realm.ships || []) {
      if (!ship.prey) continue;
      const foe = (world.provinces || []).find((row) => row.id === ship.prey.owner);
      const prey = foe && (foe.ships || []).find((row) => row.id === ship.prey.id);
      if (!prey) continue;
      const a = axialToWorld(ship.q, ship.r);
      const b = axialToWorld(prey.q, prey.r);
      ctx.strokeStyle = "rgba(176, 64, 48, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 6]);
      ctx.lineDashOffset = -time * 20;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#a33b32";
      ctx.font = "700 11px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("CLOSING", (a.x + b.x) / 2, (a.y + b.y) / 2 - 8);
    }
    for (const ship of realm.ships || []) {
      if (!ship.block) continue;
      const foe = (world.provinces || []).find((row) => row.id === ship.block.owner);
      const colony = foe && (foe.colonies || []).find((row) => row.id === ship.block.id);
      if (!colony) continue;
      const a = axialToWorld(ship.q, ship.r);
      const b = axialToWorld(colony.q, colony.r);
      ctx.strokeStyle = "rgba(47, 92, 110, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 6]);
      ctx.lineDashOffset = -time * 12;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#2f5c6e";
      ctx.font = "700 11px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("BLOCKADE", (a.x + b.x) / 2, (a.y + b.y) / 2 - 8);
    }
    for (const ship of realm.ships || []) {
      if (!ship.salvage) continue;
      const a = axialToWorld(ship.q, ship.r);
      const b = axialToWorld(ship.salvage.q, ship.salvage.r);
      ctx.strokeStyle = "rgba(226, 192, 120, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -time * 14;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#e2c078";
      ctx.font = "700 11px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("SALVAGE", (a.x + b.x) / 2, (a.y + b.y) / 2 - 8);
    }
    for (const ship of realm.ships || []) {
      if (!ship.tow) continue;
      const a = axialToWorld(ship.q, ship.r);
      const b = axialToWorld(ship.tow.q, ship.tow.r);
      ctx.strokeStyle = "rgba(203, 184, 146, 0.95)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 3]);
      ctx.lineDashOffset = -time * 8;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#cbb892";
      ctx.font = "700 11px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("TOW", (a.x + b.x) / 2, (a.y + b.y) / 2 - 16);
    }
    for (const ship of realm.ships || []) {
      if (!ship.cargo) continue;
      const colony = (realm.colonies || []).find((row) => row.id === ship.cargo);
      if (!colony) continue;
      const a = axialToWorld(ship.q, ship.r);
      const b = axialToWorld(colony.q, colony.r);
      ctx.strokeStyle = "rgba(125, 154, 114, 0.95)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -time * 10;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#7d9a72";
      ctx.font = "700 11px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("CARGO", (a.x + b.x) / 2, (a.y + b.y) / 2 - 8);
    }
    for (const ship of realm.ships || []) {
      if (!ship.cut) continue;
      const foe = (world.provinces || []).find((row) => row.id === ship.cut.owner);
      const prey = foe && (foe.ships || []).find((row) => row.id === ship.cut.id);
      if (!prey) continue;
      const a = axialToWorld(ship.q, ship.r);
      const b = axialToWorld(prey.q, prey.r);
      ctx.strokeStyle = "rgba(161, 74, 60, 0.95)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 4]);
      ctx.lineDashOffset = -time * 16;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#a14a3c";
      ctx.font = "700 11px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("CUT", (a.x + b.x) / 2, (a.y + b.y) / 2 - 8);
    }
    for (const ship of realm.ships || []) {
      if (!ship.raid) continue;
      const foe = (world.provinces || []).find((row) => row.id === ship.raid.owner);
      const colony = foe && (foe.colonies || []).find((row) => row.id === ship.raid.id);
      if (!colony) continue;
      const a = axialToWorld(ship.q, ship.r);
      const b = axialToWorld(colony.q, colony.r);
      ctx.strokeStyle = "rgba(161, 74, 60, 0.95)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 4]);
      ctx.lineDashOffset = -time * 18;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#a14a3c";
      ctx.font = "700 11px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("RAID", (a.x + b.x) / 2, (a.y + b.y) / 2 - 8);
    }
    for (const ship of realm.ships || []) {
      if (!ship.escort) continue;
      const trader = (realm.ships || []).find((row) => row.id === ship.escort);
      if (!trader) continue;
      const a = axialToWorld(ship.q, ship.r);
      const b = axialToWorld(trader.q, trader.r);
      ctx.strokeStyle = "rgba(125, 154, 114, 0.95)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -time * 10;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#7d9a72";
      ctx.font = "700 11px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("CONVOY", (a.x + b.x) / 2, (a.y + b.y) / 2 - 8);
    }
  }
  for (const realm of world.provinces || []) {
    for (const colony of realm.colonies || []) {
      const pos = axialToWorld(colony.q, colony.r);
      drawTown(ctx, pos.x, pos.y, colony.port);
      if (colony.wharf) drawCrane(ctx, pos.x, pos.y, time);
      if (colony.port && colony.cooper) drawCooper(ctx, pos.x, pos.y, time);
      if (colony.port && colony.rope) drawRope(ctx, pos.x, pos.y, time);
      if (colony.port && colony.smoke) drawSmoke(ctx, pos.x, pos.y, time, colony.cured || 0);
      if (colony.port && colony.monger) drawMonger(ctx, pos.x, pos.y, time);
      if (colony.port && colony.pilot) drawPilot(ctx, pos.x, pos.y, time);
      if (colony.port && (colony.moleUntil || 0) > (world.hour || 0)) drawMole(ctx, pos.x, pos.y, time);
      if (colony.port && (colony.quayUntil || 0) > (world.hour || 0) && (colony.quay || 0) > 0) drawQuay(ctx, pos.x, pos.y, time);
      if (colony.port && (colony.duesUntil || 0) > (world.hour || 0)) drawDues(ctx, pos.x, pos.y, time);
      if (colony.port && (colony.lampUntil || 0) > (world.hour || 0)) drawLamp(ctx, pos.x, pos.y, time);
      if (colony.port && (colony.chainUntil || 0) > (world.hour || 0)) drawChain(ctx, pos.x, pos.y, time);
      if (colony.port && (colony.leeUntil || 0) > (world.hour || 0)) drawLee(ctx, pos.x, pos.y, time);
      if (colony.port && portHeld(world, realm.id, colony)) drawBoom(ctx, pos.x, pos.y, time);
      if (colony.port && (colony.slipUntil || 0) > (world.hour || 0)) drawSlip(ctx, pos.x, pos.y, time);
      ctx.fillStyle = "#1a1612";
      ctx.font = "12px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(colony.name, pos.x, pos.y - 22);
    }
    for (const founder of realm.founders || []) {
      const pos = axialToWorld(founder.q, founder.r);
      drawFounder(ctx, pos.x, pos.y, time);
    }
    for (const ferry of realm.ferries || []) {
      if ((ferry.until || 0) <= (world.hour || 0)) continue;
      const pos = axialToWorld(ferry.q, ferry.r);
      const goal = axialToWorld(ferry.destQ, ferry.destR);
      ctx.strokeStyle = "rgba(226, 192, 120, 0.75)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -time * 12;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(goal.x, goal.y);
      ctx.stroke();
      ctx.setLineDash([]);
      drawFerry(ctx, pos.x, pos.y, time);
    }
    for (const ship of realm.ships || []) {
      const pos = axialToWorld(ship.q, ship.r);
      drawHull(ctx, pos.x, pos.y, ship.kind, time, Boolean(ship.prey));
      if ((ship.prizeUntil || 0) > (world.hour || 0)) drawPrize(ctx, pos.x, pos.y, time);
      if ((ship.marines || 0) >= 6) drawCompany(ctx, pos.x, pos.y, time);
    }
  }
  for (const realm of world.provinces || []) {
    for (const buoy of realm.buoys || []) {
      if ((buoy.until || 0) <= (world.hour || 0)) continue;
      const pos = axialToWorld(buoy.q, buoy.r);
      drawBuoy(ctx, pos.x, pos.y, time);
    }
    for (const net of realm.nets || []) {
      if ((net.until || 0) <= (world.hour || 0)) continue;
      const pos = axialToWorld(net.q, net.r);
      drawNet(ctx, pos.x, pos.y, time);
    }
  }
  for (const wreck of world.wrecks || []) {
    if ((wreck.until || 0) <= (world.hour || 0)) continue;
    const pos = axialToWorld(wreck.q, wreck.r);
    drawWreck(ctx, pos.x, pos.y, time);
  }
}

export function drawRealm(ctx, viewW, viewH, world, seatId, selectedId, cam, march, time = 0, hoverId = null, dpr = 1, motes = [], strikes = []) {
  screenTransform(ctx, dpr);
  ctx.clearRect(0, 0, viewW, viewH);
  worldTransform(ctx, cam, viewW, viewH, dpr);
  drawGround(ctx, cam, viewW, viewH);
  drawHexMap(ctx, cam, viewW, viewH, world, time);
  drawRiver(ctx, time);
  drawBanks(ctx, time);
  drawLitter(ctx, cam, viewW, viewH, time);
  drawClouds(ctx, time);
  drawBirds(ctx, time);
  const geoms = world.provinces.map(provinceGeom).sort((a, b) => a.y - b.y);
  drawRoads(ctx, geoms);
  drawSites(ctx, world);
  drawBands(ctx, world, time);
  drawColonies(ctx, world, time);
  drawPacts(ctx, world, seatId, time);
  drawCauseways(ctx, world);
  drawSieges(ctx, world, time);
  drawInnTraffic(ctx, world, time);
  for (const g of geoms) {
    const p = world.provinces.find((row) => row.id === g.id);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(g.x + 6, g.y + 10, g.r * 0.72, g.r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    const viewer = world.provinces.find((row) => row.id === seatId);
    const known = p.id === seatId || Boolean(viewer && intelFresh(viewer, p.id, world.hour));
    drawHoldings(ctx, p, g, time, known, world.hour);
    if (bountyOn(world, p.id, world.hour)) drawBountyMark(ctx, g, time);
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
    const label = !p.name || p.name === "Unscouted" ? p.name : `${p.name} · ${ageName(p)}`;
    const width = ctx.measureText(label).width + 16;
    ctx.fillStyle = "rgba(16, 12, 8, 0.78)";
    ctx.beginPath();
    ctx.roundRect(sx - width / 2, sy - 14, width, 20, 6);
    ctx.fill();
    ctx.fillStyle = p.id === seatId ? "#e2c078" : "#f6e7c1";
    ctx.fillText(label, sx, sy);
  }
}
