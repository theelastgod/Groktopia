/** Groktopia realm rules. Original numbers. Earn unit is cents of $UTOPIA (100 = 1). */

export const ORDERS = 10;
export const MIN_LAND = 40;
export const COOLDOWN = 2;

export const EARN = {
  hourActive: 25,
  combatCap: 400,
  seize: 180,
  sack: 140,
  raze: 160,
  meteor: 120,
  pilfer: 80,
  pvpFee: 0.05,
  minStake: 100,
  trade: 60,
  pact: 35,
  settle: 40,
  charter: 70,
  ledger: 15,
  tribute: 45,
  beacon: 32,
  ransom: 50,
  muster: 36,
  stall: 28,
  feast: 30,
  bounty: 40,
  vein: 34,
  relief: 38,
  smith: 33,
  seal: 30,
  levee: 31,
  road: 36,
  fold: 32,
  arm: 32,
  curfew: 29,
  hospice: 34,
  hamlet: 36,
  inn: 33,
  weir: 35,
  timber: 34,
  quarry: 37,
  siege: 39,
  sally: 41,
  ride: 42,
  patrol: 38,
  keel: 36,
  founder: 40,
  colony: 44,
  hull: 43,
  prize: 46,
  block: 47,
  salvage: 48,
  convoy: 49,
  wharf: 50,
  refit: 51,
  mole: 52,
  tow: 53,
  lee: 54,
  net: 55,
  slip: 56,
  buoy: 57,
  cargo: 58,
  cut: 59,
  tile: 60,
  raid: 61,
  quay: 62,
  armory: 63,
  dues: 64,
  lamp: 65,
  chain: 66,
  ferry: 67,
  wheel: 68,
  look: 69,
  pale: 70,
  cooper: 71,
  pan: 72,
  grove: 73,
  rope: 74,
  bell: 75,
  sail: 76,
  cistern: 77,
  smoke: 78,
  monger: 79,
  pilot: 80,
  hive: 81,
  drift: 82,
  vine: 83,
  char: 84,
  reed: 85,
  malt: 86,
  dove: 87,
  oven: 88,
};

export const FACTIONS = {
  marcher: {
    id: "marcher",
    name: "Marcher",
    blurb: "Linebreakers hit hard and hold little.",
    elite: "Linebreaker",
    off: 6,
    def: 2,
    gold: 1,
    food: 1,
    thief: 1,
    aether: 1,
    mystic: 1,
  },
  warden: {
    id: "warden",
    name: "Warden",
    blurb: "Shieldwalls make a province expensive to take.",
    elite: "Shieldwall",
    off: 2,
    def: 6,
    gold: 1,
    food: 1,
    thief: 0.9,
    aether: 1,
    mystic: 1,
  },
  veil: {
    id: "veil",
    name: "Veil",
    blurb: "Lanterns and spires. Spells land harder.",
    elite: "Lantern",
    off: 2,
    def: 2,
    gold: 0.9,
    food: 1,
    thief: 1,
    aether: 1.35,
    mystic: 1.25,
  },
  cutpurse: {
    id: "cutpurse",
    name: "Cutpurse",
    blurb: "Nightknives steal what armies cannot reach.",
    elite: "Nightknife",
    off: 3,
    def: 2,
    gold: 1.05,
    food: 1,
    thief: 1.55,
    aether: 1,
    mystic: 1,
  },
  hearth: {
    id: "hearth",
    name: "Hearth",
    blurb: "Reeves, fields, and full granaries.",
    elite: "Reeve",
    off: 2,
    def: 3,
    gold: 1.4,
    food: 1.3,
    thief: 0.85,
    aether: 0.9,
    mystic: 0.9,
  },
};

export const BUILDINGS = {
  hearth: { name: "Hearths", blurb: "Room for peasants.", cost: (n) => 120 + n * 15 },
  field: { name: "Fields", blurb: "Grain each hour.", cost: (n) => 100 + n * 12 },
  workshop: { name: "Workshops", blurb: "Gold from labor.", cost: (n) => 150 + n * 18 },
  barracks: { name: "Barracks", blurb: "Cap for soldiers and elites.", cost: (n) => 180 + n * 20 },
  keep: { name: "Keeps", blurb: "Standing defense.", cost: (n) => 220 + n * 25 },
  chapel: { name: "Chapels", blurb: "House mystics.", cost: (n) => 200 + n * 22 },
  den: { name: "Dens", blurb: "House thieves.", cost: (n) => 200 + n * 22 },
  spire: { name: "Spires", blurb: "Aether each hour.", cost: (n) => 240 + n * 28 },
};

export const ROSTER = [
  { id: "harrow", persona: "harrow", name: "Red Mile", ruler: "Marshal Harrow", faction: "marcher", line: "Harrow counts spears, then spends them." },
  { id: "vellum", persona: "vellum", name: "Quiet Stacks", ruler: "Archivist Vellum", faction: "veil", line: "Vellum reads the hour before she spends it." },
  { id: "brine", persona: "brine", name: "Salt Ledger", ruler: "Quartermaster Brine", faction: "hearth", line: "Brine buys the road, then the grain on it." },
  { id: "quill", persona: "quill", name: "Ink Market", ruler: "Informant Quill", faction: "cutpurse", line: "Quill prefers a purse to a gate." },
  { id: "sable", persona: "sable", name: "Grey Vigil", ruler: "Warden Sable", faction: "warden", line: "Sable answers the last blow, not the first rumor." },
  { id: "moss", persona: "moss", name: "Low Orchard", ruler: "Hearthkeeper Moss", faction: "hearth", line: "Moss plants another row and waits." },
];

const SPELLS = {
  bulwark: { name: "Bulwark", cost: 70, hours: 4, blurb: "Defense stands higher for 4 hours." },
  fury: { name: "Fury", cost: 70, hours: 3, blurb: "Offense stands higher for 3 hours." },
  shade: { name: "Shade", cost: 60, hours: 3, blurb: "Thieves work quieter for 3 hours." },
  blessing: { name: "Blessing", cost: 40, hours: 0, blurb: "Fields yield a burst of grain." },
  meteor: { name: "Meteor", cost: 100, hours: 0, blurb: "Strike buildings and peasants." },
};

export function spellbook() {
  return SPELLS;
}

/** Civic studies. Completing one pays the purse. Counts rise through Camp, Borough, Realm, and Crown. */
export const STUDIES = [
  { id: "furrow", name: "Furrow", cost: 400, aether: 0, need: 0, purse: 40, blurb: "Fields feed a larger hour." },
  { id: "kiln", name: "Kiln", cost: 500, aether: 0, need: 0, purse: 50, blurb: "Workshops strike a little more gold." },
  { id: "palisade", name: "Palisade", cost: 650, aether: 0, need: 1, purse: 70, blurb: "The pale holds a firmer line." },
  { id: "charter", name: "Charter", cost: 700, aether: 0, need: 2, purse: 80, blurb: "New acres cost less and pay the purse twice." },
  { id: "ledger", name: "Ledger", cost: 800, aether: 0, need: 2, purse: 90, blurb: "An active hour pays a fuller purse." },
  { id: "rite", name: "River Rite", cost: 900, aether: 40, need: 3, purse: 110, blurb: "Spires draw a brighter aether." },
  { id: "oath", name: "Road Oath", cost: 1000, aether: 0, need: 4, purse: 130, blurb: "The host marches a little heavier." },
  { id: "crown", name: "Crown Seat", cost: 1600, aether: 80, need: 6, purse: 250, blurb: "The monument of the age." },
  { id: "powder", name: "Powder Seat", cost: 1800, aether: 60, need: 8, purse: 180, blurb: "The host may roll iron landcars." },
];

export function studyCount(p) {
  if (!p || !p.studies) return 0;
  return Object.values(p.studies).filter(Boolean).length;
}

export function ageName(p) {
  const n = studyCount(p);
  if (n >= 9) return "Arsenal";
  if (n >= 8) return "Crown";
  if (n >= 5) return "Realm";
  if (n >= 2) return "Borough";
  return "Camp";
}

/** Arms the host may take once the age allows. Spears are the default and add no bite. */
export const WEAPONS = {
  spear: { name: "Spears", need: 0, bite: 0, gold: 0, age: "Camp", line: "The camp host still carries spears." },
  bow: { name: "Bows", need: 2, bite: 1, gold: 180, age: "Borough", line: "Borough archers loose across the field." },
  lock: { name: "Handlocks", need: 5, bite: 2, gold: 320, age: "Realm", line: "Realm guns crack from the line." },
  cannon: { name: "Cannon", need: 8, bite: 4, gold: 480, age: "Crown", line: "Crown cannon sit behind the host." },
  car: { name: "Landcars", need: 9, bite: 6, gold: 720, age: "Arsenal", line: "Iron hulls roll once the Powder Seat is sworn." },
};

/** One civic at a time. Switching spends an order. The purse still comes from play. */
export const DOCTRINES = {
  granary: { name: "Granary Peace", blurb: "Fields feed a larger hour." },
  levy: { name: "Spear Levy", blurb: "The host hits a little harder." },
  mint: { name: "Open Mint", blurb: "An active hour pays 0.10 $UTOPIA more." },
  college: { name: "Lantern College", blurb: "The next study costs 100 gold less." },
};

/** One of each in a realm. The builder is paid, and the landmark stays theirs. */
export const WONDERS = {
  mill: { name: "River Mill", cost: 1400, aether: 0, need: 2, purse: 220, blurb: "The builder's fields swell." },
  archive: { name: "Night Archive", cost: 1600, aether: 80, need: 4, purse: 300, blurb: "Later studies pay a richer purse." },
  bastion: { name: "Pale Bastion", cost: 1800, aether: 0, need: 5, purse: 360, blurb: "The builder's defense stands taller." },
};

function notePurse(actor, bucket, cents) {
  if (!actor || actor.kind !== "human" || !cents || cents <= 0) return;
  if (!actor.ledger) actor.ledger = {};
  actor.ledger[bucket] = (actor.ledger[bucket] || 0) + cents;
}

export const SEAT = {
  you: [0, 40],
  rival: [280, 60],
  harrow: [170, -210],
  sable: [300, 230],
  vellum: [-240, -160],
  brine: [30, 270],
  quill: [-220, 190],
  moss: [-20, -250],
};

export const HEX = 62;
const HEX_DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];

export const ARMS = {
  foot: {
    name: "Foot",
    locks: ["grass", "plain", "wood", "hill", "coast", "marsh"],
    gold: 80,
    soldiers: 4,
    line: "Foot take any land tile except water and high stone.",
  },
  rider: {
    name: "Riders",
    locks: ["grass", "plain", "coast"],
    gold: 240,
    soldiers: 6,
    line: "Horses take open ground. Woods, marsh, hills, and stone refuse them.",
  },
  engine: {
    name: "Catapults",
    locks: ["hill", "grass", "plain"],
    gold: 380,
    soldiers: 8,
    line: "Engines take a hill or open ground. They will not enter a wood or a marsh.",
  },
  sapper: {
    name: "Sappers",
    locks: ["hill", "mount", "wood"],
    gold: 280,
    soldiers: 5,
    line: "Sappers take stone and timber.",
  },
};

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seatPoint(p) {
  if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) return [p.x, p.y];
  if (p && SEAT[p.id]) return SEAT[p.id];
  const id = (p && p.id) || "x";
  return [(hash(id) % 400) - 200, (hash(id + "y") % 400) - 200];
}

export function axialToWorld(q, r) {
  return {
    x: HEX * 1.5 * q,
    y: HEX * Math.sqrt(3) * (r + q / 2),
  };
}

export function worldToAxial(x, y) {
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

export function riverPoint(t) {
  return {
    x: -2200 + t * 4400,
    y: Math.sin(t * 5.2) * 150 + Math.sin(t * 13) * 36,
  };
}

function riverDist(x, y) {
  const t = Math.max(0, Math.min(1, (x + 2200) / 4400));
  let best = Infinity;
  for (let i = -3; i <= 3; i++) {
    const spot = riverPoint(Math.max(0, Math.min(1, t + i * 0.012)));
    best = Math.min(best, Math.hypot(x - spot.x, y - spot.y));
  }
  return best;
}

const HILL_OVALS = [[-900, -700, 520, 180], [400, 500, 640, 200], [-200, 900, 480, 150], [1100, -200, 400, 140]];

function outerLand(n) {
  if (n % 17 === 0) return "mount";
  if (n % 7 === 0) return "hill";
  if (n % 5 === 0) return "wood";
  if (n % 3 === 0) return "plain";
  return "grass";
}

export function terrainKind(q, r) {
  const { x, y } = axialToWorld(q, r);
  const n = hash(`hex:${q},${r}`);
  const edge = Math.hypot(x, y);
  if (edge > 11600) return "sea";
  if (edge > 11000) return "coast";
  if (edge > 5600) return outerLand(n);
  if (edge > 3000) return "sea";
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

function plotKey(q, r) {
  return `${q},${r}`;
}

function takenPlots(world) {
  const taken = new Set();
  for (const p of world.provinces || []) {
    for (const tile of p.plots || []) taken.add(plotKey(tile.q, tile.r));
  }
  return taken;
}

function grantHome(p, taken) {
  if (p.homeSet) return;
  const [x, y] = seatPoint(p);
  const city = worldToAxial(x, y);
  p.plots = p.plots || [];
  const owned = new Set(p.plots.map((tile) => plotKey(tile.q, tile.r)));
  const seen = new Set([plotKey(city.q, city.r)]);
  const queue = [{ q: city.q, r: city.r, dist: 0 }];
  while (queue.length) {
    const cell = queue.shift();
    if (cell.dist > 0) {
      const key = plotKey(cell.q, cell.r);
      const kind = terrainKind(cell.q, cell.r);
      if (kind !== "sea") {
        if (owned.has(key)) {
          const tile = p.plots.find((row) => row.q === cell.q && row.r === cell.r);
          if (tile) tile.home = true;
        } else if (!taken.has(key)) {
          taken.add(key);
          owned.add(key);
          p.plots.push({ q: cell.q, r: cell.r, crew: "lot", home: true });
        }
      }
    }
    if (cell.dist >= 2) continue;
    for (const [dq, dr] of HEX_DIRS) {
      const nq = cell.q + dq;
      const nr = cell.r + dr;
      const key = plotKey(nq, nr);
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ q: nq, r: nr, dist: cell.dist + 1 });
    }
  }
  p.homeSet = true;
}

export function ensurePlots(world) {
  const taken = takenPlots(world);
  for (const p of world.provinces || []) {
    if (p.plots && p.plots.length) continue;
    p.plots = [];
    const [x, y] = seatPoint(p);
    const city = worldToAxial(x, y);
    const want = 6 + Math.min(6, Math.floor((p.land || 0) / 80));
    const seen = new Set([plotKey(city.q, city.r)]);
    const queue = HEX_DIRS.map(([dq, dr]) => ({ q: city.q + dq, r: city.r + dr, dist: 1 }));
    while (p.plots.length < want && queue.length && queue.length < 240) {
      const cell = queue.shift();
      const key = plotKey(cell.q, cell.r);
      if (seen.has(key)) continue;
      seen.add(key);
      const kind = terrainKind(cell.q, cell.r);
      if (!taken.has(key) && kind !== "sea" && kind !== "river") {
        taken.add(key);
        p.plots.push({ q: cell.q, r: cell.r, crew: "hand" });
      }
      if (cell.dist < 3) {
        for (const [dq, dr] of HEX_DIRS) queue.push({ q: cell.q + dq, r: cell.r + dr, dist: cell.dist + 1 });
      }
    }
  }
  for (const p of world.provinces || []) grantHome(p, taken);
}

export function claimTiles(world, actor, n) {
  ensurePlots(world);
  const taken = takenPlots(world);
  const [x, y] = seatPoint(actor);
  const city = worldToAxial(x, y);
  const seen = new Set([plotKey(city.q, city.r), ...(actor.plots || []).map((tile) => plotKey(tile.q, tile.r))]);
  const queue = [];
  const seeds = [{ q: city.q, r: city.r }, ...(actor.plots || [])];
  for (const seed of seeds) {
    for (const [dq, dr] of HEX_DIRS) queue.push({ q: seed.q + dq, r: seed.r + dr });
  }
  const bought = [];
  let guard = 0;
  while (bought.length < n && queue.length && guard < 500) {
    guard += 1;
    const cell = queue.shift();
    const key = plotKey(cell.q, cell.r);
    if (seen.has(key)) continue;
    seen.add(key);
    const kind = terrainKind(cell.q, cell.r);
    for (const [dq, dr] of HEX_DIRS) queue.push({ q: cell.q + dq, r: cell.r + dr });
    if (taken.has(key) || kind === "sea") continue;
    taken.add(key);
    const tile = { q: cell.q, r: cell.r, crew: "hand" };
    actor.plots.push(tile);
    bought.push({ ...tile, kind });
  }
  return bought;
}

function takePlot(world, actor, target) {
  ensurePlots(world);
  if (!target.plots || target.plots.length <= 4) return null;
  const tile = target.plots.find((row) => row.crew === "hand") || target.plots[target.plots.length - 1];
  target.plots = target.plots.filter((row) => row !== tile);
  tile.crew = "foot";
  actor.plots = actor.plots || [];
  actor.plots.push(tile);
  return terrainKind(tile.q, tile.r);
}

export function makeRng(seed) {
  let a = seed >>> 0;
  return {
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    state() {
      return a >>> 0;
    },
  };
}

function emptyBuildings(over = {}) {
  const b = { hearth: 0, field: 0, workshop: 0, barracks: 0, keep: 0, chapel: 0, den: 0, spire: 0 };
  return { ...b, ...over };
}

export function blankProvince(partial) {
  const base = {
    id: "you",
    kind: "human",
    persona: null,
    name: "First Acre",
    ruler: "Ruler",
    faction: "marcher",
    land: 200,
    buildings: emptyBuildings({ hearth: 50, field: 40, workshop: 25, barracks: 16, keep: 12, chapel: 6, den: 5, spire: 6 }),
    peasants: 700,
    soldiers: 100,
    elites: 24,
    thieves: 8,
    mystics: 6,
    gold: 8000,
    grain: 9000,
    aether: 220,
    utopia: 0,
    orders: ORDERS,
    earnLeft: EARN.combatCap,
    acted: false,
    spells: { bulwark: 0, fury: 0, shade: 0 },
    intel: {},
    cooldown: {},
    grudge: null,
    line: "",
    studies: {},
    doctrine: null,
    ledger: {},
    marks: {},
    pacts: {},
    relics: {},
    demands: {},
    beaconUntil: 0,
    pens: {},
    muster: 0,
    musterUntil: 0,
    stallHour: -1,
    feastUntil: 0,
    vein: "",
    veinUntil: 0,
    reliefs: {},
    smithUntil: 0,
    sealUntil: 0,
    leveeUntil: 0,
    roads: {},
    fold: 0,
    foldUntil: 0,
    curfewUntil: 0,
    hospiceUntil: 0,
    innUntil: 0,
    weir: 0,
    weirUntil: 0,
    siege: null,
    patrol: 0,
    patrolUntil: 0,
    keel: 0,
    keelUntil: 0,
  };
  const p = { ...base, ...partial };
  if (partial && partial.buildings) p.buildings = { ...base.buildings, ...partial.buildings };
  if (partial && partial.spells) p.spells = { ...base.spells, ...partial.spells };
  p.studies = { ...(partial && partial.studies ? partial.studies : {}) };
  p.ledger = { ...(partial && partial.ledger ? partial.ledger : {}) };
  p.marks = { ...(partial && partial.marks ? partial.marks : {}) };
  p.pacts = { ...(partial && partial.pacts ? partial.pacts : {}) };
  p.relics = { ...(partial && partial.relics ? partial.relics : {}) };
  p.demands = { ...(partial && partial.demands ? partial.demands : {}) };
  p.pens = { ...(partial && partial.pens ? partial.pens : {}) };
  p.reliefs = { ...(partial && partial.reliefs ? partial.reliefs : {}) };
  p.roads = { ...(partial && partial.roads ? partial.roads : {}) };
  p.intel = p.intel || {};
  p.cooldown = p.cooldown || {};
  p.founders = partial && Array.isArray(partial.founders) ? partial.founders.map((row) => ({ ...row })) : [];
  p.ships = partial && Array.isArray(partial.ships) ? partial.ships.map((row) => ({ ...row })) : [];
  p.colonies = partial && Array.isArray(partial.colonies) ? partial.colonies.map((row) => ({ ...row })) : [];
  p.nets = partial && Array.isArray(partial.nets) ? partial.nets.map((row) => ({ ...row })) : [];
  p.buoys = partial && Array.isArray(partial.buoys) ? partial.buoys.map((row) => ({ ...row })) : [];
  return p;
}

export function newWorld(opts = {}) {
  const seed = opts.seed ?? 1;
  const faction = FACTIONS[opts.faction] ? opts.faction : "marcher";
  const you = blankProvince({
    id: "you",
    kind: "human",
    name: opts.province || "First Acre",
    ruler: opts.ruler || "Ruler",
    faction,
  });
  const agents = ROSTER.map((r, i) => {
    const lean = r.id === "harrow" ? 0.82 : r.id === "sable" ? 1.05 : 0.94;
    return blankProvince({
      id: r.id,
      kind: "agent",
      persona: r.persona,
      name: r.name,
      ruler: r.ruler,
      faction: r.faction,
      line: r.line,
      land: Math.round(180 * lean) + (i % 3) * 4,
      buildings: emptyBuildings({
        hearth: Math.round(42 * lean),
        field: Math.round(36 * lean),
        workshop: Math.round(20 * lean),
        barracks: Math.round(14 * lean),
        keep: r.id === "sable" ? 18 : Math.round(8 * lean),
        chapel: r.id === "vellum" ? 12 : 5,
        den: r.id === "quill" ? 10 : 4,
        spire: r.id === "vellum" ? 10 : 4,
      }),
      peasants: Math.round(560 * lean),
      soldiers: r.id === "harrow" ? 70 : Math.round(80 * lean),
      elites: r.id === "harrow" ? 12 : r.id === "sable" ? 36 : Math.round(18 * lean),
      thieves: r.id === "quill" ? 22 : 6,
      mystics: r.id === "vellum" ? 16 : 5,
      gold: Math.round(7000 * lean),
      grain: Math.round(8000 * lean),
      aether: r.id === "vellum" ? 400 : 160,
    });
  });
  const world = {
    seed,
    hour: 0,
    orderCap: ORDERS,
    seat: "you",
    burned: 0,
    provinces: [you, ...agents],
    log: [{ hour: 0, text: `${you.ruler} takes the seat of ${you.name}. Six lattice agents already hold land.` }],
    wonders: {},
    bounties: {},
    sites: freshSites(),
    bands: freshBands(),
    wrecks: [],
    rng: makeRng(seed),
  };
  ensurePlots(world);
  return world;
}

export function byId(world, id) {
  return world.provinces.find((p) => p.id === id) || null;
}

export function buildingCount(p) {
  return Object.values(p.buildings).reduce((a, b) => a + b, 0);
}

export function freeLand(p) {
  return p.land - buildingCount(p);
}

export function population(p) {
  return p.peasants + p.soldiers + p.elites + p.thieves + p.mystics + (p.muster || 0);
}

export function soldierCap(p) {
  return p.buildings.barracks * 12;
}

export function eliteCap(p) {
  return p.buildings.barracks * 4;
}

export function thiefCap(p) {
  return p.buildings.den * 4;
}

export function mysticCap(p) {
  return p.buildings.chapel * 2;
}

export function foodNeed(p) {
  return Math.floor(population(p) * 0.75);
}

export function wageFactor(p) {
  const need = foodNeed(p);
  if (need <= 0) return 1;
  const ratio = p.grain / need;
  if (ratio >= 3) return 1.08;
  if (ratio >= 1) return 1;
  if (ratio >= 0.4) return 0.85;
  return 0.65;
}

export function offense(p) {
  const f = FACTIONS[p.faction];
  const fury = p.spells.fury > 0 ? 1.15 : 1;
  const oath = p.studies && p.studies.oath ? 1.05 : 1;
  const levy = p.doctrine === "levy" ? 1.05 : 1;
  const ash = p.relics && p.relics.barrow ? 1.04 : 1;
  const seam = p.vein === "iron" ? 1.04 : 1;
  const armed = WEAPONS[p.weapon];
  const bite = (p.smithUntil > 0 ? 4 : 3) + (armed ? armed.bite : 0);
  const posted = (p.plots || []).reduce((sum, tile) => {
    if (tile.crew === "rider") return sum + 6;
    if (tile.crew === "engine") return sum + 8;
    if (tile.crew === "sapper") return sum + 2;
    return sum;
  }, 0);
  return Math.floor((p.soldiers * bite + (p.muster || 0) * 2 + p.elites * f.off + posted) * wageFactor(p) * fury * oath * levy * ash * seam);
}

export function defense(p) {
  const f = FACTIONS[p.faction];
  const bulwark = p.spells.bulwark > 0 ? 1.2 : 1;
  const pale = p.studies && p.studies.palisade ? 1.06 : 1;
  const bastion = p.marks && p.marks.bastion ? 1.08 : 1;
  const horn = p.relics && p.relics.stand ? 1.04 : 1;
  const foot = (p.plots || []).filter((tile) => tile.crew === "foot").length * 2;
  const stone = quarryPits(p) * 5;
  const stakes = (p.plots || []).filter((tile) => tile.crew === "pale").length * 4;
  return Math.floor((p.soldiers * 1 + (p.muster || 0) + p.elites * f.def + p.buildings.keep * 10 + foot + stone + stakes) * wageFactor(p) * bulwark * pale * bastion * horn);
}

export function networth(p) {
  return Math.floor(
    p.land * 8 +
      population(p) * 0.4 +
      p.soldiers * 2 +
      p.elites * 6 +
      p.thieves * 5 +
      p.mystics * 7 +
      p.gold / 120 +
      p.grain / 100,
  );
}

/** 0 outside a fair band, else 0..1. Stops minting $UTOPIA off mice and whales. */
export function nwFactor(att, def) {
  const r = networth(def) / Math.max(1, networth(att));
  if (r < 0.55 || r > 1.7) return 0;
  if (r < 0.85) return (r - 0.55) / 0.3;
  if (r > 1.25) return (1.7 - r) / 0.45;
  return 1;
}

export function thiefPower(p) {
  const f = FACTIONS[p.faction];
  const shade = p.spells.shade > 0 ? 1.15 : 1;
  return (p.thieves / Math.max(1, p.land)) * f.thief * shade;
}

export function formatUtopia(cents) {
  const sign = cents < 0 ? "-" : "";
  const n = Math.abs(Math.floor(cents));
  return `${sign}${(n / 100).toFixed(2)}`;
}

function log(world, text) {
  world.log.unshift({ hour: world.hour, text });
  if (world.log.length > 80) world.log.length = 80;
}

function fail(message) {
  return { ok: false, message };
}

function shrinkToLand(p, rng) {
  let guard = 0;
  while (buildingCount(p) > p.land && guard < 500) {
    const keys = Object.keys(p.buildings).filter((k) => p.buildings[k] > 0);
    if (!keys.length) break;
    const k = keys[Math.floor(rng.next() * keys.length)];
    p.buildings[k] -= 1;
    guard += 1;
  }
}

function takeLand(def, acres, rng) {
  const moved = Math.max(0, Math.min(acres, def.land - MIN_LAND));
  def.land -= moved;
  shrinkToLand(def, rng);
  return moved;
}

function casualties(p, frac, rng, hour) {
  const eased = hospiceUp(p, hour) ? frac * 0.5 : frac;
  const j = 0.85 + rng.next() * 0.3;
  const hit = (n) => Math.max(0, n - Math.floor(n * eased * j));
  p.soldiers = hit(p.soldiers);
  p.elites = hit(p.elites);
  p.muster = hit(p.muster || 0);
}

function grantEarn(actor, base, scale, bucket = "combat") {
  if (scale <= 0) return 0;
  const want = Math.floor(base * scale);
  const got = Math.max(0, Math.min(actor.earnLeft, want));
  actor.utopia += got;
  actor.earnLeft -= got;
  notePurse(actor, bucket, got);
  return got;
}

function remember(actor, target, hour) {
  actor.intel[target.id] = {
    hour,
    offense: offense(target),
    defense: defense(target),
    gold: target.gold,
    grain: target.grain,
    soldiers: target.soldiers,
    elites: target.elites,
    thieves: target.thieves,
    mystics: target.mystics,
  };
}

/** A lit fire reads camps inside this distance. A second lit fire chains one hop. */
export const BEACON_RANGE = 980;
export const BEACON_HOURS = 6;

export function beaconLit(p, hour) {
  return Boolean(p && typeof p.beaconUntil === "number" && p.beaconUntil > (hour || 0));
}

function provinceNear(a, b) {
  if (!a || !b || !Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(b.x) || !Number.isFinite(b.y)) return false;
  return Math.hypot(a.x - b.x, a.y - b.y) <= BEACON_RANGE;
}

function watchSweep(world, actor) {
  const hour = world.hour || 0;
  const direct = world.provinces.filter((other) => other.id !== actor.id && provinceNear(actor, other));
  const hops = [...direct];
  for (const mid of direct) {
    if (!beaconLit(mid, hour)) continue;
    for (const other of world.provinces) {
      if (other.id === actor.id || other.id === mid.id) continue;
      if (provinceNear(mid, other)) hops.push(other);
    }
  }
  const seen = new Set();
  let fresh = 0;
  for (const other of hops) {
    if (seen.has(other.id)) continue;
    seen.add(other.id);
    if (!intelFresh(actor, other.id, hour)) fresh += 1;
    remember(actor, other, hour);
  }
  return { seen: seen.size, fresh };
}

/** A fresh aim each time the last one is met. Matching the aim pays the purse. */
export const AMBITIONS = [
  { id: "acres", name: "Break ground", purse: 40, blurb: "Settle 10 acres.", match: (action) => action.type === "explore" },
  { id: "study", name: "Open a study", purse: 50, blurb: "Complete any study.", match: (action) => action.type === "study" },
  { id: "envoy", name: "Send an envoy", purse: 40, blurb: "Bind a pact.", match: (action) => action.type === "envoy" },
  { id: "field", name: "Raise a field", purse: 35, blurb: "Build a field.", match: (action) => action.type === "build" && action.building === "field" },
  { id: "host", name: "Drill the host", purse: 35, blurb: "Train soldiers.", match: (action) => action.type === "train" && action.unit === "soldier" },
  { id: "caravan", name: "Roll a caravan", purse: 45, blurb: "Send a caravan.", match: (action) => action.type === "trade" },
  { id: "beacon", name: "Light the watch", purse: 40, blurb: "Raise a watch fire.", match: (action) => action.type === "beacon" },
  { id: "ransom", name: "Ransom the pen", purse: 45, blurb: "Send penned people home for gold.", match: (action) => action.type === "ransom" },
  { id: "muster", name: "Ring the bell", purse: 40, blurb: "Call a field host.", match: (action) => action.type === "muster" },
  { id: "stall", name: "Open the stall", purse: 35, blurb: "Sell grain at the stall.", match: (action) => action.type === "stall" && action.mode !== "buy" },
  { id: "feast", name: "Set the table", purse: 35, blurb: "Call a feast.", match: (action) => action.type === "feast" },
  { id: "bounty", name: "Post a price", purse: 40, blurb: "Put a bounty on a camp.", match: (action) => action.type === "bounty" },
  { id: "vein", name: "Strike a vein", purse: 35, blurb: "Prospect the acres.", match: (action) => action.type === "prospect" },
  { id: "relief", name: "Send relief", purse: 40, blurb: "Cart grain to a hungry camp.", match: (action) => action.type === "relief" },
  { id: "smith", name: "Bank the forge", purse: 35, blurb: "Arm the host at the smith.", match: (action) => action.type === "smith" },
  { id: "seal", name: "Seal the bins", purse: 35, blurb: "Seal the grain.", match: (action) => action.type === "seal" },
  { id: "levee", name: "Raise the bank", purse: 35, blurb: "Throw up a levee.", match: (action) => action.type === "levee" },
  { id: "road", name: "Lay a causeway", purse: 40, blurb: "Pave a road to a camp.", match: (action) => action.type === "road" },
  { id: "fold", name: "Pen the flock", purse: 35, blurb: "Fold sheep on the acres.", match: (action) => action.type === "fold" },
  { id: "curfew", name: "Hang the lanterns", purse: 35, blurb: "Call a night curfew.", match: (action) => action.type === "curfew" },
  { id: "hospice", name: "Pitch the tent", purse: 35, blurb: "Open a field hospice.", match: (action) => action.type === "hospice" },
  { id: "inn", name: "Open the inn", purse: 35, blurb: "Raise a wayside inn.", match: (action) => action.type === "inn" },
  { id: "weir", name: "Set the nets", purse: 35, blurb: "Stake a weir on the water.", match: (action) => action.type === "weir" },
  { id: "timber", name: "Cut a yard", purse: 35, blurb: "Raise a timber yard on a wood tile.", match: (action) => action.type === "timber" },
  { id: "quarry", name: "Open a pit", purse: 35, blurb: "Cut a quarry into a hill tile.", match: (action) => action.type === "quarry" },
  { id: "sally", name: "Sally the works", purse: 40, blurb: "Break a siege camp.", match: (action) => action.type === "sally" && action.win },
  { id: "ride", name: "Ride the band", purse: 40, blurb: "Break a wild camp.", match: (action) => action.type === "ride" && action.win },
  { id: "patrol", name: "Post the screen", purse: 40, blurb: "Send outriders against a wild camp.", match: (action) => action.type === "patrol" },
  { id: "keel", name: "Launch a keel", purse: 40, blurb: "Put a boat on the water.", match: (action) => action.type === "keel" },
  { id: "founder", name: "Send a founder", purse: 40, blurb: "Raise a founder for a new town.", match: (action) => action.type === "founder" },
  { id: "char", name: "Bank a hearth", purse: 35, blurb: "Bank a charcoal hearth in the woods.", match: (action) => action.type === "char" },
  { id: "reed", name: "Cut a reed bed", purse: 35, blurb: "Cut a reed bed in the marsh.", match: (action) => action.type === "reed" },
  { id: "malt", name: "Raise a malt house", purse: 35, blurb: "Raise a malt house on open ground.", match: (action) => action.type === "malt" },
  { id: "dove", name: "Raise a dovecote", purse: 35, blurb: "Raise a dovecote on open ground.", match: (action) => action.type === "dove" },
  { id: "oven", name: "Raise a bakehouse", purse: 35, blurb: "Raise a bakehouse on open ground.", match: (action) => action.type === "oven" },
];

