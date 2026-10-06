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
  };
  const p = { ...base, ...partial };
  if (partial && partial.buildings) p.buildings = { ...base.buildings, ...partial.buildings };
  if (partial && partial.spells) p.spells = { ...base.spells, ...partial.spells };
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
  return p.peasants + p.soldiers + p.elites + p.thieves + p.mystics;
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
  return Math.floor((p.soldiers * 3 + p.elites * f.off) * wageFactor(p) * fury);
}

export function defense(p) {
  const f = FACTIONS[p.faction];
  const bulwark = p.spells.bulwark > 0 ? 1.2 : 1;
  return Math.floor((p.soldiers * 1 + p.elites * f.def + p.buildings.keep * 10) * wageFactor(p) * bulwark);
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
}

function grantEarn(actor, base, scale) {
  if (scale <= 0) return 0;
  const want = Math.floor(base * scale);
  const got = Math.max(0, Math.min(actor.earnLeft, want));
  actor.utopia += got;
  actor.earnLeft -= got;
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

export function applyAction(world, actorId, action) {
  const actor = byId(world, actorId);
  if (!actor) return fail("No such province.");
  if (action.type === "build") return doBuild(world, actor, action.building);
  if (action.type === "train") return doTrain(world, actor, action);
  if (action.type === "explore") return doExplore(world, actor);
  if (action.type === "attack") return doAttack(world, actor, action);
  if (action.type === "spell") return doSpell(world, actor, action);
  if (action.type === "thief") return doThief(world, actor, action);
  return fail("Unknown order.");
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
  const cost = 300 + actor.land * 3;
  if (actor.gold < cost) return fail(`Exploration wants ${cost} gold.`);
  actor.gold -= cost;
  actor.orders -= 1;
  actor.land += 10;
  actor.peasants += 8;
  actor.acted = true;
  log(world, `${actor.name} settles 10 acres (${cost} gold).`);
  return { ok: true, message: `Settled 10 acres for ${cost} gold.` };
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
  } else if (win && mode === "sack") {
    const g = Math.floor(target.gold * 0.14 * Math.max(scale, 0.35));
    const f = Math.floor(target.grain * 0.14 * Math.max(scale, 0.35));
    target.gold -= g;
    target.grain -= f;
    actor.gold += g;
    actor.grain += f;
    detail = `sacked ${g} gold and ${f} grain`;
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
    (win ? actor : target).utopia += prize;
    world.burned += fee;
    detail += win
      ? `. Stake paid ${formatUtopia(prize)} $UTOPIA`
      : `. The defender keeps ${formatUtopia(prize)} $UTOPIA`;
  } else if (earned > 0) {
    detail += `. Earned ${formatUtopia(earned)} $UTOPIA`;
  }

  remember(actor, target, world.hour);
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
  const theirs = thiefPower(target) + target.buildings.keep * 0.0008;
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

function economy(p) {
  const f = FACTIONS[p.faction];
  const jobs = p.buildings.workshop * 8 + p.buildings.field * 4;
  const employed = Math.min(p.peasants, jobs);
  const goldIn = Math.floor(employed * 1.55 * f.gold + p.buildings.workshop * 3);
  const foodIn = Math.floor(p.buildings.field * 40 * f.food);
  const foodOut = foodNeed(p);
  p.gold += goldIn;
  p.grain += foodIn - foodOut;
  if (p.grain < 0) {
    const die = Math.min(p.peasants, Math.max(1, Math.ceil(-p.grain / 4)));
    p.peasants -= die;
    p.grain = 0;
  }
  p.aether += Math.floor(p.buildings.spire * 6 * f.aether);
  const cap = p.buildings.hearth * 16;
  if (p.peasants < cap && p.grain > foodOut * 2) {
    p.peasants = Math.min(cap, p.peasants + Math.max(1, Math.floor(p.peasants * 0.035)));
  }
  if (p.mystics < mysticCap(p)) p.mystics += 1;
  for (const k of Object.keys(p.spells)) {
    if (p.spells[k] > 0) p.spells[k] -= 1;
  }
  if (p.acted && p.kind === "human") p.utopia += EARN.hourActive;
  p.acted = false;
  p.orders = ORDERS;
  p.earnLeft = EARN.combatCap;
}

export function advanceHour(world) {
  for (const p of world.provinces) economy(p);
  world.hour += 1;
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

export function chooseAction(world, agent) {
  const rng = world.rng;
  if (agent.persona === "harrow") {
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
    const rich = world.provinces
      .filter((p) => p.id !== agent.id && nwFactor(agent, p) > 0)
      .sort((a, b) => b.gold - a.gold)[0];
    if (rich && agent.thieves >= 6 && rng.next() < 0.7) return { type: "thief", op: "pilfer", target: rich.id };
    if (rich && agent.thieves >= 3 && rng.next() < 0.5) return { type: "thief", op: "scout", target: rich.id };
    return trainBias(agent) || buildIf(agent, "den");
  }
  if (agent.persona === "brine") {
    const fat = world.provinces
      .filter((p) => p.id !== agent.id && nwFactor(agent, p) > 0 && !onCooldown(agent, p, world.hour) && p.gold > 6000 && defense(p) < offense(agent))
      .sort((a, b) => b.gold - a.gold)[0];
    if (fat && rng.next() < 0.55) return { type: "attack", target: fat.id, mode: "sack" };
    return buildIf(agent, "workshop") || buildIf(agent, "field") || trainBias(agent);
  }
  if (agent.persona === "moss") {
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
  return { ...data, rng: makeRng(rngState) };
}

export function intelFresh(actor, targetId, hour) {
  const row = actor.intel[targetId];
  if (!row) return null;
  if (hour - row.hour > 3) return null;
  return row;
}
