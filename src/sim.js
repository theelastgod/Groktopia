/** Groktopia realm rules. Original numbers. Earn unit is cents of $UTOPIA (100 = 1). */

export const ORDERS = 4;
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
];

export function studyCount(p) {
  if (!p || !p.studies) return 0;
  return Object.values(p.studies).filter(Boolean).length;
}

export function ageName(p) {
  const n = studyCount(p);
  if (n >= 8) return "Crown";
  if (n >= 5) return "Realm";
  if (n >= 2) return "Borough";
  return "Camp";
}

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
  p.intel = p.intel || {};
  p.cooldown = p.cooldown || {};
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
  return {
    seed,
    hour: 0,
    seat: "you",
    burned: 0,
    provinces: [you, ...agents],
    log: [{ hour: 0, text: `${you.ruler} takes the seat of ${you.name}. Six lattice agents already hold land.` }],
    wonders: {},
    bounties: {},
    sites: freshSites(),
    rng: makeRng(seed),
  };
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
  return Math.floor((p.soldiers * 3 + (p.muster || 0) * 2 + p.elites * f.off) * wageFactor(p) * fury * oath * levy * ash * seam);
}

export function defense(p) {
  const f = FACTIONS[p.faction];
  const bulwark = p.spells.bulwark > 0 ? 1.2 : 1;
  const pale = p.studies && p.studies.palisade ? 1.06 : 1;
  const bastion = p.marks && p.marks.bastion ? 1.08 : 1;
  const horn = p.relics && p.relics.stand ? 1.04 : 1;
  return Math.floor((p.soldiers * 1 + (p.muster || 0) + p.elites * f.def + p.buildings.keep * 10) * wageFactor(p) * bulwark * pale * bastion * horn);
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

function casualties(p, frac, rng) {
  const j = 0.85 + rng.next() * 0.3;
  const hit = (n) => Math.max(0, n - Math.floor(n * frac * j));
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
  if (action.type === "build") result = doBuild(world, actor, action.building);
  else if (action.type === "train") result = doTrain(world, actor, action);
  else if (action.type === "explore") result = doExplore(world, actor);
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
  else if (action.type === "attack") result = doAttack(world, actor, action);
  else if (action.type === "spell") result = doSpell(world, actor, action);
  else if (action.type === "thief") result = doThief(world, actor, action);
  if (result.ok) meetAmbition(world, actor, action);
  return result;
}

function doBuild(world, actor, key) {
  const spec = BUILDINGS[key];
  if (!spec) return fail("Unknown building.");
  if (freeLand(actor) < 1) return fail("No empty acres.");
  const cost = spec.cost(actor.buildings[key]);
  if (actor.gold < cost) return fail(`Need ${cost} gold for a ${spec.name.slice(0, -1).toLowerCase()}.`);
  actor.gold -= cost;
  actor.buildings[key] += 1;
  actor.acted = true;
  log(world, `${actor.name} raises a ${spec.name.slice(0, -1).toLowerCase()} (${cost} gold).`);
  return { ok: true, message: `Built. ${cost} gold.` };
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
  let purse = "";
  if (actor.kind === "human") {
    const cents = actor.studies && actor.studies.charter ? EARN.charter : EARN.settle;
    actor.utopia += cents;
    notePurse(actor, "settle", cents);
    purse = ` Purse +${formatUtopia(cents)} $UTOPIA.`;
  }
  log(world, `${actor.name} settles 10 acres (${cost} gold).${purse}`);
  return { ok: true, message: `Settled 10 acres for ${cost} gold.${purse}` };
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
  actor.gold += haul;
  const earned = grantEarn(actor, EARN.trade, scale, "trade");
  const purse = earned ? ` Purse +${formatUtopia(earned)} $UTOPIA.` : " Outside the fair band, so the purse stays shut.";
  log(world, `${actor.name} rolls a caravan to ${target.name} and brings back ${haul} gold.${purse}`);
  return { ok: true, message: `Caravan returned ${haul} gold.${purse}` };
}

function pactLive(actor, id, hour) {
  const until = actor && actor.pacts && actor.pacts[id];
  return typeof until === "number" && hour <= until;
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

  const off = offense(actor);
  const defn = defense(target);
  const win = off > defn;
  const ratio = off / Math.max(1, defn);
  casualties(actor, win ? 0.06 : 0.12, world.rng);
  casualties(target, win ? 0.07 : 0.04, world.rng);
  actor.orders -= 1;
  actor.acted = true;
  actor.cooldown[target.id] = world.hour;
  target.grudge = actor.id;

  let detail = "";
  if (win && mode === "seize") {
    const raw = Math.floor(target.land * 0.07 * Math.min(1.4, ratio) * Math.max(scale, 0.35));
    const moved = takeLand(target, raw, world.rng);
    actor.land += moved;
    const folk = Math.min(target.peasants, Math.floor(target.peasants * 0.05 * Math.max(scale, 0.35)));
    target.peasants -= folk;
    actor.peasants += folk;
    detail = `seized ${moved} acres`;
    const penned = takeCaptives(actor, target);
    if (penned) detail += ` and penned ${penned}`;
  } else if (win && mode === "sack") {
    const g = Math.floor(target.gold * 0.14 * Math.max(scale, 0.35));
    const f = Math.floor(target.grain * 0.14 * Math.max(scale, 0.35));
    target.gold -= g;
    target.grain -= f;
    actor.gold += g;
    actor.grain += f;
    detail = `sacked ${g} gold and ${f} grain`;
    const penned = takeCaptives(actor, target);
    if (penned) detail += ` and penned ${penned}`;
  } else if (win && mode === "raze") {
    const hits = Math.max(1, Math.floor(buildingCount(target) * 0.06 * Math.max(scale, 0.35)));
    let n = 0;
    for (let i = 0; i < hits; i++) {
      const keys = Object.keys(target.buildings).filter((k) => target.buildings[k] > 0);
      if (!keys.length) break;
      const k = keys[Math.floor(world.rng.next() * keys.length)];
      target.buildings[k] -= 1;
      n += 1;
    }
    detail = `razed ${n} buildings`;
  } else {
    detail = "was thrown back";
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
    const hits = Math.max(1, Math.floor(buildingCount(target) * 0.04 * Math.max(scale, 0.4)));
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
    const g = Math.floor(target.gold * 0.09 * Math.max(scale, 0.4));
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
    const hits = Math.max(1, Math.floor(2 * Math.max(scale, 0.4)));
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

function economy(p, hour) {
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
  const foodOut = foodNeed(p);
  p.gold += goldIn;
  p.grain += foodIn - foodOut;
  if (p.grain < 0) {
    const die = Math.min(p.peasants, Math.max(1, Math.ceil(-p.grain / 4)));
    p.peasants -= die;
    p.grain = 0;
  }
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
  for (const p of world.provinces) economy(p, world.hour || 0);
  for (const p of world.provinces) {
    if (!beaconLit(p, world.hour || 0)) continue;
    const sweep = watchSweep(world, p);
    if (sweep.fresh > 0 && p.kind === "human") log(world, `${p.name}'s watch fire reads ${sweep.fresh} new camps.`);
  }
  const prevSeason = seasonName(world.hour);
  world.hour += 1;
  for (const p of world.provinces) settleMuster(p, world.hour);
  for (const p of world.provinces) settleVein(p, world.hour);
  expireBounties(world);
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
  const penned = Object.entries(agent.pens || {}).find((row) => row[1] > 0);
  if (penned && agent.orders >= 1) {
    const held = byId(world, penned[0]);
    if (held && held.gold >= 20) return { type: "ransom", target: held.id };
    if (held) return { type: "release", target: held.id };
  }
  if (agent.persona === "harrow" && !(agent.muster > 0) && agent.peasants >= 60 && agent.gold >= 120 && agent.soldiers < 80 && agent.orders >= 1 && rng.next() < 0.22) {
    return { type: "muster" };
  }
  if ((agent.persona === "sable" || agent.persona === "moss") && !beaconLit(agent, world.hour) && agent.orders >= 1 && agent.gold >= 160 && agent.grain >= 80 && rng.next() < 0.2) {
    return { type: "beacon" };
  }
  const site = nearestOpenSite(world, agent);
  if (site && rng.next() < 0.18) return { type: "clear", site: site.id };
  if (agent.persona === "harrow") {
    const marked = weakestWin(world, agent, (p) => bountyOn(world, p.id, world.hour) && defense(p) < offense(agent) * 1.05);
    if (marked && rng.next() < 0.85) return { type: "attack", target: marked.id, mode: "seize" };
    const prey = weakestWin(world, agent, (p) => defense(p) < offense(agent) * 0.98);
    if (prey && rng.next() < 0.8) return { type: "attack", target: prey.id, mode: "seize" };
    return trainBias(agent) || buildIf(agent, "barracks") || buildIf(agent, "field");
  }
  if (agent.persona === "sable") {
    if (agent.grudge) {
      const foe = byId(world, agent.grudge);
      if (foe && nwFactor(agent, foe) > 0 && !onCooldown(agent, foe, world.hour) && offense(agent) > defense(foe) * 0.9) {
        agent.grudge = null;
        return { type: "attack", target: foe.id, mode: "seize" };
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
    if (!agent.vein && agent.gold >= 800 && agent.orders >= 1 && rng.next() < 0.14) return { type: "prospect" };
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
  return { ...data, rng: makeRng(rngState) };
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
export const MAX_HUMANS = 8;

export const SPAWNS = [
  [-1500, -1100],
  [-700, -1700],
  [350, -1750],
  [1450, -1200],
  [1750, -150],
  [1500, 900],
  [400, 1650],
  [-800, 1550],
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
  return {
    seed,
    hour: 0,
    seat: null,
    burned: 0,
    closed: false,
    provinces,
    log: [{ hour: 0, text: "The wilds are open. Eight human seats. The age clock runs for two hours." }],
    wonders: {},
    bounties: {},
    sites: freshSites(),
    rng: makeRng(seed),
  };
}

export function humanCount(world) {
  return world.provinces.filter((p) => p.kind === "human").length;
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
  province.seatedHour = world.hour || 0;
  rollAmbition(province, world.hour || 0);
  world.provinces.push(province);
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
    notePurse(province, "place", pay);
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