function rollAmbition(actor, hour) {
  const salt = [...(actor.id || "x")].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const pick = AMBITIONS[(salt + (hour || 0)) % AMBITIONS.length];
  actor.ambition = pick.id;
}

function meetAmbition(world, actor, action) {
  if (!actor || actor.kind !== "human" || !actor.ambition) return;
  const spec = AMBITIONS.find((row) => row.id === actor.ambition);
  if (!spec || !spec.match(action)) return;
  actor.utopia += spec.purse;
  notePurse(actor, "ambition", spec.purse);
  log(world, `${actor.name} meets ${spec.name}. Purse +${formatUtopia(spec.purse)} $UTOPIA.`);
  const nextHour = (world.hour || 0) + 1;
  rollAmbition(actor, nextHour);
  if (actor.ambition === spec.id) rollAmbition(actor, nextHour + 3);
}

export function applyAction(world, actorId, action) {
  const actor = byId(world, actorId);
  if (!actor) return fail("No such province.");
  let result = fail("Unknown order.");
  if (action.type === "build") result = doBuild(world, actor, action.building, action);
  else if (action.type === "train") result = doTrain(world, actor, action);
  else if (action.type === "explore") result = doExplore(world, actor);
  else if (action.type === "buy") result = doBuy(world, actor, action);
  else if (action.type === "arm") result = doArm(world, actor, action.unit);
  else if (action.type === "armory") result = doArmory(world, actor, action.weapon);
  else if (action.type === "study") result = doStudy(world, actor, action.study);
  else if (action.type === "doctrine") result = doDoctrine(world, actor, action.doctrine);
  else if (action.type === "wonder") result = doWonder(world, actor, action.wonder);
  else if (action.type === "trade") result = doTrade(world, actor, action.target);
  else if (action.type === "envoy") result = doEnvoy(world, actor, action.target);
  else if (action.type === "clear") result = doClear(world, actor, action.site);
  else if (action.type === "tribute") result = doTribute(world, actor, action.target);
  else if (action.type === "beacon") result = doBeacon(world, actor);
  else if (action.type === "ransom") result = doRansom(world, actor, action.target);
  else if (action.type === "release") result = doRelease(world, actor, action.target);
  else if (action.type === "muster") result = doMuster(world, actor);
  else if (action.type === "stall") result = doStall(world, actor, action.mode);
  else if (action.type === "feast") result = doFeast(world, actor);
  else if (action.type === "bounty") result = doBounty(world, actor, action.target);
  else if (action.type === "prospect") result = doProspect(world, actor);
  else if (action.type === "relief") result = doRelief(world, actor, action.target);
  else if (action.type === "smith") result = doSmith(world, actor);
  else if (action.type === "seal") result = doSeal(world, actor);
  else if (action.type === "levee") result = doLevee(world, actor);
  else if (action.type === "road") result = doRoad(world, actor, action.target);
  else if (action.type === "fold") result = doFold(world, actor);
  else if (action.type === "curfew") result = doCurfew(world, actor);
  else if (action.type === "hospice") result = doHospice(world, actor);
  else if (action.type === "hamlet") result = doHamlet(world, actor);
  else if (action.type === "inn") result = doInn(world, actor);
  else if (action.type === "weir") result = doWeir(world, actor);
  else if (action.type === "timber") result = doTimber(world, actor);
  else if (action.type === "quarry") result = doQuarry(world, actor);
  else if (action.type === "wheel") result = doWheel(world, actor);
  else if (action.type === "look") result = doLook(world, actor);
  else if (action.type === "pale") result = doPale(world, actor);
  else if (action.type === "pan") result = doPan(world, actor);
  else if (action.type === "grove") result = doGrove(world, actor);
  else if (action.type === "hive") result = doHive(world, actor);
  else if (action.type === "drift") result = doDrift(world, actor);
  else if (action.type === "vine") result = doVine(world, actor);
  else if (action.type === "bell") result = doBell(world, actor);
  else if (action.type === "sail") result = doSail(world, actor);
  else if (action.type === "cistern") result = doCistern(world, actor);
  else if (action.type === "char") result = doChar(world, actor);
  else if (action.type === "reed") result = doReed(world, actor);
  else if (action.type === "malt") result = doMalt(world, actor);
  else if (action.type === "dove") result = doDove(world, actor);
  else if (action.type === "oven") result = doOven(world, actor);
  else if (action.type === "siege") result = doSiege(world, actor, action.target);
  else if (action.type === "sally") result = doSally(world, actor, action.target);
  else if (action.type === "ride") result = doRide(world, actor, action.band);
  else if (action.type === "bribe") result = doBribe(world, actor, action.band);
  else if (action.type === "patrol") result = doPatrol(world, actor);
  else if (action.type === "keel") result = doKeel(world, actor);
  else if (action.type === "founder") result = doFounder(world, actor);
  else if (action.type === "direct") result = doDirect(world, actor, action);
  else if (action.type === "hull") result = doHull(world, actor, action.hull);
  else if (action.type === "grapple") result = doGrapple(world, actor, action);
  else if (action.type === "blockade") result = doBlockade(world, actor, action);
  else if (action.type === "salvage") result = doSalvage(world, actor, action);
  else if (action.type === "tow") result = doTow(world, actor, action);
  else if (action.type === "convoy") result = doConvoy(world, actor, action);
  else if (action.type === "wharf") result = doWharf(world, actor, action.colony);
  else if (action.type === "cooper") result = doCooper(world, actor, action.colony);
  else if (action.type === "rope") result = doRope(world, actor, action.colony);
  else if (action.type === "smoke") result = doSmoke(world, actor, action.colony);
  else if (action.type === "monger") result = doMonger(world, actor, action.colony);
  else if (action.type === "pilot") result = doPilot(world, actor, action.colony);
  else if (action.type === "refit") result = doRefit(world, actor, action);
  else if (action.type === "mole") result = doMole(world, actor, action.colony);
  else if (action.type === "lee") result = doLee(world, actor, action.colony);
  else if (action.type === "net") result = doNet(world, actor, action.ship);
  else if (action.type === "slip") result = doSlip(world, actor, action);
  else if (action.type === "buoy") result = doBuoy(world, actor, action.ship);
  else if (action.type === "cargo") result = doCargo(world, actor, action);
  else if (action.type === "cut") result = doCut(world, actor, action);
  else if (action.type === "raid") result = doRaid(world, actor, action);
  else if (action.type === "quay") result = doQuay(world, actor, action.colony);
  else if (action.type === "dues") result = doDues(world, actor, action.colony);
  else if (action.type === "lamp") result = doLamp(world, actor, action.colony);
  else if (action.type === "chain") result = doChain(world, actor, action.colony);
  else if (action.type === "ferry") result = doFerry(world, actor);
  else if (action.type === "attack") result = doAttack(world, actor, action);
  else if (action.type === "spell") result = doSpell(world, actor, action);
  else if (action.type === "thief") result = doThief(world, actor, action);
  if (result.ok) {
    if (result.win) action.win = true;
    meetAmbition(world, actor, action);
  }
  return result;
}

function tilePrice(actor) {
  let cost = 90 + (actor.plots || []).length * 6;
  if (actor.studies && actor.studies.charter) cost = Math.floor(cost * 0.85);
  return cost;
}

function touchesRealm(actor, q, r) {
  const [x, y] = seatPoint(actor);
  const seat = worldToAxial(x, y);
  if (hexDist(q, r, seat.q, seat.r) <= 1) return true;
  for (const tile of actor.plots || []) {
    if (hexDist(q, r, tile.q, tile.r) <= 1) return true;
  }
  for (const colony of actor.colonies || []) {
    if (hexDist(q, r, colony.q, colony.r) <= 1) return true;
  }
  return false;
}

function doBuy(world, actor, action) {
  ensurePlots(world);
  if (actor.orders < 1) return fail("No orders left this hour.");
  const q = action.q | 0;
  const r = action.r | 0;
  const kind = terrainKind(q, r);
  if (kind === "sea") return fail("Open sea cannot be bought.");
  if (takenPlots(world).has(plotKey(q, r))) return fail("That tile is already held.");
  if (!touchesRealm(actor, q, r)) return fail("Buy ground that touches your acres.");
  const cost = tilePrice(actor);
  if (actor.gold < cost) return fail(`That tile wants ${cost} gold.`);
  actor.gold -= cost;
  actor.orders -= 1;
  actor.land += 4;
  actor.acted = true;
  actor.plots = actor.plots || [];
  const tile = { q, r, crew: "hand" };
  actor.plots.push(tile);
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.tile;
    notePurse(actor, "tile", EARN.tile);
    purse = ` Purse +${formatUtopia(EARN.tile)} $UTOPIA.`;
  }
  log(world, `${actor.name} buys a ${kind} tile for ${cost} gold. A building can stand on it.${purse}`);
  return { ok: true, message: `Bought a ${kind} tile for ${cost} gold.${purse}` };
}

function doBuild(world, actor, key, action) {
  const spec = BUILDINGS[key];
  if (!spec) return fail("Unknown building.");
  let plot = null;
  if (action && action.q != null && action.r != null) {
    const q = action.q | 0;
    const r = action.r | 0;
    plot = (actor.plots || []).find((tile) => tile.q === q && tile.r === r);
    if (!plot) return fail("Buy that tile before you raise a building.");
    if (plot.structure) return fail("A building already stands on that tile.");
    if (plot.crew && plot.crew !== "hand" && plot.crew !== "lot") return fail("That tile is already worked.");
    const kind = terrainKind(q, r);
    if (kind === "sea" || kind === "mount") return fail("That ground will not hold a building.");
  }
  if (freeLand(actor) < 1) return fail("No empty acres.");
  const cost = stonePrice(actor, key);
  if (actor.gold < cost) return fail(`Need ${cost} gold for a ${spec.name.slice(0, -1).toLowerCase()}.`);
  actor.gold -= cost;
  actor.buildings[key] += 1;
  if (plot) {
    plot.structure = key;
    if (plot.crew === "lot") plot.crew = "hand";
  }
  actor.acted = true;
  const cut = (key === "keep" || key === "barracks") && quarryPits(actor) > 0 ? " Quarry stone cheapened it." : "";
  const where = plot ? ` on a ${terrainKind(plot.q, plot.r)} tile` : "";
  log(world, `${actor.name} raises a ${spec.name.slice(0, -1).toLowerCase()}${where} (${cost} gold).${cut}`);
  return { ok: true, message: `Built${where}. ${cost} gold.${cut}` };
}

function doTrain(world, actor, action) {
  const count = Math.max(1, Math.floor(action.count || 1));
  if (action.unit === "soldier") {
    const room = soldierCap(actor) - actor.soldiers;
    const n = Math.min(count, room, actor.peasants, Math.floor(actor.gold / 45));
    if (n < 1) return fail("Cannot draft. Need peasants, gold, and barracks room.");
    actor.peasants -= n;
    actor.soldiers += n;
    actor.gold -= n * 45;
    actor.acted = true;
    log(world, `${actor.name} drafts ${n} soldiers.`);
    return { ok: true, message: `Drafted ${n}.` };
  }
  if (action.unit === "elite") {
    const room = eliteCap(actor) - actor.elites;
    const n = Math.min(count, room, actor.soldiers, Math.floor(actor.gold / 160));
    if (n < 1) return fail("Cannot train elites. Need soldiers, gold, and barracks room.");
    actor.soldiers -= n;
    actor.elites += n;
    actor.gold -= n * 160;
    actor.acted = true;
    const name = FACTIONS[actor.faction].elite;
    log(world, `${actor.name} trains ${n} ${name}s.`);
    return { ok: true, message: `Trained ${n} ${name}s.` };
  }
  if (action.unit === "thief") {
    const room = thiefCap(actor) - actor.thieves;
    const n = Math.min(count, room, actor.soldiers, Math.floor(actor.gold / 130));
    if (n < 1) return fail("Cannot train thieves. Need soldiers, gold, and den room.");
    actor.soldiers -= n;
    actor.thieves += n;
    actor.gold -= n * 130;
    actor.acted = true;
    log(world, `${actor.name} trains ${n} thieves.`);
    return { ok: true, message: `Trained ${n} thieves.` };
  }
  if (action.unit === "disband") {
    const n = Math.min(count, actor.soldiers);
    if (n < 1) return fail("No soldiers to release.");
    actor.soldiers -= n;
    actor.peasants += n;
    log(world, `${actor.name} releases ${n} soldiers back to the fields.`);
    return { ok: true, message: `Released ${n}.` };
  }
  return fail("Unknown unit.");
}

function doExplore(world, actor) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  let cost = 300 + actor.land * 3;
  if (actor.studies && actor.studies.charter) cost = Math.floor(cost * 0.85);
  if (actor.gold < cost) return fail(`Exploration wants ${cost} gold.`);
  actor.gold -= cost;
  actor.orders -= 1;
  actor.land += 10;
  actor.peasants += 8;
  actor.acted = true;
  const bought = claimTiles(world, actor, 2);
  let purse = "";
  if (actor.kind === "human") {
    const cents = actor.studies && actor.studies.charter ? EARN.charter : EARN.settle;
    actor.utopia += cents;
    notePurse(actor, "settle", cents);
    purse = ` Purse +${formatUtopia(cents)} $UTOPIA.`;
  }
  const names = bought.map((tile) => tile.kind).join(" and ");
  const tiles = bought.length ? ` Bought ${bought.length} live ${bought.length === 1 ? "tile" : "tiles"} (${names}).` : "";
  log(world, `${actor.name} settles 10 acres (${cost} gold).${tiles}${purse}`);
  return { ok: true, message: `Settled 10 acres for ${cost} gold.${tiles}${purse}` };
}

function doArm(world, actor, unit) {
  const spec = ARMS[unit];
  if (!spec) return fail("Unknown arm.");
  ensurePlots(world);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < spec.gold) return fail(`${spec.name} want ${spec.gold} gold.`);
  if (actor.soldiers < spec.soldiers) return fail(`${spec.name} want ${spec.soldiers} soldiers.`);
  const plot = (actor.plots || []).find((tile) => (!tile.crew || tile.crew === "hand") && spec.locks.includes(terrainKind(tile.q, tile.r)));
  if (!plot) return fail(`No bought tile will take ${spec.name}. ${spec.line}`);
  actor.gold -= spec.gold;
  actor.soldiers -= spec.soldiers;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = unit;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.arm;
    notePurse(actor, "arm", EARN.arm);
    purse = ` Purse +${formatUtopia(EARN.arm)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} posts ${spec.name} on a ${kind} tile.${purse}`);
  return { ok: true, message: `${spec.name} hold the ${kind} tile.${purse}` };
}

function doArmory(world, actor, id) {
  const spec = WEAPONS[id];
  if (!spec || id === "spear") return fail("Name the arms the age can field.");
  if (studyCount(actor) < spec.need) return fail(`${spec.name} wait on the ${spec.age} age.`);
  if (id === "car" && !(actor.studies && actor.studies.powder)) return fail("Landcars wait on the Powder Seat.");
  if (actor.weapon === id) return fail(`The host already carries ${spec.name}.`);
  const held = WEAPONS[actor.weapon];
  if (held && held.bite > spec.bite) return fail("The host will not set those arms down.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if ((actor.soldiers || 0) < 8) return fail("Eight soldiers must stand to take the new arms.");
  if (actor.gold < spec.gold) return fail(`${spec.name} want ${spec.gold} gold.`);
  actor.gold -= spec.gold;
  actor.orders -= 1;
  actor.acted = true;
  actor.weapon = id;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.armory;
    notePurse(actor, "armory", EARN.armory);
    purse = ` Purse +${formatUtopia(EARN.armory)} $UTOPIA.`;
  }
  log(world, `${actor.name} issues ${spec.name} to the host. ${spec.line}${purse}`);
  return { ok: true, message: `${spec.name} issued.${purse}` };
}

function doStudy(world, actor, id) {
  const spec = STUDIES.find((row) => row.id === id);
  if (!spec) return fail("Unknown study.");
  actor.studies = actor.studies || {};
  if (actor.studies[id]) return fail(`${spec.name} is already seated.`);
  if (studyCount(actor) < spec.need) return fail(`${spec.name} waits on ${spec.need} earlier studies.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  const cost = actor.doctrine === "college" ? Math.max(80, spec.cost - 100) : spec.cost;
  if (actor.gold < cost) return fail(`${spec.name} wants ${cost} gold.`);
  if (actor.aether < spec.aether) return fail(`${spec.name} wants ${spec.aether} aether.`);
  actor.gold -= cost;
  actor.aether -= spec.aether;
  actor.orders -= 1;
  actor.acted = true;
  actor.studies[id] = world.hour || 1;
  let purse = "";
  if (actor.kind === "human") {
    const cents = actor.marks && actor.marks.archive ? Math.floor(spec.purse * 1.25) : spec.purse;
    actor.utopia += cents;
    notePurse(actor, "study", cents);
    purse = ` Purse +${formatUtopia(cents)} $UTOPIA.`;
  }
  log(world, `${actor.name} completes ${spec.name} and enters the ${ageName(actor)} age.${purse}`);
  return { ok: true, message: `${spec.name} seated.${purse}` };
}

function doDoctrine(world, actor, id) {
  const spec = DOCTRINES[id];
  if (!spec) return fail("Unknown civic.");
  if (actor.doctrine === id) return fail(`${spec.name} is already the civic.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 180) return fail("A civic wants 180 gold.");
  actor.gold -= 180;
  actor.orders -= 1;
  actor.acted = true;
  actor.doctrine = id;
  log(world, `${actor.name} adopts ${spec.name}. ${spec.blurb}`);
  return { ok: true, message: `${spec.name} adopted.` };
}

function doWonder(world, actor, id) {
  const spec = WONDERS[id];
  if (!spec) return fail("Unknown wonder.");
  world.wonders = world.wonders || {};
  if (world.wonders[id]) return fail(`${spec.name} already stands.`);
  if (studyCount(actor) < spec.need) return fail(`${spec.name} waits on ${spec.need} studies.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  const cost = actor.doctrine === "college" ? Math.max(200, spec.cost - 100) : spec.cost;
  if (actor.gold < cost) return fail(`${spec.name} wants ${cost} gold.`);
  if ((actor.aether || 0) < spec.aether) return fail(`${spec.name} wants ${spec.aether} aether.`);
  actor.gold -= cost;
  actor.aether -= spec.aether;
  actor.orders -= 1;
  actor.acted = true;
  actor.marks = actor.marks || {};
  actor.marks[id] = true;
  world.wonders[id] = actor.id;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += spec.purse;
    notePurse(actor, "wonder", spec.purse);
    purse = ` Purse +${formatUtopia(spec.purse)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises the ${spec.name}.${purse}`);
  return { ok: true, message: `${spec.name} raised.${purse}` };
}

function doTrade(world, actor, targetId) {
  const target = byId(world, targetId);
  if (!target || target.id === actor.id) return fail("Pick another holding.");
  if (!intelFresh(actor, target.id, world.hour)) return fail("Scout the road before a caravan rolls.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 200) return fail("A caravan wants 200 gold.");
  const scale = nwFactor(actor, target);
  actor.gold -= 200;
  actor.orders -= 1;
  actor.acted = true;
  let haul = 90 + Math.floor(Math.min(actor.land, target.land) * 0.35);
  if (pactLive(actor, target.id, world.hour)) haul = Math.floor(haul * 1.3);
  if (roadLive(actor, target.id, world.hour)) haul = Math.floor(haul * 1.25);
  let fed = "";
  if (innUp(actor, world.hour)) {
    haul = Math.floor(haul * 1.12);
    fed = " The inn feeds the drovers.";
  }
  if (weirLive(actor, world.hour)) {
    haul = Math.floor(haul * 1.1);
    fed += " Salted fish rides with the cart.";
  }
  if (keelUp(actor, world.hour)) {
    haul = Math.floor(haul * 1.08);
    fed += " The keel escorts the river reach.";
  }
  actor.gold += haul;
  const earned = grantEarn(actor, EARN.trade, scale, "trade");
  const purse = earned ? ` Purse +${formatUtopia(earned)} $UTOPIA.` : " Outside the fair band, so the purse stays shut.";
  log(world, `${actor.name} rolls a caravan to ${target.name} and brings back ${haul} gold.${fed}${purse}`);
  return { ok: true, message: `Caravan returned ${haul} gold.${fed}${purse}` };
}

function pactLive(actor, id, hour) {
  const until = actor && actor.pacts && actor.pacts[id];
  return typeof until === "number" && hour <= until;
}

export function roadLive(actor, id, hour) {
  const until = actor && actor.roads && actor.roads[id];
  return typeof until === "number" && until > (hour || 0);
}

function doEnvoy(world, actor, targetId) {
  const target = byId(world, targetId);
  if (!target || target.id === actor.id) return fail("Pick another holding.");
  if (!intelFresh(actor, target.id, world.hour)) return fail("Scout them before an envoy rides.");
  if (pactLive(actor, target.id, world.hour)) return fail("A pact already holds.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 120) return fail("An envoy wants 120 gold.");
  actor.gold -= 120;
  actor.orders -= 1;
  actor.acted = true;
  actor.pacts = actor.pacts || {};
  target.pacts = target.pacts || {};
  const until = (world.hour || 0) + 4;
  actor.pacts[target.id] = until;
  target.pacts[actor.id] = until;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.pact;
    notePurse(actor, "pact", EARN.pact);
    purse = ` Purse +${formatUtopia(EARN.pact)} $UTOPIA.`;
  }
  log(world, `${actor.name} binds a pact with ${target.name} through hour ${until}.${purse}`);
  return { ok: true, message: `Pact holds through hour ${until}.${purse}` };
}

function doRoad(world, actor, targetId) {
  const target = byId(world, targetId);
  if (!target || target.id === actor.id) return fail("Pick another holding.");
  if (actor.kind !== "agent" && !intelFresh(actor, target.id, world.hour)) return fail("Scout the ground before you lay stone.");
  if (roadLive(actor, target.id, world.hour)) return fail(`That causeway already holds through hour ${actor.roads[target.id] - 1}.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  const cost = timberYards(actor) > 0 ? 180 : 220;
  if (actor.gold < cost) return fail(`A causeway wants ${cost} gold.`);
  actor.gold -= cost;
  actor.orders -= 1;
  actor.acted = true;
  actor.roads = actor.roads || {};
  actor.roads[target.id] = (world.hour || 0) + 8;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.road;
    notePurse(actor, "road", EARN.road);
    purse = ` Purse +${formatUtopia(EARN.road)} $UTOPIA.`;
  }
  const cut = cost < 220 ? " Cut timber cheapened the stones." : "";
  log(world, `${actor.name} lays a causeway to ${target.name} through hour ${actor.roads[target.id] - 1}. Caravans on that road haul more.${cut}${purse}`);
  return { ok: true, message: `Causeway laid through hour ${actor.roads[target.id] - 1}.${cut}${purse}` };
}

function settleRoads(p, hour) {
  if (!p || !p.roads) return;
  for (const id of Object.keys(p.roads)) {
    if (p.roads[id] > (hour || 0)) continue;
    delete p.roads[id];
  }
}

function doClear(world, actor, siteId) {
  const site = (world.sites || []).find((row) => row.id === siteId);
  if (!site) return fail("That place is not on the map.");
  if (site.clearedBy) return fail(`${site.name} is already open.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if ((actor.soldiers || 0) < 15) return fail("A party wants 15 soldiers at home.");
  actor.orders -= 1;
  actor.acted = true;
  actor.soldiers -= 4;
  site.clearedBy = actor.id;
  actor.gold += site.gold;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += site.purse;
    notePurse(actor, "site", site.purse);
    purse = ` Purse +${formatUtopia(site.purse)} $UTOPIA.`;
  }
  actor.relics = actor.relics || {};
  actor.relics[site.id] = true;
  const relic = RELICS[site.id];
  log(world, `${actor.name} opens ${site.name} and brings home ${site.gold} gold. The ${relic ? relic.name : "relic"} stays.${purse}`);
  return { ok: true, message: `${site.name} opened. ${relic ? relic.line : ""}${purse}` };
}

function doTribute(world, actor, targetId) {
  const target = byId(world, targetId);
  if (!target || target.id === actor.id) return fail("Pick another holding.");
  if (!intelFresh(actor, target.id, world.hour)) return fail("Scout them before you ask for tribute.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  actor.demands = actor.demands || {};
  const last = actor.demands[target.id];
  if (last != null && world.hour - last < 3) return fail("They already answered this hour's demand.");
  const scale = nwFactor(actor, target);
  if (scale <= 0) return fail("Networth sits outside the fair band. No tribute, no $UTOPIA.");
  actor.orders -= 1;
  actor.acted = true;
  actor.demands[target.id] = world.hour;
  const pressed = offense(actor) > defense(target) * 0.75;
  if (!pressed) {
    target.grudge = actor.id;
    log(world, `${target.name} refuses tribute and marks ${actor.name}.`);
    return { ok: true, message: "Tribute refused.", win: false };
  }
  const take = Math.max(40, Math.floor(target.gold * 0.08));
  const got = Math.min(target.gold, take);
  target.gold -= got;
  actor.gold += got;
  const earned = grantEarn(actor, EARN.tribute, scale, "tribute");
  const purse = earned ? ` Purse +${formatUtopia(earned)} $UTOPIA.` : " Outside the purse cap for this hour.";
  log(world, `${actor.name} takes ${got} gold in tribute from ${target.name}.${purse}`);
  return { ok: true, message: `Tribute of ${got} gold.${purse}`, win: true };
}

function doBeacon(world, actor) {
  if (beaconLit(actor, world.hour)) return fail(`The watch fire already holds through hour ${actor.beaconUntil - 1}.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 160) return fail("A watch fire wants 160 gold.");
  if ((actor.grain || 0) < 80) return fail("A watch fire wants 80 grain.");
  actor.gold -= 160;
  actor.grain -= 80;
  actor.orders -= 1;
  actor.acted = true;
  actor.beaconUntil = (world.hour || 0) + BEACON_HOURS;
  const sweep = watchSweep(world, actor);
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.beacon;
    notePurse(actor, "beacon", EARN.beacon);
    purse = ` Purse +${formatUtopia(EARN.beacon)} $UTOPIA.`;
  }
  log(world, `${actor.name} lights a watch fire through hour ${actor.beaconUntil - 1}. It reads ${sweep.seen} camps.${purse}`);
  return { ok: true, message: `Watch fire lit. ${sweep.seen} camps in the light.${purse}` };
}

export function captiveCount(p) {
  if (!p) return 0;
  const penned = Object.values(p.pens || {}).reduce((sum, n) => sum + (n || 0), 0);
  if (penned > 0) return penned;
  return p.held || 0;
}

function takeCaptives(actor, target) {
  const spare = Math.max(0, (target.peasants || 0) - 12);
  const n = Math.min(spare, Math.floor((target.peasants || 0) * 0.04));
  if (n < 1) return 0;
  target.peasants -= n;
  actor.pens = actor.pens || {};
  actor.pens[target.id] = (actor.pens[target.id] || 0) + n;
  return n;
}

function shedCaptives(p, n) {
  let left = n;
  const pens = p.pens || {};
  for (const id of Object.keys(pens)) {
    if (left <= 0) break;
    const take = Math.min(pens[id], left);
    pens[id] -= take;
    left -= take;
    if (pens[id] <= 0) delete pens[id];
  }
}

function feedCaptives(p) {
  const held = Object.values(p.pens || {}).reduce((sum, n) => sum + (n || 0), 0);
  if (held < 1) return;
  const grain = Math.max(0, p.grain || 0);
  if (grain >= held) {
    p.grain = grain - held;
    return;
  }
  shedCaptives(p, held - grain);
  p.grain = 0;
}

function doRansom(world, actor, targetId) {
  const target = byId(world, targetId);
  if (!target || target.id === actor.id) return fail("Pick another holding.");
  const n = (actor.pens && actor.pens[target.id]) || 0;
  if (n < 1) return fail("You hold none of their people.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  const price = Math.min(target.gold, n * 28);
  if (price < 20) return fail("They cannot pay. Release the pen, or wait for their gold.");
  actor.orders -= 1;
  actor.acted = true;
  target.gold -= price;
  actor.gold += price;
  target.peasants += n;
  delete actor.pens[target.id];
  const scale = nwFactor(actor, target);
  const earned = actor.kind === "human" ? grantEarn(actor, EARN.ransom, scale, "ransom") : 0;
  const purse = earned ? ` Purse +${formatUtopia(earned)} $UTOPIA.` : " Outside the fair band, so the purse stays shut.";
  log(world, `${actor.name} ransoms ${n} people back to ${target.name} for ${price} gold.${purse}`);
  return { ok: true, message: `Ransom of ${price} gold for ${n}.${purse}` };
}

function doRelease(world, actor, targetId) {
  const target = byId(world, targetId);
  if (!target || target.id === actor.id) return fail("Pick another holding.");
  const n = (actor.pens && actor.pens[target.id]) || 0;
  if (n < 1) return fail("You hold none of their people.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  actor.orders -= 1;
  actor.acted = true;
  target.peasants += n;
  delete actor.pens[target.id];
  if (target.grudge === actor.id) target.grudge = null;
  log(world, `${actor.name} releases ${n} people back to ${target.name}.`);
  return { ok: true, message: `Released ${n}.` };
}

export function feastLive(p, hour) {
  return Boolean(p && typeof p.feastUntil === "number" && p.feastUntil > (hour || 0));
}

export function bountyOn(world, id, hour) {
  const row = world && world.bounties && world.bounties[id];
  if (!row || !(row.until > (hour || 0))) return null;
  return row;
}

function doBounty(world, actor, targetId) {
  const target = byId(world, targetId);
  if (!target || target.id === actor.id) return fail("Pick another holding.");
  if (actor.kind !== "agent" && !intelFresh(actor, target.id, world.hour)) return fail("Scout them before you post a price.");
  if (bountyOn(world, target.id, world.hour)) return fail(`A bounty already sits through hour ${world.bounties[target.id].until - 1}.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 200) return fail("A bounty wants 200 gold.");
  actor.gold -= 200;
  actor.orders -= 1;
  actor.acted = true;
  world.bounties = world.bounties || {};
  world.bounties[target.id] = { poster: actor.id, gold: 200, until: (world.hour || 0) + 8 };
  log(world, `${actor.name} posts 200 gold on ${target.name} through hour ${world.bounties[target.id].until - 1}.`);
  return { ok: true, message: `Bounty posted on ${target.name}.` };
}

function claimBounty(world, actor, target) {
  const row = bountyOn(world, target.id, world.hour);
  if (!row || row.poster === actor.id) return 0;
  delete world.bounties[target.id];
  actor.gold += row.gold;
  let purse = "";
  if (actor.kind === "human") {
    const earned = grantEarn(actor, EARN.bounty, nwFactor(actor, target), "bounty");
    if (earned) purse = ` Purse +${formatUtopia(earned)} $UTOPIA.`;
  }
  log(world, `${actor.name} collects the bounty on ${target.name}: ${row.gold} gold.${purse}`);
  return row.gold;
}

function expireBounties(world) {
  const board = world.bounties || {};
  for (const [id, row] of Object.entries(board)) {
    if (row.until > world.hour) continue;
    delete board[id];
    const poster = byId(world, row.poster);
    const named = byId(world, id);
    if (poster) {
      poster.gold += row.gold;
      log(world, `The price on ${named ? named.name : "a camp"} goes unpaid. ${row.gold} gold returns to ${poster.name}.`);
    }
  }
}

export const VEINS = {
  salt: { name: "Salt Pan", line: "Workshops take 6% more gold." },
  iron: { name: "Iron Seam", line: "The host hits 4% harder." },
  spring: { name: "Sweet Spring", line: "Fields yield 6% more grain." },
};

function settleVein(p, hour) {
  if (!p || !p.vein) return;
  if (typeof p.veinUntil === "number" && p.veinUntil > (hour || 0)) return;
  p.vein = "";
  p.veinUntil = 0;
}

function settleSeal(p, hour) {
  if (!p || !(p.sealUntil > 0)) return;
  if (p.sealUntil > (hour || 0)) return;
  p.sealUntil = 0;
}

export function leveeUp(p, hour) {
  return Boolean(p && (p.leveeUntil || 0) > (hour || 0));
}

function settleLevee(p, hour) {
  if (!p || !(p.leveeUntil > 0)) return;
  if (p.leveeUntil > (hour || 0)) return;
  p.leveeUntil = 0;
}

function doLevee(world, actor) {
  if (leveeUp(actor, world.hour)) return fail(`The levee already holds through hour ${actor.leveeUntil - 1}.`);
  settleLevee(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 150) return fail("A levee wants 150 gold.");
  actor.gold -= 150;
  actor.orders -= 1;
  actor.acted = true;
  actor.leveeUntil = (world.hour || 0) + 6;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.levee;
    notePurse(actor, "levee", EARN.levee);
    purse = ` Purse +${formatUtopia(EARN.levee)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a levee through hour ${actor.leveeUntil - 1}. It takes one building blow, and the ditch waters the near fields.${purse}`);
  return { ok: true, message: `Levee raised through hour ${actor.leveeUntil - 1}.${purse}` };
}

export function foldLive(p, hour) {
  return Boolean(p && (p.foldUntil || 0) > (hour || 0) && (p.fold || 0) > 0);
}

function settleFold(p, hour) {
  if (!p || !(p.foldUntil > 0)) return;
  if (p.foldUntil > (hour || 0)) return;
  p.foldUntil = 0;
  p.fold = 0;
}

function doFold(world, actor) {
  if (foldLive(actor, world.hour)) return fail(`The flock is already penned through hour ${actor.foldUntil - 1}.`);
  settleFold(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 110) return fail("A fold wants 110 gold.");
  if ((actor.peasants || 0) < 40) return fail("Need 40 peasants to mind the flock.");
  actor.gold -= 110;
  actor.orders -= 1;
  actor.acted = true;
  actor.fold = 28;
  actor.foldUntil = (world.hour || 0) + 6;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.fold;
    notePurse(actor, "fold", EARN.fold);
    purse = ` Purse +${formatUtopia(EARN.fold)} $UTOPIA.`;
  }
  log(world, `${actor.name} pens 28 sheep through hour ${actor.foldUntil - 1}. The fold yields wool and milk. A sack scatters them.${purse}`);
  return { ok: true, message: `Flock penned through hour ${actor.foldUntil - 1}.${purse}` };
}

export function curfewUp(p, hour) {
  return Boolean(p && (p.curfewUntil || 0) > (hour || 0));
}

function settleCurfew(p, hour) {
  if (!p || !(p.curfewUntil > 0)) return;
  if (p.curfewUntil > (hour || 0)) return;
  p.curfewUntil = 0;
}

function doCurfew(world, actor) {
  if (curfewUp(actor, world.hour)) return fail(`The lanterns already hang through hour ${actor.curfewUntil - 1}.`);
  settleCurfew(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 85) return fail("A curfew wants 85 gold.");
  actor.gold -= 85;
  actor.orders -= 1;
  actor.acted = true;
  actor.curfewUntil = (world.hour || 0) + 5;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.curfew;
    notePurse(actor, "curfew", EARN.curfew);
    purse = ` Purse +${formatUtopia(EARN.curfew)} $UTOPIA.`;
  }
  log(world, `${actor.name} hangs curfew lanterns through hour ${actor.curfewUntil - 1}. A pilfer takes half the gold.${purse}`);
  return { ok: true, message: `Curfew through hour ${actor.curfewUntil - 1}.${purse}` };
}

export function hospiceUp(p, hour) {
  return Boolean(p && (p.hospiceUntil || 0) > (hour || 0));
}

function settleHospice(p, hour) {
  if (!p || !(p.hospiceUntil > 0)) return;
  if (p.hospiceUntil > (hour || 0)) return;
  p.hospiceUntil = 0;
}

function doHospice(world, actor) {
  if (hospiceUp(actor, world.hour)) return fail(`The hospice already stands through hour ${actor.hospiceUntil - 1}.`);
  settleHospice(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 140) return fail("A hospice wants 140 gold.");
  if (actor.grain < 180) return fail("A hospice wants 180 grain.");
  actor.gold -= 140;
  actor.grain -= 180;
  actor.orders -= 1;
  actor.acted = true;
  actor.hospiceUntil = (world.hour || 0) + 5;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.hospice;
    notePurse(actor, "hospice", EARN.hospice);
    purse = ` Purse +${formatUtopia(EARN.hospice)} $UTOPIA.`;
  }
  log(world, `${actor.name} pitches a hospice through hour ${actor.hospiceUntil - 1}. Battle losses are halved, and the tent adds a few people each hour.${purse}`);
  return { ok: true, message: `Hospice through hour ${actor.hospiceUntil - 1}.${purse}` };
}

export function innUp(p, hour) {
  return Boolean(p && (p.innUntil || 0) > (hour || 0));
}

/** Taproom gold this hour. A live pact or causeway brings more travelers. Frost thins the road. */
export function innToll(p, hour) {
  if (!innUp(p, hour)) return 0;
  let pacts = 0;
  for (const until of Object.values(p.pacts || {})) {
    if (typeof until === "number" && (hour || 0) <= until) pacts += 1;
  }
  let roads = 0;
  for (const until of Object.values(p.roads || {})) {
    if (typeof until === "number" && until > (hour || 0)) roads += 1;
  }
  let coin = 18 + pacts * 14 + roads * 10;
  const name = seasonName(hour || 0);
  if (name === "Frost") coin = Math.floor(coin * 0.7);
  else if (name === "High Sun") coin = Math.floor(coin * 1.15);
  else if (name === "Harvest") coin = Math.floor(coin * 1.08);
  return coin;
}

function settleInn(p, hour) {
  if (!p || !(p.innUntil > 0)) return;
  if (p.innUntil > (hour || 0)) return;
  p.innUntil = 0;
}

function doInn(world, actor) {
  if (innUp(actor, world.hour)) return fail(`The inn already stands through hour ${actor.innUntil - 1}.`);
  settleInn(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 175) return fail("An inn wants 175 gold.");
  if (actor.grain < 220) return fail("An inn wants 220 grain.");
  actor.gold -= 175;
  actor.grain -= 220;
  actor.orders -= 1;
  actor.acted = true;
  actor.innUntil = (world.hour || 0) + 6;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.inn;
    notePurse(actor, "inn", EARN.inn);
    purse = ` Purse +${formatUtopia(EARN.inn)} $UTOPIA.`;
  }
  log(world, `${actor.name} opens a wayside inn through hour ${actor.innUntil - 1}. Travelers pay the taproom, and caravans leave better fed. A sack burns it.${purse}`);
  return { ok: true, message: `Inn open through hour ${actor.innUntil - 1}.${purse}` };
}

function doHamlet(world, actor) {
  ensurePlots(world);
  const held = (actor.plots || []).filter((tile) => tile.crew === "hamlet").length;
  if (held >= 3) return fail("Three hamlets already sit on your tiles.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 260) return fail("A hamlet wants 260 gold.");
  const plot = (actor.plots || []).find((tile) => tile.crew === "hand" && (terrainKind(tile.q, tile.r) === "grass" || terrainKind(tile.q, tile.r) === "plain"));
  if (!plot) return fail("A hamlet needs a grass or wheat tile still worked by hands.");
  actor.gold -= 260;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "hamlet";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.hamlet;
    notePurse(actor, "hamlet", EARN.hamlet);
    purse = ` Purse +${formatUtopia(EARN.hamlet)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} raises a hamlet on a ${kind} tile.${purse}`);
  return { ok: true, message: `Hamlet on the ${kind} tile.${purse}` };
}

export function timberYards(p) {
  return (p && p.plots ? p.plots : []).filter((tile) => tile.crew === "timber").length;
}

function doTimber(world, actor) {
  ensurePlots(world);
  if (timberYards(actor) >= 2) return fail("Two timber yards already cut the woods.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 170) return fail("A timber yard wants 170 gold.");
  const plot = (actor.plots || []).find((tile) => tile.crew === "hand" && terrainKind(tile.q, tile.r) === "wood");
  if (!plot) return fail("A timber yard needs a wood tile still worked by hands.");
  actor.gold -= 170;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "timber";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.timber;
    notePurse(actor, "timber", EARN.timber);
    purse = ` Purse +${formatUtopia(EARN.timber)} $UTOPIA.`;
  }
  log(world, `${actor.name} cuts a timber yard. The stacks pay 26 gold an hour, and a causeway costs 180 gold while a yard stands. A sack can burn one stack.${purse}`);
  return { ok: true, message: `Timber yard cut.${purse}` };
}

function stoneTile(tile) {
  if (!tile) return false;
  const kind = terrainKind(tile.q, tile.r);
  return kind === "hill" || kind === "mount";
}

function nearestFreeStone(world, actor) {
  ensurePlots(world);
  const taken = takenPlots(world);
  const seen = new Set();
  const queue = [];
  for (const seed of actor.plots || []) {
    const key = plotKey(seed.q, seed.r);
    if (seen.has(key)) continue;
    seen.add(key);
    queue.push({ q: seed.q, r: seed.r, d: 0 });
  }
  while (queue.length) {
    const cell = queue.shift();
    if (cell.d > 0 && cell.d <= 4) {
      const key = plotKey(cell.q, cell.r);
      const kind = terrainKind(cell.q, cell.r);
      if (!taken.has(key) && (kind === "hill" || kind === "mount")) return { q: cell.q, r: cell.r, kind };
    }
    if (cell.d >= 4) continue;
    for (const [dq, dr] of HEX_DIRS) {
      const nq = cell.q + dq;
      const nr = cell.r + dr;
      const key = plotKey(nq, nr);
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ q: nq, r: nr, d: cell.d + 1 });
    }
  }
  return null;
}

function doQuarry(world, actor) {
  ensurePlots(world);
  if (quarryPits(actor) >= 2) return fail("Two quarries already cut the stone.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 190) return fail("A quarry wants 190 gold.");
  let plot = (actor.plots || []).find((tile) => tile.crew === "hand" && stoneTile(tile));
  let claimed = "";
  if (!plot) {
    const spot = nearestFreeStone(world, actor);
    if (!spot) return fail("A quarry needs a hill or mountain worked by hands, or free stone within four tiles.");
    plot = { q: spot.q, r: spot.r, crew: "hand" };
    actor.plots = actor.plots || [];
    actor.plots.push(plot);
    claimed = " The crew claimed the stone.";
  }
  actor.gold -= 190;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "quarry";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.quarry;
    notePurse(actor, "quarry", EARN.quarry);
    purse = ` Purse +${formatUtopia(EARN.quarry)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} opens a quarry on a ${kind} tile. The face pays 22 gold an hour, keeps and barracks cost 40 gold less per face, and the wall stands harder. A sack can collapse one face.${claimed}${purse}`);
  return { ok: true, message: `Quarry open on the ${kind} tile.${claimed}${purse}` };
}

export function quarryPits(p) {
  return (p && p.plots ? p.plots : []).filter((tile) => tile.crew === "quarry").length;
}

export function tideWheels(p) {
  return (p && p.plots ? p.plots : []).filter((tile) => tile.crew === "wheel").length;
}

function doWheel(world, actor) {
  ensurePlots(world);
  if (tideWheels(actor) >= 1) return fail("A tide wheel already turns.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 210) return fail("A tide wheel wants 210 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && waterTouch(tile));
  if (!plot) return fail("A tide wheel needs a hand or an open lot on the coast or beside the river.");
  actor.gold -= 210;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "wheel";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.wheel;
    notePurse(actor, "wheel", EARN.wheel);
    purse = ` Purse +${formatUtopia(EARN.wheel)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} raises a tide wheel on a ${kind} tile. It pays 28 grain and 12 gold an hour. A sack breaks the wheel.${purse}`);
  return { ok: true, message: `Tide wheel on the ${kind} tile.${purse}` };
}

function doLook(world, actor) {
  ensurePlots(world);
  if ((actor.plots || []).some((tile) => tile.crew === "look")) return fail("A lookout already watches.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 180) return fail("A lookout wants 180 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && stoneTile(tile));
  if (!plot) return fail("A lookout needs a hand or an open lot on a hill or a mountain.");
  actor.gold -= 180;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "look";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.look;
    notePurse(actor, "look", EARN.look);
    purse = ` Purse +${formatUtopia(EARN.look)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} raises a lookout on a ${kind} tile. It pays 6 gold an hour and marks an enemy hull within six hexes. A sack topples it.${purse}`);
  return { ok: true, message: `Lookout on the ${kind} tile.${purse}` };
}

function spotLookout(world, actor) {
  const tower = (actor.plots || []).find((tile) => tile.crew === "look");
  if (!tower) return;
  for (const other of world.provinces || []) {
    if (!other || other.id === actor.id) continue;
    for (const ship of other.ships || []) {
      if (hexDist(ship.q, ship.r, tower.q, tower.r) > 6) continue;
      const spec = NAVY[ship.kind];
      log(world, `${actor.name}'s lookout marks ${other.name}'s ${spec ? spec.name : "hull"} within six hexes.`);
      return;
    }
  }
}

function plotEdge(actor, tile) {
  for (const [dq, dr] of HEX_DIRS) {
    const nq = tile.q + dq;
    const nr = tile.r + dr;
    if (!(actor.plots || []).some((row) => row.q === nq && row.r === nr)) return true;
  }
  return false;
}

function doPale(world, actor) {
  ensurePlots(world);
  const held = (actor.plots || []).filter((tile) => tile.crew === "pale").length;
  if (held >= 3) return fail("Three stakes already ring the acres.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 170) return fail("A palisade wants 170 gold.");
  const sites = (actor.plots || []).filter((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && plotEdge(actor, tile)).slice(0, 3 - held);
  if (!sites.length) return fail("A palisade needs an open lot or a hand on the edge of your acres.");
  actor.gold -= 170;
  actor.orders -= 1;
  actor.acted = true;
  for (const tile of sites) tile.crew = "pale";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.pale;
    notePurse(actor, "pale", EARN.pale);
    purse = ` Purse +${formatUtopia(EARN.pale)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises ${sites.length} palisade ${sites.length === 1 ? "stake" : "stakes"}. Each adds 4 to the wall and pays 4 gold an hour. A sack breaks one.${purse}`);
  return { ok: true, message: `${sites.length} stakes raised.${purse}` };
}

function saltGround(tile) {
  if (!tile) return false;
  const kind = terrainKind(tile.q, tile.r);
  if (kind === "marsh") return true;
  return waterTouch(tile);
}

function doPan(world, actor) {
  ensurePlots(world);
  const held = (actor.plots || []).filter((tile) => tile.crew === "pan").length;
  if (held >= 2) return fail("Two salt pans already dry on the shore.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 150) return fail("A salt pan wants 150 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && saltGround(tile));
  if (!plot) return fail("A salt pan needs a hand or an open lot on marsh, coast, or a river bank.");
  actor.gold -= 150;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "pan";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.pan;
    notePurse(actor, "pan", EARN.pan);
    purse = ` Purse +${formatUtopia(EARN.pan)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} cuts a salt pan on a ${kind} tile. It pays 16 gold an hour. A sack spoils one pan.${purse}`);
  return { ok: true, message: `Salt pan on the ${kind} tile.${purse}` };
}

function fieldGround(tile) {
  if (!tile) return false;
  const kind = terrainKind(tile.q, tile.r);
  return kind === "grass" || kind === "plain";
}

function doGrove(world, actor) {
  ensurePlots(world);
  const held = (actor.plots || []).filter((tile) => tile.crew === "grove").length;
  if (held >= 2) return fail("Two groves already stand in the fields.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 160) return fail("A grove wants 160 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && fieldGround(tile));
  if (!plot) return fail("A grove needs a hand or an open lot on grass or plain.");
  actor.gold -= 160;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "grove";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.grove;
    notePurse(actor, "grove", EARN.grove);
    purse = ` Purse +${formatUtopia(EARN.grove)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} plants a grove on a ${kind} tile. It pays 24 grain and 4 gold an hour. A sack burns one grove.${purse}`);
  return { ok: true, message: `Grove on the ${kind} tile.${purse}` };
}

function doHive(world, actor) {
  ensurePlots(world);
  if ((actor.plots || []).some((tile) => tile.crew === "hive")) return fail("A hive already stands in the fields.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 150) return fail("A hive wants 150 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && fieldGround(tile));
  if (!plot) return fail("A hive needs a hand or an open lot on grass or plain.");
  actor.gold -= 150;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "hive";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.hive;
    notePurse(actor, "hive", EARN.hive);
    purse = ` Purse +${formatUtopia(EARN.hive)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} raises a hive on a ${kind} tile. It pays 8 grain and 6 gold an hour. Each grove beside the acres yields 10 more grain. A sack smokes the hive.${purse}`);
  return { ok: true, message: `Hive on the ${kind} tile.${purse}` };
}

function doDrift(world, actor) {
  ensurePlots(world);
  if ((actor.plots || []).some((tile) => tile.crew === "drift")) return fail("A drift yard already stands on the shore.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 170) return fail("A drift yard wants 170 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && waterTouch(tile));
  if (!plot) return fail("A drift yard needs a hand or an open lot on the shore.");
  actor.gold -= 170;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "drift";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.drift;
    notePurse(actor, "drift", EARN.drift);
    purse = ` Purse +${formatUtopia(EARN.drift)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} raises a drift yard on a ${kind} tile. It pays 5 gold an hour and strips 16 gold of timber from a wreck within two hexes. A sack scatters the wood.${purse}`);
  return { ok: true, message: `Drift yard on the ${kind} tile.${purse}` };
}

function doVine(world, actor) {
  ensurePlots(world);
  const held = (actor.plots || []).filter((tile) => tile.crew === "vine").length;
  if (held >= 2) return fail("Two vineyards already stand on the hills.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 190) return fail("A vineyard wants 190 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && terrainKind(tile.q, tile.r) === "hill");
  if (!plot) return fail("A vineyard needs a hand or an open lot on a hill.");
  actor.gold -= 190;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "vine";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.vine;
    notePurse(actor, "vine", EARN.vine);
    purse = ` Purse +${formatUtopia(EARN.vine)} $UTOPIA.`;
  }
  log(world, `${actor.name} plants a vineyard on a hill. It pays 6 grain and 14 gold an hour. A hive adds 8 gold to each row. A sail presses 8 grain from each row into 14 gold. A sack treads one vineyard.${purse}`);
  return { ok: true, message: `Vineyard on the hill.${purse}` };
}

function doBell(world, actor) {
  ensurePlots(world);
  if ((actor.plots || []).some((tile) => tile.crew === "bell")) return fail("A bell already hangs over the acres.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 170) return fail("A bell wants 170 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && fieldGround(tile));
  if (!plot) return fail("A bell needs a hand or an open lot on grass or plain.");
  actor.gold -= 170;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "bell";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.bell;
    notePurse(actor, "bell", EARN.bell);
    purse = ` Purse +${formatUtopia(EARN.bell)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} hangs a bell on a ${kind} tile. It pays 5 gold an hour. A wild ride that breaks in takes half. A sack silences it.${purse}`);
  return { ok: true, message: `Bell on the ${kind} tile.${purse}` };
}

function doSail(world, actor) {
  ensurePlots(world);
  if ((actor.plots || []).some((tile) => tile.crew === "sail")) return fail("A sail already turns on the hill.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 220) return fail("A sail wants 220 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && terrainKind(tile.q, tile.r) === "hill");
  if (!plot) return fail("A sail needs a hand or an open lot on a hill.");
  actor.gold -= 220;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "sail";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.sail;
    notePurse(actor, "sail", EARN.sail);
    purse = ` Purse +${formatUtopia(EARN.sail)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a sail on a hill. While the stores hold 36 grain it mills 16 into 28 gold. A thin store pays 4 gold. A sack topples it.${purse}`);
  return { ok: true, message: `Sail on the hill.${purse}` };
}

function wellGround(tile) {
  if (!tile) return false;
  const kind = terrainKind(tile.q, tile.r);
  return kind === "grass" || kind === "plain" || kind === "marsh";
}

function doCistern(world, actor) {
  ensurePlots(world);
  if ((actor.plots || []).some((tile) => tile.crew === "cistern")) return fail("A cistern already holds under the acres.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 180) return fail("A cistern wants 180 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && wellGround(tile));
  if (!plot) return fail("A cistern needs a hand or an open lot on grass, plain, or marsh.");
  actor.gold -= 180;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "cistern";
  plot.store = 0;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.cistern;
    notePurse(actor, "cistern", EARN.cistern);
    purse = ` Purse +${formatUtopia(EARN.cistern)} $UTOPIA.`;
  }
  const kind = terrainKind(plot.q, plot.r);
  log(world, `${actor.name} digs a cistern on a ${kind} tile. Spare grain above 48 fills it, ten a hour, up to 80. Below 24 grain it gives back up to 20. A full cistern seeps 4 grain. A sack cracks it.${purse}`);
  return { ok: true, message: `Cistern on the ${kind} tile.${purse}` };
}

function doChar(world, actor) {
  ensurePlots(world);
  if ((actor.plots || []).some((tile) => tile.crew === "char")) return fail("A charcoal hearth already smokes in the woods.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 200) return fail("A charcoal hearth wants 200 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && terrainKind(tile.q, tile.r) === "wood");
  if (!plot) return fail("A charcoal hearth needs a hand or an open lot in the woods.");
  actor.gold -= 200;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "char";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.char;
    notePurse(actor, "char", EARN.char);
    purse = ` Purse +${formatUtopia(EARN.char)} $UTOPIA.`;
  }
  log(world, `${actor.name} banks a charcoal hearth in the woods. While stores hold 40 grain it burns 12 into 30 gold. A timber yard feeds the fire and pays 22 gold with no grain spent. A drift yard adds 8 gold. A thin store pays 6 gold. Smoke takes 12 gold and 2 riders from a wild ride. A sack quenches it.${purse}`);
  return { ok: true, message: `Charcoal hearth in the woods.${purse}` };
}

function doReed(world, actor) {
  ensurePlots(world);
  const held = (actor.plots || []).filter((tile) => tile.crew === "reed").length;
  if (held >= 2) return fail("Two reed beds already stand in the marsh.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 160) return fail("A reed bed wants 160 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && terrainKind(tile.q, tile.r) === "marsh");
  if (!plot) return fail("A reed bed needs a hand or an open lot in the marsh.");
  actor.gold -= 160;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "reed";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.reed;
    notePurse(actor, "reed", EARN.reed);
    purse = ` Purse +${formatUtopia(EARN.reed)} $UTOPIA.`;
  }
  log(world, `${actor.name} cuts a reed bed in the marsh. It pays 20 grain and 6 gold an hour. A tide wheel adds 8 grain to each bed. One bed feeds a charcoal hearth for 14 gold, and two beds feed it for 22, with no grain spent. A sack drowns one bed.${purse}`);
  return { ok: true, message: `Reed bed in the marsh.${purse}` };
}

function doMalt(world, actor) {
  ensurePlots(world);
  if ((actor.plots || []).some((tile) => tile.crew === "malt")) return fail("A malt house already stands on the acres.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 180) return fail("A malt house wants 180 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && (terrainKind(tile.q, tile.r) === "grass" || terrainKind(tile.q, tile.r) === "plain"));
  if (!plot) return fail("A malt house needs a hand or an open lot on grass or plain.");
  actor.gold -= 180;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "malt";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.malt;
    notePurse(actor, "malt", EARN.malt);
    purse = ` Purse +${formatUtopia(EARN.malt)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a malt house. While stores hold 30 grain it malts 10 into 18 gold. A reed bed adds 6 gold and a vineyard adds 8. A thin store pays 4 gold. The charcoal hearth drinks first. A sack spoils the floor.${purse}`);
  return { ok: true, message: `Malt house on the open ground.${purse}` };
}

function doDove(world, actor) {
  ensurePlots(world);
  if ((actor.plots || []).some((tile) => tile.crew === "dove")) return fail("A dovecote already stands on the acres.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 170) return fail("A dovecote wants 170 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && (terrainKind(tile.q, tile.r) === "grass" || terrainKind(tile.q, tile.r) === "plain"));
  if (!plot) return fail("A dovecote needs a hand or an open lot on grass or plain.");
  actor.gold -= 170;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "dove";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.dove;
    notePurse(actor, "dove", EARN.dove);
    purse = ` Purse +${formatUtopia(EARN.dove)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a dovecote. It pays 14 grain and 5 gold an hour. A bell brings the birds home for 8 more grain. A wild ride loses 2 people to the doves. A sack topples the cote.${purse}`);
  return { ok: true, message: `Dovecote on the open ground.${purse}` };
}

function doOven(world, actor) {
  ensurePlots(world);
  if ((actor.plots || []).some((tile) => tile.crew === "oven")) return fail("A bakehouse already stands on the acres.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 190) return fail("A bakehouse wants 190 gold.");
  const plot = (actor.plots || []).find((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && (terrainKind(tile.q, tile.r) === "grass" || terrainKind(tile.q, tile.r) === "plain"));
  if (!plot) return fail("A bakehouse needs a hand or an open lot on grass or plain.");
  actor.gold -= 190;
  actor.orders -= 1;
  actor.acted = true;
  plot.crew = "oven";
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.oven;
    notePurse(actor, "oven", EARN.oven);
    purse = ` Purse +${formatUtopia(EARN.oven)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a bakehouse. It bakes only after a malt house has stood. While 24 grain remains it spends 8 for 20 gold, and each grove adds 6. A cold oven pays 6 gold. A sack breaks the floor.${purse}`);
  return { ok: true, message: `Bakehouse on the open ground.${purse}` };
}

function bakeHouse(world, p) {
  const oven = (p.plots || []).find((tile) => tile.crew === "oven");
  if (!oven) return;
  const malted = (p.plots || []).some((tile) => tile.crew === "malt");
  const groves = (p.plots || []).filter((tile) => tile.crew === "grove").length;
  if (malted && (p.grain || 0) >= 24) {
    const pay = 20 + groves * 6;
    p.grain -= 8;
    p.gold += pay;
    log(world, `${p.name}'s bakehouse bakes 8 grain into ${pay} gold.`);
    return;
  }
  p.gold += 6;
}

function maltHouse(world, p) {
  const house = (p.plots || []).find((tile) => tile.crew === "malt");
  if (!house) return;
  const reed = (p.plots || []).some((tile) => tile.crew === "reed");
  const vine = (p.plots || []).some((tile) => tile.crew === "vine");
  const bonus = (reed ? 6 : 0) + (vine ? 8 : 0);
  if ((p.grain || 0) >= 30) {
    p.grain -= 10;
    p.gold += 18 + bonus;
    log(world, `${p.name}'s malt house malts 10 grain into ${18 + bonus} gold.`);
    return;
  }
  p.gold += 4 + bonus;
}

function burnChar(world, p) {
  const hearth = (p.plots || []).find((tile) => tile.crew === "char");
  if (!hearth) return;
  const fed = timberYards(p) > 0;
  const drift = (p.plots || []).some((tile) => tile.crew === "drift");
  const extra = drift ? 8 : 0;
  const reeds = (p.plots || []).filter((tile) => tile.crew === "reed").length;
  if (fed) {
    p.gold += 22 + extra;
    log(world, `${p.name}'s timber yard feeds the charcoal hearth for ${22 + extra} gold.`);
    return;
  }
  if (reeds > 0) {
    const pay = (reeds >= 2 ? 22 : 14) + extra;
    p.gold += pay;
    log(world, `${p.name}'s reed beds feed the charcoal hearth for ${pay} gold.`);
    return;
  }
  if ((p.grain || 0) >= 40) {
    p.grain -= 12;
    p.gold += 30 + extra;
    log(world, `${p.name}'s charcoal hearth burns 12 grain into ${30 + extra} gold.`);
    return;
  }
  p.gold += 6 + extra;
}

function tendCistern(p) {
  const well = (p.plots || []).find((tile) => tile.crew === "cistern");
  if (!well) return;
  well.store = well.store || 0;
  if ((p.grain || 0) >= 48 && well.store < 80) {
    const take = Math.min(10, 80 - well.store, p.grain);
    p.grain -= take;
    well.store += take;
  } else if ((p.grain || 0) < 24 && well.store > 0) {
    const give = Math.min(20, well.store, 24 - p.grain);
    well.store -= give;
    p.grain += give;
  }
  if (well.store >= 80) p.grain += 4;
}

function grindSail(p) {
  const mill = (p.plots || []).find((tile) => tile.crew === "sail");
  if (!mill) return;
  if ((p.grain || 0) >= 36) {
    p.grain -= 16;
    p.gold += 28;
    return;
  }
  p.gold += 4;
}

function pressVines(world, p) {
  const vines = (p.plots || []).filter((tile) => tile.crew === "vine").length;
  if (!vines) return;
  if (!(p.plots || []).some((tile) => tile.crew === "sail")) return;
  let rows = 0;
  while (rows < vines && (p.grain || 0) >= 8) {
    p.grain -= 8;
    p.gold += 14;
    rows += 1;
  }
  if (rows > 0) log(world, `${p.name}'s sail presses ${rows} vineyard ${rows === 1 ? "row" : "rows"} and mills ${rows * 8} grain into ${rows * 14} gold.`);
}

export function stonePrice(actor, key) {
  const spec = BUILDINGS[key];
  if (!spec || !actor) return 0;
  let cost = spec.cost(actor.buildings[key] || 0);
  if ((key === "keep" || key === "barracks") && quarryPits(actor) > 0) {
    cost = Math.max(40, cost - 40 * quarryPits(actor));
  }
  return cost;
}

export function waterTouch(tile) {
  if (!tile) return false;
  const kind = terrainKind(tile.q, tile.r);
  if (kind === "coast" || kind === "river") return true;
  for (const [dq, dr] of HEX_DIRS) {
    const near = terrainKind(tile.q + dq, tile.r + dr);
    if (near === "river" || near === "sea" || near === "coast") return true;
  }
  return false;
}

export function weirLive(p, hour) {
  return Boolean(p && (p.weirUntil || 0) > (hour || 0) && (p.weir || 0) > 0);
}

export function weirYield(p, hour) {
  if (!weirLive(p, hour)) return { gold: 0, grain: 0 };
  const posts = Math.max(1, Math.min(3, p.weir || 1));
  let grain = 22 * posts;
  let gold = 8 * posts;
  const name = seasonName(hour || 0);
  if (name === "Frost") {
    grain = Math.floor(grain * 0.5);
    gold = Math.floor(gold * 0.5);
  } else if (name === "High Sun") {
    grain = Math.floor(grain * 1.2);
    gold = Math.floor(gold * 1.15);
  } else if (name === "Harvest") {
    grain = Math.floor(grain * 1.1);
  }
  return { gold, grain };
}

function clearNets(p) {
  if (!p) return;
  p.weir = 0;
  p.weirUntil = 0;
  for (const tile of p.plots || []) tile.net = false;
}

function settleWeir(p, hour) {
  if (!p || !(p.weirUntil > 0)) return;
  if (p.weirUntil > (hour || 0)) return;
  clearNets(p);
}

function doWeir(world, actor) {
  ensurePlots(world);
  if (weirLive(actor, world.hour)) return fail(`The nets already hold through hour ${actor.weirUntil - 1}.`);
  settleWeir(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 160) return fail("Nets want 160 gold.");
  if ((actor.peasants || 0) < 24) return fail("Need 24 peasants to crew the nets.");
  const sites = (actor.plots || []).filter((tile) => tile.crew !== "lot" && waterTouch(tile));
  if (!sites.length) return fail("The nets need a bought tile on the coast or beside the river.");
  const posts = sites.slice(0, 3);
  actor.gold -= 160;
  actor.orders -= 1;
  actor.acted = true;
  for (const tile of actor.plots || []) tile.net = false;
  for (const tile of posts) tile.net = true;
  actor.weir = posts.length;
  actor.weirUntil = (world.hour || 0) + 7;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.weir;
    notePurse(actor, "weir", EARN.weir);
    purse = ` Purse +${formatUtopia(EARN.weir)} $UTOPIA.`;
  }
  log(world, `${actor.name} stakes ${actor.weir} nets through hour ${actor.weirUntil - 1}. The weir yields fish, and a sack tears it up.${purse}`);
  return { ok: true, message: `${actor.weir} nets through hour ${actor.weirUntil - 1}.${purse}` };
}

function soakedHits(target, hour, hits) {
  if (!leveeUp(target, hour) || hits < 1) return hits;
  return Math.max(0, hits - 1);
}

function doSeal(world, actor) {
  if ((actor.sealUntil || 0) > (world.hour || 0)) return fail(`The bins are already sealed through hour ${actor.sealUntil - 1}.`);
  settleSeal(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 90) return fail("A grain seal wants 90 gold.");
  actor.gold -= 90;
  actor.orders -= 1;
  actor.acted = true;
  actor.sealUntil = (world.hour || 0) + 5;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.seal;
    notePurse(actor, "seal", EARN.seal);
    purse = ` Purse +${formatUtopia(EARN.seal)} $UTOPIA.`;
  }
  log(world, `${actor.name} seals the grain bins through hour ${actor.sealUntil - 1}. A sack takes half the grain.${purse}`);
  return { ok: true, message: `Bins sealed through hour ${actor.sealUntil - 1}.${purse}` };
}

function settleSmith(p, hour) {
  if (!p || !(p.smithUntil > 0)) return;
  if (p.smithUntil > (hour || 0)) return;
  p.smithUntil = 0;
}

function doSmith(world, actor) {
  if ((actor.smithUntil || 0) > (world.hour || 0)) return fail(`The forge is already banked through hour ${actor.smithUntil - 1}.`);
  settleSmith(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 200) return fail("The smith wants 200 gold.");
  actor.gold -= 200;
  actor.orders -= 1;
  actor.acted = true;
  actor.smithUntil = (world.hour || 0) + 6;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.smith;
    notePurse(actor, "smith", EARN.smith);
    purse = ` Purse +${formatUtopia(EARN.smith)} $UTOPIA.`;
  }
  log(world, `${actor.name} banks the forge through hour ${actor.smithUntil - 1}. Each soldier hits harder.${purse}`);
  return { ok: true, message: `Forge banked through hour ${actor.smithUntil - 1}.${purse}` };
}

function doRelief(world, actor, targetId) {
  const target = byId(world, targetId);
  if (!target || target.id === actor.id) return fail("Pick another holding.");
  if (actor.kind !== "agent" && !intelFresh(actor, target.id, world.hour)) return fail("Scout them before the cart rolls.");
  if (actor.reliefs && actor.reliefs[target.id] > (world.hour || 0)) return fail(`That cart already ran. The road opens again at hour ${actor.reliefs[target.id]}.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if ((actor.grain || 0) < 560) return fail("Relief keeps 200 grain back and sends 360.");
  const hungry = (target.grain || 0) < foodNeed(target);
  actor.grain -= 360;
  target.grain += 360;
  actor.orders -= 1;
  actor.acted = true;
  actor.reliefs = actor.reliefs || {};
  actor.reliefs[target.id] = (world.hour || 0) + 4;
  let cleared = "";
  if (target.grudge === actor.id) {
    target.grudge = null;
    cleared = " The grudge is set down.";
  }
  let purse = "";
  if (hungry && actor.kind === "human") {
    actor.utopia += EARN.relief;
    notePurse(actor, "relief", EARN.relief);
    purse = ` Purse +${formatUtopia(EARN.relief)} $UTOPIA.`;
  } else if (!hungry) {
    purse = " Their stores were already full, so the purse stays shut.";
  }
  log(world, `${actor.name} sends 360 grain to ${target.name}.${cleared}${purse}`);
  return { ok: true, message: `Sent 360 grain.${cleared}${purse}` };
}

function doProspect(world, actor) {
  if (actor.vein && actor.veinUntil > (world.hour || 0)) return fail(`The ${VEINS[actor.vein].name} already holds through hour ${actor.veinUntil - 1}.`);
  settleVein(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 180) return fail("Prospecting wants 180 gold.");
  const kinds = Object.keys(VEINS);
  const kind = kinds[Math.floor(world.rng.next() * kinds.length)];
  actor.gold -= 180;
  actor.orders -= 1;
  actor.acted = true;
  actor.vein = kind;
  actor.veinUntil = (world.hour || 0) + 8;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.vein;
    notePurse(actor, "vein", EARN.vein);
    purse = ` Purse +${formatUtopia(EARN.vein)} $UTOPIA.`;
  }
  log(world, `${actor.name} strikes a ${VEINS[kind].name} through hour ${actor.veinUntil - 1}. ${VEINS[kind].line}${purse}`);
  return { ok: true, message: `${VEINS[kind].name}. ${VEINS[kind].line}${purse}` };
}

function doFeast(world, actor) {
  if (feastLive(actor, world.hour)) return fail(`The tables are already set through hour ${actor.feastUntil - 1}.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 160) return fail("A feast wants 160 gold.");
  if ((actor.grain || 0) < 450) return fail("A feast wants 450 grain.");
  actor.gold -= 160;
  actor.grain -= 450;
  actor.orders -= 1;
  actor.acted = true;
  actor.feastUntil = (world.hour || 0) + 5;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.feast;
    notePurse(actor, "feast", EARN.feast);
    purse = ` Purse +${formatUtopia(EARN.feast)} $UTOPIA.`;
  }
  log(world, `${actor.name} sets a long table through hour ${actor.feastUntil - 1}. The hearth grows faster.${purse}`);
  return { ok: true, message: `Feast set through hour ${actor.feastUntil - 1}.${purse}` };
}

function doStall(world, actor, mode) {
  const quote = stallQuote(world.hour);
  if (mode !== "sell" && mode !== "buy") return fail("The stall buys or sells grain.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (mode === "sell") {
    if ((actor.grain || 0) < quote.grain + quote.keep) return fail(`Selling keeps ${quote.keep} grain back and needs ${quote.grain} more.`);
    actor.grain -= quote.grain;
    actor.gold += quote.sell;
  } else {
    if ((actor.gold || 0) < quote.buy) return fail(`Buying ${quote.grain} grain costs ${quote.buy} gold in ${quote.name}.`);
    actor.gold -= quote.buy;
    actor.grain += quote.grain;
  }
  actor.orders -= 1;
  actor.acted = true;
  let purse = "";
  if (actor.kind === "human" && mode === "sell" && actor.stallHour !== world.hour) {
    actor.utopia += EARN.stall;
    notePurse(actor, "stall", EARN.stall);
    purse = ` Purse +${formatUtopia(EARN.stall)} $UTOPIA.`;
  }
  actor.stallHour = world.hour || 0;
  const line = mode === "sell"
    ? `${actor.name} sells ${quote.grain} grain for ${quote.sell} gold in ${quote.name}.${purse}`
    : `${actor.name} buys ${quote.grain} grain for ${quote.buy} gold in ${quote.name}.`;
  log(world, line);
  return { ok: true, message: line };
}

function settleMuster(p, hour) {
  if (!p || !(p.muster > 0)) return;
  if (typeof p.musterUntil === "number" && p.musterUntil > (hour || 0)) return;
  p.peasants += p.muster;
  p.muster = 0;
  p.musterUntil = 0;
}

function doMuster(world, actor) {
  if ((actor.muster || 0) > 0 && actor.musterUntil > (world.hour || 0)) {
    return fail(`The field host already stands through hour ${actor.musterUntil - 1}.`);
  }
  settleMuster(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 120) return fail("The muster bell wants 120 gold.");
  const n = Math.min(36, actor.peasants - 24);
  if (n < 12) return fail("Need at least 36 peasants to call a field host.");
  actor.gold -= 120;
  actor.orders -= 1;
  actor.acted = true;
  actor.peasants -= n;
  actor.muster = n;
  actor.musterUntil = (world.hour || 0) + 4;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.muster;
    notePurse(actor, "muster", EARN.muster);
    purse = ` Purse +${formatUtopia(EARN.muster)} $UTOPIA.`;
  }
  log(world, `${actor.name} rings the bell and calls ${n} into the field host through hour ${actor.musterUntil - 1}.${purse}`);
  return { ok: true, message: `Field host of ${n} stands through hour ${actor.musterUntil - 1}.${purse}` };
}

function onCooldown(actor, target, hour) {
  const last = actor.cooldown[target.id];
  return last != null && hour - last < COOLDOWN;
}

export function siegeLive(p, hour) {
  return Boolean(p && p.siege && p.siege.target && (p.siege.until || 0) > (hour || 0) && (p.siege.men || 0) > 0);
}

function settleSiege(p, hour) {
  if (!p || !p.siege) return;
  if ((p.siege.until || 0) > (hour || 0)) return;
  p.soldiers += p.siege.men || 0;
  p.siege = null;
}

function pressSieges(world) {
  const hour = world.hour || 0;
  for (const actor of world.provinces) {
    if (!siegeLive(actor, hour)) continue;
    const target = byId(world, actor.siege.target);
    if (!target) {
      actor.soldiers += actor.siege.men || 0;
      actor.siege = null;
      continue;
    }
    const bite = Math.min(target.grain, 36);
    target.grain -= bite;
    const push = actor.siege.men * 8 + 24;
    if (push > defense(target) * 0.35) {
      const hits = soakedHits(target, hour, 1);
      if (hits > 0) {
        const keys = Object.keys(target.buildings).filter((k) => target.buildings[k] > 0);
        if (keys.length) {
          const k = keys[Math.floor(world.rng.next() * keys.length)];
          target.buildings[k] -= 1;
          log(world, `${actor.name}'s siege works eat ${bite} grain at ${target.name}. A ${k} falls.`);
        } else {
          log(world, `${actor.name}'s siege works eat ${bite} grain at ${target.name}.`);
        }
      } else {
        log(world, `${actor.name}'s siege works eat ${bite} grain at ${target.name}. The levee holds the sap.`);
      }
    } else {
      actor.siege.men -= 1;
      if (actor.siege.men < 4) {
        const left = actor.siege.men;
        actor.soldiers += left;
        actor.siege = null;
        log(world, `${actor.name}'s siege works eat ${bite} grain, then the wall throws them back. ${left} soldiers limp home.`);
      } else {
        log(world, `${actor.name}'s siege works eat ${bite} grain at ${target.name}. The wall drops one sapper.`);
      }
    }
  }
}

function doSiege(world, actor, targetId) {
  const target = byId(world, targetId);
  if (!target || target.id === actor.id) return fail("Pick another province.");
  if (siegeLive(actor, world.hour)) {
    const camp = byId(world, actor.siege.target);
    return fail(`Siege works already sit outside ${camp ? camp.name : "a camp"} through hour ${actor.siege.until - 1}.`);
  }
  settleSiege(actor, world.hour || 0);
  if (actor.kind === "human" && !intelFresh(actor, target.id, world.hour)) return fail("Scout the camp before the works can sit.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 260) return fail("Siege works want 260 gold.");
  if (actor.soldiers < 18) return fail("Need 18 soldiers. Eight man the works and ten stay home.");
  if (onCooldown(actor, target, world.hour)) return fail("That province is still under the two-hour truce of your last march.");
  if (nwFactor(actor, target) <= 0) return fail("Networth sits outside the fair band. No siege.");
  if (pactLive(actor, target.id, world.hour)) {
    delete actor.pacts[target.id];
    if (target.pacts) delete target.pacts[actor.id];
    log(world, `${actor.name} breaks the pact with ${target.name}.`);
  }
  actor.gold -= 260;
  actor.soldiers -= 8;
  actor.orders -= 1;
  actor.acted = true;
  actor.siege = { target: target.id, until: (world.hour || 0) + 4, men: 8 };
  target.grudge = actor.id;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.siege;
    notePurse(actor, "siege", EARN.siege);
    purse = ` Purse +${formatUtopia(EARN.siege)} $UTOPIA.`;
  }
  log(world, `${actor.name} pitches siege works outside ${target.name} through hour ${actor.siege.until - 1}. Eight soldiers sap the wall. A march spends the works and hits harder. A winning blow against ${actor.name} breaks the camp.${purse}`);
  return { ok: true, message: `Siege works through hour ${actor.siege.until - 1}.${purse}` };
}

function doSally(world, actor, besiegerId) {
  const foe = byId(world, besiegerId);
  if (!foe || foe.id === actor.id) return fail("Pick the camp that is sieging you.");
  if (!siegeLive(foe, world.hour) || foe.siege.target !== actor.id) return fail("Those works are not outside your wall.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.soldiers < 8) return fail("Need 8 soldiers to sally.");
  actor.orders -= 1;
  actor.acted = true;
  const wall = defense(actor);
  const camp = foe.siege.men * 14 + 30;
  if (wall >= camp) {
    const loot = Math.min(foe.gold, 80);
    foe.gold -= loot;
    actor.gold += loot;
    foe.siege = null;
    actor.standards = (actor.standards || 0) + 1;
    actor.grudge = foe.id;
    let purse = "";
    if (actor.kind === "human") {
      actor.utopia += EARN.sally;
      notePurse(actor, "sally", EARN.sally);
      purse = ` Purse +${formatUtopia(EARN.sally)} $UTOPIA.`;
    }
    log(world, `${actor.name} sallies and breaks ${foe.name}'s siege works, taking ${loot} gold and a banner.${purse}`);
    return { ok: true, win: true, message: `The works break. ${loot} gold and a banner.${purse}` };
  }
  const lost = Math.min(actor.soldiers, 6);
  actor.soldiers -= lost;
  foe.siege.men = Math.max(0, foe.siege.men - 2);
  if (foe.siege.men < 4) {
    foe.soldiers += foe.siege.men;
    foe.siege = null;
    log(world, `${actor.name} sallies and loses ${lost} soldiers. ${foe.name}'s works collapse.`);
    return { ok: true, win: false, message: `The sally fails. ${lost} soldiers fall, and the works collapse.` };
  }
  log(world, `${actor.name} sallies and loses ${lost} soldiers. ${foe.name}'s works still stand.`);
  return { ok: true, win: false, message: `The sally fails. ${lost} soldiers fall. The works still stand.` };
}

export const BANDS = [
  { id: "drifters", name: "Ash Drifters", x: 1280, y: -360, men: 28, hoard: 180 },
  { id: "yoke", name: "Broken Yoke", x: -520, y: 980, men: 22, hoard: 140 },
  { id: "herd", name: "Night Herd", x: -980, y: -1100, men: 26, hoard: 160 },
];

export function freshBands() {
  return BANDS.map((band) => ({ ...band, raid: null, truce: {}, downUntil: 0 }));
}

export function bandUp(band, hour) {
  return Boolean(band && (band.men || 0) >= 8 && (band.downUntil || 0) <= (hour || 0));
}

function quietBand(world, band, hour, text) {
  band.men = 0;
  band.downUntil = (hour || 0) + 6;
  band.raid = null;
  if (text) log(world, text);
}

function bandTarget(world, band) {
  const hour = world.hour || 0;
  const rows = [];
  for (const province of world.provinces || []) {
    const truce = band.truce && band.truce[province.id];
    if (typeof truce === "number" && truce > hour) continue;
    const [x, y] = seatPoint(province);
    const dist = Math.hypot(x - band.x, y - band.y);
    if (dist <= 1700) rows.push({ province, dist });
  }
  if (!rows.length) return null;
  rows.sort((a, b) => a.dist - b.dist);
  const human = rows.find((row) => row.province.kind === "human");
  return (human || rows[0]).province;
}

export function patrolUp(p, hour) {
  return Boolean(p && (p.patrolUntil || 0) > (hour || 0) && (p.patrol || 0) >= 4);
}

function settlePatrol(p, hour) {
  if (!p || !(p.patrolUntil > 0)) return;
  if (p.patrolUntil > (hour || 0)) return;
  const home = p.patrol || 0;
  p.patrol = 0;
  p.patrolUntil = 0;
  if (home > 0) p.soldiers += home;
}

function doPatrol(world, actor) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (patrolUp(actor, world.hour)) return fail(`Outriders already screen the acres through hour ${actor.patrolUntil - 1}.`);
  settlePatrol(actor, world.hour || 0);
  if ((actor.soldiers || 0) < 8) return fail("Need 8 soldiers to post outriders.");
  if (actor.gold < 150) return fail("Outriders want 150 gold.");
  actor.gold -= 150;
  actor.soldiers -= 8;
  actor.patrol = 8;
  actor.patrolUntil = (world.hour || 0) + 5;
  actor.orders -= 1;
  actor.acted = true;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.patrol;
    notePurse(actor, "patrol", EARN.patrol);
    purse = ` Purse +${formatUtopia(EARN.patrol)} $UTOPIA.`;
  }
  log(world, `${actor.name} posts 8 outriders through hour ${actor.patrolUntil - 1}. A wild ride that cannot break the screen turns aside.${purse}`);
  return { ok: true, message: `Outriders screen the acres through hour ${actor.patrolUntil - 1}.${purse}` };
}

export const NAVY = {
  skiff: { name: "Skiff", gold: 140, speed: 3, fish: 4, haul: 0, teeth: 1 },
  fisher: { name: "Fisher", gold: 220, speed: 2, fish: 12, haul: 0, teeth: 2 },
  cog: { name: "Cog", gold: 320, speed: 2, fish: 0, haul: 8, teeth: 3 },
  galley: { name: "Galley", gold: 440, speed: 3, fish: 0, haul: 4, teeth: 6 },
  dromon: { name: "Dromon", gold: 580, speed: 2, fish: 6, haul: 6, teeth: 8 },
  hulk: { name: "Hulk", gold: 680, speed: 1, fish: 8, haul: 12, teeth: 5 },
};

const WAR_TEETH = 5;

const COLONY_NAMES = ["Salt Step", "Reed Haven", "Grey Landing", "Low Quay", "Millwater", "Ash Dock", "Far Acre", "Pale Reach"];

function hexDist(aq, ar, bq, br) {
  return (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
}

function sailKind(kind) {
  return kind === "sea" || kind === "coast" || kind === "river";
}

function stepToward(q, r, destQ, destR, allow) {
  if (q === destQ && r === destR) return { q, r };
  let best = { q, r };
  let bestD = hexDist(q, r, destQ, destR);
  for (const [dq, dr] of HEX_DIRS) {
    const nq = q + dq;
    const nr = r + dr;
    if (!allow(nq, nr)) continue;
    const dist = hexDist(nq, nr, destQ, destR);
    if (dist < bestD) {
      bestD = dist;
      best = { q: nq, r: nr };
    }
  }
  return best;
}

function portSite(q, r) {
  const kind = terrainKind(q, r);
  if (kind === "coast" || kind === "river") return true;
  for (const [dq, dr] of HEX_DIRS) {
    const near = terrainKind(q + dq, r + dr);
    if (near === "sea" || near === "coast") return true;
  }
  return false;
}

function cityBlocks(world, q, r) {
  for (const realm of world.provinces || []) {
    const [x, y] = seatPoint(realm);
    const seat = worldToAxial(x, y);
    if (hexDist(q, r, seat.q, seat.r) < 6) return true;
    for (const colony of realm.colonies || []) {
      if (hexDist(q, r, colony.q, colony.r) < 5) return true;
    }
  }
  return false;
}

function waterBeside(q, r) {
  for (const [dq, dr] of HEX_DIRS) {
    const nq = q + dq;
    const nr = r + dr;
    if (sailKind(terrainKind(nq, nr))) return { q: nq, r: nr };
  }
  if (sailKind(terrainKind(q, r))) return { q, r };
  return null;
}

function doFounder(world, actor) {
  ensurePlots(world);
  const field = (actor.founders || []).filter((row) => !row.spent);
  if (field.length >= 2) return fail("Two founders are already in the field.");
  if ((actor.colonies || []).length >= 4) return fail("Four colonies already answer this holding.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.gold < 260) return fail("A founder wants 260 gold.");
  if ((actor.peasants || 0) < 8) return fail("A founder needs 8 peasants.");
  const plot = (actor.plots || []).find((tile) => tile.crew === "hand" && terrainKind(tile.q, tile.r) !== "sea");
  if (!plot) return fail("A founder needs a hand tile that is not open sea.");
  actor.gold -= 260;
  actor.peasants -= 8;
  actor.orders -= 1;
  actor.acted = true;
  actor.founders = actor.founders || [];
  const founder = {
    id: `f${world.hour || 0}-${actor.founders.length}`,
    q: plot.q,
    r: plot.r,
    destQ: null,
    destR: null,
  };
  actor.founders.push(founder);
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.founder;
    notePurse(actor, "founder", EARN.founder);
    purse = ` Purse +${formatUtopia(EARN.founder)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a founder on a worked tile. Direct them to open grass, wheat, or coast. A coast or a river bank becomes a port.${purse}`);
  return { ok: true, message: `Founder ${founder.id} is in the field. Click the map to direct them.${purse}` };
}

function plantColony(world, actor, founder) {
  const kind = terrainKind(founder.q, founder.r);
  if (kind !== "grass" && kind !== "plain" && kind !== "coast") {
    founder.destQ = null;
    founder.destR = null;
    log(world, `${actor.name}'s founder waits. That tile will not hold a city.`);
    return false;
  }
  if (cityBlocks(world, founder.q, founder.r) || takenPlots(world).has(plotKey(founder.q, founder.r))) {
    founder.destQ = null;
    founder.destR = null;
    log(world, `${actor.name}'s founder waits. Another city or a worked tile is too close.`);
    return false;
  }
  if ((actor.colonies || []).length >= 4) {
    founder.destQ = null;
    founder.destR = null;
    return false;
  }
  const port = portSite(founder.q, founder.r);
  const name = COLONY_NAMES[(actor.colonies || []).length % COLONY_NAMES.length];
  const spot = axialToWorld(founder.q, founder.r);
  actor.colonies = actor.colonies || [];
  actor.colonies.push({
    id: `c${world.hour || 0}-${actor.colonies.length}`,
    name,
    q: founder.q,
    r: founder.r,
    x: spot.x,
    y: spot.y,
    port,
    land: 24,
  });
  actor.plots = actor.plots || [];
  actor.plots.push({ q: founder.q, r: founder.r, crew: "hand" });
  actor.land += 12;
  actor.peasants += 8;
  founder.spent = true;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.colony;
    notePurse(actor, "colony", EARN.colony);
    purse = ` Purse +${formatUtopia(EARN.colony)} $UTOPIA.`;
  }
  const quay = port ? " The quay fishes 12 grain an hour and can lay a hull." : "";
  log(world, `${actor.name} founds ${name}.${quay}${purse}`);
  return true;
}

function doDirect(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const q = action.q | 0;
  const r = action.r | 0;
  const kind = terrainKind(q, r);
  if (action.unit === "founder") {
    const founder = (actor.founders || []).find((row) => row.id === action.id && !row.spent);
    if (!founder) return fail("That founder is not in the field.");
    if (kind === "sea") return fail("A founder will not step onto open sea.");
    founder.destQ = q;
    founder.destR = r;
  } else if (action.unit === "ship") {
    const ship = (actor.ships || []).find((row) => row.id === action.id);
    if (!ship) return fail("That hull is not yours.");
    if (!sailKind(kind)) return fail("A hull only takes sea, coast, or river.");
    ship.prey = null;
    ship.block = null;
    ship.salvage = null;
    ship.escort = null;
    ship.tow = null;
    ship.cargo = null;
    ship.cut = null;
    ship.raid = null;
    ship.destQ = q;
    ship.destR = r;
  } else {
    return fail("Direct a founder or a hull.");
  }
  actor.orders -= 1;
  actor.acted = true;
  log(world, `${actor.name} directs a ${action.unit} toward ${q},${r}.`);
  return { ok: true, message: `Course set for ${q},${r}.` };
}

function hullAsk(port, spec) {
  if (port && port.cooper) return Math.max(80, spec.gold - 40);
  return spec.gold;
}

function launchPort(actor) {
  const ports = (actor.colonies || []).filter((row) => row.port);
  return ports.find((row) => row.cooper) || ports[0] || null;
}

function doHull(world, actor, hull) {
  const spec = NAVY[hull];
  if (!spec) return fail("Name a hull. A port can lay a skiff, fisher, cog, galley, dromon, or hulk.");
  const port = launchPort(actor);
  if (!port) return fail("Only a port can lay a hull.");
  if ((actor.ships || []).length >= 6) return fail("Six hulls already ride for this holding.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  const price = hullAsk(port, spec);
  if (actor.gold < price) return fail(`A ${spec.name} wants ${price} gold.`);
  const berth = waterBeside(port.q, port.r);
  if (!berth) return fail("The port has no water to launch into.");
  actor.gold -= price;
  actor.orders -= 1;
  actor.acted = true;
  actor.ships = actor.ships || [];
  const ship = {
    id: `s${world.hour || 0}-${actor.ships.length}-${hull}`,
    kind: hull,
    q: berth.q,
    r: berth.r,
    destQ: null,
    destR: null,
  };
  actor.ships.push(ship);
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.hull;
    notePurse(actor, "hull", EARN.hull);
    purse = ` Purse +${formatUtopia(EARN.hull)} $UTOPIA.`;
  }
  const cut = price < spec.gold ? ` The cooperage cut ${spec.gold - price} gold.` : "";
  log(world, `${actor.name} lays a ${spec.name} at ${port.name}. Direct it across sea, coast, or river. On the water it works the hour.${cut}${purse}`);
  return { ok: true, message: `${spec.name} launched from ${port.name}.${cut}${purse}` };
}

function hullTeeth(kind) {
  const spec = NAVY[kind];
  return spec && spec.teeth ? spec.teeth : 0;
}

function findHull(world, ownerId, shipId) {
  const realm = byId(world, ownerId);
  if (!realm) return null;
  const ship = (realm.ships || []).find((row) => row.id === shipId);
  if (!ship) return null;
  return { realm, ship };
}

function doGrapple(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === action.ship);
  if (!own) return fail("That hull is not yours.");
  if (hullTeeth(own.kind) < WAR_TEETH) return fail("A skiff, fisher, or cog will not close. Lay a galley, dromon, or hulk.");
  const prey = findHull(world, action.owner, action.hull);
  if (!prey || prey.realm.id === actor.id) return fail("Name another ruler's hull.");
  if (!sailKind(terrainKind(prey.ship.q, prey.ship.r))) return fail("That hull is not on the water.");
  own.block = null;
  own.salvage = null;
  own.escort = null;
  own.tow = null;
  own.cargo = null;
  own.cut = null;
  own.raid = null;
  own.prey = { owner: prey.realm.id, id: prey.ship.id };
  own.destQ = prey.ship.q;
  own.destR = prey.ship.r;
  actor.orders -= 1;
  actor.acted = true;
  const spec = NAVY[own.kind];
  const theirs = NAVY[prey.ship.kind];
  log(world, `${actor.name} sends the ${spec.name} to close on ${prey.realm.name}'s ${theirs ? theirs.name : "hull"}.`);
  return { ok: true, message: `${spec.name} is closing on the ${theirs ? theirs.name : "hull"}.` };
}

function colonyOf(world, ownerId, colonyId) {
  const realm = byId(world, ownerId);
  if (!realm) return null;
  const colony = (realm.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return null;
  return { realm, colony };
}

function doBlockade(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === action.ship);
  if (!own) return fail("That hull is not yours.");
  if (hullTeeth(own.kind) < WAR_TEETH) return fail("A skiff, fisher, or cog cannot hold a port. Lay a galley, dromon, or hulk.");
  const mark = colonyOf(world, action.owner, action.colony);
  if (!mark || mark.realm.id === actor.id) return fail("Name another ruler's port.");
  if (!mark.colony.port) return fail("That town has no quay to close.");
  const berth = waterBeside(mark.colony.q, mark.colony.r);
  if (!berth) return fail("That port has no water to close.");
  own.prey = null;
  own.salvage = null;
  own.escort = null;
  own.tow = null;
  own.cargo = null;
  own.cut = null;
  own.raid = null;
  own.block = { owner: mark.realm.id, id: mark.colony.id };
  own.destQ = berth.q;
  own.destR = berth.r;
  actor.orders -= 1;
  actor.acted = true;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.block;
    notePurse(actor, "block", EARN.block);
    purse = ` Purse +${formatUtopia(EARN.block)} $UTOPIA.`;
  }
  const spec = NAVY[own.kind];
  log(world, `${actor.name} sends the ${spec.name} to close ${mark.realm.name}'s ${mark.colony.name}. The quay will not fish while the hull sits.${purse}`);
  return { ok: true, message: `${spec.name} is bound for ${mark.colony.name}.${purse}` };
}

function blockadeAt(world, victim, colony) {
  let found = null;
  for (const realm of world.provinces || []) {
    if (realm.id === victim.id) continue;
    for (const ship of realm.ships || []) {
      if (!ship.block || ship.block.owner !== victim.id || ship.block.id !== colony.id) continue;
      if (hullTeeth(ship.kind) < WAR_TEETH) continue;
      if (hexDist(ship.q, ship.r, colony.q, colony.r) > 2) continue;
      found = { realm, ship };
      break;
    }
    if (found) break;
  }
  return found;
}

function wreckGold(kind) {
  return 40 + hullTeeth(kind) * 12;
}

function liveWreck(world, q, r) {
  const hour = world.hour || 0;
  return (world.wrecks || []).find((row) => row.q === q && row.r === r && (row.until || 0) > hour) || null;
}

function dropWreck(world, ship) {
  world.wrecks = world.wrecks || [];
  world.wrecks.push({
    q: ship.q,
    r: ship.r,
    kind: ship.kind,
    gold: wreckGold(ship.kind),
    until: (world.hour || 0) + 4,
  });
}

function doSalvage(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === action.ship);
  if (!own) return fail("That hull is not yours.");
  const q = action.q | 0;
  const r = action.r | 0;
  const wreck = liveWreck(world, q, r);
  if (!wreck) return fail("No wreck rides there.");
  if (!sailKind(terrainKind(q, r))) return fail("A hull cannot reach that wreck.");
  own.prey = null;
  own.block = null;
  own.escort = null;
  own.tow = null;
  own.cargo = null;
  own.cut = null;
  own.raid = null;
  own.salvage = { q, r };
  own.destQ = q;
  own.destR = r;
  actor.orders -= 1;
  actor.acted = true;
  const spec = NAVY[own.kind];
  const sunk = NAVY[wreck.kind];
  log(world, `${actor.name} sends the ${spec ? spec.name : "hull"} after a wrecked ${sunk ? sunk.name : "hull"}.`);
  return { ok: true, message: `${spec ? spec.name : "Hull"} is bound for the wreck.` };
}

function nearestWharf(realm, q, r) {
  let best = null;
  let bestD = Infinity;
  for (const colony of realm.colonies || []) {
    if (!colony.port || !colony.wharf) continue;
    const dist = hexDist(q, r, colony.q, colony.r);
    if (dist < bestD) {
      bestD = dist;
      best = colony;
    }
  }
  return best;
}

function doTow(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === action.ship);
  if (!own) return fail("That hull is not yours.");
  const q = action.q | 0;
  const r = action.r | 0;
  const wreck = liveWreck(world, q, r);
  if (!wreck) return fail("No wreck rides there.");
  if (!sailKind(terrainKind(q, r))) return fail("A hull cannot reach that wreck.");
  if (!nearestWharf(actor, q, r)) return fail("Raise a wharf before a hull can tow.");
  for (const realm of world.provinces || []) {
    for (const ship of realm.ships || []) {
      if (ship !== own && ship.tow && ship.tow.q === q && ship.tow.r === r) return fail("Another hull already has that wreck in tow.");
    }
  }
  own.prey = null;
  own.block = null;
  own.salvage = null;
  own.escort = null;
  own.cargo = null;
  own.cut = null;
  own.raid = null;
  own.tow = { q, r };
  own.destQ = q;
  own.destR = r;
  actor.orders -= 1;
  actor.acted = true;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.tow;
    notePurse(actor, "tow", EARN.tow);
    purse = ` Purse +${formatUtopia(EARN.tow)} $UTOPIA.`;
  }
  const spec = NAVY[own.kind];
  const sunk = NAVY[wreck.kind];
  log(world, `${actor.name} puts the ${spec ? spec.name : "hull"} on a wrecked ${sunk ? sunk.name : "hull"}. It will drag the wreck toward a wharf.${purse}`);
  return { ok: true, message: `${spec ? spec.name : "Hull"} is towing the wreck.${purse}` };
}

function doConvoy(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === action.ship);
  if (!own) return fail("That hull is not yours.");
  if (hullTeeth(own.kind) < WAR_TEETH) return fail("A skiff, fisher, or cog cannot escort. Lay a galley, dromon, or hulk.");
  const trader = (actor.ships || []).find((row) => row.id === action.hull);
  if (!trader || trader.id === own.id) return fail("Name one of your traders.");
  if (hullTeeth(trader.kind) >= WAR_TEETH) return fail("Escort a skiff, fisher, or cog.");
  own.prey = null;
  own.block = null;
  own.salvage = null;
  own.tow = null;
  own.cargo = null;
  own.cut = null;
  own.raid = null;
  own.escort = trader.id;
  own.destQ = trader.q;
  own.destR = trader.r;
  actor.orders -= 1;
  actor.acted = true;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.convoy;
    notePurse(actor, "convoy", EARN.convoy);
    purse = ` Purse +${formatUtopia(EARN.convoy)} $UTOPIA.`;
  }
  const spec = NAVY[own.kind];
  const trade = NAVY[trader.kind];
  log(world, `${actor.name} puts the ${spec.name} on the ${trade ? trade.name : "trader"}. While it stays within two hexes the haul is heavier and the trader has three more teeth.${purse}`);
  return { ok: true, message: `${spec.name} is escorting the ${trade ? trade.name : "trader"}.${purse}` };
}

function coverTeeth(realm, prey) {
  let extra = 0;
  for (const ship of realm.ships || []) {
    if (!prey || ship.id === prey.id || ship.escort !== prey.id) continue;
    if (hullTeeth(ship.kind) < WAR_TEETH) continue;
    if (hexDist(ship.q, ship.r, prey.q, prey.r) > 2) continue;
    extra += 3;
  }
  return extra;
}

function convoyNear(realm, ship) {
  if (!ship || hullTeeth(ship.kind) >= WAR_TEETH) return false;
  return (realm.ships || []).some((other) => other.escort === ship.id && hullTeeth(other.kind) >= WAR_TEETH && hexDist(other.q, other.r, ship.q, ship.r) <= 2);
}

function doWharf(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A wharf needs a port.");
  if (colony.wharf) return fail(`${colony.name} already has a wharf.`);
  if (actor.gold < 220) return fail("A wharf wants 220 gold.");
  actor.gold -= 220;
  actor.orders -= 1;
  actor.acted = true;
  colony.wharf = true;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.wharf;
    notePurse(actor, "wharf", EARN.wharf);
    purse = ` Purse +${formatUtopia(EARN.wharf)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a wharf at ${colony.name}. The yard pays 8 gold an hour and can refit a wreck within three hexes.${purse}`);
  return { ok: true, message: `Wharf raised at ${colony.name}.${purse}` };
}

function doCooper(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A cooperage needs a port.");
  if (colony.cooper) return fail(`${colony.name} already has a cooperage.`);
  if (actor.gold < 220) return fail("A cooperage wants 220 gold.");
  actor.gold -= 220;
  actor.orders -= 1;
  actor.acted = true;
  colony.cooper = true;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.cooper;
    notePurse(actor, "cooper", EARN.cooper);
    purse = ` Purse +${formatUtopia(EARN.cooper)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a cooperage at ${colony.name}. The yard pays 10 gold an hour, and a hull laid there costs 40 gold less.${purse}`);
  return { ok: true, message: `Cooperage raised at ${colony.name}.${purse}` };
}

function doRope(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A ropewalk needs a port.");
  if (colony.rope) return fail(`${colony.name} already has a ropewalk.`);
  if (actor.gold < 190) return fail("A ropewalk wants 190 gold.");
  actor.gold -= 190;
  actor.orders -= 1;
  actor.acted = true;
  colony.rope = true;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.rope;
    notePurse(actor, "rope", EARN.rope);
    purse = ` Purse +${formatUtopia(EARN.rope)} $UTOPIA.`;
  }
  log(world, `${actor.name} lays a ropewalk at ${colony.name}. The yard pays 6 gold an hour, and a hull within three hexes sails one hex farther.${purse}`);
  return { ok: true, message: `Ropewalk laid at ${colony.name}.${purse}` };
}

function doSmoke(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A smokehouse needs a port.");
  if (colony.smoke) return fail(`${colony.name} already has a smokehouse.`);
  if (actor.gold < 200) return fail("A smokehouse wants 200 gold.");
  actor.gold -= 200;
  actor.orders -= 1;
  actor.acted = true;
  colony.smoke = true;
  colony.cured = colony.cured || 0;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.smoke;
    notePurse(actor, "smoke", EARN.smoke);
    purse = ` Purse +${formatUtopia(EARN.smoke)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a smokehouse at ${colony.name}. The yard pays 4 gold an hour. An open quay cures 8 fish, up to 48. A closed quay feeds 12 from the racks. A landing smashes it.${purse}`);
  return { ok: true, message: `Smokehouse raised at ${colony.name}.${purse}` };
}

function doMonger(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A fishmonger needs a port.");
  if (colony.monger) return fail(`${colony.name} already has a fishmonger.`);
  if (actor.gold < 210) return fail("A fishmonger wants 210 gold.");
  actor.gold -= 210;
  actor.orders -= 1;
  actor.acted = true;
  colony.monger = true;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.monger;
    notePurse(actor, "monger", EARN.monger);
    purse = ` Purse +${formatUtopia(EARN.monger)} $UTOPIA.`;
  }
  log(world, `${actor.name} opens a fishmonger at ${colony.name}. The boards pay 3 gold an hour. An open quay sells up to 8 cured fish above a reserve of 16, at 3 gold each. A closed quay keeps the racks. A landing smashes the stall.${purse}`);
  return { ok: true, message: `Fishmonger open at ${colony.name}.${purse}` };
}

function doPilot(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A pilot needs a port.");
  if (colony.pilot) return fail(`${colony.name} already keeps a pilot.`);
  if (actor.gold < 200) return fail("A pilot wants 200 gold.");
  actor.gold -= 200;
  actor.orders -= 1;
  actor.acted = true;
  colony.pilot = true;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.pilot;
    notePurse(actor, "pilot", EARN.pilot);
    purse = ` Purse +${formatUtopia(EARN.pilot)} $UTOPIA.`;
  }
  log(world, `${actor.name} posts a pilot at ${colony.name}. The house pays 5 gold an hour. A friendly hull within three hexes ignores an enemy lamp. A chain still holds. A landing sends the pilot home.${purse}`);
  return { ok: true, message: `Pilot posted at ${colony.name}.${purse}` };
}

function doRefit(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  if ((actor.ships || []).length >= 6) return fail("Six hulls already ride for this holding.");
  const q = action.q | 0;
  const r = action.r | 0;
  const wreck = liveWreck(world, q, r);
  if (!wreck || !NAVY[wreck.kind]) return fail("No wreck rides there.");
  const yard = (actor.colonies || []).find((row) => row.port && row.wharf && hexDist(row.q, row.r, q, r) <= 3);
  if (!yard) return fail("A wharf within three hexes can refit that wreck.");
  const spec = NAVY[wreck.kind];
  const cost = Math.ceil(spec.gold / 2);
  if (actor.gold < cost) return fail(`Refitting a ${spec.name} wants ${cost} gold.`);
  actor.gold -= cost;
  actor.orders -= 1;
  actor.acted = true;
  actor.ships = actor.ships || [];
  const ship = {
    id: `s${world.hour || 0}-refit-${actor.ships.length}-${wreck.kind}`,
    kind: wreck.kind,
    q,
    r,
    destQ: null,
    destR: null,
  };
  actor.ships.push(ship);
  world.wrecks = (world.wrecks || []).filter((row) => row !== wreck);
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.refit;
    notePurse(actor, "refit", EARN.refit);
    purse = ` Purse +${formatUtopia(EARN.refit)} $UTOPIA.`;
  }
  log(world, `${actor.name} refits a ${spec.name} at ${yard.name}. The wreck is a hull again.${purse}`);
  return { ok: true, message: `${spec.name} refit at ${yard.name}.${purse}` };
}

function settleQuay(p, hour) {
  if (!p) return;
  for (const colony of p.colonies || []) {
    if (!(colony.quayUntil > 0)) continue;
    if (colony.quayUntil > hour) continue;
    const home = colony.quay || 0;
    colony.quay = 0;
    colony.quayUntil = 0;
    if (home > 0) p.soldiers += home;
  }
}

function doQuay(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A quay watch needs a port.");
  const hour = world.hour || 0;
  if ((colony.quayUntil || 0) > hour) return fail(`${colony.name} already has a quay watch.`);
  if ((actor.soldiers || 0) < 4) return fail("Need 4 soldiers to post a quay watch.");
  if (actor.gold < 120) return fail("A quay watch wants 120 gold.");
  actor.gold -= 120;
  actor.soldiers -= 4;
  actor.orders -= 1;
  actor.acted = true;
  colony.quay = 4;
  colony.quayUntil = hour + 6;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.quay;
    notePurse(actor, "quay", EARN.quay);
    purse = ` Purse +${formatUtopia(EARN.quay)} $UTOPIA.`;
  }
  log(world, `${actor.name} posts 4 soldiers on ${colony.name} through hour ${colony.quayUntil - 1}. A landing company is thrown back, and the quay lands 6 more grain.${purse}`);
  return { ok: true, message: `Quay watch posted at ${colony.name} through hour ${colony.quayUntil - 1}.${purse}` };
}

function doDues(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("Harbor dues need a port.");
  const hour = world.hour || 0;
  if ((colony.duesUntil || 0) > hour) return fail(`${colony.name} already collects harbor dues.`);
  if (actor.gold < 150) return fail("Harbor dues want 150 gold.");
  actor.gold -= 150;
  actor.orders -= 1;
  actor.acted = true;
  colony.duesUntil = hour + 6;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.dues;
    notePurse(actor, "dues", EARN.dues);
    purse = ` Purse +${formatUtopia(EARN.dues)} $UTOPIA.`;
  }
  log(world, `${actor.name} opens harbor dues at ${colony.name} through hour ${colony.duesUntil - 1}. An enemy hull within two hexes pays 12 gold.${purse}`);
  return { ok: true, message: `Harbor dues open at ${colony.name} through hour ${colony.duesUntil - 1}.${purse}` };
}

function doLamp(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A harbor lamp needs a port.");
  const hour = world.hour || 0;
  if ((colony.lampUntil || 0) > hour) return fail(`${colony.name} already burns a lamp.`);
  if (actor.gold < 200) return fail("A harbor lamp wants 200 gold.");
  actor.gold -= 200;
  actor.orders -= 1;
  actor.acted = true;
  colony.lampUntil = hour + 8;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.lamp;
    notePurse(actor, "lamp", EARN.lamp);
    purse = ` Purse +${formatUtopia(EARN.lamp)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a lamp at ${colony.name} through hour ${colony.lampUntil - 1}. An enemy hull within four hexes sails one hex slower.${purse}`);
  return { ok: true, message: `Lamp raised at ${colony.name} through hour ${colony.lampUntil - 1}.${purse}` };
}

function doChain(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A harbor chain needs a port.");
  const hour = world.hour || 0;
  if ((colony.chainUntil || 0) > hour) return fail(`${colony.name} already holds a chain.`);
  if (actor.gold < 240) return fail("A harbor chain wants 240 gold.");
  actor.gold -= 240;
  actor.orders -= 1;
  actor.acted = true;
  colony.chainUntil = hour + 7;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.chain;
    notePurse(actor, "chain", EARN.chain);
    purse = ` Purse +${formatUtopia(EARN.chain)} $UTOPIA.`;
  }
  log(world, `${actor.name} stretches a chain at ${colony.name} through hour ${colony.chainUntil - 1}. An enemy hull within one hex does not sail and pays 16 gold.${purse}`);
  return { ok: true, message: `Chain stretched at ${colony.name} through hour ${colony.chainUntil - 1}.${purse}` };
}

function portBerth(colony) {
  if (!colony || !colony.port) return null;
  if (sailKind(terrainKind(colony.q, colony.r))) return { q: colony.q, r: colony.r };
  return waterBeside(colony.q, colony.r);
}

function ferryPair(actor) {
  const ports = (actor.colonies || []).filter((row) => portBerth(row));
  let best = null;
  let bestD = 1;
  for (let i = 0; i < ports.length; i++) {
    for (let j = i + 1; j < ports.length; j++) {
      const a = portBerth(ports[i]);
      const b = portBerth(ports[j]);
      const dist = hexDist(a.q, a.r, b.q, b.r);
      if (dist > bestD) {
        bestD = dist;
        best = { from: ports[i], to: ports[j], a, b };
      }
    }
  }
  return best;
}

function doFerry(world, actor) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const hour = world.hour || 0;
  actor.ferries = (actor.ferries || []).filter((row) => (row.until || 0) > hour);
  if (actor.ferries.length) return fail("A ferry is already on the water.");
  const pair = ferryPair(actor);
  if (!pair) return fail("A ferry needs two ports more than one hex apart.");
  if (actor.gold < 280) return fail("A ferry wants 280 gold.");
  actor.gold -= 280;
  actor.orders -= 1;
  actor.acted = true;
  actor.ferries.push({
    id: `f${hour}-${pair.from.id}`,
    from: pair.from.id,
    to: pair.to.id,
    q: pair.a.q,
    r: pair.a.r,
    destQ: pair.b.q,
    destR: pair.b.r,
    until: hour + 8,
  });
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.ferry;
    notePurse(actor, "ferry", EARN.ferry);
    purse = ` Purse +${formatUtopia(EARN.ferry)} $UTOPIA.`;
  }
  log(world, `${actor.name} runs a ferry between ${pair.from.name} and ${pair.to.name} through hour ${hour + 7}. Each landing pays 18 gold and 14 grain.${purse}`);
  return { ok: true, message: `Ferry running between ${pair.from.name} and ${pair.to.name} through hour ${hour + 7}.${purse}` };
}

function doMole(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A mole needs a port.");
  const hour = world.hour || 0;
  if ((colony.moleUntil || 0) > hour) return fail(`${colony.name} already has a mole.`);
  if (actor.gold < 180) return fail("A mole wants 180 gold.");
  actor.gold -= 180;
  actor.orders -= 1;
  actor.acted = true;
  colony.moleUntil = hour + 5;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.mole;
    notePurse(actor, "mole", EARN.mole);
    purse = ` Purse +${formatUtopia(EARN.mole)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a mole at ${colony.name}. For five hours an enemy hull within two hexes is shoved off the quay.${purse}`);
  return { ok: true, message: `Mole raised at ${colony.name}.${purse}` };
}

function doLee(world, actor, colonyId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const colony = (actor.colonies || []).find((row) => row.id === colonyId);
  if (!colony) return fail("That town is not yours.");
  if (!colony.port) return fail("A lee needs a port.");
  const hour = world.hour || 0;
  if ((colony.leeUntil || 0) > hour) return fail(`${colony.name} already has a lee.`);
  if (actor.gold < 160) return fail("A lee wants 160 gold.");
  actor.gold -= 160;
  actor.orders -= 1;
  actor.acted = true;
  colony.leeUntil = hour + 6;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.lee;
    notePurse(actor, "lee", EARN.lee);
    purse = ` Purse +${formatUtopia(EARN.lee)} $UTOPIA.`;
  }
  log(world, `${actor.name} raises a lee at ${colony.name}. For six hours a hull within two hexes is sheltered, and a heavier grapple turns aside.${purse}`);
  return { ok: true, message: `Lee raised at ${colony.name}.${purse}` };
}

function doNet(world, actor, shipId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === shipId);
  if (!own) return fail("That hull is not yours.");
  if (hullTeeth(own.kind) >= WAR_TEETH) return fail("A galley, dromon, or hulk will not stop to lay nets.");
  if (!sailKind(terrainKind(own.q, own.r))) return fail("Lay nets on sea, coast, or river.");
  const hour = world.hour || 0;
  actor.nets = (actor.nets || []).filter((row) => (row.until || 0) > hour);
  if (actor.nets.length >= 3) return fail("Three nets are already in the water.");
  if (actor.nets.some((row) => row.q === own.q && row.r === own.r)) return fail("Nets already ride that water.");
  actor.orders -= 1;
  actor.acted = true;
  actor.nets.push({ q: own.q, r: own.r, until: hour + 5 });
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.net;
    notePurse(actor, "net", EARN.net);
    purse = ` Purse +${formatUtopia(EARN.net)} $UTOPIA.`;
  }
  const spec = NAVY[own.kind];
  log(world, `${actor.name} lays nets from the ${spec ? spec.name : "hull"}. For four hours an enemy hull on that water does not sail.${purse}`);
  return { ok: true, message: `Nets laid at ${own.q},${own.r}.${purse}` };
}

function doSlip(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === action.ship);
  if (!own) return fail("That hull is not yours.");
  if (hullTeeth(own.kind) >= WAR_TEETH) return fail("A galley, dromon, or hulk is too heavy to slip a boom.");
  const colony = (actor.colonies || []).find((row) => row.id === action.colony);
  if (!colony || !colony.port) return fail("Name one of your ports.");
  const hour = world.hour || 0;
  if ((colony.slipUntil || 0) > hour) return fail(`${colony.name} already slipped the boom.`);
  if (!blockadeAt(world, actor, colony)) return fail("No hull holds that quay.");
  if (hexDist(own.q, own.r, colony.q, colony.r) > 2) return fail("The trader must be within two hexes of the port.");
  actor.orders -= 1;
  actor.acted = true;
  colony.slipUntil = hour + 1;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.slip;
    notePurse(actor, "slip", EARN.slip);
    purse = ` Purse +${formatUtopia(EARN.slip)} $UTOPIA.`;
  }
  const spec = NAVY[own.kind];
  log(world, `${actor.name} slips ${colony.name} with the ${spec ? spec.name : "hull"}. The quay will land its fish this hour.${purse}`);
  return { ok: true, message: `${colony.name} slipped the boom.${purse}` };
}

function doBuoy(world, actor, shipId) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === shipId);
  if (!own) return fail("That hull is not yours.");
  if (!sailKind(terrainKind(own.q, own.r))) return fail("Drop a buoy on sea, coast, or river.");
  const hour = world.hour || 0;
  actor.buoys = (actor.buoys || []).filter((row) => (row.until || 0) > hour);
  if (actor.buoys.length >= 2) return fail("Two buoys are already lit.");
  if (actor.buoys.some((row) => row.q === own.q && row.r === own.r)) return fail("A buoy already burns on that water.");
  actor.orders -= 1;
  actor.acted = true;
  actor.buoys.push({ q: own.q, r: own.r, until: hour + 6 });
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.buoy;
    notePurse(actor, "buoy", EARN.buoy);
    purse = ` Purse +${formatUtopia(EARN.buoy)} $UTOPIA.`;
  }
  const spec = NAVY[own.kind];
  log(world, `${actor.name} drops a buoy from the ${spec ? spec.name : "hull"}. For five hours your hulls within three hexes sail one hex farther.${purse}`);
  return { ok: true, message: `Buoy lit at ${own.q},${own.r}.${purse}` };
}

function doCargo(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === action.ship);
  if (!own) return fail("That hull is not yours.");
  if (hullTeeth(own.kind) >= WAR_TEETH) return fail("A galley, dromon, or hulk will not carry a packet.");
  if (!sailKind(terrainKind(own.q, own.r))) return fail("A cargo runs from the water.");
  const colony = (actor.colonies || []).find((row) => row.id === action.colony);
  if (!colony || !colony.port) return fail("Name one of your ports.");
  if (hexDist(own.q, own.r, colony.q, colony.r) <= 3) return fail("That quay is too close for a cargo run.");
  const berth = sailKind(terrainKind(colony.q, colony.r)) ? { q: colony.q, r: colony.r } : waterBeside(colony.q, colony.r);
  if (!berth) return fail("That port has no water.");
  own.prey = null;
  own.block = null;
  own.salvage = null;
  own.escort = null;
  own.tow = null;
  own.cut = null;
  own.raid = null;
  own.cargo = colony.id;
  own.destQ = berth.q;
  own.destR = berth.r;
  actor.orders -= 1;
  actor.acted = true;
  const spec = NAVY[own.kind];
  log(world, `${actor.name} sends the ${spec ? spec.name : "hull"} with a cargo for ${colony.name}.`);
  return { ok: true, message: `${spec ? spec.name : "Hull"} is carrying a cargo to ${colony.name}.` };
}

function landCargo(world, realm, ship) {
  if (!ship.cargo) return;
  const colony = (realm.colonies || []).find((row) => row.id === ship.cargo);
  if (!colony || !colony.port || hexDist(ship.q, ship.r, colony.q, colony.r) > 1) return;
  realm.gold += 32;
  realm.grain += 20;
  let purse = "";
  if (realm.kind === "human") {
    realm.utopia += EARN.cargo;
    notePurse(realm, "cargo", EARN.cargo);
    purse = ` Purse +${formatUtopia(EARN.cargo)} $UTOPIA.`;
  }
  log(world, `${realm.name} lands a cargo at ${colony.name}. The quay pays 32 gold and 20 grain.${purse}`);
  ship.cargo = null;
}

function doCut(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === action.ship);
  if (!own) return fail("That hull is not yours.");
  if (hullTeeth(own.kind) < WAR_TEETH) return fail("A skiff, fisher, or cog will not cut a hull out. Lay a galley, dromon, or hulk.");
  if ((actor.ships || []).length >= 6) return fail("Six hulls already ride. There is no room for a prize.");
  const prey = findHull(world, action.owner, action.hull);
  if (!prey || prey.realm.id === actor.id) return fail("Name another ruler's hull.");
  if (!sailKind(terrainKind(prey.ship.q, prey.ship.r))) return fail("That hull is not on the water.");
  if (hullTeeth(own.kind) <= hullTeeth(prey.ship.kind)) return fail("That hull is not lighter. A cut needs heavier teeth.");
  own.prey = null;
  own.block = null;
  own.salvage = null;
  own.escort = null;
  own.tow = null;
  own.cargo = null;
  own.raid = null;
  own.cut = { owner: prey.realm.id, id: prey.ship.id };
  own.destQ = prey.ship.q;
  own.destR = prey.ship.r;
  actor.orders -= 1;
  actor.acted = true;
  const spec = NAVY[own.kind];
  const theirs = NAVY[prey.ship.kind];
  log(world, `${actor.name} sends the ${spec ? spec.name : "hull"} to cut out ${prey.realm.name}'s ${theirs ? theirs.name : "hull"}.`);
  return { ok: true, message: `${spec ? spec.name : "Hull"} is cutting out the ${theirs ? theirs.name : "hull"}.` };
}

function doRaid(world, actor, action) {
  if (actor.orders < 1) return fail("No orders left this hour.");
  const own = (actor.ships || []).find((row) => row.id === action.ship);
  if (!own) return fail("That hull is not yours.");
  if (hullTeeth(own.kind) < WAR_TEETH) return fail("A skiff, fisher, or cog will not land a company. Lay a galley, dromon, or hulk.");
  if (!sailKind(terrainKind(own.q, own.r))) return fail("The company boards from the water.");
  const mark = colonyOf(world, action.owner, action.colony);
  if (!mark || !mark.colony.port) return fail("Name a port.");
  const berth = sailKind(terrainKind(mark.colony.q, mark.colony.r)) ? { q: mark.colony.q, r: mark.colony.r } : waterBeside(mark.colony.q, mark.colony.r);
  if (!berth) return fail("That port has no water.");
  const home = mark.realm.id === actor.id;
  if ((own.marines || 0) < 6) {
    if (home) return fail("The company is already ashore.");
    const quay = (actor.colonies || []).find((row) => row.port && hexDist(own.q, own.r, row.q, row.r) <= 2);
    if (!quay) return fail("Board the company at one of your ports.");
    if ((actor.soldiers || 0) < 6) return fail("Need 6 soldiers to land a company.");
    actor.soldiers -= 6;
    own.marines = 6;
  }
  own.prey = null;
  own.block = null;
  own.salvage = null;
  own.escort = null;
  own.tow = null;
  own.cargo = null;
  own.cut = null;
  own.raid = { owner: mark.realm.id, id: mark.colony.id };
  own.destQ = berth.q;
  own.destR = berth.r;
  actor.orders -= 1;
  actor.acted = true;
  const spec = NAVY[own.kind];
  if (home) {
    log(world, `${actor.name} sends the ${spec ? spec.name : "hull"} home so the company can step ashore at ${mark.colony.name}.`);
    return { ok: true, message: `The company is bound for ${mark.colony.name}.` };
  }
  log(world, `${actor.name} sends the ${spec ? spec.name : "hull"} to raid ${mark.realm.name}'s ${mark.colony.name}.`);
  return { ok: true, message: `${spec ? spec.name : "Hull"} is carrying a company to ${mark.colony.name}.` };
}

function landRaid(world, realm, ship) {
  if (!ship.raid || (ship.marines || 0) < 4) return;
  const mark = colonyOf(world, ship.raid.owner, ship.raid.id);
  if (!mark || !mark.colony.port) {
    ship.raid = null;
    return;
  }
  if (hexDist(ship.q, ship.r, mark.colony.q, mark.colony.r) > 1) return;
  const company = ship.marines || 0;
  if (mark.realm.id === realm.id) {
    realm.soldiers += company;
    ship.marines = 0;
    ship.raid = null;
    log(world, `${realm.name} lands the company at ${mark.colony.name}.`);
    return;
  }
  const hour = world.hour || 0;
  if ((mark.colony.moleUntil || 0) > hour) {
    const lost = Math.min(company, 2);
    ship.marines = company - lost;
    ship.raid = null;
    shoveOff(ship, mark.colony.q, mark.colony.r, 1);
    log(world, `${mark.colony.name}'s mole breaks ${realm.name}'s landing. ${lost} soldiers are lost.`);
    return;
  }
  if ((mark.colony.quayUntil || 0) > hour && (mark.colony.quay || 0) > 0) {
    const lost = Math.min(company, 2);
    ship.marines = company - lost;
    ship.raid = null;
    mark.colony.quay -= 1;
    if (mark.colony.quay <= 0) mark.colony.quayUntil = hour;
    shoveOff(ship, mark.colony.q, mark.colony.r, 1);
    log(world, `${mark.colony.name}'s quay watch throws ${realm.name}'s company back. ${lost} soldiers are lost.`);
    return;
  }
  const gold = Math.min(mark.realm.gold || 0, 36);
  const grain = Math.min(mark.realm.grain || 0, 20);
  mark.realm.gold -= gold;
  mark.realm.grain -= grain;
  realm.gold += gold;
  realm.grain += grain;
  realm.soldiers += company;
  ship.marines = 0;
  ship.raid = null;
  let staves = "";
  if (mark.colony.cooper) {
    mark.colony.cooper = false;
    staves = " The cooperage is smashed.";
  }
  let coils = "";
  if (mark.colony.rope) {
    mark.colony.rope = false;
    coils = " The ropewalk is cut.";
  }
  let racks = "";
  if (mark.colony.smoke) {
    const spilled = mark.colony.cured || 0;
    mark.colony.smoke = false;
    mark.colony.cured = 0;
    if (spilled) realm.grain += spilled;
    racks = spilled ? ` The smokehouse is smashed and ${spilled} cured grain is taken.` : " The smokehouse is smashed.";
  }
  let boards = "";
  if (mark.colony.monger) {
    mark.colony.monger = false;
    boards = " The fishmonger is smashed.";
  }
  let pilot = "";
  if (mark.colony.pilot) {
    mark.colony.pilot = false;
    pilot = " The pilot is sent home.";
  }
  let purse = "";
  if (realm.kind === "human" && (gold > 0 || grain > 0)) {
    realm.utopia += EARN.raid;
    notePurse(realm, "raid", EARN.raid);
    purse = ` Purse +${formatUtopia(EARN.raid)} $UTOPIA.`;
  }
  log(world, `${realm.name} lands a company at ${mark.colony.name}. The quay loses ${gold} gold and ${grain} grain.${staves}${coils}${racks}${boards}${pilot}${purse}`);
}

function chainHold(world, realm, ship, hour) {
  for (const other of world.provinces || []) {
    if (!other || other.id === realm.id) continue;
    for (const colony of other.colonies || []) {
      if (!colony.port || (colony.chainUntil || 0) <= (hour || 0)) continue;
      if (hexDist(ship.q, ship.r, colony.q, colony.r) <= 1) return { realm: other, colony };
    }
  }
  return null;
}

function lampNear(world, realm, ship, hour) {
  for (const other of world.provinces || []) {
    if (!other || other.id === realm.id) continue;
    for (const colony of other.colonies || []) {
      if (!colony.port || (colony.lampUntil || 0) <= (hour || 0)) continue;
      if (hexDist(ship.q, ship.r, colony.q, colony.r) <= 4) return true;
    }
  }
  return false;
}

function pilotNear(realm, ship) {
  return (realm.colonies || []).some((colony) => colony.port && colony.pilot && hexDist(ship.q, ship.r, colony.q, colony.r) <= 3);
}

function buoyLit(realm, ship, hour) {
  return (realm.buoys || []).some((row) => (row.until || 0) > (hour || 0) && hexDist(ship.q, ship.r, row.q, row.r) <= 3);
}

function ropeNear(realm, ship) {
  return (realm.colonies || []).some((colony) => colony.port && colony.rope && hexDist(ship.q, ship.r, colony.q, colony.r) <= 3);
}

function netHolder(world, realm, ship, hour) {
  for (const other of world.provinces || []) {
    if (!other || other.id === realm.id) continue;
    for (const net of other.nets || []) {
      if ((net.until || 0) <= hour) continue;
      if (net.q === ship.q && net.r === ship.r) return other;
    }
  }
  return null;
}

function leeCover(realm, ship, hour) {
  if (!realm || !ship) return false;
  return (realm.colonies || []).some((colony) => colony.port && (colony.leeUntil || 0) > (hour || 0) && hexDist(ship.q, ship.r, colony.q, colony.r) <= 2);
}

function shoveOff(ship, cq, cr, steps) {
  let left = steps;
  while (left > 0) {
    let best = null;
    let bestD = hexDist(ship.q, ship.r, cq, cr);
    for (const [dq, dr] of HEX_DIRS) {
      const nq = ship.q + dq;
      const nr = ship.r + dr;
      if (!sailKind(terrainKind(nq, nr))) continue;
      const dist = hexDist(nq, nr, cq, cr);
      if (dist > bestD) {
        bestD = dist;
        best = { q: nq, r: nr };
      }
    }
    if (!best) break;
    ship.q = best.q;
    ship.r = best.r;
    left -= 1;
  }
  ship.destQ = ship.q;
  ship.destR = ship.r;
}

function pressMoles(world) {
  const hour = world.hour || 0;
  const shoved = new Set();
  for (const realm of world.provinces || []) {
    for (const colony of realm.colonies || []) {
      if (!colony.port || (colony.moleUntil || 0) <= hour) continue;
      for (const other of world.provinces || []) {
        if (other.id === realm.id) continue;
        for (const ship of other.ships || []) {
          if (shoved.has(ship)) continue;
          const onBlock = ship.block && ship.block.owner === realm.id && ship.block.id === colony.id;
          if (!onBlock && hexDist(ship.q, ship.r, colony.q, colony.r) > 2) continue;
          shoved.add(ship);
          ship.block = null;
          ship.prey = null;
          ship.salvage = null;
          ship.tow = null;
          ship.cargo = null;
          ship.cut = null;
          ship.raid = null;
          const spec = NAVY[ship.kind];
          shoveOff(ship, colony.q, colony.r, onBlock ? 2 : 1);
          const skim = Math.min(other.gold || 0, 14);
          other.gold -= skim;
          realm.gold += skim;
          log(world, `${realm.name}'s mole at ${colony.name} shoves ${other.name}'s ${spec ? spec.name : "hull"} off the quay${skim ? ` and takes ${skim} gold` : ""}.`);
        }
      }
    }
  }
}

function resolveSalvage(world) {
  const hour = world.hour || 0;
  for (const realm of world.provinces || []) {
    for (const ship of realm.ships || []) {
      if (!ship.salvage) continue;
      const wreck = (world.wrecks || []).find((row) => row.q === ship.q && row.r === ship.r && (row.until || 0) > hour);
      if (!wreck) {
        if (ship.q === ship.salvage.q && ship.r === ship.salvage.r) ship.salvage = null;
        continue;
      }
      const take = Number.isFinite(wreck.gold) ? wreck.gold : wreckGold(wreck.kind);
      realm.gold += take;
      let purse = "";
      if (realm.kind === "human") {
        realm.utopia += EARN.salvage;
        notePurse(realm, "salvage", EARN.salvage);
        purse = ` Purse +${formatUtopia(EARN.salvage)} $UTOPIA.`;
      }
      const spec = NAVY[wreck.kind];
      log(world, `${realm.name} salvages a wrecked ${spec ? spec.name : "hull"} for ${take} gold.${purse}`);
      world.wrecks = (world.wrecks || []).filter((row) => row !== wreck);
      ship.salvage = null;
    }
  }
}

function payPrize(world, winner, loser, sunk) {
  const take = Math.min(loser.gold || 0, 48 + hullTeeth(sunk.kind) * 16);
  loser.gold -= take;
  winner.gold += take;
  let purse = "";
  if (winner.kind === "human") {
    winner.utopia += EARN.prize;
    notePurse(winner, "prize", EARN.prize);
    purse = ` Purse +${formatUtopia(EARN.prize)} $UTOPIA.`;
  }
  const spec = NAVY[sunk.kind];
  log(world, `${winner.name} grapples ${loser.name}'s ${spec ? spec.name : "hull"} and takes ${take} gold. The hull goes under.${purse}`);
  if ((sunk.marines || 0) > 0) log(world, `${sunk.marines} soldiers go under with the hull.`);
  dropWreck(world, sunk);
}

function resolveCuts(world) {
  const taken = new Set();
  const gained = new Map();
  const captured = [];
  for (const realm of world.provinces || []) {
    for (const ship of realm.ships || []) {
      if (!ship.cut || taken.has(ship)) continue;
      const prey = findHull(world, ship.cut.owner, ship.cut.id);
      if (!prey || taken.has(prey.ship) || prey.ship === ship) {
        ship.cut = null;
        continue;
      }
      if (hexDist(ship.q, ship.r, prey.ship.q, prey.ship.r) > 1) continue;
      const hour = world.hour || 0;
      if (leeCover(prey.realm, prey.ship, hour)) {
        ship.cut = null;
        const home = (prey.realm.colonies || []).find((colony) => colony.port && (colony.leeUntil || 0) > hour);
        log(world, `${prey.realm.name}'s lee at ${home ? home.name : "the quay"} turns ${realm.name}'s cut aside.`);
        continue;
      }
      const teeth = hullTeeth(ship.kind);
      const theirs = hullTeeth(prey.ship.kind) + coverTeeth(prey.realm, prey.ship);
      if (teeth <= theirs) {
        ship.cut = null;
        log(world, `${realm.name} reaches for ${prey.realm.name}'s hull, but it slips the cut.`);
        continue;
      }
      const room = (realm.ships || []).length + (gained.get(realm.id) || 0);
      if (room >= 6) {
        ship.cut = null;
        log(world, `${realm.name} has no room for the prize. The hull slips away.`);
        continue;
      }
      taken.add(prey.ship);
      gained.set(realm.id, (gained.get(realm.id) || 0) + 1);
      const take = Math.min(prey.realm.gold || 0, 28 + hullTeeth(prey.ship.kind) * 8);
      prey.realm.gold -= take;
      realm.gold += take;
      let purse = "";
      if (realm.kind === "human") {
        realm.utopia += EARN.cut;
        notePurse(realm, "cut", EARN.cut);
        purse = ` Purse +${formatUtopia(EARN.cut)} $UTOPIA.`;
      }
      const spec = NAVY[prey.ship.kind];
      log(world, `${realm.name} cuts out ${prey.realm.name}'s ${spec ? spec.name : "hull"}. The hull is yours${take ? ` and ${take} gold comes with it` : ""}.${purse}`);
      ship.cut = null;
      captured.push({ from: prey.realm, ship: prey.ship, to: realm });
    }
  }
  for (const move of captured) {
    const oldId = move.ship.id;
    move.from.ships = (move.from.ships || []).filter((row) => row !== move.ship);
    for (const other of move.from.ships) {
      if (other.escort === oldId) other.escort = null;
      if (other.prey && other.prey.id === oldId) other.prey = null;
      if (other.cut && other.cut.id === oldId) other.cut = null;
    }
    move.to.ships = move.to.ships || [];
    move.to.ships.push({
      id: `s${world.hour || 0}-cut-${move.to.ships.length}-${move.ship.kind}`,
      kind: move.ship.kind,
      q: move.ship.q,
      r: move.ship.r,
      destQ: null,
      destR: null,
      prizeUntil: (world.hour || 0) + 3,
    });
  }
}

function resolveGrapples(world) {
  const sunk = new Set();
  for (const realm of world.provinces || []) {
    for (const ship of realm.ships || []) {
      if (!ship.prey || sunk.has(ship)) continue;
      const prey = findHull(world, ship.prey.owner, ship.prey.id);
      if (!prey || sunk.has(prey.ship)) {
        ship.prey = null;
        continue;
      }
      if (hexDist(ship.q, ship.r, prey.ship.q, prey.ship.r) > 1) continue;
      const hour = world.hour || 0;
      if (leeCover(prey.realm, prey.ship, hour) && hullTeeth(ship.kind) > hullTeeth(prey.ship.kind) + coverTeeth(prey.realm, prey.ship)) {
        ship.prey = null;
        const home = (prey.realm.colonies || []).find((colony) => colony.port && (colony.leeUntil || 0) > hour);
        log(world, `${prey.realm.name}'s lee at ${home ? home.name : "the quay"} turns ${realm.name}'s grapple aside.`);
        continue;
      }
      const teeth = hullTeeth(ship.kind);
      const theirs = hullTeeth(prey.ship.kind) + coverTeeth(prey.realm, prey.ship);
      if (teeth > theirs) {
        payPrize(world, realm, prey.realm, prey.ship);
        sunk.add(prey.ship);
        ship.prey = null;
      } else if (teeth < theirs) {
        payPrize(world, prey.realm, realm, ship);
        sunk.add(ship);
      } else {
        ship.prey = null;
        prey.ship.prey = null;
        log(world, `${realm.name} and ${prey.realm.name} lock hulls and fall apart. Neither goes under.`);
      }
    }
  }
  for (const realm of world.provinces || []) {
    realm.ships = (realm.ships || []).filter((ship) => !sunk.has(ship));
    for (const ship of realm.ships) {
      if (ship.prey && !findHull(world, ship.prey.owner, ship.prey.id)) ship.prey = null;
      if (ship.escort && !(realm.ships || []).some((row) => row.id === ship.escort)) ship.escort = null;
    }
  }
}

function sailHour(world) {
  for (const realm of world.provinces || []) {
    for (const founder of realm.founders || []) {
      if (founder.spent || founder.destQ == null) continue;
      let left = 2;
      while (left > 0 && (founder.q !== founder.destQ || founder.r !== founder.destR)) {
        const next = stepToward(founder.q, founder.r, founder.destQ, founder.destR, (q, r) => terrainKind(q, r) !== "sea");
        if (next.q === founder.q && next.r === founder.r) break;
        founder.q = next.q;
        founder.r = next.r;
        left -= 1;
      }
      if (founder.q === founder.destQ && founder.r === founder.destR) plantColony(world, realm, founder);
    }
    realm.founders = (realm.founders || []).filter((row) => !row.spent);
    for (const ship of realm.ships || []) {
      if (ship.cut) {
        const prey = findHull(world, ship.cut.owner, ship.cut.id);
        if (prey && sailKind(terrainKind(prey.ship.q, prey.ship.r))) {
          ship.destQ = prey.ship.q;
          ship.destR = prey.ship.r;
        } else ship.cut = null;
      } else if (ship.prey) {
        const prey = findHull(world, ship.prey.owner, ship.prey.id);
        if (prey && sailKind(terrainKind(prey.ship.q, prey.ship.r))) {
          ship.destQ = prey.ship.q;
          ship.destR = prey.ship.r;
        }
      } else if (ship.block) {
        const mark = colonyOf(world, ship.block.owner, ship.block.id);
        const berth = mark && mark.colony.port ? waterBeside(mark.colony.q, mark.colony.r) : null;
        if (!berth) ship.block = null;
        else {
          ship.destQ = berth.q;
          ship.destR = berth.r;
        }
      } else if (ship.salvage) {
        const wreck = liveWreck(world, ship.salvage.q, ship.salvage.r);
        if (!wreck) ship.salvage = null;
        else {
          ship.destQ = wreck.q;
          ship.destR = wreck.r;
        }
      } else if (ship.tow) {
        const wreck = liveWreck(world, ship.tow.q, ship.tow.r);
        if (!wreck) ship.tow = null;
        else if (ship.q === wreck.q && ship.r === wreck.r) {
          const yard = nearestWharf(realm, wreck.q, wreck.r);
          if (!yard) ship.tow = null;
          else if (hexDist(wreck.q, wreck.r, yard.q, yard.r) <= 3) {
            ship.tow = null;
            ship.destQ = ship.q;
            ship.destR = ship.r;
            log(world, `${realm.name} brings a wreck within reach of ${yard.name}.`);
          } else {
            const next = stepToward(wreck.q, wreck.r, yard.q, yard.r, (q, r) => sailKind(terrainKind(q, r)));
            if (next.q === wreck.q && next.r === wreck.r) {
              ship.tow = null;
              log(world, `${realm.name} loses the tow. The wreck will not come nearer.`);
            } else {
              wreck.q = next.q;
              wreck.r = next.r;
              wreck.until = Math.max(wreck.until || 0, (world.hour || 0) + 2);
              ship.q = wreck.q;
              ship.r = wreck.r;
              ship.tow = { q: wreck.q, r: wreck.r };
              ship.destQ = wreck.q;
              ship.destR = wreck.r;
            }
          }
        } else {
          ship.destQ = wreck.q;
          ship.destR = wreck.r;
        }
      } else if (ship.escort) {
        const trader = (realm.ships || []).find((row) => row.id === ship.escort);
        if (!trader) ship.escort = null;
        else if (sailKind(terrainKind(trader.q, trader.r))) {
          ship.destQ = trader.q;
          ship.destR = trader.r;
        }
      } else if (ship.raid) {
        const mark = colonyOf(world, ship.raid.owner, ship.raid.id);
        const berth = mark && mark.colony.port ? (sailKind(terrainKind(mark.colony.q, mark.colony.r)) ? { q: mark.colony.q, r: mark.colony.r } : waterBeside(mark.colony.q, mark.colony.r)) : null;
        if (!berth) ship.raid = null;
        else {
          ship.destQ = berth.q;
          ship.destR = berth.r;
        }
      } else if (ship.cargo) {
        const colony = (realm.colonies || []).find((row) => row.id === ship.cargo);
        const berth = colony && colony.port ? (sailKind(terrainKind(colony.q, colony.r)) ? { q: colony.q, r: colony.r } : waterBeside(colony.q, colony.r)) : null;
        if (!berth) ship.cargo = null;
        else {
          ship.destQ = berth.q;
          ship.destR = berth.r;
        }
      }
      const holder = netHolder(world, realm, ship, world.hour || 0);
      if (holder) {
        const skim = Math.min(realm.gold || 0, 10);
        realm.gold -= skim;
        holder.gold += skim;
        ship.destQ = ship.q;
        ship.destR = ship.r;
        const caught = NAVY[ship.kind];
        log(world, `${holder.name}'s nets hold ${realm.name}'s ${caught ? caught.name : "hull"}${skim ? ` and take ${skim} gold` : ""}.`);
        continue;
      }
      const chained = chainHold(world, realm, ship, world.hour || 0);
      if (chained) {
        const skim = Math.min(realm.gold || 0, 16);
        realm.gold -= skim;
        chained.realm.gold += skim;
        ship.destQ = ship.q;
        ship.destR = ship.r;
        const caught = NAVY[ship.kind];
        log(world, `${chained.realm.name}'s chain at ${chained.colony.name} holds ${realm.name}'s ${caught ? caught.name : "hull"}${skim ? ` and takes ${skim} gold` : ""}.`);
        continue;
      }
      if (ship.destQ == null) continue;
      const spec = NAVY[ship.kind];
      let left = (spec ? spec.speed : 1) + (buoyLit(realm, ship, world.hour || 0) ? 1 : 0) + (ropeNear(realm, ship) ? 1 : 0);
      const lamp = lampNear(world, realm, ship, world.hour || 0);
      if (lamp && pilotNear(realm, ship)) {
        const steered = NAVY[ship.kind];
        log(world, `${realm.name}'s pilot keeps the ${steered ? steered.name : "hull"} off the lamp.`);
      } else if (lamp) left = Math.max(1, left - 1);
      while (left > 0 && (ship.q !== ship.destQ || ship.r !== ship.destR)) {
        const next = stepToward(ship.q, ship.r, ship.destQ, ship.destR, (q, r) => sailKind(terrainKind(q, r)));
        if (next.q === ship.q && next.r === ship.r) break;
        ship.q = next.q;
        ship.r = next.r;
        left -= 1;
      }
      landCargo(world, realm, ship);
      landRaid(world, realm, ship);
    }
  }
  resolveCuts(world);
  resolveGrapples(world);
  resolveSalvage(world);
  tendDrift(world);
  sailFerries(world);
  const hour = world.hour || 0;
  world.wrecks = (world.wrecks || []).filter((row) => (row.until || 0) > hour);
  for (const realm of world.provinces || []) {
    realm.nets = (realm.nets || []).filter((row) => (row.until || 0) > hour);
    realm.buoys = (realm.buoys || []).filter((row) => (row.until || 0) > hour);
  }
}

function tendDrift(world) {
  const hour = world.hour || 0;
  for (const realm of world.provinces || []) {
    const yard = (realm.plots || []).find((tile) => tile.crew === "drift");
    if (!yard) continue;
    const wreck = (world.wrecks || []).find((row) => (row.until || 0) > hour && hexDist(row.q, row.r, yard.q, yard.r) <= 2);
    if (!wreck) continue;
    const pile = Number.isFinite(wreck.gold) ? wreck.gold : wreckGold(wreck.kind);
    const take = Math.min(16, pile);
    if (take <= 0) continue;
    wreck.gold = pile - take;
    realm.gold += take;
    const spec = NAVY[wreck.kind];
    const name = spec ? spec.name : "hull";
    if (wreck.gold <= 0) {
      world.wrecks = (world.wrecks || []).filter((row) => row !== wreck);
      log(world, `${realm.name}'s drift yard takes the last ${take} gold of a wrecked ${name}.`);
    } else {
      log(world, `${realm.name}'s drift yard strips ${take} gold from a wrecked ${name}. ${wreck.gold} gold of timber remains.`);
    }
  }
}

function landFerry(world, realm, ferry) {
  const here = (realm.colonies || []).find((colony) => {
    const berth = portBerth(colony);
    return berth && berth.q === ferry.q && berth.r === ferry.r;
  });
  if (!here) return;
  realm.gold += 18;
  realm.grain += 14;
  log(world, `${realm.name}'s ferry lands at ${here.name}. The quay pays 18 gold and 14 grain.`);
  const nextId = here.id === ferry.to ? ferry.from : ferry.to;
  const next = (realm.colonies || []).find((colony) => colony.id === nextId);
  const berth = next && portBerth(next);
  if (!berth || (berth.q === ferry.q && berth.r === ferry.r)) {
    ferry.until = world.hour || 0;
    return;
  }
  ferry.from = here.id;
  ferry.to = next.id;
  ferry.destQ = berth.q;
  ferry.destR = berth.r;
}

function sailFerries(world) {
  const hour = world.hour || 0;
  for (const realm of world.provinces || []) {
    for (const ferry of realm.ferries || []) {
      if ((ferry.until || 0) <= hour) continue;
      if (ferry.destQ == null) continue;
      let left = 2;
      while (left > 0 && (ferry.q !== ferry.destQ || ferry.r !== ferry.destR)) {
        const next = stepToward(ferry.q, ferry.r, ferry.destQ, ferry.destR, (q, r) => sailKind(terrainKind(q, r)));
        if (next.q === ferry.q && next.r === ferry.r) break;
        ferry.q = next.q;
        ferry.r = next.r;
        left -= 1;
      }
      if (ferry.q === ferry.destQ && ferry.r === ferry.destR) landFerry(world, realm, ferry);
    }
    realm.ferries = (realm.ferries || []).filter((row) => (row.until || 0) > hour);
  }
}

export function keelUp(p, hour) {
  return Boolean(p && (p.keelUntil || 0) > (hour || 0) && (p.keel || 0) >= 3);
}

export function keelHaul(p, hour) {
  if (!keelUp(p, hour)) return { gold: 0, grain: 0 };
  let grain = 14;
  let gold = 18;
  if (weirLive(p, hour)) grain += 10;
  const name = seasonName(hour || 0);
  if (name === "Frost") {
    grain = Math.floor(grain * 0.5);
    gold = Math.floor(gold * 0.6);
  } else if (name === "High Sun") {
    grain = Math.floor(grain * 1.15);
  }
  return { gold, grain };
}

function clearKeel(p) {
  if (!p) return;
  p.keel = 0;
  p.keelUntil = 0;
  for (const tile of p.plots || []) tile.keel = false;
}

function settleKeel(p, hour) {
  if (!p || !(p.keelUntil > 0)) return;
  if (p.keelUntil > (hour || 0)) return;
  const home = p.keel || 0;
  clearKeel(p);
  if (home > 0) p.soldiers += home;
}

function doKeel(world, actor) {
  ensurePlots(world);
  if (keelUp(actor, world.hour)) return fail(`The keel already rides through hour ${actor.keelUntil - 1}.`);
  settleKeel(actor, world.hour || 0);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if ((actor.soldiers || 0) < 6) return fail("Need 6 soldiers to crew a keel.");
  if (actor.gold < 200) return fail("A keel wants 200 gold.");
  const plot = (actor.plots || []).find((tile) => tile.crew !== "lot" && waterTouch(tile));
  if (!plot) return fail("A keel needs a bought tile on the coast or beside the river.");
  actor.gold -= 200;
  actor.soldiers -= 6;
  actor.orders -= 1;
  actor.acted = true;
  for (const tile of actor.plots || []) tile.keel = false;
  plot.keel = true;
  actor.keel = 6;
  actor.keelUntil = (world.hour || 0) + 6;
  let purse = "";
  if (actor.kind === "human") {
    actor.utopia += EARN.keel;
    notePurse(actor, "keel", EARN.keel);
    purse = ` Purse +${formatUtopia(EARN.keel)} $UTOPIA.`;
  }
  log(world, `${actor.name} launches a keel through hour ${actor.keelUntil - 1}. It hauls fish and coin, escorts a caravan, and can turn a wild ride. A sack burns the hull.${purse}`);
  return { ok: true, message: `Keel launched through hour ${actor.keelUntil - 1}.${purse}` };
}

function strikeBand(world, band, target) {
  const hour = world.hour || 0;
  band.raid = { target: target.id, hour, met: "" };
  if (patrolUp(target, hour)) {
    const screen = target.patrol * 20;
    if (screen >= band.men * 5) {
      const lost = Math.min(band.men, 4);
      band.men -= lost;
      const fallen = Math.min(target.patrol, 2);
      target.patrol -= fallen;
      band.raid.met = "patrol";
      if (target.patrol < 4) {
        target.patrol = 0;
        target.patrolUntil = hour;
        log(world, `${band.name} meets the outriders of ${target.name}. The screen breaks after ${lost} riders fall.`);
      } else {
        log(world, `${band.name} meets the outriders of ${target.name} and turns aside. ${lost} riders fall. ${fallen} outriders do not come home.`);
      }
      if (band.men < 8) quietBand(world, band, hour, `${band.name} scatters. The camp is ash for six hours.`);
      return;
    }
    const spent = target.patrol;
    target.patrol = 0;
    target.patrolUntil = hour;
    band.men = Math.max(1, band.men - 3);
    log(world, `${band.name} breaks ${spent} outriders of ${target.name} and rides on.`);
  }
  if (keelUp(target, hour)) {
    const screen = target.keel * 22;
    if (screen >= band.men * 4) {
      const lost = Math.min(band.men, 3);
      band.men -= lost;
      const fallen = Math.min(target.keel, 1);
      target.keel -= fallen;
      band.raid.met = "keel";
      if (target.keel < 3) {
        clearKeel(target);
        log(world, `${band.name} meets the keel of ${target.name}. The hull breaks after ${lost} riders fall.`);
      } else {
        log(world, `${band.name} meets the keel of ${target.name} and turns aside. ${lost} riders fall. ${fallen} of the crew does not come home.`);
      }
      if (band.men < 8) quietBand(world, band, hour, `${band.name} scatters. The camp is ash for six hours.`);
      return;
    }
    const spent = target.keel;
    clearKeel(target);
    band.men = Math.max(1, band.men - 2);
    log(world, `${band.name} breaks the keel of ${target.name}. ${spent} crew are lost, and the camp still comes on.`);
  }
  const tolled = (target.plots || []).some((tile) => tile.crew === "bell");
  const cut = tolled ? 0.5 : 1;
  const bite = band.men * 9;
  if (defense(target) >= bite) {
    const lost = Math.min(band.men, 3 + Math.floor(defense(target) / 120));
    band.men -= lost;
    log(world, `${band.name} rides at ${target.name} and breaks on the wall. ${lost} riders do not return.`);
    if (band.men < 8) quietBand(world, band, hour, `${band.name} scatters. The camp is ash for six hours.`);
    return;
  }
  let gold = Math.min(target.gold, Math.floor((36 + band.men) * cut));
  const grain = Math.min(target.grain, Math.floor((50 + band.men * 2) * cut));
  let folk = Math.min(target.peasants, Math.floor((6 + Math.floor(band.men / 8)) * cut));
  let smoke = "";
  if ((target.plots || []).some((tile) => tile.crew === "char")) {
    const choke = Math.min(gold, 12);
    gold -= choke;
    const fallen = Math.min(band.men, 2);
    band.men -= fallen;
    if (fallen) smoke = ` The charcoal smoke takes ${fallen} riders.`;
  }
  let lifted = "";
  if ((target.plots || []).some((tile) => tile.crew === "dove")) {
    const saved = Math.min(folk, 2);
    folk -= saved;
    if (saved) lifted = ` The doves carry ${saved} people clear.`;
  }
  target.gold -= gold;
  target.grain -= grain;
  band.hoard = (band.hoard || 0) + Math.floor(gold / 2);
  target.peasants -= folk;
  target.soldiers = Math.max(0, (target.soldiers || 0) - Math.min(target.soldiers || 0, 2));
  const toll = tolled ? " The bell saves half." : "";
  log(world, `${band.name} rides through ${target.name}, taking ${gold} gold and ${grain} grain. ${folk} people fall.${toll}${smoke}${lifted}`);
}

export function pressBands(world) {
  const hour = world.hour || 0;
  const bands = world.bands || [];
  for (const band of bands) {
    if ((band.downUntil || 0) > 0 && hour >= band.downUntil) {
      band.men = 16;
      band.hoard = (band.hoard || 0) + 70;
      band.downUntil = 0;
      log(world, `${band.name} lights the camp again.`);
    } else if (bandUp(band, hour) && band.men < 34 && hour % 4 === 0) {
      band.men += 1;
    }
  }
  const live = bands.filter((band) => bandUp(band, hour));
  if (!live.length) return;
  const rider = live[hour % live.length];
  const target = bandTarget(world, rider);
  if (!target) {
    rider.raid = null;
    return;
  }
  strikeBand(world, rider, target);
}

function findBand(world, bandId) {
  return (world.bands || []).find((band) => band.id === bandId) || null;
}

function doRide(world, actor, bandId) {
  const band = findBand(world, bandId);
  if (!band) return fail("That camp is not on the map.");
  if (!bandUp(band, world.hour)) return fail(`${band.name} is already ash.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  if ((actor.soldiers || 0) < 12) return fail("Need 12 soldiers to ride them down.");
  actor.orders -= 1;
  actor.acted = true;
  if (offense(actor) >= band.men * 12) {
    const loot = band.hoard || 0;
    band.hoard = 0;
    actor.gold += loot;
    actor.pelts = (actor.pelts || 0) + 1;
    quietBand(world, band, world.hour, null);
    let purse = "";
    if (actor.kind === "human") {
      actor.utopia += EARN.ride;
      notePurse(actor, "ride", EARN.ride);
      purse = ` Purse +${formatUtopia(EARN.ride)} $UTOPIA.`;
    }
    log(world, `${actor.name} rides down ${band.name}, takes ${loot} gold, and hangs a hide. The camp is ash for six hours.${purse}`);
    return { ok: true, win: true, message: `${band.name} breaks. ${loot} gold and a hide.${purse}` };
  }
  const lost = Math.min(actor.soldiers, 5);
  actor.soldiers -= lost;
  band.men = Math.max(0, band.men - 4);
  if (band.men < 8) {
    quietBand(world, band, world.hour, `${actor.name} rides at ${band.name}, loses ${lost} soldiers, and the camp still scatters.`);
    return { ok: true, win: false, message: `The ride fails. ${lost} soldiers fall, and the camp scatters.` };
  }
  log(world, `${actor.name} rides at ${band.name} and loses ${lost} soldiers. The camp still stands.`);
  return { ok: true, win: false, message: `The ride fails. ${lost} soldiers fall. ${band.men} riders remain.` };
}

function doBribe(world, actor, bandId) {
  const band = findBand(world, bandId);
  if (!band) return fail("That camp is not on the map.");
  if (!bandUp(band, world.hour)) return fail(`${band.name} is already ash.`);
  if (actor.orders < 1) return fail("No orders left this hour.");
  band.truce = band.truce || {};
  if ((band.truce[actor.id] || 0) > (world.hour || 0)) return fail(`${band.name} is already paid off through hour ${band.truce[actor.id] - 1}.`);
  if (actor.gold < 160) return fail("Buying them off wants 160 gold.");
  actor.gold -= 160;
  actor.orders -= 1;
  actor.acted = true;
  band.truce[actor.id] = (world.hour || 0) + 5;
  log(world, `${actor.name} buys off ${band.name} through hour ${band.truce[actor.id] - 1}.`);
  return { ok: true, message: `${band.name} stays quiet through hour ${band.truce[actor.id] - 1}.` };
}

export function growRival(world, agent) {
  if (!agent || agent.kind !== "agent") return false;
  if (agent.gold < 350 || agent.peasants < 30) return false;
  if (agent.land >= 380) return false;
  agent.land += 4;
  agent.gold -= 80;
  claimTiles(world, agent, 1);
  const pref = { harrow: "barracks", sable: "keep", vellum: "spire", quill: "den", brine: "workshop", moss: "field" }[agent.persona] || "field";
  if (agent.buildings && agent.buildings[pref] != null && freeLand(agent) >= 1) agent.buildings[pref] += 1;
  const cap = (agent.buildings.hearth || 0) * 16;
  if (cap > agent.peasants) agent.peasants = Math.min(cap, agent.peasants + 6);
  return true;
}

function doAttack(world, actor, action) {
  const target = byId(world, action.target);
  const mode = action.mode;
  if (!target || target.id === actor.id) return fail("Pick another province.");
  if (!["seize", "sack", "raze"].includes(mode)) return fail("Unknown march.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.soldiers + actor.elites < 10) return fail("Need at least 10 troops at home.");
  if (onCooldown(actor, target, world.hour)) return fail("That province is still under the two-hour truce of your last march.");
  if (pactLive(actor, target.id, world.hour)) {
    delete actor.pacts[target.id];
    if (target.pacts) delete target.pacts[actor.id];
    log(world, `${actor.name} breaks the pact with ${target.name}.`);
  }
  const scale = nwFactor(actor, target);
  if (scale <= 0) return fail("Networth sits outside the fair band. No march, no $UTOPIA.");
  const stake = Math.floor(action.stake || 0);
  if (target.kind === "human") {
    if (stake < EARN.minStake) return fail("PvP needs a stake of at least 1.00 $UTOPIA from each side.");
    if (actor.utopia < stake || target.utopia < stake) return fail("Both purses must cover the stake.");
  } else if (stake > 0) {
    return fail("Agents do not stake. March them for the earn.");
  }

  let breach = 1;
  if (siegeLive(actor, world.hour) && actor.siege.target === target.id) {
    actor.soldiers += actor.siege.men || 0;
    actor.siege = null;
    breach = 1.12;
  }
  const off = Math.floor(offense(actor) * breach);
  const defn = defense(target);
  const win = off > defn;
  const ratio = off / Math.max(1, defn);
  casualties(actor, win ? 0.06 : 0.12, world.rng, world.hour);
  casualties(target, win ? 0.07 : 0.04, world.rng, world.hour);
  actor.orders -= 1;
  actor.acted = true;
  actor.cooldown[target.id] = world.hour;
  target.grudge = actor.id;
  if (roadLive(actor, target.id, world.hour)) {
    delete actor.roads[target.id];
    log(world, `${actor.name} tears up the causeway toward ${target.name}.`);
  }

  let detail = "";
  if (win && mode === "seize") {
    const raw = Math.floor(target.land * 0.07 * Math.min(1.4, ratio) * Math.max(scale, 0.35));
    const moved = takeLand(target, raw, world.rng);
    actor.land += moved;
    const folk = Math.min(target.peasants, Math.floor(target.peasants * 0.05 * Math.max(scale, 0.35)));
    target.peasants -= folk;
    actor.peasants += folk;
    detail = `seized ${moved} acres`;
    const taken = takePlot(world, actor, target);
    if (taken) detail += ` and the ${taken} tile`;
    const penned = takeCaptives(actor, target);
    if (penned) detail += ` and penned ${penned}`;
  } else if (win && mode === "sack") {
    let g = Math.floor(target.gold * 0.14 * Math.max(scale, 0.35));
    let f = Math.floor(target.grain * 0.14 * Math.max(scale, 0.35));
    if ((target.sealUntil || 0) > (world.hour || 0)) f = Math.floor(f / 2);
    target.gold -= g;
    target.grain -= f;
    let scattered = "";
    if (foldLive(target, world.hour)) {
      const fleece = Math.min(target.grain, 90);
      target.grain -= fleece;
      f += fleece;
      target.fold = 0;
      target.foldUntil = 0;
      scattered = " and scattered the flock";
    }
    let burned = "";
    if (innUp(target, world.hour)) {
      const tap = Math.min(target.gold, 70);
      target.gold -= tap;
      g += tap;
      target.innUntil = 0;
      burned = " and burned the inn";
    }
    let torn = "";
    if (weirLive(target, world.hour)) {
      const catchGrain = Math.min(target.grain, 40);
      target.grain -= catchGrain;
      f += catchGrain;
      clearNets(target);
      torn = " and tore up the nets";
    }
    let logs = "";
    const yard = (target.plots || []).find((tile) => tile.crew === "timber");
    if (yard) {
      const pile = Math.min(target.gold, 50);
      target.gold -= pile;
      g += pile;
      yard.crew = "hand";
      logs = " and burned a timber yard";
    }
    let face = "";
    const pit = (target.plots || []).find((tile) => tile.crew === "quarry");
    if (pit) {
      const block = Math.min(target.gold, 45);
      target.gold -= block;
      g += block;
      pit.crew = "hand";
      face = " and collapsed a quarry";
    }
    let spoke = "";
    const wheel = (target.plots || []).find((tile) => tile.crew === "wheel");
    if (wheel) {
      const meal = Math.min(target.grain, 36);
      target.grain -= meal;
      f += meal;
      wheel.crew = "hand";
      spoke = " and broke the tide wheel";
    }
    let tower = "";
    const look = (target.plots || []).find((tile) => tile.crew === "look");
    if (look) {
      const watch = Math.min(target.gold, 30);
      target.gold -= watch;
      g += watch;
      look.crew = "hand";
      tower = " and toppled the lookout";
    }
    let stake = "";
    const paleTile = (target.plots || []).find((tile) => tile.crew === "pale");
    if (paleTile) {
      const post = Math.min(target.gold, 24);
      target.gold -= post;
      g += post;
      paleTile.crew = "hand";
      stake = " and broke a palisade stake";
    }
    let crust = "";
    const pan = (target.plots || []).find((tile) => tile.crew === "pan");
    if (pan) {
      const cake = Math.min(target.gold, 28);
      target.gold -= cake;
      g += cake;
      pan.crew = "hand";
      crust = " and spoiled a salt pan";
    }
    let ashes = "";
    const grove = (target.plots || []).find((tile) => tile.crew === "grove");
    if (grove) {
      const fruit = Math.min(target.grain, 34);
      target.grain -= fruit;
      f += fruit;
      grove.crew = "hand";
      ashes = " and burned a grove";
    }
    let smoked = "";
    const hive = (target.plots || []).find((tile) => tile.crew === "hive");
    if (hive) {
      const wax = Math.min(target.gold, 22);
      target.gold -= wax;
      g += wax;
      hive.crew = "hand";
      smoked = " and smoked the hive";
    }
    let scatteredWood = "";
    const drift = (target.plots || []).find((tile) => tile.crew === "drift");
    if (drift) {
      const boards = Math.min(target.gold, 20);
      target.gold -= boards;
      g += boards;
      drift.crew = "hand";
      scatteredWood = " and scattered the driftwood";
    }
    let trod = "";
    const vine = (target.plots || []).find((tile) => tile.crew === "vine");
    if (vine) {
      const cask = Math.min(target.gold, 26);
      target.gold -= cask;
      g += cask;
      vine.crew = "hand";
      trod = " and trod a vineyard";
    }
    let clapper = "";
    const bellTile = (target.plots || []).find((tile) => tile.crew === "bell");
    if (bellTile) {
      const toll = Math.min(target.gold, 20);
      target.gold -= toll;
      g += toll;
      bellTile.crew = "hand";
      clapper = " and silenced the bell";
    }
    let vanes = "";
    const sail = (target.plots || []).find((tile) => tile.crew === "sail");
    if (sail) {
      const flour = Math.min(target.gold, 40);
      target.gold -= flour;
      g += flour;
      sail.crew = "hand";
      vanes = " and toppled the sail";
    }
    let cracked = "";
    const well = (target.plots || []).find((tile) => tile.crew === "cistern");
    if (well) {
      const spilled = well.store || 0;
      f += spilled;
      well.store = 0;
      well.crew = "hand";
      cracked = " and cracked the cistern";
    }
    let quenched = "";
    const hearth = (target.plots || []).find((tile) => tile.crew === "char");
    if (hearth) {
      const ash = Math.min(target.gold, 32);
      target.gold -= ash;
      g += ash;
      hearth.crew = "hand";
      quenched = " and quenched the charcoal hearth";
    }
    let drowned = "";
    const reedBed = (target.plots || []).find((tile) => tile.crew === "reed");
    if (reedBed) {
      const thatch = Math.min(target.grain, 30);
      target.grain -= thatch;
      f += thatch;
      reedBed.crew = "hand";
      drowned = " and drowned a reed bed";
    }
    let spoiled = "";
    const maltFloor = (target.plots || []).find((tile) => tile.crew === "malt");
    if (maltFloor) {
      const mash = Math.min(target.gold, 24);
      target.gold -= mash;
      g += mash;
      maltFloor.crew = "hand";
      spoiled = " and spoiled the malt house";
    }
    let cote = "";
    const dovecote = (target.plots || []).find((tile) => tile.crew === "dove");
    if (dovecote) {
      const birds = Math.min(target.gold, 20);
      target.gold -= birds;
      g += birds;
      dovecote.crew = "hand";
      cote = " and toppled the dovecote";
    }
    let loaf = "";
    const oven = (target.plots || []).find((tile) => tile.crew === "oven");
    if (oven) {
      const crumb = Math.min(target.gold, 22);
      target.gold -= crumb;
      g += crumb;
      oven.crew = "hand";
      loaf = " and broke the bakehouse";
    }
    let hull = "";
    if (keelUp(target, world.hour)) {
      const plank = Math.min(target.gold, 55);
      target.gold -= plank;
      g += plank;
      clearKeel(target);
      hull = " and burned the keel";
    }
    actor.gold += g;
    actor.grain += f;
    detail = `sacked ${g} gold and ${f} grain${scattered}${burned}${torn}${logs}${face}${spoke}${tower}${stake}${crust}${ashes}${smoked}${scatteredWood}${trod}${clapper}${vanes}${cracked}${quenched}${drowned}${spoiled}${cote}${loaf}${hull}`;
    const penned = takeCaptives(actor, target);
    if (penned) detail += ` and penned ${penned}`;
  } else if (win && mode === "raze") {
    const rawHits = Math.max(1, Math.floor(buildingCount(target) * 0.06 * Math.max(scale, 0.35)));
    const hits = soakedHits(target, world.hour, rawHits);
    let n = 0;
    for (let i = 0; i < hits; i++) {
      const keys = Object.keys(target.buildings).filter((k) => target.buildings[k] > 0);
      if (!keys.length) break;
      const k = keys[Math.floor(world.rng.next() * keys.length)];
      target.buildings[k] -= 1;
      n += 1;
    }
    detail = n < 1 && leveeUp(target, world.hour) ? "meets the levee and razes nothing" : `razed ${n} buildings`;
    if (n > 0 && hits < rawHits) detail += ". The levee took one blow";
  } else {
    detail = "was thrown back";
  }
  if (breach > 1) detail += ". The siege works joined the assault";
  if (win && siegeLive(target, world.hour)) {
    target.siege = null;
    detail += " and broke the siege works";
  }

  let earned = 0;
  if (win && target.kind === "agent") earned = grantEarn(actor, EARN[mode], scale);

  if (target.kind === "human" && stake >= EARN.minStake) {
    const pot = stake * 2;
    const fee = Math.floor(pot * EARN.pvpFee);
    actor.utopia -= stake;
    target.utopia -= stake;
    const prize = pot - fee;
    const victor = win ? actor : target;
    victor.utopia += prize;
    notePurse(victor, "stake", prize - stake);
    world.burned += fee;
    detail += win
      ? `. Stake paid ${formatUtopia(prize)} $UTOPIA`
      : `. The defender keeps ${formatUtopia(prize)} $UTOPIA`;
  } else if (earned > 0) {
    detail += `. Earned ${formatUtopia(earned)} $UTOPIA`;
  }

  remember(actor, target, world.hour);
  if (win && (mode === "seize" || mode === "sack")) {
    const prize = claimBounty(world, actor, target);
    if (prize) detail += `. Collected a bounty of ${prize} gold`;
  }
  const verb = win ? "breaks" : "meets";
  log(world, `${actor.name} ${verb} ${target.name} and ${detail}. Offense ${off} against defense ${defn}.`);
  return { ok: true, message: detail, win };
}

function doSpell(world, actor, action) {
  const spec = SPELLS[action.spell];
  if (!spec) return fail("Unknown spell.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.mystics < 1) return fail("No mystics.");
  if (actor.aether < spec.cost) return fail(`Need ${spec.cost} aether.`);
  const target = action.target ? byId(world, action.target) : actor;
  if (action.spell === "meteor") {
    if (!target || target.id === actor.id) return fail("Meteor needs another province.");
    const scale = nwFactor(actor, target);
    if (scale <= 0) return fail("That province sits outside the fair band.");
    const power = actor.mystics * FACTIONS[actor.faction].mystic;
    const resist = target.mystics + target.buildings.spire * 0.6;
    const lands = power > resist * 0.85;
    actor.aether -= spec.cost;
    actor.orders -= 1;
    actor.acted = true;
    if (!lands) {
      log(world, `${actor.name} hurls a meteor at ${target.name}. The spires hold.`);
      return { ok: true, message: "The spires held.", win: false };
    }
    const hits = soakedHits(target, world.hour, Math.max(1, Math.floor(buildingCount(target) * 0.04 * Math.max(scale, 0.4))));
    for (let i = 0; i < hits; i++) {
      const keys = Object.keys(target.buildings).filter((k) => target.buildings[k] > 0);
      if (!keys.length) break;
      target.buildings[keys[Math.floor(world.rng.next() * keys.length)]] -= 1;
    }
    const dead = Math.min(target.peasants, Math.floor(target.peasants * 0.04));
    target.peasants -= dead;
    target.grudge = actor.id;
    const earned = target.kind === "agent" ? grantEarn(actor, EARN.meteor, scale) : 0;
    log(world, `${actor.name} meteors ${target.name}: ${hits} buildings, ${dead} peasants.${earned ? ` Earned ${formatUtopia(earned)} $UTOPIA.` : ""}`);
    return { ok: true, message: "Meteor landed.", win: true };
  }
  actor.aether -= spec.cost;
  actor.orders -= 1;
  actor.acted = true;
  if (action.spell === "blessing") {
    const gain = Math.floor(actor.buildings.field * 22);
    actor.grain += gain;
    log(world, `${actor.name} blesses the fields for ${gain} grain.`);
    return { ok: true, message: `+${gain} grain.` };
  }
  actor.spells[action.spell] = spec.hours;
  log(world, `${actor.name} casts ${spec.name}.`);
  return { ok: true, message: `${spec.name} holds for ${spec.hours} hours.` };
}

function doThief(world, actor, action) {
  const target = byId(world, action.target);
  if (!target || target.id === actor.id) return fail("Pick another province.");
  if (actor.orders < 1) return fail("No orders left this hour.");
  if (actor.thieves < 3) return fail("Need at least 3 thieves.");
  const scale = nwFactor(actor, target);
  if (action.op !== "scout" && scale <= 0) return fail("Outside the fair band.");
  const mine = thiefPower(actor);
  let theirs = thiefPower(target) + target.buildings.keep * 0.0008;
  if (beaconLit(target, world.hour)) theirs *= 1.18;
  actor.orders -= 1;
  actor.acted = true;
  if (action.op === "scout") {
    const ok = mine > theirs * 0.55 || world.rng.next() < 0.35;
    if (!ok) {
      actor.thieves = Math.max(0, actor.thieves - 1);
      log(world, `${actor.name} scouts ${target.name} and loses a thief.`);
      return { ok: true, message: "Scout failed.", win: false };
    }
    remember(actor, target, world.hour);
    log(world, `${actor.name} scouts ${target.name}. Defense ${defense(target)}, offense ${offense(target)}.`);
    return { ok: true, message: "Scout returned.", win: true };
  }
  if (action.op === "pilfer") {
    const ok = mine > theirs * 0.9;
    if (!ok) {
      const lost = Math.min(actor.thieves, 1 + Math.floor(world.rng.next() * 2));
      actor.thieves -= lost;
      log(world, `${actor.name} is caught in ${target.name}. ${lost} thieves lost.`);
      return { ok: true, message: "Caught.", win: false };
    }
    let g = Math.floor(target.gold * 0.09 * Math.max(scale, 0.4));
    if (curfewUp(target, world.hour)) g = Math.floor(g / 2);
    target.gold -= g;
    actor.gold += g;
    target.grudge = actor.id;
    const earned = target.kind === "agent" ? grantEarn(actor, EARN.pilfer, scale) : 0;
    log(world, `${actor.name} pilfers ${g} gold from ${target.name}.${earned ? ` Earned ${formatUtopia(earned)} $UTOPIA.` : ""}`);
    return { ok: true, message: `Pilfered ${g} gold.`, win: true };
  }
  if (action.op === "arson") {
    const ok = mine > theirs;
    if (!ok) {
      actor.thieves = Math.max(0, actor.thieves - 1);
      log(world, `${actor.name} fails to burn ${target.name}.`);
      return { ok: true, message: "Arson failed.", win: false };
    }
    const keys = Object.keys(target.buildings).filter((k) => target.buildings[k] > 0);
    let n = 0;
    const hits = soakedHits(target, world.hour, Math.max(1, Math.floor(2 * Math.max(scale, 0.4))));
    for (let i = 0; i < hits && keys.length; i++) {
      const live = Object.keys(target.buildings).filter((k) => target.buildings[k] > 0);
      if (!live.length) break;
      target.buildings[live[Math.floor(world.rng.next() * live.length)]] -= 1;
      n += 1;
    }
    target.grudge = actor.id;
    log(world, `${actor.name} burns ${n} buildings in ${target.name}.`);
    return { ok: true, message: `Burned ${n}.`, win: true };
  }
  return fail("Unknown thief op.");
}

function economy(world, p, hour) {
  const f = FACTIONS[p.faction];
  const season = seasonMod(hour || 0);
  const jobs = p.buildings.workshop * 8 + p.buildings.field * 4;
  const employed = Math.min(p.peasants, jobs);
  let goldIn = Math.floor(employed * 1.55 * f.gold + p.buildings.workshop * 3);
  let foodIn = Math.floor(p.buildings.field * 40 * f.food);
  if (p.studies && p.studies.kiln) goldIn = Math.floor(goldIn * 1.06);
  if (p.studies && p.studies.furrow) foodIn = Math.floor(foodIn * 1.08);
  if (p.doctrine === "granary") foodIn = Math.floor(foodIn * 1.08);
  if (p.marks && p.marks.mill) foodIn = Math.floor(foodIn * 1.1);
  if (p.relics && p.relics.kilnruin) goldIn = Math.floor(goldIn * 1.06);
  if (p.relics && p.relics.well) foodIn = Math.floor(foodIn * 1.06);
  goldIn = Math.floor(goldIn * season.gold);
  foodIn = Math.floor(foodIn * season.food);
  if (feastLive(p, hour)) goldIn = Math.floor(goldIn * 1.05);
  if (p.vein === "salt") goldIn = Math.floor(goldIn * 1.06);
  if (p.vein === "spring") foodIn = Math.floor(foodIn * 1.06);
  if (leveeUp(p, hour)) foodIn = Math.floor(foodIn * 1.04);
  for (const tile of p.plots || []) {
    const kind = terrainKind(tile.q, tile.r);
    if (tile.crew === "hand" && (kind === "grass" || kind === "plain" || kind === "coast")) foodIn += 4;
    else if (tile.crew === "hand" && kind === "wood") goldIn += 3;
    else if (tile.crew === "rider" && (kind === "plain" || kind === "grass" || kind === "coast")) goldIn += 6;
    else if (tile.crew === "engine" && (kind === "hill" || kind === "plain" || kind === "grass")) goldIn += 8;
    else if (tile.crew === "sapper" && (kind === "hill" || kind === "mount" || kind === "wood")) goldIn += 5;
    else if (tile.crew === "hamlet") {
      foodIn += 14;
      goldIn += 10;
    }
    else if (tile.crew === "timber") goldIn += 26;
    else if (tile.crew === "quarry") goldIn += 22;
    else if (tile.crew === "wheel") {
      foodIn += 28;
      goldIn += 12;
    }
    else if (tile.crew === "look") goldIn += 6;
    else if (tile.crew === "pale") goldIn += 4;
    else if (tile.crew === "pan") goldIn += 16;
    else if (tile.crew === "grove") {
      foodIn += 24;
      goldIn += 4;
    }
    else if (tile.crew === "hive") {
      foodIn += 8;
      goldIn += 6;
    }
    else if (tile.crew === "drift") goldIn += 5;
    else if (tile.crew === "vine") {
      foodIn += 6;
      goldIn += 14;
    }
    else if (tile.crew === "bell") goldIn += 5;
    else if (tile.crew === "reed") {
      foodIn += 20;
      goldIn += 6;
    }
    else if (tile.crew === "dove") {
      foodIn += 14;
      goldIn += 5;
    }
  }
  const groveCount = (p.plots || []).filter((tile) => tile.crew === "grove").length;
  if (groveCount && (p.plots || []).some((tile) => tile.crew === "hive")) foodIn += 10 * groveCount;
  const vineCount = (p.plots || []).filter((tile) => tile.crew === "vine").length;
  if (vineCount && (p.plots || []).some((tile) => tile.crew === "hive")) goldIn += 8 * vineCount;
  const reedCount = (p.plots || []).filter((tile) => tile.crew === "reed").length;
  if (reedCount && tideWheels(p) > 0) foodIn += 8 * reedCount;
  if ((p.plots || []).some((tile) => tile.crew === "dove") && (p.plots || []).some((tile) => tile.crew === "bell")) foodIn += 8;
  for (const colony of p.colonies || []) {
    if (!colony.port) continue;
    const hold = blockadeAt(world, p, colony);
    if (colony.wharf) goldIn += 8;
    if (colony.cooper) goldIn += 10;
    if (colony.rope) goldIn += 6;
    if (colony.smoke) goldIn += 4;
    if (colony.monger) goldIn += 3;
    if (colony.pilot) goldIn += 5;
    if (!hold || (colony.slipUntil || 0) > hour) {
      let fish = 12;
      if ((colony.quayUntil || 0) > hour && (colony.quay || 0) > 0) fish += 6;
      if (colony.smoke) {
        const room = Math.max(0, 48 - (colony.cured || 0));
        const cure = Math.min(8, fish, room);
        colony.cured = (colony.cured || 0) + cure;
        fish -= cure;
      }
      if (colony.monger) {
        const sold = Math.min(8, Math.max(0, (colony.cured || 0) - 16));
        if (sold > 0) {
          colony.cured -= sold;
          goldIn += sold * 3;
          log(world, `${p.name} sells ${sold} cured fish at ${colony.name}.`);
        }
      }
      foodIn += fish;
      if (hold) log(world, `${p.name} slips the boom at ${colony.name}. The quay lands its fish.`);
      continue;
    }
    const skim = Math.min(p.gold, 18);
    p.gold -= skim;
    hold.realm.gold += skim;
    let ration = "";
    if (colony.smoke && (colony.cured || 0) > 0) {
      const feed = Math.min(12, colony.cured);
      colony.cured -= feed;
      foodIn += feed;
      ration = ` The smokehouse feeds ${feed} grain.`;
    }
    log(world, `${hold.realm.name} holds ${colony.name} closed. The quay lands no fish${skim ? ` and ${skim} gold is taken` : ""}.${ration}`);
  }
  for (const colony of p.colonies || []) {
    if (!colony.port || (colony.duesUntil || 0) <= hour) continue;
    for (const other of world.provinces || []) {
      if (!other || other.id === p.id) continue;
      for (const ship of other.ships || []) {
        if (hexDist(ship.q, ship.r, colony.q, colony.r) > 2) continue;
        const due = Math.min(other.gold || 0, 12);
        if (!due) continue;
        other.gold -= due;
        p.gold += due;
        const spec = NAVY[ship.kind];
        log(world, `${p.name} takes ${due} gold in harbor dues from ${other.name}'s ${spec ? spec.name : "hull"} at ${colony.name}.`);
      }
    }
  }
  for (const ship of p.ships || []) {
    const spec = NAVY[ship.kind];
    if (!spec) continue;
    const wet = terrainKind(ship.q, ship.r);
    if (wet !== "sea" && wet !== "coast" && wet !== "river") continue;
    foodIn += spec.fish || 0;
    goldIn += spec.haul || 0;
    if (convoyNear(p, ship)) {
      foodIn += Math.ceil((spec.fish || 0) / 2);
      goldIn += Math.floor((spec.haul || 0) / 2) + 4;
    }
    if (leeCover(p, ship, hour)) goldIn += 6;
  }
  const foodOut = foodNeed(p);
  p.gold += goldIn;
  p.grain += foodIn - foodOut;
  if (foldLive(p, hour)) {
    p.gold += 22;
    p.grain += 48;
  }
  if (innUp(p, hour)) p.gold += innToll(p, hour);
  if (weirLive(p, hour)) {
    const catchTaken = weirYield(p, hour);
    p.gold += catchTaken.gold;
    p.grain += catchTaken.grain;
  }
  if (keelUp(p, hour)) {
    const catchTaken = keelHaul(p, hour);
    p.gold += catchTaken.gold;
    p.grain += catchTaken.grain;
  }
  tendCistern(p);
  if (p.grain < 0) {
    const die = Math.min(p.peasants, Math.max(1, Math.ceil(-p.grain / 4)));
    p.peasants -= die;
    p.grain = 0;
  }
  grindSail(p);
  pressVines(world, p);
  burnChar(world, p);
  maltHouse(world, p);
  bakeHouse(world, p);
  feedCaptives(p);
  p.aether += Math.floor(p.buildings.spire * 6 * f.aether);
  if (p.studies && p.studies.rite) p.aether += 6;
  const cap = p.buildings.hearth * 16;
  if (p.peasants < cap && p.grain > foodOut * 2) {
    let grow = Math.max(1, Math.floor(p.peasants * 0.035));
    if (p.relics && p.relics.orchard) grow += 2;
    if (feastLive(p, hour)) grow += 6;
    p.peasants = Math.min(cap, p.peasants + grow);
  } else if (feastLive(p, hour) && p.peasants < cap && p.grain > foodOut) {
    p.peasants = Math.min(cap, p.peasants + 4);
  }
  if (hospiceUp(p, hour) && p.peasants < cap && p.grain > foodOut) {
    p.peasants = Math.min(cap, p.peasants + 3);
  }
  if (p.mystics < mysticCap(p)) p.mystics += 1;
  for (const k of Object.keys(p.spells)) {
    if (p.spells[k] > 0) p.spells[k] -= 1;
  }
  if (p.acted && p.kind === "human") {
    let pay = EARN.hourActive + (p.studies && p.studies.ledger ? EARN.ledger : 0) + (p.doctrine === "mint" ? 10 : 0);
    if (p.relics && p.relics.stacks) pay += 8;
    p.utopia += pay;
    notePurse(p, "hour", pay - (p.relics && p.relics.stacks ? 8 : 0));
    if (p.relics && p.relics.stacks) notePurse(p, "relic", 8);
  }
  p.acted = false;
  p.orders = ORDERS;
  p.earnLeft = EARN.combatCap;
}

export function advanceHour(world) {
  pressMoles(world);
  for (const p of world.provinces) economy(world, p, world.hour || 0);
  pressSieges(world);
  for (const p of world.provinces) {
    if (!beaconLit(p, world.hour || 0)) continue;
    const sweep = watchSweep(world, p);
    if (sweep.fresh > 0 && p.kind === "human") log(world, `${p.name}'s watch fire reads ${sweep.fresh} new camps.`);
  }
  for (const p of world.provinces) spotLookout(world, p);
  const prevSeason = seasonName(world.hour);
  world.hour += 1;
  for (const p of world.provinces) settleMuster(p, world.hour);
  for (const p of world.provinces) settlePatrol(p, world.hour);
  for (const p of world.provinces) settleQuay(p, world.hour);
  for (const p of world.provinces) settleVein(p, world.hour);
  for (const p of world.provinces) settleSmith(p, world.hour);
  for (const p of world.provinces) settleSeal(p, world.hour);
  for (const p of world.provinces) settleLevee(p, world.hour);
  for (const p of world.provinces) settleRoads(p, world.hour);
  for (const p of world.provinces) settleFold(p, world.hour);
  for (const p of world.provinces) settleCurfew(p, world.hour);
  for (const p of world.provinces) settleHospice(p, world.hour);
  for (const p of world.provinces) settleInn(p, world.hour);
  for (const p of world.provinces) settleWeir(p, world.hour);
  for (const p of world.provinces) settleKeel(p, world.hour);
  for (const p of world.provinces) settleSiege(p, world.hour);
  expireBounties(world);
  pressBands(world);
  sailHour(world);
  if (world.hour % 3 === 0) {
    let grown = 0;
    for (const p of world.provinces) {
      if (p.kind === "agent" && growRival(world, p)) grown += 1;
    }
    if (grown) log(world, `${grown} wild holdings push their fences.`);
  }
  if (seasonName(world.hour) !== prevSeason) log(world, `${seasonName(world.hour)} comes across the realm.`);
  const agents = world.provinces.filter((p) => p.kind === "agent");
  for (const agent of agents) {
    for (let i = 0; i < ORDERS; i++) {
      const action = chooseAction(world, agent);
      if (!action) break;
      const res = applyAction(world, agent.id, action);
      if (!res.ok) break;
    }
  }
  log(world, `Hour ${world.hour} closes.`);
  return world;
}

function weakestWin(world, agent, pred) {
  const rows = world.provinces.filter((p) => p.id !== agent.id && nwFactor(agent, p) > 0 && !onCooldown(agent, p, world.hour) && pred(p));
  rows.sort((a, b) => defense(a) - defense(b));
  return rows[0] || null;
}

function trainBias(agent) {
  if (agent.soldiers < 40 && agent.peasants > 30 && agent.gold > 45) return { type: "train", unit: "soldier", count: 10 };
  if (agent.persona === "quill" && agent.thieves < thiefCap(agent) && agent.soldiers > 15 && agent.gold > 130) {
    return { type: "train", unit: "thief", count: 2 };
  }
  if (agent.elites < eliteCap(agent) && agent.soldiers > 20 && agent.gold > 160) return { type: "train", unit: "elite", count: 2 };
  return null;
}

function buildIf(agent, key) {
  const spec = BUILDINGS[key];
  if (freeLand(agent) < 1) return null;
  if (agent.gold < spec.cost(agent.buildings[key]) + 400) return null;
  return { type: "build", building: key };
}

function nearestOpenSite(world, agent) {
  if (!Number.isFinite(agent.x) || !Number.isFinite(agent.y)) return null;
  if ((agent.soldiers || 0) < 18) return null;
  let best = null;
  let bestD = 980;
  for (const site of world.sites || []) {
    if (site.clearedBy) continue;
    const d = Math.hypot(agent.x - site.x, agent.y - site.y);
    if (d < bestD) {
      best = site;
      bestD = d;
    }
  }
  return best;
}

export function chooseAction(world, agent) {
  const rng = world.rng;
  const camped = world.provinces.find((p) => siegeLive(p, world.hour) && p.siege.target === agent.id);
  if (camped && agent.orders >= 1 && agent.soldiers >= 8 && defense(agent) >= camped.siege.men * 14 + 30 && rng.next() < 0.6) {
    return { type: "sally", target: camped.id };
  }
  const penned = Object.entries(agent.pens || {}).find((row) => row[1] > 0);
  if (penned && agent.orders >= 1) {
    const held = byId(world, penned[0]);
    if (held && held.gold >= 20) return { type: "ransom", target: held.id };
    if (held) return { type: "release", target: held.id };
  }
  if (agent.persona === "harrow" && !(agent.plots || []).some((tile) => tile.crew === "look") && (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && stoneTile(tile)) && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.1) {
    return { type: "look" };
  }
  if (agent.persona === "harrow" && !(agent.smithUntil > world.hour) && agent.gold >= 500 && agent.soldiers >= 40 && agent.orders >= 1 && rng.next() < 0.16) {
    return { type: "smith" };
  }
  if (agent.persona === "harrow" && !(agent.muster > 0) && agent.peasants >= 60 && agent.gold >= 120 && agent.soldiers < 80 && agent.orders >= 1 && rng.next() < 0.22) {
    return { type: "muster" };
  }
  if ((agent.persona === "sable" || agent.persona === "moss") && !beaconLit(agent, world.hour) && agent.orders >= 1 && agent.gold >= 160 && agent.grain >= 80 && rng.next() < 0.2) {
    return { type: "beacon" };
  }
  if (agent.persona === "sable" && (agent.plots || []).filter((tile) => tile.crew === "pale").length < 3 && (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && plotEdge(agent, tile)) && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.12) {
    return { type: "pale" };
  }
  if (agent.persona === "sable" && !curfewUp(agent, world.hour) && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.14) {
    return { type: "curfew" };
  }
  const site = nearestOpenSite(world, agent);
  if (site && rng.next() < 0.18) return { type: "clear", site: site.id };
  if (agent.persona === "harrow" && agent.orders >= 1) {
    const [ax, ay] = seatPoint(agent);
    const camp = (world.bands || []).find((band) => bandUp(band, world.hour) && Math.hypot(ax - band.x, ay - band.y) < 1400 && offense(agent) >= band.men * 12);
    if (camp && rng.next() < 0.2) return { type: "ride", band: camp.id };
  }
  if (agent.persona === "harrow") {
    if (siegeLive(agent, world.hour)) return trainBias(agent) || buildIf(agent, "barracks") || buildIf(agent, "field");
    const marked = weakestWin(world, agent, (p) => bountyOn(world, p.id, world.hour) && defense(p) < offense(agent) * 1.05);
    if (marked && rng.next() < 0.85) return { type: "attack", target: marked.id, mode: "seize" };
    const camp = weakestWin(world, agent, (p) => defense(p) < offense(agent) * 1.2 && defense(p) > offense(agent) * 0.55);
    if (camp && agent.soldiers >= 18 && agent.gold >= 260 && rng.next() < 0.42) return { type: "siege", target: camp.id };
    const prey = weakestWin(world, agent, (p) => defense(p) < offense(agent) * 0.98);
    if (prey && rng.next() < 0.8) return { type: "attack", target: prey.id, mode: "seize" };
    return trainBias(agent) || buildIf(agent, "barracks") || buildIf(agent, "field");
  }
  if (agent.persona === "sable") {
    const belled = (agent.plots || []).some((tile) => tile.crew === "bell");
    const bellField = (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && fieldGround(tile));
    if (!belled && bellField && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.1) return { type: "bell" };
    if (!patrolUp(agent, world.hour) && agent.soldiers >= 40 && agent.gold >= 500 && agent.orders >= 1) {
      const [ax, ay] = seatPoint(agent);
      const near = (world.bands || []).some((band) => bandUp(band, world.hour) && Math.hypot(ax - band.x, ay - band.y) < 1600);
      if (near && rng.next() < 0.12) return { type: "patrol" };
    }
    const ownsStone = (agent.plots || []).some((tile) => tile.crew === "hand" && (terrainKind(tile.q, tile.r) === "hill" || terrainKind(tile.q, tile.r) === "mount"));
    if (quarryPits(agent) < 2 && ownsStone && agent.gold >= 500 && agent.orders >= 1 && rng.next() < 0.18) return { type: "quarry" };
    if (siegeLive(agent, world.hour)) {
      if (agent.aether > 70 && agent.spells.bulwark <= 0 && agent.mystics > 0 && agent.orders > 0 && rng.next() < 0.4) {
        return { type: "spell", spell: "bulwark" };
      }
      return buildIf(agent, "keep") || trainBias(agent) || buildIf(agent, "barracks");
    }
    if (agent.grudge) {
      const foe = byId(world, agent.grudge);
      if (foe && nwFactor(agent, foe) > 0 && !onCooldown(agent, foe, world.hour) && offense(agent) > defense(foe) * 0.9) {
        agent.grudge = null;
        return { type: "attack", target: foe.id, mode: "seize" };
      }
      if (foe && nwFactor(agent, foe) > 0 && !onCooldown(agent, foe, world.hour) && agent.soldiers >= 18 && agent.gold >= 260 && offense(agent) > defense(foe) * 0.62 && rng.next() < 0.45) {
        return { type: "siege", target: foe.id };
      }
    }
    if (agent.aether > 70 && agent.spells.bulwark <= 0 && agent.mystics > 0 && agent.orders > 0 && rng.next() < 0.4) {
      return { type: "spell", spell: "bulwark" };
    }
    return buildIf(agent, "keep") || trainBias(agent) || buildIf(agent, "barracks");
  }
  if (agent.persona === "vellum") {
    if (agent.spells.bulwark <= 0 && agent.aether > 80 && agent.mystics > 0) return { type: "spell", spell: "bulwark" };
    const prey = weakestWin(world, agent, (p) => p.mystics + p.buildings.spire < agent.mystics);
    if (prey && agent.aether > 100 && rng.next() < 0.65) return { type: "spell", spell: "meteor", target: prey.id };
    return buildIf(agent, "spire") || buildIf(agent, "chapel") || buildIf(agent, "field");
  }
  if (agent.persona === "quill") {
    if (agent.gold >= 900 && agent.orders >= 1 && rng.next() < 0.12) {
      const mark = world.provinces
        .filter((p) => p.id !== agent.id && !bountyOn(world, p.id, world.hour) && p.gold > 4000)
        .sort((a, b) => b.gold - a.gold)[0];
      if (mark) return { type: "bounty", target: mark.id };
    }
    const rich = world.provinces
      .filter((p) => p.id !== agent.id && nwFactor(agent, p) > 0)
      .sort((a, b) => b.gold - a.gold)[0];
    if (rich && agent.thieves >= 6 && rng.next() < 0.7) return { type: "thief", op: "pilfer", target: rich.id };
    if (rich && agent.thieves >= 3 && rng.next() < 0.5) return { type: "thief", op: "scout", target: rich.id };
    return trainBias(agent) || buildIf(agent, "den");
  }
  if (agent.persona === "brine") {
    if (!innUp(agent, world.hour) && agent.gold >= 700 && agent.grain >= 900 && agent.orders >= 1 && rng.next() < 0.12) {
      return { type: "inn" };
    }
    if (!weirLive(agent, world.hour) && (agent.plots || []).some((tile) => tile.crew !== "lot" && waterTouch(tile)) && agent.gold >= 400 && agent.peasants >= 40 && agent.orders >= 1 && rng.next() < 0.16) {
      return { type: "weir" };
    }
    if (!keelUp(agent, world.hour) && (agent.plots || []).some((tile) => tile.crew !== "lot" && waterTouch(tile)) && agent.soldiers >= 20 && agent.gold >= 500 && agent.orders >= 1 && rng.next() < 0.12) {
      return { type: "keel" };
    }
    const closed = (agent.colonies || []).find((colony) => colony.port && (colony.slipUntil || 0) <= (world.hour || 0) && blockadeAt(world, agent, colony));
    const runner = closed && (agent.ships || []).find((row) => hullTeeth(row.kind) < WAR_TEETH && hexDist(row.q, row.r, closed.q, closed.r) <= 2);
    if (closed && runner && agent.orders >= 1 && rng.next() < 0.35) {
      return { type: "slip", ship: runner.id, colony: closed.id };
    }
    const leePort = (agent.colonies || []).find((colony) => colony.port && (colony.leeUntil || 0) <= (world.hour || 0) && world.provinces.some((other) => other.id !== agent.id && (other.ships || []).some((ship) => hullTeeth(ship.kind) >= WAR_TEETH && hexDist(ship.q, ship.r, colony.q, colony.r) <= 8)));
    if (leePort && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.16) {
      return { type: "lee", colony: leePort.id };
    }
    const quayPort = (agent.colonies || []).find((colony) => colony.port && (colony.quayUntil || 0) <= (world.hour || 0) && (agent.soldiers || 0) >= 8 && agent.gold >= 300 && world.provinces.some((other) => other.id !== agent.id && (other.ships || []).some((ship) => hullTeeth(ship.kind) >= WAR_TEETH && hexDist(ship.q, ship.r, colony.q, colony.r) <= 8)));
    if (quayPort && agent.orders >= 1 && rng.next() < 0.14) return { type: "quay", colony: quayPort.id };
    const duesPort = (agent.colonies || []).find((colony) => colony.port && (colony.duesUntil || 0) <= (world.hour || 0) && agent.gold >= 400 && world.provinces.some((other) => other.id !== agent.id && (other.ships || []).some((ship) => hexDist(ship.q, ship.r, colony.q, colony.r) <= 6)));
    if (duesPort && agent.orders >= 1 && rng.next() < 0.12) return { type: "dues", colony: duesPort.id };
    const lampPort = (agent.colonies || []).find((colony) => colony.port && (colony.lampUntil || 0) <= (world.hour || 0) && agent.gold >= 500 && world.provinces.some((other) => other.id !== agent.id && (other.ships || []).some((ship) => hullTeeth(ship.kind) >= WAR_TEETH && hexDist(ship.q, ship.r, colony.q, colony.r) <= 8)));
    if (lampPort && agent.orders >= 1 && rng.next() < 0.12) return { type: "lamp", colony: lampPort.id };
    const chainPort = (agent.colonies || []).find((colony) => colony.port && (colony.chainUntil || 0) <= (world.hour || 0) && agent.gold >= 520 && world.provinces.some((other) => other.id !== agent.id && (other.ships || []).some((ship) => hexDist(ship.q, ship.r, colony.q, colony.r) <= 2)));
    if (chainPort && agent.orders >= 1 && rng.next() < 0.14) return { type: "chain", colony: chainPort.id };
    const ferryLive = (agent.ferries || []).some((row) => (row.until || 0) > (world.hour || 0));
    if (!ferryLive && ferryPair(agent) && agent.gold >= 600 && agent.orders >= 1 && rng.next() < 0.1) return { type: "ferry" };
    const cooperPort = (agent.colonies || []).find((colony) => colony.port && !colony.cooper);
    if (cooperPort && agent.gold >= 500 && agent.orders >= 1 && rng.next() < 0.1) return { type: "cooper", colony: cooperPort.id };
    const ropePort = (agent.colonies || []).find((colony) => colony.port && !colony.rope);
    if (ropePort && agent.gold >= 450 && agent.orders >= 1 && rng.next() < 0.1) return { type: "rope", colony: ropePort.id };
    const smokePort = (agent.colonies || []).find((colony) => colony.port && !colony.smoke);
    if (smokePort && agent.gold >= 480 && agent.orders >= 1 && rng.next() < 0.1) return { type: "smoke", colony: smokePort.id };
    const mongerPort = (agent.colonies || []).find((colony) => colony.port && colony.smoke && !colony.monger);
    if (mongerPort && agent.gold >= 520 && agent.orders >= 1 && rng.next() < 0.1) return { type: "monger", colony: mongerPort.id };
    const pilotPort = (agent.colonies || []).find((colony) => colony.port && !colony.pilot && world.provinces.some((other) => other.id !== agent.id && (other.colonies || []).some((row) => row.port && (row.lampUntil || 0) > (world.hour || 0))));
    if (pilotPort && agent.gold >= 480 && agent.orders >= 1 && rng.next() < 0.12) return { type: "pilot", colony: pilotPort.id };
    const pans = (agent.plots || []).filter((tile) => tile.crew === "pan").length;
    const brineWet = (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && saltGround(tile));
    if (pans < 2 && brineWet && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.1) return { type: "pan" };
    const threatened = (agent.colonies || []).find((colony) => colony.port && (colony.moleUntil || 0) <= (world.hour || 0) && world.provinces.some((other) => other.id !== agent.id && (other.ships || []).some((ship) => hexDist(ship.q, ship.r, colony.q, colony.r) <= 6)));
    if (threatened && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.2) {
      return { type: "mole", colony: threatened.id };
    }
    const guard = (agent.ships || []).find((row) => hullTeeth(row.kind) >= WAR_TEETH && !row.prey && !row.block && !row.salvage && !row.escort);
    const trader = guard && (agent.ships || []).find((row) => row.id !== guard.id && hullTeeth(row.kind) < WAR_TEETH);
    if (guard && trader && agent.orders >= 1 && rng.next() < 0.16) {
      return { type: "convoy", ship: guard.id, hull: trader.id };
    }
    const tower = (agent.ships || []).find((row) => !row.prey && !row.block && !row.salvage && !row.escort && !row.tow);
    const yard = (agent.colonies || []).find((row) => row.port && row.wharf);
    const towWreck = tower && yard && (world.wrecks || []).find((row) => (row.until || 0) > (world.hour || 0) && hexDist(tower.q, tower.r, row.q, row.r) <= 12 && hexDist(row.q, row.r, yard.q, yard.r) > 3);
    if (tower && towWreck && agent.orders >= 1 && rng.next() < 0.14) {
      return { type: "tow", ship: tower.id, q: towWreck.q, r: towWreck.r };
    }
    const layer = (agent.ships || []).find((row) => hullTeeth(row.kind) < WAR_TEETH && !row.tow && !row.salvage && sailKind(terrainKind(row.q, row.r)));
    const liveNets = (agent.nets || []).filter((row) => (row.until || 0) > (world.hour || 0));
    const nearFoe = layer && world.provinces.some((other) => other.id !== agent.id && (other.ships || []).some((ship) => hexDist(ship.q, ship.r, layer.q, layer.r) <= 3));
    const netHere = layer && liveNets.some((row) => row.q === layer.q && row.r === layer.r);
    if (layer && nearFoe && !netHere && liveNets.length < 3 && agent.orders >= 1 && rng.next() < 0.15) {
      return { type: "net", ship: layer.id };
    }
    const marker = (agent.ships || []).find((row) => sailKind(terrainKind(row.q, row.r)));
    const liveBuoys = (agent.buoys || []).filter((row) => (row.until || 0) > (world.hour || 0));
    const buoyHere = marker && liveBuoys.some((row) => row.q === marker.q && row.r === marker.r);
    if (marker && !buoyHere && liveBuoys.length < 2 && agent.orders >= 1 && rng.next() < 0.12) {
      return { type: "buoy", ship: marker.id };
    }
    const packet = (agent.ships || []).find((row) => hullTeeth(row.kind) < WAR_TEETH && !row.prey && !row.block && !row.salvage && !row.escort && !row.tow && !row.cargo);
    const quay = packet && (agent.colonies || []).find((row) => row.port && hexDist(packet.q, packet.r, row.q, row.r) > 3);
    if (packet && quay && agent.orders >= 1 && rng.next() < 0.14) {
      return { type: "cargo", ship: packet.id, colony: quay.id };
    }
    const salvor = (agent.ships || []).find((row) => !row.prey && !row.block && !row.salvage && !row.escort && !row.tow);
    const wreck = salvor && (world.wrecks || []).find((row) => (row.until || 0) > (world.hour || 0) && hexDist(salvor.q, salvor.r, row.q, row.r) <= 12);
    if (salvor && wreck && agent.orders >= 1 && rng.next() < 0.22) {
      return { type: "salvage", ship: salvor.id, q: wreck.q, r: wreck.r };
    }
    const hunter = (agent.ships || []).find((row) => hullTeeth(row.kind) >= WAR_TEETH && !row.prey && !row.block && !row.escort && !row.cut && !row.raid);
    if (hunter && !hunter.raid && agent.orders >= 1 && ((hunter.marines || 0) >= 6 || (agent.soldiers || 0) >= 6) && rng.next() < 0.16) {
      const boarded = (hunter.marines || 0) >= 6 || (agent.colonies || []).some((colony) => colony.port && hexDist(hunter.q, hunter.r, colony.q, colony.r) <= 2);
      let port = null;
      let portD = 14;
      if (boarded) {
        for (const other of world.provinces) {
          if (other.id === agent.id) continue;
          for (const colony of other.colonies || []) {
            if (!colony.port) continue;
            const dist = hexDist(hunter.q, hunter.r, colony.q, colony.r);
            if (dist < portD) {
              portD = dist;
              port = { owner: other.id, id: colony.id };
            }
          }
        }
      }
      if (port) return { type: "raid", ship: hunter.id, owner: port.owner, colony: port.id };
    }
    if (hunter && !hunter.block && agent.orders >= 1 && rng.next() < 0.18) {
      let port = null;
      let portD = 14;
      for (const other of world.provinces) {
        if (other.id === agent.id) continue;
        for (const colony of other.colonies || []) {
          if (!colony.port) continue;
          const dist = hexDist(hunter.q, hunter.r, colony.q, colony.r);
          if (dist < portD) {
            portD = dist;
            port = { owner: other.id, id: colony.id };
          }
        }
      }
      if (port) return { type: "blockade", ship: hunter.id, owner: port.owner, colony: port.id };
    }
    if (hunter && (agent.ships || []).length < 6 && agent.orders >= 1 && rng.next() < 0.2) {
      let prize = null;
      let prizeD = 16;
      for (const other of world.provinces) {
        if (other.id === agent.id) continue;
        for (const ship of other.ships || []) {
          if (hullTeeth(ship.kind) >= hullTeeth(hunter.kind)) continue;
          const dist = hexDist(hunter.q, hunter.r, ship.q, ship.r);
          if (dist < prizeD) {
            prizeD = dist;
            prize = { owner: other.id, id: ship.id };
          }
        }
      }
      if (prize) return { type: "cut", ship: hunter.id, owner: prize.owner, hull: prize.id };
    }
    if (hunter && agent.orders >= 1 && rng.next() < 0.28) {
      let best = null;
      let bestD = 18;
      for (const other of world.provinces) {
        if (other.id === agent.id) continue;
        for (const ship of other.ships || []) {
          const dist = hexDist(hunter.q, hunter.r, ship.q, ship.r);
          if (dist < bestD) {
            bestD = dist;
            best = { owner: other.id, id: ship.id };
          }
        }
      }
      if (best) return { type: "grapple", ship: hunter.id, owner: best.owner, hull: best.id };
    }
    if ((agent.colonies || []).some((row) => row.port) && !(agent.ships || []).some((row) => hullTeeth(row.kind) >= WAR_TEETH) && agent.gold >= NAVY.galley.gold + 600 && agent.orders >= 1 && rng.next() < 0.1) {
      return { type: "hull", hull: "galley" };
    }
    if (!agent.vein && agent.gold >= 800 && agent.orders >= 1 && rng.next() < 0.14) return { type: "prospect" };
    if (!(agent.sealUntil > world.hour) && agent.grain >= 4000 && agent.gold >= 200 && agent.orders >= 1 && rng.next() < 0.12) return { type: "seal" };
    if (agent.gold >= 1400 && agent.orders >= 1 && rng.next() < 0.1) {
      const paved = world.provinces
        .filter((p) => p.id !== agent.id && !roadLive(agent, p.id, world.hour))
        .sort((a, b) => b.land - a.land)[0];
      if (paved) return { type: "road", target: paved.id };
    }
    const quote = stallQuote(world.hour);
    if (agent.grain >= quote.grain + quote.keep + 800 && agent.orders >= 1 && rng.next() < 0.28) {
      return { type: "stall", mode: "sell" };
    }
    const fat = world.provinces
      .filter((p) => p.id !== agent.id && nwFactor(agent, p) > 0 && !onCooldown(agent, p, world.hour) && p.gold > 6000 && defense(p) < offense(agent))
      .sort((a, b) => b.gold - a.gold)[0];
    if (fat && rng.next() < 0.55) return { type: "attack", target: fat.id, mode: "sack" };
    return buildIf(agent, "workshop") || buildIf(agent, "field") || trainBias(agent);
  }
  if (agent.persona === "moss") {
    const quote = stallQuote(world.hour);
    if (agent.grain < foodNeed(agent) && agent.gold >= quote.buy && agent.orders >= 1 && rng.next() < 0.35) {
      return { type: "stall", mode: "buy" };
    }
    if (!feastLive(agent, world.hour) && agent.grain >= 3500 && agent.gold >= 300 && agent.orders >= 1 && rng.next() < 0.16) {
      return { type: "feast" };
    }
    if (!leveeUp(agent, world.hour) && agent.gold >= 500 && agent.orders >= 1 && rng.next() < 0.12) {
      return { type: "levee" };
    }
    if (!foldLive(agent, world.hour) && agent.peasants >= 80 && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.14) {
      return { type: "fold" };
    }
    if (!hospiceUp(agent, world.hour) && agent.gold >= 500 && agent.grain >= 800 && agent.orders >= 1 && rng.next() < 0.12) {
      return { type: "hospice" };
    }
    const welled = (agent.plots || []).some((tile) => tile.crew === "cistern");
    const wellLot = (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && wellGround(tile));
    if (!welled && wellLot && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.1) return { type: "cistern" };
    const sailed = (agent.plots || []).some((tile) => tile.crew === "sail");
    const hillLot = (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && terrainKind(tile.q, tile.r) === "hill");
    if (!sailed && hillLot && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.12) return { type: "sail" };
    const vines = (agent.plots || []).filter((tile) => tile.crew === "vine").length;
    if (vines < 2 && hillLot && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.12) return { type: "vine" };
    const groves = (agent.plots || []).filter((tile) => tile.crew === "grove").length;
    const field = (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && fieldGround(tile));
    if (groves < 2 && field && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.1) return { type: "grove" };
    const hived = (agent.plots || []).some((tile) => tile.crew === "hive");
    if (!hived && groves > 0 && field && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.12) return { type: "hive" };
    const drifted = (agent.plots || []).some((tile) => tile.crew === "drift");
    const shoreLot = (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && waterTouch(tile));
    if (!drifted && shoreLot && agent.gold >= 420 && agent.orders >= 1 && rng.next() < 0.1) return { type: "drift" };
    const wheels = tideWheels(agent);
    const wetLot = (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && waterTouch(tile));
    if (wheels < 1 && wetLot && agent.gold >= 500 && agent.orders >= 1 && rng.next() < 0.12) return { type: "wheel" };
    const hamlets = (agent.plots || []).filter((tile) => tile.crew === "hamlet").length;
    if (hamlets < 2 && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.18) return { type: "hamlet" };
    const yards = timberYards(agent);
    const woods = (agent.plots || []).some((tile) => tile.crew === "hand" && terrainKind(tile.q, tile.r) === "wood");
    if (yards < 2 && woods && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.16) return { type: "timber" };
    const charred = (agent.plots || []).some((tile) => tile.crew === "char");
    const woodLot = (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && terrainKind(tile.q, tile.r) === "wood");
    if (!charred && woodLot && agent.gold >= 450 && agent.orders >= 1 && rng.next() < 0.1) return { type: "char" };
    const reeds = (agent.plots || []).filter((tile) => tile.crew === "reed").length;
    const marshLot = (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && terrainKind(tile.q, tile.r) === "marsh");
    if (reeds < 2 && marshLot && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.1) return { type: "reed" };
    const malted = (agent.plots || []).some((tile) => tile.crew === "malt");
    const flatLot = (agent.plots || []).some((tile) => (tile.crew === "hand" || tile.crew === "lot") && !tile.structure && (terrainKind(tile.q, tile.r) === "grass" || terrainKind(tile.q, tile.r) === "plain"));
    if (!malted && flatLot && agent.gold >= 420 && agent.orders >= 1 && rng.next() < 0.1) return { type: "malt" };
    const coted = (agent.plots || []).some((tile) => tile.crew === "dove");
    if (!coted && flatLot && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.1) return { type: "dove" };
    const baked = (agent.plots || []).some((tile) => tile.crew === "oven");
    if (!baked && flatLot && agent.gold >= 450 && agent.orders >= 1 && rng.next() < 0.08) return { type: "oven" };
    const pits = quarryPits(agent);
    const stone = (agent.plots || []).some((tile) => tile.crew === "hand" && (terrainKind(tile.q, tile.r) === "hill" || terrainKind(tile.q, tile.r) === "mount"));
    if (pits < 1 && stone && agent.gold >= 400 && agent.orders >= 1 && rng.next() < 0.14) return { type: "quarry" };
    const hungry = world.provinces.find((p) => p.id !== agent.id && p.grain < foodNeed(p) && !(agent.reliefs && agent.reliefs[p.id] > (world.hour || 0)));
    if (hungry && agent.grain >= 1200 && agent.orders >= 1 && rng.next() < 0.22) return { type: "relief", target: hungry.id };
    const cost = 300 + agent.land * 3;
    if (agent.gold > cost + 800 && agent.orders > 0 && rng.next() < 0.7) return { type: "explore" };
    const prey = weakestWin(world, agent, (p) => defense(p) * 1.4 < offense(agent));
    if (prey && rng.next() < 0.2) return { type: "attack", target: prey.id, mode: "seize" };
    return buildIf(agent, "field") || buildIf(agent, "hearth") || buildIf(agent, "workshop");
  }
  return null;
}

export function seatRival(world, name, faction) {
  if (byId(world, "rival")) return fail("A rival already sits this device.");
  const you = byId(world, "you");
  const rival = blankProvince({
    id: "rival",
    kind: "human",
    name: name || "Second Acre",
    ruler: "Rival",
    faction: FACTIONS[faction] ? faction : you.faction,
    utopia: 0,
  });
  world.provinces.push(rival);
  log(world, `${rival.ruler} seats ${rival.name}. PvP stakes are paid in $UTOPIA.`);
  return { ok: true, message: "Rival seated." };
}

export function serialize(world) {
  const { rng, ...rest } = world;
  return JSON.stringify({ ...rest, rngState: rng.state() });
}

export function hydrate(raw) {
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  const rngState = data.rngState >>> 0;
  delete data.rngState;
  data.wonders = data.wonders || {};
  data.sites = data.sites && data.sites.length ? data.sites : freshSites();
  data.bands = data.bands && data.bands.length ? data.bands : freshBands();
  const world = { ...data, rng: makeRng(rngState) };
  ensurePlots(world);
  for (const realm of world.provinces || []) {
    if (!Array.isArray(realm.founders)) realm.founders = [];
    if (!Array.isArray(realm.ships)) realm.ships = [];
    if (!Array.isArray(realm.colonies)) realm.colonies = [];
    if (!Array.isArray(realm.nets)) realm.nets = [];
    if (!Array.isArray(realm.buoys)) realm.buoys = [];
  }
  if (!Array.isArray(world.wrecks)) world.wrecks = [];
  const cap = world.orderCap || 4;
  if (cap < ORDERS) {
    const grant = ORDERS - cap;
    for (const p of world.provinces || []) {
      if (typeof p.orders === "number") p.orders += grant;
    }
    world.orderCap = ORDERS;
  }
  return world;
}

export function intelFresh(actor, targetId, hour) {
  const row = actor.intel[targetId];
  if (!row) return null;
  if (hour - row.hour > 3) return null;
  return row;
}

export const MATCH_MS = 2 * 60 * 60 * 1000;
export const FILL_MS = 0;
export const JOIN_GRACE_MS = 2 * 60 * 1000;
export const TICK_MS = 60 * 1000;

export const SITES = [
  { id: "barrow", name: "Ash Barrow", x: 820, y: -980, purse: 80, gold: 420, blurb: "A hill of old ash. Send a party to open it." },
  { id: "well", name: "Moon Well", x: -1280, y: 180, purse: 70, gold: 260, blurb: "The water keeps a light." },
  { id: "kilnruin", name: "Cold Kiln", x: 240, y: 1280, purse: 60, gold: 520, blurb: "The chimney still stands." },
  { id: "stacks", name: "Drowned Stacks", x: -640, y: -1480, purse: 90, gold: 200, blurb: "Ledgers under the mud." },
  { id: "stand", name: "Horn Stand", x: 1680, y: 420, purse: 75, gold: 310, blurb: "A watch that nobody kept." },
  { id: "orchard", name: "Grey Orchard", x: -1680, y: 760, purse: 65, gold: 360, blurb: "Trees that fruit once." },
];

export function freshSites() {
  return SITES.map((site) => ({ ...site, clearedBy: null }));
}

export const RELICS = {
  barrow: { name: "Ash Standard", line: "Marches hit 4% harder." },
  well: { name: "Well Light", line: "Fields yield 6% more grain." },
  kilnruin: { name: "Kiln Brand", line: "Workshops mint 6% more gold." },
  stacks: { name: "Mud Ledger", line: "An active hour pays 8 extra cents." },
  stand: { name: "Horn Watch", line: "Walls hold 4% firmer." },
  orchard: { name: "Grey Graft", line: "The hearth grows two more peasants." },
};

export function stallQuote(hour) {
  const name = seasonName(hour);
  const sell = { Thaw: 220, "High Sun": 200, Harvest: 160, Frost: 280 }[name] || 200;
  return { name, grain: 400, sell, buy: sell + 40, keep: 200 };
}

export function seasonName(hour) {
  return ["Thaw", "High Sun", "Harvest", "Frost"][Math.floor((hour || 0) / 30) % 4];
}

export function seasonMod(hour) {
  const name = seasonName(hour);
  if (name === "Thaw") return { food: 1.06, gold: 1, line: "Thaw. Fields drink, and grain comes in fuller." };
  if (name === "High Sun") return { food: 1, gold: 1.05, line: "High Sun. The workshops run hot." };
  if (name === "Harvest") return { food: 1.1, gold: 1.02, line: "Harvest. Granaries and purses both fill." };
  return { food: 0.9, gold: 0.96, line: "Frost. Grain thins and gold slows." };
}
export const MAX_HUMANS = 12;

export const SPAWNS = [
  [-1500, -1100],
  [-700, -1700],
  [350, -1750],
  [1450, -1200],
  [1750, -150],
  [1500, 900],
  [400, 1650],
  [-800, 1550],
  [0, 2320],
  [2320, 180],
  [-2320, -160],
  [160, -2320],
];

const WILD = [
  { id: "harrow", persona: "harrow", name: "Red Mile", ruler: "Marshal Harrow", faction: "marcher", x: -200, y: -400, line: "Harrow counts spears, then spends them." },
  { id: "vellum", persona: "vellum", name: "Quiet Stacks", ruler: "Archivist Vellum", faction: "veil", x: 200, y: -500, line: "Vellum reads the hour before she spends it." },
  { id: "brine", persona: "brine", name: "Salt Ledger", ruler: "Quartermaster Brine", faction: "hearth", x: 0, y: 450, line: "Brine buys the road, then the grain on it." },
  { id: "quill", persona: "quill", name: "Ink Market", ruler: "Informant Quill", faction: "cutpurse", x: -450, y: 200, line: "Quill prefers a purse to a gate." },
  { id: "sable", persona: "sable", name: "Grey Vigil", ruler: "Warden Sable", faction: "warden", x: 500, y: 250, line: "Sable answers the last blow, not the first rumor." },
  { id: "moss", persona: "moss", name: "Low Orchard", ruler: "Hearthkeeper Moss", faction: "hearth", x: -150, y: 900, line: "Moss plants another row and waits." },
  { id: "cinder", persona: "harrow", name: "Cinder Reach", ruler: "Captain Cinder", faction: "marcher", x: 900, y: -700, line: "Cinder marches the far road." },
  { id: "loom", persona: "vellum", name: "Loom Hill", ruler: "Sister Loom", faction: "veil", x: -1100, y: -200, line: "Loom keeps a light on the west ridge." },
  { id: "peat", persona: "brine", name: "Peat Market", ruler: "Factor Peat", faction: "hearth", x: 1100, y: 500, line: "Peat buys what the road drops." },
  { id: "nyx", persona: "quill", name: "Nyx Fold", ruler: "Nyx", faction: "cutpurse", x: -900, y: 1100, line: "Nyx is already inside the tent." },
];

export function createOpenRealm(seed = 1) {
  const provinces = WILD.map((r, i) => {
    const lean = 0.86 + (i % 4) * 0.05;
    return blankProvince({
      id: r.id,
      kind: "agent",
      persona: r.persona,
      name: r.name,
      ruler: r.ruler,
      faction: r.faction,
      line: r.line,
      x: r.x,
      y: r.y,
      land: Math.round(170 * lean),
      buildings: emptyBuildings({
        hearth: Math.round(36 * lean),
        field: Math.round(30 * lean),
        workshop: Math.round(16 * lean),
        barracks: Math.round(12 * lean),
        keep: r.persona === "sable" ? 16 : Math.round(7 * lean),
        chapel: r.persona === "vellum" ? 10 : 4,
        den: r.persona === "quill" ? 9 : 3,
        spire: r.persona === "vellum" ? 8 : 3,
      }),
      peasants: Math.round(480 * lean),
      soldiers: r.persona === "harrow" ? 64 : Math.round(70 * lean),
      elites: r.persona === "sable" ? 28 : Math.round(14 * lean),
      thieves: r.persona === "quill" ? 16 : 5,
      mystics: r.persona === "vellum" ? 12 : 4,
      gold: Math.round(6400 * lean),
      grain: Math.round(7200 * lean),
      aether: r.persona === "vellum" ? 320 : 140,
    });
  });
  const world = {
    seed,
    hour: 0,
    orderCap: ORDERS,
    seat: null,
    burned: 0,
    closed: false,
    provinces,
    log: [{ hour: 0, text: "The wilds are open. Twelve human seats. The age clock runs for two hours." }],
    wonders: {},
    bounties: {},
    sites: freshSites(),
    bands: freshBands(),
    wrecks: [],
    rng: makeRng(seed),
  };
  ensurePlots(world);
  return world;
}

export function humanCount(world) {
  return world.provinces.filter((p) => p.kind === "human").length;
}

export function cleanWallet(value) {
  const text = String(value || "").trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text)) return "";
  return text;
}

export function bindWallet(world, seatId, address) {
  const province = byId(world, seatId);
  if (!province || province.kind !== "human") return { ok: false, message: "No seat." };
  const wallet = cleanWallet(address);
  if (!wallet) return { ok: false, message: "That is not a Solana address." };
  province.wallet = wallet;
  return { ok: true, wallet };
}

export function claimSeat(world, opts) {
  if (world.closed) return { ok: false, message: "This age is over." };
  if (humanCount(world) >= MAX_HUMANS) return { ok: false, message: "This realm is full." };
  if (byId(world, opts.id)) return { ok: false, message: "That seat is already taken." };
  const faction = FACTIONS[opts.faction] ? opts.faction : "marcher";
  const used = new Set(world.provinces.map((p) => `${p.x},${p.y}`));
  const spot = SPAWNS.find(([x, y]) => !used.has(`${x},${y}`));
  if (!spot) return { ok: false, message: "No open ground." };
  const province = blankProvince({
    id: opts.id,
    kind: "human",
    name: opts.province || "New Acre",
    ruler: opts.ruler || "Ruler",
    faction,
    x: spot[0],
    y: spot[1],
  });
  const wallet = cleanWallet(opts.wallet);
  if (wallet) province.wallet = wallet;
  province.seatedHour = world.hour || 0;
  rollAmbition(province, world.hour || 0);
  world.provinces.push(province);
  ensurePlots(world);
  if (!world.seat) world.seat = province.id;
  const behind = province.seatedHour > 0 ? ` The age is already at hour ${province.seatedHour}.` : "";
  log(world, `${province.ruler} claims ${province.name} on the open map. ${humanCount(world)} of ${MAX_HUMANS} human seats filled.${behind}`);
  return { ok: true, message: "Seat claimed.", province };
}

export function realmJoinable(meta, now) {
  if (!meta || meta.ended || meta.status === "ended") return false;
  if ((meta.humans || 0) >= MAX_HUMANS) return false;
  if (meta.startedAt && now > meta.startedAt + JOIN_GRACE_MS) return false;
  return true;
}

export function standings(world) {
  return world.provinces
    .map((p) => ({
      id: p.id,
      name: p.name,
      ruler: p.ruler,
      kind: p.kind,
      networth: networth(p),
      utopia: p.utopia,
      place: p.place || 0,
      placePay: p.placePay || 0,
      wallet: p.wallet || "",
    }))
    .sort((a, b) => b.networth - a.networth || b.utopia - a.utopia);
}

export function closeAge(world) {
  if (world.closed) return standings(world);
  const humans = standings(world).filter((row) => row.kind === "human");
  const bonus = [2500, 1500, 800, 400, 200];
  humans.forEach((row, index) => {
    const province = byId(world, row.id);
    const pay = bonus[index] ?? 100;
    province.utopia += pay;
    province.place = index + 1;
    province.placePay = pay;
    notePurse(province, "place", pay);
    const marked = province.wallet ? ` Marked for ${province.wallet.slice(0, 4)}…${province.wallet.slice(-4)}.` : "";
    log(world, `${province.name} places ${index + 1} and wins ${formatUtopia(pay)} $UTOPIA.${marked}`);
  });
  world.closed = true;
  log(world, "The two-hour age is over. Placement is paid in $UTOPIA.");
  return standings(world);
}

export function redact(world, seatId) {
  const copy = JSON.parse(serialize(world));
  delete copy.rngState;
  const viewer = copy.provinces.find((p) => p.id === seatId);
  const hiddenNames = [];
  for (const province of copy.provinces) {
    if (province.id === seatId) continue;
    const known = viewer && intelFresh(viewer, province.id, copy.hour);
    province.intel = {};
    province.cooldown = {};
    province.ledger = {};
    province.held = captiveCount(province);
    if (!known) {
      hiddenNames.push(province.name);
      province.soldiers = 0;
      province.elites = 0;
      province.thieves = 0;
      province.mystics = 0;
      province.gold = 0;
      province.grain = 0;
      province.aether = 0;
      province.orders = 0;
      province.utopia = 0;
      province.studies = {};
      province.doctrine = null;
      province.marks = {};
      province.pacts = {};
      province.relics = {};
      province.demands = {};
      province.pens = {};
      province.name = "Unscouted";
      province.ruler = "Unknown";
      province.line = "A camp in the wild. Send a thief to scout it.";
    }
  }
  for (const row of copy.log || []) {
    for (const name of hiddenNames) row.text = row.text.split(name).join("an unscouted camp");
  }
  copy.wonders = copy.wonders || {};
  for (const [id, owner] of Object.entries(copy.wonders)) {
    const holder = copy.provinces.find((p) => p.id === owner);
    if (!holder || holder.name === "Unscouted") copy.wonders[id] = "";
  }
  return copy;
}
