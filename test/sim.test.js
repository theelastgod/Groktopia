import test from "node:test";
import assert from "node:assert/strict";
import {
  EARN,
  ORDERS,
  TICK_MS,
  seasonName,
  seasonMod,
  offense,
  defense,
  foodNeed,
  advanceHour,
  applyAction,
  pressBands,
  buildingCount,
  byId,
  formatUtopia,
  ageName,
  hydrate,
  redact,
  newWorld,
  terrainKind,
  worldToAxial,
  NAVY,
  nwFactor,
  seatRival,
  serialize,
  studyCount,
  beaconLit,
  captiveCount,
  intelFresh,
  stallQuote,
  feastLive,
  bountyOn,
  leveeUp,
  roadLive,
  foldLive,
  curfewUp,
  hospiceUp,
  innUp,
  innToll,
  waterTouch,
  weirLive,
  weirYield,
  timberYards,
  quarryPits,
  stonePrice,
  siegeLive,
  growRival,
  patrolUp,
  keelUp,
  keelHaul,
} from "../src/sim.js";

test("build spends gold and an acre", () => {
  const w = newWorld({ seed: 1 });
  const you = byId(w, "you");
  const gold = you.gold;
  const free = you.land - buildingCount(you);
  const res = applyAction(w, "you", { type: "build", building: "field" });
  assert.equal(res.ok, true);
  assert.ok(you.gold < gold);
  assert.equal(you.land - buildingCount(you), free - 1);
});

test("a bought tile can hold one building", () => {
  const w = newWorld({ seed: 3 });
  const you = byId(w, "you");
  w.provinces = [you];
  w.bands = [];
  you.gold = 5000;
  you.orders = ORDERS;
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const held = new Set(you.plots.map((tile) => `${tile.q},${tile.r}`));
  let spot = null;
  for (const tile of you.plots) {
    for (const [dq, dr] of dirs) {
      const q = tile.q + dq;
      const r = tile.r + dr;
      const kind = terrainKind(q, r);
      if (held.has(`${q},${r}`) || kind === "sea" || kind === "mount") continue;
      spot = { q, r };
      break;
    }
    if (spot) break;
  }
  assert.ok(spot);
  const plots = you.plots.length;
  const land = you.land;
  const cost = 90 + plots * 6;
  const bought = applyAction(w, "you", { type: "buy", q: spot.q, r: spot.r });
  assert.equal(bought.ok, true, bought.message);
  assert.equal(you.gold, 5000 - cost);
  assert.equal(you.land, land + 4);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.tile, EARN.tile);
  assert.equal(you.plots.length, plots + 1);
  assert.equal(applyAction(w, "you", { type: "buy", q: 130, r: -65 }).ok, false);
  const fields = you.buildings.field;
  const raised = applyAction(w, "you", { type: "build", building: "field", q: spot.q, r: spot.r });
  assert.equal(raised.ok, true, raised.message);
  assert.equal(you.buildings.field, fields + 1);
  assert.equal(you.plots.find((tile) => tile.q === spot.q && tile.r === spot.r).structure, "field");
  assert.equal(applyAction(w, "you", { type: "build", building: "hearth", q: spot.q, r: spot.r }).ok, false);
  assert.equal(applyAction(w, "you", { type: "build", building: "field", q: spot.q + 3, r: spot.r + 3 }).ok, false);
});

test("empty acres block construction", () => {
  const w = newWorld({ seed: 1 });
  const you = byId(w, "you");
  you.land = buildingCount(you);
  const res = applyAction(w, "you", { type: "build", building: "field" });
  assert.equal(res.ok, false);
  assert.equal(you.land, buildingCount(you));
});

test("a fair seize moves land and pays $UTOPIA", () => {
  const w = newWorld({ seed: 2 });
  const you = byId(w, "you");
  const h = byId(w, "harrow");
  h.soldiers = 20;
  h.elites = 0;
  h.buildings.keep = 3;
  assert.ok(nwFactor(you, h) > 0);
  const land = h.land;
  const yours = you.land;
  const res = applyAction(w, "you", { type: "attack", target: "harrow", mode: "seize" });
  assert.equal(res.ok, true);
  assert.equal(res.win, true);
  assert.ok(h.land < land);
  assert.ok(you.land > yours);
  assert.ok(you.utopia > 0);
  assert.ok(buildingCount(h) <= h.land);
});

test("a march outside the band does not pay", () => {
  const w = newWorld({ seed: 3 });
  const you = byId(w, "you");
  const h = byId(w, "harrow");
  h.land = 40;
  h.buildings = { hearth: 8, field: 8, workshop: 4, barracks: 4, keep: 2, chapel: 2, den: 2, spire: 2 };
  h.peasants = 20;
  h.soldiers = 0;
  h.elites = 0;
  h.thieves = 0;
  h.mystics = 0;
  h.gold = 0;
  h.grain = 0;
  assert.equal(nwFactor(you, h), 0);
  const purse = you.utopia;
  const res = applyAction(w, "you", { type: "attack", target: "harrow", mode: "seize" });
  assert.equal(res.ok, false);
  assert.equal(you.utopia, purse);
  assert.equal(you.orders, ORDERS);
});

test("PvP stake pays the winner and burns a fee", () => {
  const w = newWorld({ seed: 4 });
  assert.equal(seatRival(w, "Second Acre", "warden").ok, true);
  const you = byId(w, "you");
  const rival = byId(w, "rival");
  you.utopia = 1000;
  rival.utopia = 1000;
  rival.soldiers = 30;
  rival.elites = 0;
  rival.buildings.keep = 2;
  assert.ok(nwFactor(you, rival) > 0);
  const res = applyAction(w, "you", { type: "attack", target: "rival", mode: "seize", stake: 500 });
  assert.equal(res.ok, true);
  assert.equal(res.win, true);
  assert.equal(you.utopia, 1450);
  assert.equal(rival.utopia, 500);
  assert.equal(w.burned, 50);
  assert.equal(formatUtopia(you.utopia), "14.50");
});

test("an active hour pays the human purse and the agents keep the books finite", () => {
  const w = newWorld({ seed: 5 });
  const you = byId(w, "you");
  assert.equal(applyAction(w, "you", { type: "build", building: "field" }).ok, true);
  advanceHour(w);
  assert.equal(w.hour, 1);
  assert.ok(you.utopia >= EARN.hourActive);
  assert.equal(you.orders, ORDERS);
  for (const p of w.provinces) {
    assert.ok(buildingCount(p) <= p.land);
    assert.ok(p.land >= 40);
    for (const n of [p.gold, p.grain, p.aether, p.peasants, p.soldiers, p.elites, p.thieves, p.mystics, p.utopia]) {
      assert.equal(Number.isFinite(n), true);
      assert.ok(n >= 0);
    }
  }
});

test("forty-eight hours stay inside the realm", () => {
  const w = newWorld({ seed: 9, faction: "veil", ruler: "Ada", province: "Glass Acre" });
  for (let i = 0; i < 48; i++) advanceHour(w);
  assert.equal(w.hour, 48);
  for (const p of w.provinces) {
    assert.ok(p.land >= 40);
    assert.ok(buildingCount(p) <= p.land);
    for (const n of [p.gold, p.grain, p.aether, p.peasants, p.soldiers, p.elites, p.thieves, p.mystics, p.utopia]) {
      assert.equal(Number.isFinite(n), true);
      assert.ok(n >= 0);
    }
  }
});

test("studies pay the purse and climb from Camp to Borough", () => {
  const w = newWorld({ seed: 11 });
  const you = byId(w, "you");
  assert.equal(ageName(you), "Camp");
  const before = you.utopia;
  const furrow = applyAction(w, "you", { type: "study", study: "furrow" });
  assert.equal(furrow.ok, true);
  assert.equal(you.utopia, before + 40);
  assert.equal(applyAction(w, "you", { type: "study", study: "furrow" }).ok, false);
  assert.equal(applyAction(w, "you", { type: "study", study: "crown" }).ok, false);
  assert.equal(applyAction(w, "you", { type: "study", study: "kiln" }).ok, true);
  assert.equal(studyCount(you), 2);
  assert.equal(ageName(you), "Borough");
  assert.equal(you.ledger.study, 90);
  assert.equal(applyAction(w, "you", { type: "doctrine", doctrine: "granary" }).ok, true);
  assert.equal(you.doctrine, "granary");
  const view = redact(w, "you");
  const camp = view.provinces.find((p) => p.id === "harrow");
  assert.equal(camp.name, "Unscouted");
  assert.equal(camp.gold, 0);
  const purse = you.utopia;
  const settled = applyAction(w, "you", { type: "explore" });
  assert.equal(settled.ok, true);
  assert.ok(you.utopia > purse);
});

test("a wonder pays once and hides until the builder is scouted", () => {
  const w = newWorld({ seed: 12 });
  const you = byId(w, "you");
  assert.equal(applyAction(w, "you", { type: "study", study: "furrow" }).ok, true);
  assert.equal(applyAction(w, "you", { type: "study", study: "kiln" }).ok, true);
  const raised = applyAction(w, "you", { type: "wonder", wonder: "mill" });
  assert.equal(raised.ok, true);
  assert.equal(you.ledger.wonder, 220);
  assert.equal(w.wonders.mill, "you");
  assert.equal(applyAction(w, "you", { type: "wonder", wonder: "mill" }).ok, false);
  const view = redact(w, "harrow");
  assert.equal(view.wonders.mill, "");
  assert.equal(view.provinces.find((p) => p.id === "you").name, "Unscouted");
  const kept = hydrate(serialize(w));
  assert.equal(kept.wonders.mill, "you");
});

test("a caravan needs a scout and pays inside the fair band", () => {
  const w = newWorld({ seed: 13 });
  const you = byId(w, "you");
  assert.equal(applyAction(w, "you", { type: "trade", target: "harrow" }).ok, false);
  you.intel.harrow = { hour: w.hour, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
  const before = you.utopia;
  const res = applyAction(w, "you", { type: "trade", target: "harrow" });
  assert.equal(res.ok, true);
  assert.ok(you.utopia > before);
  assert.ok(you.ledger.trade > 0);
  assert.ok(you.ledger.trade <= EARN.trade);
});

test("an envoy needs a scout, pays once, and a march breaks the pact", () => {
  const w = newWorld({ seed: 15 });
  const you = byId(w, "you");
  const harrow = byId(w, "harrow");
  assert.equal(applyAction(w, "you", { type: "envoy", target: "harrow" }).ok, false);
  you.intel.harrow = { hour: w.hour, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
  const bound = applyAction(w, "you", { type: "envoy", target: "harrow" });
  assert.equal(bound.ok, true);
  assert.equal(you.ledger.pact, 35);
  assert.equal(you.pacts.harrow, 4);
  assert.equal(harrow.pacts.you, 4);
  assert.equal(applyAction(w, "you", { type: "envoy", target: "harrow" }).ok, false);
  you.soldiers = 400;
  const march = applyAction(w, "you", { type: "attack", target: "harrow", mode: "seize", stake: 0 });
  assert.equal(march.ok, true);
  assert.equal(you.pacts.harrow, undefined);
});

test("meeting an ambition pays and names the next one", () => {
  const w = newWorld({ seed: 16 });
  const you = byId(w, "you");
  you.ambition = "study";
  const before = you.utopia;
  assert.equal(applyAction(w, "you", { type: "study", study: "furrow" }).ok, true);
  assert.equal(you.utopia, before + 40 + 50);
  assert.equal(you.ledger.ambition, 50);
  assert.notEqual(you.ambition, "study");
});

test("opening a place pays once", () => {
  const w = newWorld({ seed: 17 });
  const you = byId(w, "you");
  const site = w.sites[0];
  const before = you.utopia;
  assert.equal(applyAction(w, "you", { type: "clear", site: site.id }).ok, true);
  assert.equal(you.utopia, before + site.purse);
  assert.equal(you.ledger.site, site.purse);
  assert.equal(applyAction(w, "you", { type: "clear", site: site.id }).ok, false);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(ORDERS, 10);
  assert.equal(you.relics[site.id], true);
  assert.equal(seasonName(0), "Thaw");
  assert.equal(seasonName(30), "High Sun");
  assert.equal(seasonName(90), "Frost");
  assert.ok(seasonMod(0).food > 1);
});

test("a relic changes the host and tribute pays inside the band", () => {
  const w = newWorld({ seed: 19 });
  const you = byId(w, "you");
  const bare = offense(you);
  const bareWall = defense(you);
  you.relics = { barrow: true, stand: true };
  assert.ok(offense(you) > bare);
  assert.ok(defense(you) > bareWall);
  const harrow = byId(w, "harrow");
  you.intel.harrow = { hour: w.hour, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
  const gold = you.gold;
  const purse = you.utopia;
  const res = applyAction(w, "you", { type: "tribute", target: "harrow" });
  assert.equal(res.ok, true);
  assert.ok(you.gold > gold);
  assert.ok(harrow.gold >= 0);
  assert.ok(you.utopia >= purse);
  assert.ok(you.ledger.tribute > 0);
  assert.ok(you.ledger.tribute <= EARN.tribute);
  assert.equal(applyAction(w, "you", { type: "tribute", target: "harrow" }).ok, false);
});

test("a watch fire scouts in range, chains one hop, and dulls a pilfer", () => {
  const w = newWorld({ seed: 21 });
  const you = byId(w, "you");
  const harrow = byId(w, "harrow");
  const vellum = byId(w, "vellum");
  const moss = byId(w, "moss");
  you.x = 0;
  you.y = 0;
  harrow.x = 700;
  harrow.y = 0;
  vellum.x = 1400;
  vellum.y = 0;
  moss.x = 2400;
  moss.y = 0;
  you.gold = 5000;
  you.grain = 40;
  assert.equal(applyAction(w, "you", { type: "beacon" }).ok, false);
  you.grain = 5000;
  const purse = you.utopia;
  const lit = applyAction(w, "you", { type: "beacon" });
  assert.equal(lit.ok, true);
  assert.equal(you.ledger.beacon, EARN.beacon);
  assert.equal(you.utopia, purse + EARN.beacon);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(beaconLit(you, w.hour), true);
  assert.ok(intelFresh(you, "harrow", w.hour));
  assert.equal(intelFresh(you, "vellum", w.hour), null);
  assert.equal(intelFresh(you, "moss", w.hour), null);
  assert.equal(applyAction(w, "you", { type: "beacon" }).ok, false);
  you.beaconUntil = 0;
  you.intel = {};
  you.orders = ORDERS;
  harrow.beaconUntil = w.hour + 6;
  assert.equal(applyAction(w, "you", { type: "beacon" }).ok, true);
  assert.ok(intelFresh(you, "vellum", w.hour));
  assert.equal(intelFresh(you, "moss", w.hour), null);
  assert.equal(you.ledger.beacon, EARN.beacon * 2);
  const view = redact(w, "moss");
  const hidden = view.provinces.find((p) => p.id === "you");
  assert.equal(hidden.name, "Unscouted");
  assert.equal(hidden.beaconUntil, you.beaconUntil);
  const kept = hydrate(serialize(w));
  assert.equal(byId(kept, "you").beaconUntil, you.beaconUntil);

  const open = newWorld({ seed: 22 });
  const thief = byId(open, "you");
  const camp = byId(open, "harrow");
  camp.land = thief.land;
  camp.buildings = { ...thief.buildings, keep: 0 };
  thief.buildings = { ...thief.buildings, keep: 0 };
  camp.peasants = thief.peasants;
  camp.soldiers = thief.soldiers;
  camp.elites = thief.elites;
  camp.thieves = thief.thieves = 10;
  camp.mystics = thief.mystics;
  camp.gold = thief.gold;
  camp.grain = thief.grain;
  camp.faction = thief.faction;
  const easy = applyAction(open, "you", { type: "thief", op: "pilfer", target: "harrow" });
  assert.equal(easy.win, true);

  const shut = newWorld({ seed: 22 });
  const thief2 = byId(shut, "you");
  const camp2 = byId(shut, "harrow");
  camp2.land = thief2.land;
  camp2.buildings = { ...thief2.buildings, keep: 0 };
  thief2.buildings = { ...thief2.buildings, keep: 0 };
  camp2.peasants = thief2.peasants;
  camp2.soldiers = thief2.soldiers;
  camp2.elites = thief2.elites;
  camp2.thieves = thief2.thieves = 10;
  camp2.mystics = thief2.mystics;
  camp2.gold = thief2.gold;
  camp2.grain = thief2.grain;
  camp2.faction = thief2.faction;
  camp2.beaconUntil = shut.hour + 6;
  const resisted = applyAction(shut, "you", { type: "thief", op: "pilfer", target: "harrow" });
  assert.equal(resisted.win, false);

  const refresh = newWorld({ seed: 23 });
  const home = byId(refresh, "you");
  const near = byId(refresh, "harrow");
  home.x = 0;
  home.y = 0;
  near.x = 120;
  near.y = 0;
  home.beaconUntil = 4;
  home.intel = {};
  home.acted = false;
  advanceHour(refresh);
  assert.equal(refresh.hour, 1);
  assert.ok(intelFresh(home, "harrow", refresh.hour));
});

test("a winning sack pens people and a ransom sends them home", () => {
  const w = newWorld({ seed: 24 });
  const you = byId(w, "you");
  const harrow = byId(w, "harrow");
  harrow.soldiers = 10;
  harrow.elites = 0;
  harrow.buildings.keep = 0;
  const folk = harrow.peasants;
  const sack = applyAction(w, "you", { type: "attack", target: "harrow", mode: "sack" });
  assert.equal(sack.ok, true);
  assert.equal(sack.win, true);
  const n = you.pens.harrow;
  assert.ok(n >= 1);
  assert.equal(harrow.peasants, folk - n);
  you.orders = ORDERS;
  const purse = you.utopia;
  const theirGold = harrow.gold;
  const paid = applyAction(w, "you", { type: "ransom", target: "harrow" });
  assert.equal(paid.ok, true);
  assert.equal(you.pens.harrow, undefined);
  assert.equal(harrow.peasants, folk);
  assert.ok(you.gold > 0);
  assert.ok(harrow.gold < theirGold);
  assert.ok(you.ledger.ransom > 0);
  assert.ok(you.ledger.ransom <= EARN.ransom);
  assert.equal(you.utopia, purse + you.ledger.ransom);
  assert.equal(applyAction(w, "you", { type: "ransom", target: "harrow" }).ok, false);

  you.pens = { harrow: 4 };
  harrow.grudge = "you";
  harrow.peasants = 40;
  you.orders = ORDERS;
  assert.equal(applyAction(w, "you", { type: "release", target: "harrow" }).ok, true);
  assert.equal(harrow.peasants, 44);
  assert.equal(harrow.grudge, null);
  assert.equal(captiveCount(you), 0);

  you.pens = { harrow: 5 };
  you.buildings.field = 0;
  you.buildings.workshop = 0;
  you.grain = 0;
  you.acted = false;
  advanceHour(w);
  assert.equal(captiveCount(you), 0);
  assert.ok(you.grain >= 0);

  const again = newWorld({ seed: 25 });
  const seat = byId(again, "you");
  seat.pens = { harrow: 3 };
  const view = redact(again, "harrow");
  const hidden = view.provinces.find((p) => p.id === "you");
  assert.equal(hidden.name, "Unscouted");
  assert.equal(hidden.held, 3);
  assert.deepEqual(hidden.pens, {});
  assert.equal(captiveCount(hidden), 3);
});

test("the muster bell calls a field host and sends them home", () => {
  const w = newWorld({ seed: 26 });
  const you = byId(w, "you");
  const peasants = you.peasants;
  const gold = you.gold;
  const purse = you.utopia;
  const bareOff = offense(you);
  const bareDef = defense(you);
  const bareFood = foodNeed(you);
  const called = applyAction(w, "you", { type: "muster" });
  assert.equal(called.ok, true);
  assert.equal(you.muster, 36);
  assert.equal(you.peasants, peasants - 36);
  assert.equal(you.gold, gold - 120);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.muster, EARN.muster);
  assert.equal(you.utopia, purse + EARN.muster);
  assert.equal(you.musterUntil, 4);
  assert.ok(offense(you) > bareOff);
  assert.ok(defense(you) > bareDef);
  assert.ok(foodNeed(you) >= bareFood);
  assert.equal(applyAction(w, "you", { type: "muster" }).ok, false);
  const thin = newWorld({ seed: 27 });
  byId(thin, "you").peasants = 20;
  assert.equal(applyAction(thin, "you", { type: "muster" }).ok, false);

  const harrow = byId(w, "harrow");
  harrow.soldiers = 8;
  harrow.elites = 0;
  harrow.buildings.keep = 0;
  const beforeHost = you.muster;
  const march = applyAction(w, "you", { type: "attack", target: "harrow", mode: "seize" });
  assert.equal(march.ok, true);
  assert.equal(march.win, true);
  assert.ok(you.muster < beforeHost);

  w.provinces = [you];
  you.muster = 36;
  you.musterUntil = w.hour + 4;
  const home = you.peasants;
  for (let i = 0; i < 3; i++) advanceHour(w);
  assert.equal(you.muster, 36);
  advanceHour(w);
  assert.equal(you.muster, 0);
  assert.ok(you.peasants >= home + 36);
});

test("the grain stall pays once an hour and follows the season", () => {
  assert.equal(stallQuote(0).name, "Thaw");
  assert.equal(stallQuote(0).sell, 220);
  assert.equal(stallQuote(30).sell, 200);
  assert.equal(stallQuote(60).sell, 160);
  assert.equal(stallQuote(90).sell, 280);
  assert.equal(stallQuote(90).buy, 320);
  const w = newWorld({ seed: 28 });
  const you = byId(w, "you");
  const grain = you.grain;
  const gold = you.gold;
  const purse = you.utopia;
  const sold = applyAction(w, "you", { type: "stall", mode: "sell" });
  assert.equal(sold.ok, true);
  assert.equal(you.grain, grain - 400);
  assert.equal(you.gold, gold + 220);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.stall, EARN.stall);
  assert.equal(you.utopia, purse + EARN.stall);
  assert.equal(you.stallHour, 0);
  you.orders = ORDERS;
  assert.equal(applyAction(w, "you", { type: "stall", mode: "sell" }).ok, true);
  assert.equal(you.ledger.stall, EARN.stall);
  assert.equal(you.grain, grain - 800);
  you.grain = 100;
  you.orders = ORDERS;
  assert.equal(applyAction(w, "you", { type: "stall", mode: "sell" }).ok, false);
  w.hour = 90;
  you.gold = 5000;
  you.orders = ORDERS;
  const beforeGrain = you.grain;
  const beforeGold = you.gold;
  const beforePurse = you.utopia;
  const bought = applyAction(w, "you", { type: "stall", mode: "buy" });
  assert.equal(bought.ok, true);
  assert.equal(you.grain, beforeGrain + 400);
  assert.equal(you.gold, beforeGold - 320);
  assert.equal(you.utopia, beforePurse);
  assert.equal(you.stallHour, 90);
  assert.equal(applyAction(w, "you", { type: "stall", mode: "barter" }).ok, false);
});

test("a feast spends the table and grows the hearth", () => {
  const fed = newWorld({ seed: 29 });
  const plain = newWorld({ seed: 29 });
  for (const realm of [fed, plain]) {
    const seat = byId(realm, "you");
    seat.peasants = 100;
    seat.grain = 20000;
    seat.gold = 5000;
    realm.provinces = [seat];
  }
  const you = byId(fed, "you");
  const purse = you.utopia;
  const grain = you.grain;
  const gold = you.gold;
  assert.equal(applyAction(fed, "you", { type: "feast" }).ok, true);
  assert.equal(you.grain, grain - 450);
  assert.equal(you.gold, gold - 160);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.feast, EARN.feast);
  assert.equal(you.utopia, purse + EARN.feast);
  assert.equal(feastLive(you, fed.hour), true);
  assert.equal(applyAction(fed, "you", { type: "feast" }).ok, false);
  you.grain = 40;
  you.gold = 5000;
  you.orders = ORDERS;
  you.feastUntil = 0;
  assert.equal(applyAction(fed, "you", { type: "feast" }).ok, false);
  you.grain = 20000;
  you.feastUntil = 5;
  advanceHour(fed);
  advanceHour(plain);
  assert.equal(byId(fed, "you").peasants, byId(plain, "you").peasants + 6);
});

test("a bounty needs a scout, pays the taker, and returns if it expires", () => {
  const w = newWorld({ seed: 30 });
  const you = byId(w, "you");
  const harrow = byId(w, "harrow");
  assert.equal(applyAction(w, "you", { type: "bounty", target: "harrow" }).ok, false);
  you.intel.harrow = { hour: w.hour, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
  const gold = you.gold;
  assert.equal(applyAction(w, "you", { type: "bounty", target: "harrow" }).ok, true);
  assert.equal(you.gold, gold - 200);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(bountyOn(w, "harrow", w.hour).gold, 200);
  assert.equal(applyAction(w, "you", { type: "bounty", target: "harrow" }).ok, false);
  harrow.soldiers = 5;
  harrow.elites = 0;
  harrow.buildings.keep = 0;
  you.orders = ORDERS;
  const own = applyAction(w, "you", { type: "attack", target: "harrow", mode: "sack" });
  assert.equal(own.win, true);
  assert.equal(bountyOn(w, "harrow", w.hour).poster, "you");

  const other = newWorld({ seed: 31 });
  const taker = byId(other, "you");
  const camp = byId(other, "harrow");
  other.bounties = { harrow: { poster: "sable", gold: 200, until: 8 } };
  camp.soldiers = 5;
  camp.elites = 0;
  camp.buildings.keep = 0;
  const before = taker.gold;
  const purse = taker.utopia;
  const won = applyAction(other, "you", { type: "attack", target: "harrow", mode: "seize" });
  assert.equal(won.win, true);
  assert.equal(taker.gold, before + 200);
  assert.equal(bountyOn(other, "harrow", other.hour), null);
  assert.ok(taker.ledger.bounty > 0);
  assert.ok(taker.ledger.bounty <= EARN.bounty);
  assert.ok(taker.utopia > purse);

  const aged = newWorld({ seed: 32 });
  const seat = byId(aged, "you");
  aged.provinces = [seat];
  aged.hour = 7;
  aged.bounties = { harrow: { poster: "you", gold: 200, until: 8 } };
  const held = seat.gold;
  advanceHour(aged);
  assert.equal(aged.hour, 8);
  assert.equal(aged.bounties.harrow, undefined);
  assert.ok(seat.gold >= held + 200);
});

test("prospecting strikes a vein and a spring feeds the fields", () => {
  const w = newWorld({ seed: 33 });
  const you = byId(w, "you");
  const purse = you.utopia;
  const gold = you.gold;
  const struck = applyAction(w, "you", { type: "prospect" });
  assert.equal(struck.ok, true);
  assert.ok(["salt", "iron", "spring"].includes(you.vein));
  assert.equal(you.veinUntil, 8);
  assert.equal(you.gold, gold - 180);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.vein, EARN.vein);
  assert.equal(you.utopia, purse + EARN.vein);
  assert.equal(applyAction(w, "you", { type: "prospect" }).ok, false);
  const poor = newWorld({ seed: 34 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "prospect" }).ok, false);

  const wet = newWorld({ seed: 35 });
  const dry = newWorld({ seed: 35 });
  for (const realm of [wet, dry]) {
    const seat = byId(realm, "you");
    seat.peasants = 100;
    seat.grain = 0;
    seat.buildings.field = 10;
    seat.buildings.workshop = 0;
    realm.provinces = [seat];
  }
  const quiet = byId(dry, "you");
  const bare = offense(quiet);
  quiet.vein = "iron";
  quiet.veinUntil = 8;
  assert.ok(offense(quiet) > bare);
  quiet.vein = "";
  byId(wet, "you").vein = "spring";
  byId(wet, "you").veinUntil = 8;
  advanceHour(wet);
  advanceHour(dry);
  assert.ok(byId(wet, "you").grain > byId(dry, "you").grain);

  const aged = newWorld({ seed: 36 });
  const seat = byId(aged, "you");
  aged.provinces = [seat];
  aged.hour = 7;
  seat.vein = "salt";
  seat.veinUntil = 8;
  advanceHour(aged);
  assert.equal(aged.hour, 8);
  assert.equal(seat.vein, "");
});

test("relief feeds a hungry camp, pays once, and waits out the road", () => {
  const w = newWorld({ seed: 37 });
  const you = byId(w, "you");
  const harrow = byId(w, "harrow");
  assert.equal(applyAction(w, "you", { type: "relief", target: "harrow" }).ok, false);
  you.intel.harrow = { hour: w.hour, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
  harrow.grain = 0;
  harrow.grudge = "you";
  const yours = you.grain;
  const purse = you.utopia;
  const sent = applyAction(w, "you", { type: "relief", target: "harrow" });
  assert.equal(sent.ok, true);
  assert.equal(you.grain, yours - 360);
  assert.equal(harrow.grain, 360);
  assert.equal(harrow.grudge, null);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.relief, EARN.relief);
  assert.equal(you.utopia, purse + EARN.relief);
  assert.equal(you.reliefs.harrow, 4);
  you.orders = ORDERS;
  assert.equal(applyAction(w, "you", { type: "relief", target: "harrow" }).ok, false);

  const fat = newWorld({ seed: 38 });
  const seat = byId(fat, "you");
  const camp = byId(fat, "harrow");
  seat.intel.harrow = { hour: 0, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
  camp.grain = 80000;
  const before = seat.utopia;
  assert.equal(applyAction(fat, "you", { type: "relief", target: "harrow" }).ok, true);
  assert.equal(camp.grain, 80360);
  assert.equal(seat.utopia, before);
  assert.equal(seat.ledger.relief, undefined);
  seat.grain = 100;
  seat.orders = ORDERS;
  seat.reliefs = {};
  assert.equal(applyAction(fat, "you", { type: "relief", target: "harrow" }).ok, false);
});

test("the smith arms the host for six hours", () => {
  const w = newWorld({ seed: 39 });
  const you = byId(w, "you");
  const bare = offense(you);
  const gold = you.gold;
  const purse = you.utopia;
  assert.equal(applyAction(w, "you", { type: "smith" }).ok, true);
  assert.equal(you.gold, gold - 200);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.smithUntil, 6);
  assert.equal(you.ledger.smith, EARN.smith);
  assert.equal(you.utopia, purse + EARN.smith);
  assert.ok(offense(you) > bare);
  assert.equal(applyAction(w, "you", { type: "smith" }).ok, false);
  const poor = newWorld({ seed: 40 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "smith" }).ok, false);
  w.provinces = [you];
  w.hour = 5;
  you.smithUntil = 6;
  const armed = offense(you);
  advanceHour(w);
  assert.equal(w.hour, 6);
  assert.equal(you.smithUntil, 0);
  assert.ok(offense(you) < armed);
});

test("a grain seal halves what a sack can carry", () => {
  const w = newWorld({ seed: 41 });
  const you = byId(w, "you");
  const gold = you.gold;
  const purse = you.utopia;
  assert.equal(applyAction(w, "you", { type: "seal" }).ok, true);
  assert.equal(you.gold, gold - 90);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.sealUntil, 5);
  assert.equal(you.ledger.seal, EARN.seal);
  assert.equal(you.utopia, purse + EARN.seal);
  assert.equal(applyAction(w, "you", { type: "seal" }).ok, false);
  const poor = newWorld({ seed: 42 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "seal" }).ok, false);

  const open = newWorld({ seed: 43 });
  const shut = newWorld({ seed: 43 });
  for (const realm of [open, shut]) {
    const camp = byId(realm, "harrow");
    camp.soldiers = 8;
    camp.elites = 0;
    camp.buildings.keep = 0;
    camp.grain = 10000;
  }
  byId(shut, "harrow").sealUntil = shut.hour + 5;
  const openBefore = byId(open, "harrow").grain;
  const shutBefore = byId(shut, "harrow").grain;
  assert.equal(applyAction(open, "you", { type: "attack", target: "harrow", mode: "sack" }).win, true);
  assert.equal(applyAction(shut, "you", { type: "attack", target: "harrow", mode: "sack" }).win, true);
  const openLost = openBefore - byId(open, "harrow").grain;
  const shutLost = shutBefore - byId(shut, "harrow").grain;
  assert.ok(openLost > 0);
  assert.equal(shutLost, Math.floor(openLost / 2));

  const aged = newWorld({ seed: 44 });
  const seat = byId(aged, "you");
  aged.provinces = [seat];
  aged.hour = 4;
  seat.sealUntil = 5;
  advanceHour(aged);
  assert.equal(aged.hour, 5);
  assert.equal(seat.sealUntil, 0);
});

test("a levee soaks one raze and waters the fields", () => {
  const w = newWorld({ seed: 45 });
  const you = byId(w, "you");
  const gold = you.gold;
  const purse = you.utopia;
  assert.equal(applyAction(w, "you", { type: "levee" }).ok, true);
  assert.equal(you.gold, gold - 150);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.leveeUntil, 6);
  assert.equal(you.ledger.levee, EARN.levee);
  assert.equal(you.utopia, purse + EARN.levee);
  assert.equal(leveeUp(you, w.hour), true);
  assert.equal(applyAction(w, "you", { type: "levee" }).ok, false);
  const poor = newWorld({ seed: 46 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "levee" }).ok, false);

  const open = newWorld({ seed: 47 });
  const banked = newWorld({ seed: 47 });
  for (const realm of [open, banked]) {
    const camp = byId(realm, "harrow");
    camp.soldiers = 8;
    camp.elites = 0;
    camp.buildings.keep = 0;
  }
  byId(banked, "harrow").leveeUntil = banked.hour + 6;
  const openBefore = buildingCount(byId(open, "harrow"));
  const bankedBefore = buildingCount(byId(banked, "harrow"));
  assert.equal(applyAction(open, "you", { type: "attack", target: "harrow", mode: "raze" }).win, true);
  assert.equal(applyAction(banked, "you", { type: "attack", target: "harrow", mode: "raze" }).win, true);
  const openLost = openBefore - buildingCount(byId(open, "harrow"));
  const bankedLost = bankedBefore - buildingCount(byId(banked, "harrow"));
  assert.ok(openLost > 1);
  assert.equal(bankedLost, openLost - 1);

  function grainGain(withLevee) {
    const realm = newWorld({ seed: 48 });
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    seat.grain = 50000;
    if (withLevee) seat.leveeUntil = 6;
    const before = seat.grain;
    advanceHour(realm);
    return seat.grain - before;
  }
  assert.ok(grainGain(true) > grainGain(false));

  const aged = newWorld({ seed: 49 });
  const seat = byId(aged, "you");
  aged.provinces = [seat];
  aged.hour = 5;
  seat.leveeUntil = 6;
  advanceHour(aged);
  assert.equal(aged.hour, 6);
  assert.equal(seat.leveeUntil, 0);
  assert.equal(leveeUp(seat, aged.hour), false);
});

test("a causeway needs a scout and makes the caravan haul heavier", () => {
  const w = newWorld({ seed: 52 });
  const you = byId(w, "you");
  assert.equal(applyAction(w, "you", { type: "road", target: "harrow" }).ok, false);
  you.intel.harrow = { hour: w.hour, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
  const gold = you.gold;
  const purse = you.utopia;
  assert.equal(applyAction(w, "you", { type: "road", target: "harrow" }).ok, true);
  assert.equal(you.gold, gold - 220);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.roads.harrow, 8);
  assert.equal(roadLive(you, "harrow", w.hour), true);
  assert.equal(you.ledger.road, EARN.road);
  assert.equal(you.utopia, purse + EARN.road);
  assert.equal(applyAction(w, "you", { type: "road", target: "harrow" }).ok, false);
  const poor = newWorld({ seed: 53 });
  const broke = byId(poor, "you");
  broke.intel.harrow = { hour: 0, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
  broke.gold = 10;
  assert.equal(applyAction(poor, "you", { type: "road", target: "harrow" }).ok, false);

  function netHaul(withRoad) {
    const realm = newWorld({ seed: 54 });
    const seat = byId(realm, "you");
    seat.intel.harrow = { hour: 0, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
    if (withRoad) seat.roads.harrow = 8;
    const before = seat.gold;
    assert.equal(applyAction(realm, "you", { type: "trade", target: "harrow" }).ok, true);
    return seat.gold - before + 200;
  }
  const openHaul = netHaul(false);
  const pavedHaul = netHaul(true);
  assert.ok(openHaul > 0);
  assert.equal(pavedHaul, Math.floor(openHaul * 1.25));

  const march = newWorld({ seed: 55 });
  const seat = byId(march, "you");
  seat.intel.harrow = { hour: 0, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
  seat.roads.harrow = 8;
  seat.soldiers = 400;
  assert.equal(applyAction(march, "you", { type: "attack", target: "harrow", mode: "seize" }).ok, true);
  assert.equal(seat.roads.harrow, undefined);
  assert.equal(roadLive(seat, "harrow", march.hour), false);

  const aged = newWorld({ seed: 56 });
  const left = byId(aged, "you");
  aged.provinces = [left];
  aged.hour = 7;
  left.roads = { harrow: 8 };
  advanceHour(aged);
  assert.equal(aged.hour, 8);
  assert.equal(left.roads.harrow, undefined);
});

test("a fold yields wool and milk until a sack scatters it", () => {
  const w = newWorld({ seed: 57 });
  const you = byId(w, "you");
  const gold = you.gold;
  const purse = you.utopia;
  assert.equal(applyAction(w, "you", { type: "fold" }).ok, true);
  assert.equal(you.gold, gold - 110);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.fold, 28);
  assert.equal(you.foldUntil, 6);
  assert.equal(foldLive(you, w.hour), true);
  assert.equal(you.ledger.fold, EARN.fold);
  assert.equal(you.utopia, purse + EARN.fold);
  assert.equal(applyAction(w, "you", { type: "fold" }).ok, false);
  const poor = newWorld({ seed: 58 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "fold" }).ok, false);
  const thin = newWorld({ seed: 59 });
  byId(thin, "you").peasants = 12;
  assert.equal(applyAction(thin, "you", { type: "fold" }).ok, false);

  function tick(withFold) {
    const realm = newWorld({ seed: 60 });
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    seat.grain = 50000;
    seat.gold = 8000;
    if (withFold) {
      seat.fold = 28;
      seat.foldUntil = 6;
    }
    const grain = seat.grain;
    const purseGold = seat.gold;
    advanceHour(realm);
    return { grain: seat.grain - grain, gold: seat.gold - purseGold };
  }
  const open = tick(false);
  const penned = tick(true);
  assert.equal(penned.grain, open.grain + 48);
  assert.equal(penned.gold, open.gold + 22);

  const bare = newWorld({ seed: 61 });
  const folded = newWorld({ seed: 61 });
  for (const realm of [bare, folded]) {
    const camp = byId(realm, "harrow");
    camp.soldiers = 8;
    camp.elites = 0;
    camp.buildings.keep = 0;
    camp.grain = 10000;
  }
  byId(folded, "harrow").fold = 28;
  byId(folded, "harrow").foldUntil = 6;
  const bareBefore = byId(bare, "harrow").grain;
  const foldedBefore = byId(folded, "harrow").grain;
  assert.equal(applyAction(bare, "you", { type: "attack", target: "harrow", mode: "sack" }).win, true);
  assert.equal(applyAction(folded, "you", { type: "attack", target: "harrow", mode: "sack" }).win, true);
  const bareLost = bareBefore - byId(bare, "harrow").grain;
  const foldedLost = foldedBefore - byId(folded, "harrow").grain;
  assert.equal(foldedLost, bareLost + 90);
  assert.equal(foldLive(byId(folded, "harrow"), folded.hour), false);

  const aged = newWorld({ seed: 62 });
  const seat = byId(aged, "you");
  aged.provinces = [seat];
  aged.hour = 5;
  seat.fold = 28;
  seat.foldUntil = 6;
  advanceHour(aged);
  assert.equal(aged.hour, 6);
  assert.equal(seat.fold, 0);
  assert.equal(seat.foldUntil, 0);
});

test("settling buys live tiles and each arm locks to its ground", () => {
  const w = newWorld({ seed: 26 });
  const you = byId(w, "you");
  const before = you.plots.length;
  assert.ok(before >= 6);
  assert.ok(you.plots.every((tile) => tile.crew === "hand"));
  const settled = applyAction(w, "you", { type: "explore" });
  assert.equal(settled.ok, true);
  assert.equal(you.land, 210);
  assert.equal(you.plots.length, before + 2);
  assert.match(settled.message, /live tiles/);
  const rider = applyAction(w, "you", { type: "arm", unit: "rider" });
  assert.equal(rider.ok, true);
  const horse = you.plots.find((tile) => tile.crew === "rider");
  assert.ok(horse);
  assert.ok(["grass", "plain", "coast"].includes(terrainKind(horse.q, horse.r)));
  const engine = applyAction(w, "you", { type: "arm", unit: "engine" });
  assert.equal(engine.ok, true);
  const catapult = you.plots.find((tile) => tile.crew === "engine");
  assert.ok(["hill", "grass", "plain"].includes(terrainKind(catapult.q, catapult.r)));
  const sapper = applyAction(w, "you", { type: "arm", unit: "sapper" });
  assert.equal(sapper.ok, true);
  assert.ok(["hill", "mount", "wood"].includes(terrainKind(you.plots.find((tile) => tile.crew === "sapper").q, you.plots.find((tile) => tile.crew === "sapper").r)));
  assert.equal(you.ledger.arm, EARN.arm * 3);
  const wood = you.plots.find((tile) => terrainKind(tile.q, tile.r) === "wood");
  if (wood) wood.crew = "rider";
  const illegal = (you.plots || []).filter((tile) => tile.crew === "rider" && !["grass", "plain", "coast"].includes(terrainKind(tile.q, tile.r)));
  assert.equal(illegal.length, wood && terrainKind(wood.q, wood.r) === "wood" ? 1 : 0);
});

test("a curfew halves what a pilfer can carry", () => {
  const w = newWorld({ seed: 63 });
  const you = byId(w, "you");
  const gold = you.gold;
  const purse = you.utopia;
  assert.equal(applyAction(w, "you", { type: "curfew" }).ok, true);
  assert.equal(you.gold, gold - 85);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.curfewUntil, 5);
  assert.equal(curfewUp(you, w.hour), true);
  assert.equal(you.ledger.curfew, EARN.curfew);
  assert.equal(you.utopia, purse + EARN.curfew);
  assert.equal(applyAction(w, "you", { type: "curfew" }).ok, false);
  const poor = newWorld({ seed: 64 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "curfew" }).ok, false);

  const open = newWorld({ seed: 65 });
  const shut = newWorld({ seed: 65 });
  for (const realm of [open, shut]) {
    const seat = byId(realm, "you");
    const camp = byId(realm, "harrow");
    seat.thieves = 80;
    camp.thieves = 0;
    camp.buildings.keep = 0;
    camp.gold = 8000;
  }
  byId(shut, "harrow").curfewUntil = 5;
  const openBefore = byId(open, "harrow").gold;
  const shutBefore = byId(shut, "harrow").gold;
  assert.equal(applyAction(open, "you", { type: "thief", op: "pilfer", target: "harrow" }).win, true);
  assert.equal(applyAction(shut, "you", { type: "thief", op: "pilfer", target: "harrow" }).win, true);
  const openLost = openBefore - byId(open, "harrow").gold;
  const shutLost = shutBefore - byId(shut, "harrow").gold;
  assert.ok(openLost > 0);
  assert.equal(shutLost, Math.floor(openLost / 2));

  const aged = newWorld({ seed: 66 });
  const seat = byId(aged, "you");
  aged.provinces = [seat];
  aged.hour = 4;
  seat.curfewUntil = 5;
  advanceHour(aged);
  assert.equal(aged.hour, 5);
  assert.equal(seat.curfewUntil, 0);
  assert.equal(curfewUp(seat, aged.hour), false);
});

test("a hospice halves march losses and adds people", () => {
  const w = newWorld({ seed: 67 });
  const you = byId(w, "you");
  const gold = you.gold;
  const grain = you.grain;
  const purse = you.utopia;
  assert.equal(applyAction(w, "you", { type: "hospice" }).ok, true);
  assert.equal(you.gold, gold - 140);
  assert.equal(you.grain, grain - 180);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.hospiceUntil, 5);
  assert.equal(hospiceUp(you, w.hour), true);
  assert.equal(you.ledger.hospice, EARN.hospice);
  assert.equal(you.utopia, purse + EARN.hospice);
  assert.equal(applyAction(w, "you", { type: "hospice" }).ok, false);
  const poor = newWorld({ seed: 68 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "hospice" }).ok, false);
  const hungry = newWorld({ seed: 69 });
  byId(hungry, "you").grain = 10;
  assert.equal(applyAction(hungry, "you", { type: "hospice" }).ok, false);

  const open = newWorld({ seed: 70 });
  const tent = newWorld({ seed: 70 });
  for (const realm of [open, tent]) {
    const seat = byId(realm, "you");
    const camp = byId(realm, "harrow");
    seat.soldiers = 200;
    camp.soldiers = 8;
    camp.elites = 0;
    camp.buildings.keep = 0;
  }
  byId(tent, "you").hospiceUntil = 5;
  const openBefore = byId(open, "you").soldiers;
  const tentBefore = byId(tent, "you").soldiers;
  assert.equal(applyAction(open, "you", { type: "attack", target: "harrow", mode: "seize" }).win, true);
  assert.equal(applyAction(tent, "you", { type: "attack", target: "harrow", mode: "seize" }).win, true);
  const openLost = openBefore - byId(open, "you").soldiers;
  const tentLost = tentBefore - byId(tent, "you").soldiers;
  assert.ok(openLost > tentLost);

  function grown(withTent) {
    const realm = newWorld({ seed: 71 });
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    seat.grain = 50000;
    seat.peasants = 700;
    if (withTent) seat.hospiceUntil = 6;
    const before = seat.peasants;
    advanceHour(realm);
    return seat.peasants - before;
  }
  assert.equal(grown(true), grown(false) + 3);

  const aged = newWorld({ seed: 72 });
  const seat = byId(aged, "you");
  aged.provinces = [seat];
  aged.hour = 4;
  seat.hospiceUntil = 5;
  advanceHour(aged);
  assert.equal(aged.hour, 5);
  assert.equal(seat.hospiceUntil, 0);
  assert.equal(hospiceUp(seat, aged.hour), false);
});

test("a hamlet keeps a grass or wheat tile and feeds the holding", () => {
  const raised = newWorld({ seed: 26 });
  const you = byId(raised, "you");
  const res = applyAction(raised, "you", { type: "hamlet" });
  assert.equal(res.ok, true);
  const tile = you.plots.find((row) => row.crew === "hamlet");
  assert.ok(tile);
  assert.ok(["grass", "plain"].includes(terrainKind(tile.q, tile.r)));
  assert.equal(you.ledger.hamlet, EARN.hamlet);
  const bare = newWorld({ seed: 26 });
  raised.provinces = [you];
  bare.provinces = [byId(bare, "you")];
  const gold = you.gold;
  const grain = you.grain;
  const otherGold = bare.provinces[0].gold;
  const otherGrain = bare.provinces[0].grain;
  advanceHour(raised);
  advanceHour(bare);
  assert.ok(you.gold - gold > bare.provinces[0].gold - otherGold);
  assert.ok(you.grain - grain > bare.provinces[0].grain - otherGrain);
  you.orders = 3;
  you.gold = 2000;
  assert.equal(applyAction(raised, "you", { type: "hamlet" }).ok, true);
  assert.equal(applyAction(raised, "you", { type: "hamlet" }).ok, true);
  assert.equal(applyAction(raised, "you", { type: "hamlet" }).ok, false);
});

test("a wayside inn tolls travelers, feeds a caravan, and burns in a sack", () => {
  const w = newWorld({ seed: 88 });
  const you = byId(w, "you");
  const gold = you.gold;
  const grain = you.grain;
  const purse = you.utopia;
  assert.equal(applyAction(w, "you", { type: "inn" }).ok, true);
  assert.equal(you.gold, gold - 175);
  assert.equal(you.grain, grain - 220);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.innUntil, 6);
  assert.equal(innUp(you, w.hour), true);
  assert.equal(innToll(you, w.hour), 18);
  assert.equal(you.ledger.inn, EARN.inn);
  assert.equal(you.utopia, purse + EARN.inn);
  assert.equal(applyAction(w, "you", { type: "inn" }).ok, false);
  const poor = newWorld({ seed: 89 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "inn" }).ok, false);
  const hungry = newWorld({ seed: 90 });
  byId(hungry, "you").grain = 10;
  assert.equal(applyAction(hungry, "you", { type: "inn" }).ok, false);
  const quiet = newWorld({ seed: 91 });
  byId(quiet, "you").orders = 0;
  assert.equal(applyAction(quiet, "you", { type: "inn" }).ok, false);

  function gain(hour, extra) {
    const realm = newWorld({ seed: 92 });
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    realm.hour = hour;
    seat.innUntil = hour + 6;
    if (extra === "pact") seat.pacts = { harrow: hour + 4 };
    if (extra === "road") seat.roads = { harrow: hour + 8 };
    if (extra === "both") {
      seat.pacts = { harrow: hour + 4 };
      seat.roads = { harrow: hour + 8 };
    }
    const before = seat.gold;
    advanceHour(realm);
    return seat.gold - before;
  }
  function bare(hour) {
    const realm = newWorld({ seed: 92 });
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    realm.hour = hour;
    const before = seat.gold;
    advanceHour(realm);
    return seat.gold - before;
  }
  assert.equal(gain(0) - bare(0), 18);
  assert.equal(gain(0, "pact") - bare(0), 32);
  assert.equal(gain(0, "road") - bare(0), 28);
  assert.equal(gain(0, "both") - bare(0), 42);
  assert.equal(gain(30) - bare(30), Math.floor(18 * 1.15));
  assert.equal(gain(60) - bare(60), Math.floor(18 * 1.08));
  assert.equal(gain(90) - bare(90), Math.floor(18 * 0.7));

  function hauled(withInn) {
    const realm = newWorld({ seed: 93 });
    const seat = byId(realm, "you");
    seat.intel.harrow = { hour: 0, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
    if (withInn) seat.innUntil = 6;
    const before = seat.gold;
    assert.equal(applyAction(realm, "you", { type: "trade", target: "harrow" }).ok, true);
    return seat.gold - before;
  }
  assert.ok(hauled(true) > hauled(false));

  function sacked(withInn) {
    const realm = newWorld({ seed: 94 });
    const seat = byId(realm, "you");
    const camp = byId(realm, "harrow");
    seat.soldiers = 200;
    camp.soldiers = 8;
    camp.elites = 0;
    camp.buildings.keep = 0;
    if (withInn) camp.innUntil = 6;
    const before = seat.gold;
    const res = applyAction(realm, "you", { type: "attack", target: "harrow", mode: "sack" });
    assert.equal(res.win, true);
    return { gold: seat.gold - before, up: innUp(camp, realm.hour) };
  }
  const open = sacked(false);
  const shut = sacked(true);
  assert.equal(shut.gold, open.gold + 70);
  assert.equal(shut.up, false);

  const aged = newWorld({ seed: 95 });
  const seat = byId(aged, "you");
  aged.provinces = [seat];
  aged.hour = 5;
  seat.innUntil = 6;
  advanceHour(aged);
  assert.equal(aged.hour, 6);
  assert.equal(seat.innUntil, 0);
  assert.equal(innUp(seat, aged.hour), false);
});

test("a weir needs water, yields with the season, and a sack tears it up", () => {
  const w = newWorld({ seed: 96 });
  const you = byId(w, "you");
  const gold = you.gold;
  const purse = you.utopia;
  const posts = you.plots.filter((tile) => waterTouch(tile)).length;
  assert.ok(posts >= 3);
  assert.equal(applyAction(w, "you", { type: "weir" }).ok, true);
  assert.equal(you.gold, gold - 160);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.weir, 3);
  assert.equal(you.plots.filter((tile) => tile.net).length, 3);
  assert.equal(you.weirUntil, 7);
  assert.equal(weirLive(you, w.hour), true);
  assert.equal(weirYield(you, 0).grain, 66);
  assert.equal(weirYield(you, 0).gold, 24);
  assert.equal(you.ledger.weir, EARN.weir);
  assert.equal(you.utopia, purse + EARN.weir);
  assert.equal(applyAction(w, "you", { type: "weir" }).ok, false);
  assert.equal(applyAction(w, "harrow", { type: "weir" }).ok, false);
  const poor = newWorld({ seed: 97 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "weir" }).ok, false);
  const short = newWorld({ seed: 98 });
  byId(short, "you").peasants = 8;
  assert.equal(applyAction(short, "you", { type: "weir" }).ok, false);
  const dry = newWorld({ seed: 99 });
  const inland = byId(dry, "you");
  inland.plots = inland.plots.filter((tile) => !waterTouch(tile));
  assert.ok(inland.plots.length > 0);
  assert.equal(applyAction(dry, "you", { type: "weir" }).ok, false);

  function delta(hour, posts) {
    const realm = newWorld({ seed: 100 });
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    realm.hour = hour;
    const beforeGold = seat.gold;
    const beforeGrain = seat.grain;
    if (posts) {
      seat.weir = posts;
      seat.weirUntil = hour + 7;
    }
    advanceHour(realm);
    return { gold: seat.gold - beforeGold, grain: seat.grain - beforeGrain };
  }
  const thaw = delta(0, 2);
  const bare = delta(0, 0);
  assert.equal(thaw.gold - bare.gold, 16);
  assert.equal(thaw.grain - bare.grain, 44);
  const sun = delta(30, 2);
  const sunBare = delta(30, 0);
  assert.equal(sun.grain - sunBare.grain, Math.floor(44 * 1.2));
  assert.equal(sun.gold - sunBare.gold, Math.floor(16 * 1.15));
  const harvest = delta(60, 2);
  const harvestBare = delta(60, 0);
  assert.equal(harvest.grain - harvestBare.grain, Math.floor(44 * 1.1));
  assert.equal(harvest.gold - harvestBare.gold, 16);
  const frost = delta(90, 2);
  const frostBare = delta(90, 0);
  assert.equal(frost.grain - frostBare.grain, Math.floor(44 * 0.5));
  assert.equal(frost.gold - frostBare.gold, Math.floor(16 * 0.5));

  function hauled(withWeir) {
    const realm = newWorld({ seed: 101 });
    const seat = byId(realm, "you");
    seat.intel.harrow = { hour: 0, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
    if (withWeir) {
      seat.weir = 1;
      seat.weirUntil = 7;
    }
    const before = seat.gold;
    assert.equal(applyAction(realm, "you", { type: "trade", target: "harrow" }).ok, true);
    return seat.gold - before;
  }
  assert.ok(hauled(true) > hauled(false));

  function sacked(withWeir) {
    const realm = newWorld({ seed: 102 });
    const seat = byId(realm, "you");
    const camp = byId(realm, "harrow");
    seat.soldiers = 200;
    camp.soldiers = 8;
    camp.elites = 0;
    camp.buildings.keep = 0;
    camp.plots = [{ q: 1, r: 1, crew: "hand", net: true }];
    if (withWeir) {
      camp.weir = 1;
      camp.weirUntil = 6;
    }
    const before = seat.grain;
    const res = applyAction(realm, "you", { type: "attack", target: "harrow", mode: "sack" });
    assert.equal(res.win, true);
    return { grain: seat.grain - before, up: weirLive(camp, realm.hour), net: camp.plots.some((tile) => tile.net) };
  }
  const open = sacked(false);
  const shut = sacked(true);
  assert.equal(shut.grain, open.grain + 40);
  assert.equal(shut.up, false);
  assert.equal(shut.net, false);

  const aged = newWorld({ seed: 103 });
  const seat = byId(aged, "you");
  aged.provinces = [seat];
  aged.hour = 6;
  seat.weir = 2;
  seat.weirUntil = 7;
  seat.plots[0].net = true;
  advanceHour(aged);
  assert.equal(aged.hour, 7);
  assert.equal(seat.weirUntil, 0);
  assert.equal(seat.weir, 0);
  assert.equal(weirLive(seat, aged.hour), false);
  assert.equal(seat.plots.some((tile) => tile.net), false);
});

test("a timber yard pays from a wood tile, cheapens a causeway, and a sack burns one stack", () => {
  const w = newWorld({ seed: 110 });
  const you = byId(w, "you");
  const woods = you.plots.filter((tile) => tile.crew === "hand" && terrainKind(tile.q, tile.r) === "wood");
  assert.ok(woods.length >= 2);
  const gold = you.gold;
  const purse = you.utopia;
  assert.equal(applyAction(w, "you", { type: "timber" }).ok, true);
  assert.equal(you.gold, gold - 170);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(timberYards(you), 1);
  assert.equal(you.ledger.timber, EARN.timber);
  assert.equal(you.utopia, purse + EARN.timber);
  you.orders = 1;
  assert.equal(applyAction(w, "you", { type: "timber" }).ok, true);
  assert.equal(timberYards(you), 2);
  assert.equal(you.ledger.timber, EARN.timber * 2);
  you.orders = 1;
  you.gold = 2000;
  assert.equal(applyAction(w, "you", { type: "timber" }).ok, false);
  const poor = newWorld({ seed: 111 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "timber" }).ok, false);
  const bare = newWorld({ seed: 112 });
  const inland = byId(bare, "you");
  inland.plots = inland.plots.filter((tile) => terrainKind(tile.q, tile.r) !== "wood");
  assert.equal(applyAction(bare, "you", { type: "timber" }).ok, false);

  function coined(cut) {
    const realm = newWorld({ seed: 113 });
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    const wood = seat.plots.find((tile) => tile.crew === "hand" && terrainKind(tile.q, tile.r) === "wood");
    if (cut) wood.crew = "timber";
    const before = seat.gold;
    advanceHour(realm);
    return seat.gold - before;
  }
  assert.equal(coined(true) - coined(false), 23);

  function spent(withYard) {
    const realm = newWorld({ seed: 114 });
    const seat = byId(realm, "you");
    seat.intel.harrow = { hour: 0, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
    if (withYard) {
      const wood = seat.plots.find((tile) => tile.crew === "hand" && terrainKind(tile.q, tile.r) === "wood");
      wood.crew = "timber";
    }
    const before = seat.gold;
    assert.equal(applyAction(realm, "you", { type: "road", target: "harrow" }).ok, true);
    return before - seat.gold;
  }
  assert.equal(spent(false), 220);
  assert.equal(spent(true), 180);

  function sacked(withYard) {
    const realm = newWorld({ seed: 115 });
    const seat = byId(realm, "you");
    const camp = byId(realm, "harrow");
    seat.soldiers = 200;
    camp.soldiers = 8;
    camp.elites = 0;
    camp.buildings.keep = 0;
    camp.plots = [
      { q: 2, r: 2, crew: withYard ? "timber" : "hand" },
      { q: 3, r: 2, crew: withYard ? "timber" : "hand" },
    ];
    const before = seat.gold;
    const res = applyAction(realm, "you", { type: "attack", target: "harrow", mode: "sack" });
    assert.equal(res.win, true);
    return { gold: seat.gold - before, yards: timberYards(camp) };
  }
  const open = sacked(false);
  const shut = sacked(true);
  assert.equal(shut.gold, open.gold + 50);
  assert.equal(shut.yards, 1);
});

test("a quarry claims nearby stone, cheapens a keep, and a sack collapses one face", () => {
  const w = newWorld({ seed: 1 });
  const you = byId(w, "you");
  const held = you.plots.length;
  const gold = you.gold;
  const purse = you.utopia;
  assert.equal(you.plots.some((tile) => tile.crew === "hand" && (terrainKind(tile.q, tile.r) === "hill" || terrainKind(tile.q, tile.r) === "mount")), false);
  assert.equal(applyAction(w, "you", { type: "quarry" }).ok, true);
  assert.equal(you.gold, gold - 190);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(quarryPits(you), 1);
  assert.equal(you.plots.length, held + 1);
  const face = you.plots.find((tile) => tile.crew === "quarry");
  assert.ok(face);
  assert.ok(terrainKind(face.q, face.r) === "hill" || terrainKind(face.q, face.r) === "mount");
  assert.equal(you.ledger.quarry, EARN.quarry);
  assert.equal(you.utopia, purse + EARN.quarry);
  you.orders = 1;
  you.gold = 4000;
  if (!you.plots.some((tile) => tile.crew === "hand" && (terrainKind(tile.q, tile.r) === "hill" || terrainKind(tile.q, tile.r) === "mount"))) {
    const spot = { q: 1, r: 4, crew: "hand" };
    if (!you.plots.some((tile) => tile.q === spot.q && tile.r === spot.r)) you.plots.push(spot);
  }
  const beforeSecond = quarryPits(you);
  assert.equal(applyAction(w, "you", { type: "quarry" }).ok, true);
  assert.equal(quarryPits(you), beforeSecond + 1);
  you.orders = 1;
  you.gold = 4000;
  assert.equal(applyAction(w, "you", { type: "quarry" }).ok, false);
  const poor = newWorld({ seed: 1 });
  byId(poor, "you").gold = 10;
  assert.equal(applyAction(poor, "you", { type: "quarry" }).ok, false);

  function coined(cut) {
    const realm = newWorld({ seed: 131 });
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    let tile = seat.plots.find((row) => row.q === 1 && row.r === 4);
    if (!tile) {
      tile = { q: 1, r: 4, crew: "hand" };
      seat.plots.push(tile);
    }
    assert.equal(terrainKind(tile.q, tile.r), "hill");
    tile.crew = cut ? "quarry" : "hand";
    const before = seat.gold;
    advanceHour(realm);
    return seat.gold - before;
  }
  assert.equal(coined(true) - coined(false), 22);

  const priced = newWorld({ seed: 132 });
  const buyer = byId(priced, "you");
  const bareKeep = stonePrice(buyer, "keep");
  const bareField = stonePrice(buyer, "field");
  buyer.plots.push({ q: 1, r: 4, crew: "quarry" });
  assert.equal(stonePrice(buyer, "keep"), bareKeep - 40);
  assert.equal(stonePrice(buyer, "field"), bareField);
  buyer.plots.push({ q: 9, r: 9, crew: "quarry" });
  assert.equal(stonePrice(buyer, "barracks"), Math.max(40, buyer.buildings.barracks * 20 + 180 - 80));
  const spent = buyer.gold;
  assert.equal(applyAction(priced, "you", { type: "build", building: "keep" }).ok, true);
  assert.equal(spent - buyer.gold, bareKeep - 80);

  buyer.grain = foodNeed(buyer);
  buyer.spells.bulwark = 0;
  const wall = defense(buyer);
  buyer.plots = buyer.plots.filter((tile) => tile.crew !== "quarry");
  assert.equal(wall - defense(buyer), 10);

  function sacked(withPit) {
    const realm = newWorld({ seed: 133 });
    const seat = byId(realm, "you");
    const camp = byId(realm, "harrow");
    seat.soldiers = 200;
    camp.soldiers = 8;
    camp.elites = 0;
    camp.buildings.keep = 0;
    camp.plots = [
      { q: 2, r: 2, crew: withPit ? "quarry" : "hand" },
      { q: 3, r: 2, crew: withPit ? "quarry" : "hand" },
      { q: 4, r: 2, crew: "hand" },
      { q: 5, r: 2, crew: "hand" },
      { q: 6, r: 2, crew: "hand" },
    ];
    const before = seat.gold;
    const res = applyAction(realm, "you", { type: "attack", target: "harrow", mode: "sack" });
    assert.equal(res.win, true);
    return { gold: seat.gold - before, pits: quarryPits(camp) };
  }
  const open = sacked(false);
  const shut = sacked(true);
  assert.equal(shut.gold, open.gold + 45);
  assert.equal(shut.pits, 1);

  const blocked = newWorld({ seed: 1 });
  const seat = byId(blocked, "you");
  const brine = byId(blocked, "brine");
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const seen = new Set(seat.plots.map((tile) => `${tile.q},${tile.r}`));
  const queue = seat.plots.map((tile) => ({ q: tile.q, r: tile.r, d: 0 }));
  const owned = new Set();
  for (const province of blocked.provinces) {
    for (const tile of province.plots) owned.add(`${tile.q},${tile.r}`);
  }
  while (queue.length) {
    const cell = queue.shift();
    if (cell.d > 0 && cell.d <= 4) {
      const key = `${cell.q},${cell.r}`;
      const kind = terrainKind(cell.q, cell.r);
      if (!owned.has(key) && (kind === "hill" || kind === "mount")) {
        brine.plots.push({ q: cell.q, r: cell.r, crew: "hand" });
        owned.add(key);
      }
    }
    if (cell.d >= 4) continue;
    for (const [dq, dr] of dirs) {
      const key = `${cell.q + dq},${cell.r + dr}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ q: cell.q + dq, r: cell.r + dr, d: cell.d + 1 });
    }
  }
  for (const tile of seat.plots) {
    const kind = terrainKind(tile.q, tile.r);
    if (kind === "hill" || kind === "mount") tile.crew = "foot";
  }
  seat.gold = 4000;
  assert.equal(applyAction(blocked, "you", { type: "quarry" }).ok, false);
});

test("a siege saps a scouted camp, returns its soldiers, and a march spends the works", () => {
  const w = newWorld({ seed: 4 });
  const you = byId(w, "you");
  const h = byId(w, "harrow");
  w.provinces = [you, h];
  h.kind = "human";
  you.intel.harrow = { hour: 0, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
  you.soldiers = 80;
  you.gold = 5000;
  const quiet = newWorld({ seed: 4 });
  const qYou = byId(quiet, "you");
  const qH = byId(quiet, "harrow");
  quiet.provinces = [qYou, qH];
  qH.kind = "human";
  const purse = you.utopia;
  const soldiers = you.soldiers;
  assert.equal(applyAction(w, "you", { type: "siege", target: "harrow" }).ok, true);
  assert.equal(you.soldiers, soldiers - 8);
  assert.equal(you.gold, 5000 - 260);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.siege, EARN.siege);
  assert.equal(you.utopia, purse + EARN.siege);
  assert.equal(siegeLive(you, w.hour), true);
  assert.equal(you.siege.until, 4);
  assert.equal(applyAction(w, "you", { type: "siege", target: "harrow" }).ok, false);
  const walls = buildingCount(h);
  advanceHour(w);
  advanceHour(quiet);
  assert.equal(h.grain, qH.grain - 36);
  assert.equal(buildingCount(h), walls - 1);
  assert.equal(siegeLive(you, w.hour), true);
  h.kind = "agent";
  you.orders = ORDERS;
  const away = you.soldiers;
  const spent = applyAction(w, "you", { type: "attack", target: "harrow", mode: "seize" });
  assert.equal(spent.ok, true);
  assert.equal(spent.win, true);
  assert.equal(siegeLive(you, w.hour), false);
  assert.ok(you.soldiers > away);
  assert.match(spent.message, /siege works joined/);

  const blind = newWorld({ seed: 8 });
  byId(blind, "you").intel = {};
  assert.equal(applyAction(blind, "you", { type: "siege", target: "harrow" }).ok, false);
  const poor = newWorld({ seed: 8 });
  byId(poor, "you").intel.harrow = { hour: 0, offense: 1, defense: 1 };
  byId(poor, "you").gold = 20;
  assert.equal(applyAction(poor, "you", { type: "siege", target: "harrow" }).ok, false);
  const thin = newWorld({ seed: 8 });
  byId(thin, "you").intel.harrow = { hour: 0, offense: 1, defense: 1 };
  byId(thin, "you").soldiers = 12;
  assert.equal(applyAction(thin, "you", { type: "siege", target: "harrow" }).ok, false);

  const aged = newWorld({ seed: 11 });
  const seat = byId(aged, "you");
  const camp = byId(aged, "harrow");
  aged.provinces = [seat, camp];
  camp.soldiers = 0;
  camp.elites = 0;
  camp.gold = 10;
  camp.peasants = 10;
  camp.buildings.keep = 1;
  camp.grain = 4000;
  seat.soldiers = 40;
  seat.siege = { target: "harrow", until: 1, men: 8 };
  advanceHour(aged);
  assert.equal(aged.hour, 1);
  assert.equal(seat.siege, null);
  assert.equal(seat.soldiers, 48);

  const broke = newWorld({ seed: 12 });
  const foe = byId(broke, "harrow");
  foe.soldiers = 12;
  foe.elites = 0;
  foe.buildings.keep = 0;
  foe.siege = { target: "you", until: 6, men: 8 };
  const home = foe.soldiers;
  const blow = applyAction(broke, "you", { type: "attack", target: "harrow", mode: "seize" });
  assert.equal(blow.win, true);
  assert.equal(foe.siege, null);
  assert.ok(foe.soldiers <= home);
  assert.ok(foe.soldiers < home + 8);
  assert.match(blow.message, /broke the siege works/);
});

test("a sally breaks the siege works and hangs the banner", () => {
  const w = newWorld({ seed: 6 });
  const you = byId(w, "you");
  const h = byId(w, "harrow");
  h.siege = { target: "you", until: 6, men: 8 };
  h.soldiers = 40;
  h.gold = 500;
  const purse = you.utopia;
  const gold = you.gold;
  const res = applyAction(w, "you", { type: "sally", target: "harrow" });
  assert.equal(res.ok, true);
  assert.equal(res.win, true);
  assert.equal(h.siege, null);
  assert.equal(h.soldiers, 40);
  assert.equal(you.standards, 1);
  assert.equal(you.gold, gold + 80);
  assert.equal(h.gold, 420);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.sally, EARN.sally);
  assert.equal(you.utopia, purse + EARN.sally);
  assert.equal(applyAction(w, "you", { type: "sally", target: "harrow" }).ok, false);

  const weak = newWorld({ seed: 7 });
  const seat = byId(weak, "you");
  const foe = byId(weak, "sable");
  foe.siege = { target: "you", until: 5, men: 8 };
  seat.soldiers = 8;
  seat.elites = 0;
  seat.buildings.keep = 0;
  seat.muster = 0;
  for (const tile of seat.plots || []) {
    if (tile.crew === "foot" || tile.crew === "quarry") tile.crew = "hand";
  }
  const before = seat.soldiers;
  const lost = applyAction(weak, "you", { type: "sally", target: "sable" });
  assert.equal(lost.ok, true);
  assert.equal(lost.win, false);
  assert.equal(siegeLive(foe, weak.hour), true);
  assert.equal(foe.siege.men, 6);
  assert.equal(seat.soldiers, before - 6);
  assert.equal(seat.ledger.sally, undefined);
  assert.equal(seat.standards || 0, 0);
});

test("a wild band raids a soft holding, and a ride or a bribe answers it", () => {
  const w = newWorld({ seed: 3 });
  assert.equal(w.bands.length, 3);
  const you = byId(w, "you");
  const band = w.bands[0];
  you.x = band.x + 80;
  you.y = band.y;
  you.soldiers = 4;
  you.elites = 0;
  you.buildings.keep = 0;
  you.muster = 0;
  you.plots = [];
  you.gold = 1000;
  you.grain = 1000;
  you.peasants = 200;
  pressBands(w);
  assert.equal(band.raid.target, "you");
  assert.ok(you.gold < 1000);
  assert.ok(you.grain < 1000);
  assert.ok(you.peasants < 200);
  you.soldiers = 100;
  you.elites = 24;
  you.buildings.keep = 12;
  const purse = you.utopia;
  const hoard = band.hoard;
  const afterRaid = you.gold;
  const res = applyAction(w, "you", { type: "ride", band: band.id });
  assert.equal(res.ok, true);
  assert.equal(res.win, true);
  assert.equal(band.men, 0);
  assert.equal(band.downUntil, w.hour + 6);
  assert.equal(you.pelts, 1);
  assert.equal(you.gold, afterRaid + hoard);
  assert.equal(you.ledger.ride, EARN.ride);
  assert.equal(you.utopia, purse + EARN.ride);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(applyAction(w, "you", { type: "ride", band: band.id }).ok, false);

  const weak = newWorld({ seed: 8 });
  const seat = byId(weak, "you");
  const foe = weak.bands[0];
  seat.soldiers = 12;
  seat.elites = 0;
  seat.buildings.keep = 0;
  seat.muster = 0;
  seat.plots = [];
  seat.spells.fury = 0;
  const before = seat.soldiers;
  const lost = applyAction(weak, "you", { type: "ride", band: foe.id });
  assert.equal(lost.ok, true);
  assert.equal(lost.win, false);
  assert.equal(seat.soldiers, before - 5);
  assert.equal(foe.men, 24);
  assert.equal(seat.ledger.ride, undefined);

  const paid = newWorld({ seed: 4 });
  const buyer = byId(paid, "you");
  const camp = paid.bands[1];
  buyer.x = camp.x + 40;
  buyer.y = camp.y;
  const gold = buyer.gold;
  const bribe = applyAction(paid, "you", { type: "bribe", band: camp.id });
  assert.equal(bribe.ok, true);
  assert.equal(buyer.gold, gold - 160);
  assert.equal(camp.truce.you, 5);
  buyer.soldiers = 4;
  buyer.elites = 0;
  buyer.buildings.keep = 0;
  buyer.plots = [];
  buyer.gold = 400;
  buyer.grain = 400;
  pressBands(paid);
  assert.equal(buyer.gold, 400);
  assert.notEqual(camp.raid && camp.raid.target, "you");
});

test("outriders turn a wild ride and ride home when the screen ends", () => {
  const w = newWorld({ seed: 3 });
  const you = byId(w, "you");
  const band = w.bands[0];
  you.x = band.x + 80;
  you.y = band.y;
  you.soldiers = 40;
  you.elites = 0;
  you.buildings.keep = 0;
  you.muster = 0;
  you.plots = [];
  you.gold = 1000;
  you.grain = 1000;
  you.peasants = 200;
  const purse = you.utopia;
  const posted = applyAction(w, "you", { type: "patrol" });
  assert.equal(posted.ok, true);
  assert.equal(you.soldiers, 32);
  assert.equal(you.gold, 850);
  assert.equal(you.patrol, 8);
  assert.equal(you.patrolUntil, 5);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.patrol, EARN.patrol);
  assert.equal(you.utopia, purse + EARN.patrol);
  assert.equal(patrolUp(you, w.hour), true);
  assert.equal(applyAction(w, "you", { type: "patrol" }).ok, false);
  const men = band.men;
  pressBands(w);
  assert.equal(band.raid.target, "you");
  assert.equal(band.raid.met, "patrol");
  assert.equal(you.gold, 850);
  assert.equal(you.grain, 1000);
  assert.equal(you.peasants, 200);
  assert.equal(band.men, men - 3);
  assert.equal(you.patrol, 6);

  const weak = newWorld({ seed: 6 });
  const seat = byId(weak, "you");
  const foe = weak.bands[0];
  seat.x = foe.x + 40;
  seat.y = foe.y;
  seat.soldiers = 4;
  seat.elites = 0;
  seat.buildings.keep = 0;
  seat.muster = 0;
  seat.plots = [];
  seat.gold = 500;
  seat.grain = 500;
  seat.peasants = 80;
  seat.patrol = 4;
  seat.patrolUntil = 5;
  foe.men = 40;
  pressBands(weak);
  assert.ok(seat.gold < 500);
  assert.equal(seat.patrol, 0);
  assert.equal(foe.men, 37);

  const home = newWorld({ seed: 1 });
  const ruler = byId(home, "you");
  ruler.soldiers = 30;
  for (const camp of home.bands) {
    camp.x = 9000;
    camp.y = 9000;
  }
  assert.equal(applyAction(home, "you", { type: "patrol" }).ok, true);
  for (let i = 0; i < 5; i++) advanceHour(home);
  assert.equal(home.hour, 5);
  assert.equal(patrolUp(ruler, home.hour), false);
  assert.equal(ruler.patrol, 0);
  assert.equal(ruler.soldiers, 30);
  ruler.soldiers = 3;
  ruler.gold = 1000;
  assert.equal(applyAction(home, "you", { type: "patrol" }).ok, false);
});

test("a keel hauls fish, turns a wild ride, escorts a caravan, and burns in a sack", () => {
  const w = newWorld({ seed: 3 });
  const you = byId(w, "you");
  const band = w.bands[0];
  assert.ok(you.plots.some((tile) => waterTouch(tile)));
  you.x = band.x + 80;
  you.y = band.y;
  you.soldiers = 40;
  you.elites = 0;
  you.buildings.keep = 0;
  you.muster = 0;
  you.gold = 1000;
  you.grain = 1000;
  you.peasants = 200;
  const purse = you.utopia;
  const launched = applyAction(w, "you", { type: "keel" });
  assert.equal(launched.ok, true);
  assert.equal(you.soldiers, 34);
  assert.equal(you.gold, 800);
  assert.equal(you.keel, 6);
  assert.equal(you.keelUntil, 6);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.keel, EARN.keel);
  assert.equal(you.utopia, purse + EARN.keel);
  assert.equal(keelUp(you, w.hour), true);
  assert.equal(you.plots.some((tile) => tile.keel), true);
  assert.equal(keelHaul(you, 0).gold, 18);
  assert.equal(keelHaul(you, 0).grain, 14);
  you.weir = 2;
  you.weirUntil = 4;
  assert.equal(keelHaul(you, 0).grain, 24);
  you.weir = 0;
  you.weirUntil = 0;
  assert.equal(applyAction(w, "you", { type: "keel" }).ok, false);
  const men = band.men;
  pressBands(w);
  assert.equal(band.raid.target, "you");
  assert.equal(band.raid.met, "keel");
  assert.equal(you.gold, 800);
  assert.equal(you.grain, 1000);
  assert.equal(band.men, men - 2);
  assert.equal(you.keel, 5);

  const weak = newWorld({ seed: 6 });
  const seat = byId(weak, "you");
  const foe = weak.bands[0];
  seat.x = foe.x + 40;
  seat.y = foe.y;
  seat.soldiers = 4;
  seat.elites = 0;
  seat.buildings.keep = 0;
  seat.muster = 0;
  seat.plots = [];
  seat.gold = 500;
  seat.grain = 500;
  seat.peasants = 80;
  seat.keel = 3;
  seat.keelUntil = 5;
  foe.men = 40;
  pressBands(weak);
  assert.ok(seat.gold < 500);
  assert.equal(seat.keel, 0);
  assert.equal(foe.men, 38);

  const home = newWorld({ seed: 1 });
  const ruler = byId(home, "you");
  ruler.soldiers = 30;
  for (const camp of home.bands) {
    camp.x = 9000;
    camp.y = 9000;
  }
  assert.equal(applyAction(home, "you", { type: "keel" }).ok, true);
  for (let i = 0; i < 6; i++) advanceHour(home);
  assert.equal(home.hour, 6);
  assert.equal(keelUp(ruler, home.hour), false);
  assert.equal(ruler.keel, 0);
  assert.equal(ruler.soldiers, 30);

  const dry = newWorld({ seed: 2 });
  const inland = byId(dry, "you");
  inland.plots = inland.plots.filter((tile) => !waterTouch(tile));
  assert.equal(applyAction(dry, "you", { type: "keel" }).ok, false);

  const trade = (withKeel) => {
    const realm = newWorld({ seed: 13 });
    const buyer = byId(realm, "you");
    buyer.intel.harrow = { hour: 0, offense: 1, defense: 1, gold: 1, grain: 1, soldiers: 1, elites: 0, thieves: 0, mystics: 0 };
    if (withKeel) {
      buyer.keel = 6;
      buyer.keelUntil = 4;
    }
    const before = buyer.gold;
    assert.equal(applyAction(realm, "you", { type: "trade", target: "harrow" }).ok, true);
    return buyer.gold - before;
  };
  assert.ok(trade(true) > trade(false));

  const sack = newWorld({ seed: 2 });
  const camp = byId(sack, "harrow");
  camp.soldiers = 8;
  camp.elites = 0;
  camp.buildings.keep = 0;
  camp.muster = 0;
  camp.plots = [];
  camp.gold = 800;
  camp.keel = 6;
  camp.keelUntil = 6;
  const taken = applyAction(sack, "you", { type: "attack", target: "harrow", mode: "sack" });
  assert.equal(taken.ok, true);
  assert.equal(taken.win, true);
  assert.equal(keelUp(camp, sack.hour), false);
  assert.ok(taken.message.includes("burned the keel"));
});

test("a founder plants a port, and a directed fisher works the ocean", () => {
  assert.equal(ORDERS, 10);
  assert.equal(Object.keys(NAVY).length, 6);
  assert.equal(NAVY.galley.gold, 440);
  assert.equal(NAVY.galley.speed, 3);
  assert.equal(NAVY.hulk.speed, 1);
  assert.equal(terrainKind(36, -18), "sea");
  assert.equal(terrainKind(52, -26), "sea");
  assert.equal(terrainKind(130, -65), "sea");
  assert.equal(terrainKind(-2, 5), "hill");
  const far = terrainKind(70, -35);
  assert.ok(["grass", "plain", "wood", "hill", "mount"].includes(far));

  const quiet = (seed = 4) => {
    const realm = newWorld({ seed });
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    realm.bands = [];
    seat.gold = 8000;
    seat.peasants = 200;
    seat.grain = 5000;
    seat.orders = ORDERS;
    return realm;
  };
  const findCoast = (seat) => {
    const home = worldToAxial(seat.x, seat.y);
    const taken = new Set((seat.plots || []).map((tile) => `${tile.q},${tile.r}`));
    for (let q = -50; q <= 50; q++) {
      for (let r = -50; r <= 50; r++) {
        if (terrainKind(q, r) !== "coast") continue;
        if (taken.has(`${q},${r}`)) continue;
        const dist = (Math.abs(q - home.q) + Math.abs(r - home.r) + Math.abs(q + r - (home.q + home.r))) / 2;
        if (dist < 6) continue;
        return { q, r };
      }
    }
    return null;
  };
  const delta = (extra) => {
    const realm = quiet();
    const seat = realm.provinces[0];
    extra(seat);
    const grain = seat.grain;
    const gold = seat.gold;
    advanceHour(realm);
    return { grain: seat.grain - grain, gold: seat.gold - gold };
  };
  const spot = findCoast(quiet().provinces[0]);
  assert.ok(spot);
  const plain = delta(() => {});
  const ported = delta((seat) => {
    seat.colonies = [{ id: "c", name: "Salt Step", q: spot.q, r: spot.r, port: true }];
    seat.plots = seat.plots.concat([{ q: spot.q, r: spot.r, crew: "hand" }]);
  });
  assert.equal(ported.grain - plain.grain, 16);
  const fished = delta((seat) => {
    seat.ships = [{ id: "s", kind: "fisher", q: 36, r: -18, destQ: null, destR: null }];
  });
  assert.equal(fished.grain - plain.grain, NAVY.fisher.fish);
  const hauled = delta((seat) => {
    seat.ships = [{ id: "s", kind: "cog", q: 36, r: -18, destQ: null, destR: null }];
  });
  assert.equal(hauled.gold - plain.gold, NAVY.cog.haul);

  const w = quiet(1);
  const you = w.provinces[0];
  const land = you.land;
  const purse = you.utopia;
  const raised = applyAction(w, "you", { type: "founder" });
  assert.equal(raised.ok, true);
  assert.equal(you.gold, 8000 - 260);
  assert.equal(you.peasants, 192);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.founder, EARN.founder);
  assert.equal(you.utopia, purse + EARN.founder);
  const coast = findCoast(you);
  const founder = you.founders[0];
  founder.q = coast.q;
  founder.r = coast.r;
  you.orders = 1;
  assert.equal(applyAction(w, "you", { type: "direct", unit: "founder", id: founder.id, q: coast.q, r: coast.r }).ok, true);
  advanceHour(w);
  assert.equal(you.colonies.length, 1);
  assert.equal(you.colonies[0].port, true);
  assert.equal(you.founders.length, 0);
  assert.equal(you.land, land + 12);
  assert.ok(you.peasants >= 200);
  assert.equal(you.ledger.colony, EARN.colony);
  you.orders = 0;
  assert.equal(applyAction(w, "you", { type: "hull", hull: "skiff" }).ok, false);
  you.orders = 1;
  you.gold = 5000;
  const laid = applyAction(w, "you", { type: "hull", hull: "fisher" });
  assert.equal(laid.ok, true);
  assert.equal(you.ships.length, 1);
  assert.equal(you.ships[0].kind, "fisher");
  assert.equal(you.gold, 5000 - NAVY.fisher.gold);
  assert.equal(you.ledger.hull, EARN.hull);
  assert.ok(["sea", "coast", "river"].includes(terrainKind(you.ships[0].q, you.ships[0].r)));
  const dry = quiet(2);
  assert.equal(applyAction(dry, "you", { type: "hull", hull: "hulk" }).ok, false);

  const sail = quiet(3);
  const captain = sail.provinces[0];
  captain.ships = [{ id: "s1", kind: "fisher", q: 36, r: -18, destQ: null, destR: null }];
  assert.equal(applyAction(sail, "you", { type: "direct", unit: "ship", id: "s1", q: -2, r: 5 }).ok, false);
  assert.equal(applyAction(sail, "you", { type: "direct", unit: "ship", id: "s1", q: 40, r: -20 }).ok, true);
  advanceHour(sail);
  assert.equal(captain.ships[0].q, 38);
  assert.equal(captain.ships[0].r, -18);
});

test("a war hull grapples a lighter ship and the heavier teeth take the prize", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(NAVY.skiff.teeth, 1);
  assert.equal(NAVY.fisher.teeth, 2);
  assert.equal(NAVY.cog.teeth, 3);
  assert.equal(NAVY.hulk.teeth, 5);
  assert.equal(NAVY.galley.teeth, 6);
  assert.equal(NAVY.dromon.teeth, 8);
  assert.equal(NAVY.galley.gold, 440);
  assert.equal(EARN.prize, 46);

  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  const sea = (seed = 4) => {
    const realm = newWorld({ seed });
    realm.bands = [];
    const you = hush(realm, "you");
    const foe = hush(realm, "brine");
    realm.provinces = [you, foe];
    return realm;
  };

  const w = sea();
  const you = w.provinces[0];
  const foe = w.provinces[1];
  you.ships = [{ id: "gal", kind: "galley", q: 36, r: -17, destQ: null, destR: null }];
  foe.ships = [{ id: "fish", kind: "fisher", q: 36, r: -18, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "grapple", ship: "gal", owner: "brine", hull: "missing" }).ok, false);
  you.ships[0].kind = "fisher";
  assert.equal(applyAction(w, "you", { type: "grapple", ship: "gal", owner: "brine", hull: "fish" }).ok, false);
  assert.equal(you.orders, ORDERS);
  you.ships[0].kind = "galley";
  const closed = applyAction(w, "you", { type: "grapple", ship: "gal", owner: "brine", hull: "fish" });
  assert.equal(closed.ok, true);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ships[0].prey.owner, "brine");
  assert.equal(you.ships[0].prey.id, "fish");
  advanceHour(w);
  const prize = 48 + NAVY.fisher.teeth * 16;
  assert.equal(foe.ships.length, 0);
  assert.equal(you.ships.length, 1);
  assert.equal(you.ships[0].prey, null);
  assert.equal(you.gold, 1000 + NAVY.galley.haul + prize);
  assert.equal(foe.gold, 1000 - prize);
  assert.equal(you.ledger.prize, EARN.prize);
  assert.equal(you.utopia, EARN.hourActive + EARN.prize);
  assert.equal(w.wrecks.length, 1);
  assert.equal(w.wrecks[0].kind, "fisher");
  assert.ok(w.log.some((row) => row.text.includes("goes under")));

  const chase = sea(5);
  const hunter = chase.provinces[0];
  const merchant = chase.provinces[1];
  hunter.ships = [{ id: "gal", kind: "galley", q: 36, r: -18, destQ: null, destR: null }];
  merchant.ships = [{ id: "cog", kind: "cog", q: 42, r: -18, destQ: null, destR: null }];
  assert.equal(applyAction(chase, "you", { type: "grapple", ship: "gal", owner: "brine", hull: "cog" }).ok, true);
  advanceHour(chase);
  assert.equal(merchant.ships.length, 1);
  assert.equal(hunter.ships[0].q, 39);
  assert.equal(hunter.ships[0].prey.id, "cog");
  advanceHour(chase);
  assert.equal(merchant.ships.length, 0);
  assert.equal(hunter.ships[0].q, 42);
  assert.equal(hunter.ledger.prize, EARN.prize);

  const lock = sea(6);
  const left = lock.provinces[0];
  const right = lock.provinces[1];
  left.ships = [{ id: "a", kind: "galley", q: 36, r: -18, destQ: null, destR: null }];
  right.ships = [{ id: "b", kind: "galley", q: 37, r: -18, destQ: null, destR: null }];
  assert.equal(applyAction(lock, "you", { type: "grapple", ship: "a", owner: "brine", hull: "b" }).ok, true);
  advanceHour(lock);
  assert.equal(left.ships.length, 1);
  assert.equal(right.ships.length, 1);
  assert.equal(left.ships[0].prey, null);
  assert.equal(left.ledger.prize, undefined);
  assert.ok(lock.log.some((row) => row.text.includes("fall apart")));

  const lost = sea(7);
  const light = lost.provinces[0];
  const heavy = lost.provinces[1];
  light.ships = [{ id: "gal", kind: "galley", q: 36, r: -17, destQ: null, destR: null }];
  heavy.ships = [{ id: "war", kind: "dromon", q: 36, r: -18, destQ: null, destR: null }];
  assert.equal(applyAction(lost, "you", { type: "grapple", ship: "gal", owner: "brine", hull: "war" }).ok, true);
  advanceHour(lost);
  assert.equal(light.ships.length, 0);
  assert.equal(heavy.ships.length, 1);
  const lostPrize = 48 + NAVY.galley.teeth * 16;
  assert.equal(light.gold, 1000 + NAVY.galley.haul - lostPrize);
  assert.equal(heavy.gold, 1000 + NAVY.dromon.haul + lostPrize);
  assert.equal(heavy.ledger.prize, EARN.prize);
  assert.equal(light.ledger.prize, undefined);

  const broken = sea(8);
  const captain = broken.provinces[0];
  captain.ships = [{ id: "gal", kind: "galley", q: 36, r: -18, destQ: null, destR: null, prey: { owner: "brine", id: "fish" } }];
  assert.equal(applyAction(broken, "you", { type: "direct", unit: "ship", id: "gal", q: 40, r: -20 }).ok, true);
  assert.equal(captain.ships[0].prey, null);
  assert.equal(captain.ships[0].destQ, 40);
});

test("a war hull blockades a port, cuts the fish, and takes gold while it sits", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.block, 47);
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  const coast = () => {
    for (let q = -40; q <= 40; q++) {
      for (let r = -40; r <= 40; r++) {
        if (terrainKind(q, r) === "coast") return { q, r };
      }
    }
    return null;
  };
  const spot = coast();
  assert.ok(spot);
  const open = newWorld({ seed: 4 });
  open.bands = [];
  const openFoe = hush(open, "brine");
  hush(open, "you");
  open.provinces = [open.provinces[0], openFoe];
  openFoe.colonies = [{ id: "c", name: "Salt Step", q: spot.q, r: spot.r, port: true }];
  advanceHour(open);
  assert.equal(openFoe.grain, 5012);

  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  foe.colonies = [{ id: "c", name: "Salt Step", q: spot.q, r: spot.r, port: true }];
  you.ships = [{ id: "gal", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null }];
  you.ships[0].kind = "fisher";
  assert.equal(applyAction(w, "you", { type: "blockade", ship: "gal", owner: "brine", colony: "c" }).ok, false);
  assert.equal(you.orders, ORDERS);
  you.ships[0].kind = "galley";
  foe.colonies[0].port = false;
  assert.equal(applyAction(w, "you", { type: "blockade", ship: "gal", owner: "brine", colony: "c" }).ok, false);
  foe.colonies[0].port = true;
  assert.equal(applyAction(w, "you", { type: "blockade", ship: "gal", owner: "you", colony: "c" }).ok, false);
  const closed = applyAction(w, "you", { type: "blockade", ship: "gal", owner: "brine", colony: "c" });
  assert.equal(closed.ok, true);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.block, EARN.block);
  assert.equal(you.utopia, EARN.block);
  assert.equal(you.ships[0].block.owner, "brine");
  assert.equal(you.ships[0].prey, null);
  advanceHour(w);
  advanceHour(w);
  assert.equal(foe.grain, 5000);
  assert.equal(foe.gold, 1000 - 36);
  assert.equal(you.gold, 1000 + NAVY.galley.haul * 2 + 36);
  assert.equal(you.utopia, EARN.block + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("holds Salt Step closed")));
  you.orders = 1;
  assert.equal(applyAction(w, "you", { type: "direct", unit: "ship", id: "gal", q: you.ships[0].destQ, r: you.ships[0].destR }).ok, true);
  assert.equal(you.ships[0].block, null);
});

test("a hull salvages a wreck and takes the timber", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.salvage, 48);
  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = byId(w, "you");
  w.provinces = [you];
  for (const key of Object.keys(you.buildings)) you.buildings[key] = 0;
  you.peasants = 0;
  you.soldiers = 0;
  you.elites = 0;
  you.thieves = 0;
  you.mystics = 0;
  you.plots = [];
  you.colonies = [];
  you.founders = [];
  you.gold = 1000;
  you.grain = 5000;
  you.utopia = 0;
  you.ledger = {};
  you.orders = ORDERS;
  you.acted = false;
  you.kind = "human";
  you.ships = [{ id: "fish", kind: "fisher", q: 34, r: -18, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "salvage", ship: "fish", q: 36, r: -18 }).ok, false);
  assert.equal(you.orders, ORDERS);
  w.wrecks = [{ q: 36, r: -18, kind: "fisher", gold: 40 + NAVY.fisher.teeth * 12, until: 6 }];
  const sent = applyAction(w, "you", { type: "salvage", ship: "fish", q: 36, r: -18 });
  assert.equal(sent.ok, true);
  assert.equal(you.orders, ORDERS - 1);
  assert.deepEqual(you.ships[0].salvage, { q: 36, r: -18 });
  assert.equal(applyAction(w, "you", { type: "direct", unit: "ship", id: "fish", q: 35, r: -18 }).ok, true);
  assert.equal(you.ships[0].salvage, null);
  assert.equal(w.wrecks.length, 1);
  assert.equal(applyAction(w, "you", { type: "salvage", ship: "fish", q: 36, r: -18 }).ok, true);
  advanceHour(w);
  assert.equal(you.ships[0].q, 36);
  assert.equal(you.ships[0].r, -18);
  assert.equal(you.ships[0].salvage, null);
  assert.equal(w.wrecks.length, 0);
  assert.equal(you.gold, 1000 + 40 + NAVY.fisher.teeth * 12);
  assert.equal(you.ledger.salvage, EARN.salvage);
  assert.equal(you.utopia, EARN.salvage + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("salvages a wrecked Fisher")));
});

test("a war hull escorts a trader, fattens the haul, and adds teeth", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.convoy, 49);
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.gold = 1000;
    seat.grain = 5000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = hush(w, "you");
  w.provinces = [you];
  you.ships = [
    { id: "cog", kind: "cog", q: 36, r: -18, destQ: null, destR: null },
    { id: "gal", kind: "galley", q: 36, r: -18, destQ: null, destR: null },
  ];
  assert.equal(applyAction(w, "you", { type: "convoy", ship: "cog", hull: "gal" }).ok, false);
  assert.equal(you.orders, ORDERS);
  const sent = applyAction(w, "you", { type: "convoy", ship: "gal", hull: "cog" });
  assert.equal(sent.ok, true);
  assert.equal(you.ships[1].escort, "cog");
  assert.equal(you.ledger.convoy, EARN.convoy);
  advanceHour(w);
  const bonus = Math.floor(NAVY.cog.haul / 2) + 4;
  assert.equal(you.gold, 1000 + NAVY.cog.haul + bonus + NAVY.galley.haul);
  assert.equal(you.utopia, EARN.convoy + EARN.hourActive);
  you.orders = 1;
  assert.equal(applyAction(w, "you", { type: "direct", unit: "ship", id: "gal", q: 38, r: -18 }).ok, true);
  assert.equal(you.ships.find((row) => row.id === "gal").escort, null);

  const fight = newWorld({ seed: 5 });
  fight.bands = [];
  const left = hush(fight, "you");
  const right = hush(fight, "brine");
  fight.provinces = [left, right];
  left.ships = [
    { id: "cog", kind: "cog", q: 36, r: -18, destQ: null, destR: null },
    { id: "gal", kind: "galley", q: 36, r: -17, destQ: null, destR: null },
  ];
  right.ships = [{ id: "war", kind: "galley", q: 37, r: -18, destQ: null, destR: null }];
  assert.equal(applyAction(fight, "you", { type: "convoy", ship: "gal", hull: "cog" }).ok, true);
  assert.equal(applyAction(fight, "brine", { type: "grapple", ship: "war", owner: "you", hull: "cog" }).ok, true);
  advanceHour(fight);
  assert.equal(left.ships.length, 2);
  assert.equal(right.ships.length, 1);
  assert.ok(fight.log.some((row) => row.text.includes("fall apart")));

  const bare = newWorld({ seed: 6 });
  bare.bands = [];
  const open = hush(bare, "you");
  const foe = hush(bare, "brine");
  bare.provinces = [open, foe];
  open.ships = [
    { id: "cog", kind: "cog", q: 36, r: -18, destQ: null, destR: null },
    { id: "gal", kind: "galley", q: 36, r: -17, destQ: null, destR: null },
  ];
  foe.ships = [{ id: "war", kind: "galley", q: 37, r: -18, destQ: null, destR: null }];
  assert.equal(applyAction(bare, "brine", { type: "grapple", ship: "war", owner: "you", hull: "cog" }).ok, true);
  advanceHour(bare);
  assert.equal(open.ships.some((row) => row.kind === "cog"), false);
});

test("wild holdings push their fences when the gold holds", () => {
  const w = newWorld({ seed: 2 });
  const moss = byId(w, "moss");
  const land = moss.land;
  const plots = moss.plots.length;
  const fields = moss.buildings.field;
  moss.gold = 900;
  assert.equal(growRival(w, moss), true);
  assert.equal(moss.land, land + 4);
  assert.equal(moss.gold, 820);
  assert.ok(moss.plots.length >= plots);
  assert.equal(moss.buildings.field, fields + 1);
  assert.ok(buildingCount(moss) <= moss.land);
  moss.gold = 10;
  assert.equal(growRival(w, moss), false);
  assert.equal(moss.land, land + 4);
  const grown = newWorld({ seed: 15 });
  const brine = byId(grown, "brine");
  grown.provinces = [brine];
  const before = brine.land;
  brine.gold = 50000;
  for (let i = 0; i < 3; i++) advanceHour(grown);
  assert.equal(grown.hour, 3);
  assert.ok(brine.land >= before + 4);
});

test("a port wharf pays gold and refits a nearby wreck", () => {
  assert.equal(ORDERS, 10);
  const quiet = () => {
    const realm = newWorld({ seed: 8 });
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    realm.bands = [];
    seat.gold = 8000;
    seat.peasants = 200;
    seat.grain = 5000;
    seat.orders = ORDERS;
    seat.colonies = [{ id: "c1", name: "Salt Step", q: 2, r: 2, port: true }];
    return realm;
  };
  const inland = quiet();
  inland.provinces[0].colonies[0].port = false;
  assert.equal(applyAction(inland, "you", { type: "wharf", colony: "c1" }).ok, false);

  const raised = quiet();
  const you = raised.provinces[0];
  const purse = you.utopia;
  assert.equal(applyAction(raised, "you", { type: "wharf", colony: "c1" }).ok, true);
  assert.equal(you.gold, 8000 - 220);
  assert.equal(you.colonies[0].wharf, true);
  assert.equal(you.ledger.wharf, EARN.wharf);
  assert.equal(you.utopia, purse + EARN.wharf);
  assert.equal(applyAction(raised, "you", { type: "wharf", colony: "c1" }).ok, false);

  const delta = (wharf) => {
    const realm = quiet();
    const seat = realm.provinces[0];
    if (wharf) seat.colonies[0].wharf = true;
    const gold = seat.gold;
    advanceHour(realm);
    return seat.gold - gold;
  };
  assert.equal(delta(true) - delta(false), 8);

  const yard = quiet();
  const ruler = yard.provinces[0];
  ruler.colonies[0].wharf = true;
  yard.wrecks = [{ q: 8, r: 2, kind: "fisher", gold: 64, until: 6 }];
  assert.equal(applyAction(yard, "you", { type: "refit", q: 8, r: 2 }).ok, false);
  yard.wrecks = [{ q: 2, r: 2, kind: "fisher", gold: 64, until: 6 }];
  ruler.orders = 1;
  const before = ruler.gold;
  const refit = applyAction(yard, "you", { type: "refit", q: 2, r: 2 });
  assert.equal(refit.ok, true);
  assert.equal(ruler.gold, before - 110);
  assert.equal(ruler.ships.length, 1);
  assert.equal(ruler.ships[0].kind, "fisher");
  assert.equal(ruler.ships[0].q, 2);
  assert.equal(ruler.ships[0].r, 2);
  assert.equal(yard.wrecks.length, 0);
  assert.equal(ruler.ledger.refit, EARN.refit);
  ruler.ships = Array.from({ length: 6 }, (_, i) => ({ id: `full${i}`, kind: "skiff", q: 2, r: 2 }));
  yard.wrecks = [{ q: 2, r: 2, kind: "cog", gold: 40, until: 6 }];
  ruler.orders = 1;
  assert.equal(applyAction(yard, "you", { type: "refit", q: 2, r: 2 }).ok, false);

  const bare = quiet();
  bare.wrecks = [{ q: 2, r: 2, kind: "skiff", gold: 40, until: 6 }];
  assert.equal(applyAction(bare, "you", { type: "refit", q: 2, r: 2 }).ok, false);
});

test("a mole shoves a blockading hull off the quay", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.mole, 52);
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  you.colonies = [{ id: "c", name: "Salt Step", q: spot.q, r: spot.r, port: false }];
  assert.equal(applyAction(w, "you", { type: "mole", colony: "c" }).ok, false);
  assert.equal(you.orders, ORDERS);
  you.colonies[0].port = true;
  you.gold = 100;
  assert.equal(applyAction(w, "you", { type: "mole", colony: "c" }).ok, false);
  you.gold = 1000;
  const raised = applyAction(w, "you", { type: "mole", colony: "c" });
  assert.equal(raised.ok, true);
  assert.equal(you.gold, 820);
  assert.equal(you.colonies[0].moleUntil, 5);
  assert.equal(you.ledger.mole, EARN.mole);
  assert.equal(you.utopia, EARN.mole);
  assert.equal(applyAction(w, "you", { type: "mole", colony: "c" }).ok, false);
  foe.ships = [{ id: "gal", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null, block: { owner: "you", id: "c" } }];
  advanceHour(w);
  assert.equal(foe.ships[0].block, null);
  assert.ok(foe.ships[0].q !== spot.q || foe.ships[0].r !== spot.r);
  assert.equal(you.grain, 5012);
  assert.equal(you.gold, 820 + 14);
  assert.equal(foe.gold, 1000 - 14 + NAVY.galley.haul);
  assert.equal(you.utopia, EARN.mole + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("shoves") && row.text.includes("Salt Step")));
});

test("a hull tows a wreck toward a wharf", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.tow, 53);
  const hexDist = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  let far = { ...spot };
  for (let i = 0; i < 6; i++) {
    let best = null;
    let bestD = hexDist(far.q, far.r, spot.q, spot.r);
    for (const [dq, dr] of dirs) {
      const nq = far.q + dq;
      const nr = far.r + dr;
      const kind = terrainKind(nq, nr);
      if (kind !== "sea" && kind !== "coast" && kind !== "river") continue;
      const dist = hexDist(nq, nr, spot.q, spot.r);
      if (dist > bestD) {
        bestD = dist;
        best = { q: nq, r: nr };
      }
    }
    if (!best) break;
    far = best;
  }
  assert.ok(hexDist(far.q, far.r, spot.q, spot.r) >= 4);
  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = hush(w, "you");
  w.provinces = [you];
  you.colonies = [{ id: "c", name: "Salt Step", q: spot.q, r: spot.r, port: true }];
  you.ships = [{ id: "fish", kind: "fisher", q: far.q, r: far.r, destQ: null, destR: null }];
  w.wrecks = [{ q: far.q, r: far.r, kind: "cog", gold: 76, until: 8 }];
  assert.equal(applyAction(w, "you", { type: "tow", ship: "fish", q: far.q, r: far.r }).ok, false);
  you.colonies[0].wharf = true;
  const sent = applyAction(w, "you", { type: "tow", ship: "fish", q: far.q, r: far.r });
  assert.equal(sent.ok, true);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.tow, EARN.tow);
  assert.deepEqual(you.ships[0].tow, { q: far.q, r: far.r });
  const start = hexDist(far.q, far.r, spot.q, spot.r);
  advanceHour(w);
  const mid = hexDist(w.wrecks[0].q, w.wrecks[0].r, spot.q, spot.r);
  assert.equal(mid, start - 1);
  assert.equal(you.ships[0].q, w.wrecks[0].q);
  assert.equal(you.ships[0].r, w.wrecks[0].r);
  assert.deepEqual(you.ships[0].tow, { q: w.wrecks[0].q, r: w.wrecks[0].r });
  you.orders = 1;
  assert.equal(applyAction(w, "you", { type: "direct", unit: "ship", id: "fish", q: far.q, r: far.r }).ok, true);
  assert.equal(you.ships[0].tow, null);
});

test("a lee shelters a hull and turns a heavier grapple aside", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.lee, 54);
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const open = newWorld({ seed: 4 });
  open.bands = [];
  const bare = hush(open, "you");
  const hunter = hush(open, "brine");
  open.provinces = [bare, hunter];
  bare.colonies = [{ id: "c", name: "Salt Step", q: spot.q, r: spot.r, port: true }];
  bare.ships = [{ id: "fish", kind: "fisher", q: spot.q, r: spot.r, destQ: null, destR: null }];
  hunter.ships = [{ id: "gal", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null }];
  assert.equal(applyAction(open, "brine", { type: "grapple", ship: "gal", owner: "you", hull: "fish" }).ok, true);
  advanceHour(open);
  assert.equal(bare.ships.length, 0);

  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  you.colonies = [{ id: "c", name: "Salt Step", q: spot.q, r: spot.r, port: false }];
  assert.equal(applyAction(w, "you", { type: "lee", colony: "c" }).ok, false);
  you.colonies[0].port = true;
  you.gold = 100;
  assert.equal(applyAction(w, "you", { type: "lee", colony: "c" }).ok, false);
  you.gold = 1000;
  const raised = applyAction(w, "you", { type: "lee", colony: "c" });
  assert.equal(raised.ok, true);
  assert.equal(you.gold, 840);
  assert.equal(you.colonies[0].leeUntil, 6);
  assert.equal(you.ledger.lee, EARN.lee);
  assert.equal(applyAction(w, "you", { type: "lee", colony: "c" }).ok, false);
  you.ships = [{ id: "fish", kind: "fisher", q: spot.q, r: spot.r, destQ: null, destR: null }];
  foe.ships = [{ id: "gal", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "brine", { type: "grapple", ship: "gal", owner: "you", hull: "fish" }).ok, true);
  advanceHour(w);
  assert.equal(you.ships.length, 1);
  assert.equal(foe.ships.length, 1);
  assert.equal(foe.ships[0].prey, null);
  assert.equal(you.gold, 840 + 6);
  assert.equal(you.grain, 5012 + NAVY.fisher.fish);
  assert.equal(you.utopia, EARN.lee + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("lee") && row.text.includes("turns")));
});

test("nets hold an enemy hull and take gold", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.net, 55);
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.nets = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const away = dirs.map(([dq, dr]) => ({ q: spot.q + dq, r: spot.r + dr })).find((tile) => {
    const kind = terrainKind(tile.q, tile.r);
    return kind === "sea" || kind === "coast" || kind === "river";
  });
  assert.ok(away);
  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  you.ships = [{ id: "gal", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "net", ship: "gal" }).ok, false);
  you.ships = [{ id: "fish", kind: "fisher", q: spot.q, r: spot.r, destQ: null, destR: null }];
  const laid = applyAction(w, "you", { type: "net", ship: "fish" });
  assert.equal(laid.ok, true);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.ledger.net, EARN.net);
  assert.equal(you.nets.length, 1);
  assert.equal(you.nets[0].until, 5);
  assert.equal(applyAction(w, "you", { type: "net", ship: "fish" }).ok, false);
  you.nets = [
    { q: spot.q + 3, r: spot.r, until: 9 },
    { q: spot.q + 4, r: spot.r, until: 9 },
    { q: spot.q + 5, r: spot.r, until: 9 },
  ];
  you.orders = 1;
  assert.equal(applyAction(w, "you", { type: "net", ship: "fish" }).ok, false);
  you.nets = [{ q: spot.q, r: spot.r, until: 5 }];
  foe.ships = [{ id: "war", kind: "galley", q: spot.q, r: spot.r, destQ: away.q, destR: away.r }];
  advanceHour(w);
  assert.equal(foe.ships[0].q, spot.q);
  assert.equal(foe.ships[0].r, spot.r);
  assert.equal(you.gold, 1010);
  assert.equal(foe.gold, 1000 - 10 + NAVY.galley.haul);
  assert.equal(you.utopia, EARN.net + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("nets hold")));
  assert.equal(you.nets.length, 1);
});

test("a trader slips a boom and the quay still fishes", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.slip, 56);
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.nets = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  you.colonies = [{ id: "c", name: "Salt Step", q: spot.q, r: spot.r, port: true }];
  foe.ships = [{ id: "war", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null, block: { owner: "you", id: "c" } }];
  you.ships = [{ id: "far", kind: "cog", q: spot.q + 8, r: spot.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "slip", ship: "far", colony: "c" }).ok, false);
  you.ships = [{ id: "war", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "slip", ship: "war", colony: "c" }).ok, false);
  foe.ships[0].block = null;
  you.ships = [{ id: "cog", kind: "cog", q: spot.q, r: spot.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "slip", ship: "cog", colony: "c" }).ok, false);
  foe.ships[0].block = { owner: "you", id: "c" };
  const slipped = applyAction(w, "you", { type: "slip", ship: "cog", colony: "c" });
  assert.equal(slipped.ok, true);
  assert.equal(you.colonies[0].slipUntil, 1);
  assert.equal(you.ledger.slip, EARN.slip);
  assert.equal(applyAction(w, "you", { type: "slip", ship: "cog", colony: "c" }).ok, false);
  advanceHour(w);
  assert.equal(you.grain, 5012);
  assert.equal(you.gold, 1000 + NAVY.cog.haul);
  assert.equal(foe.gold, 1000 + NAVY.galley.haul);
  assert.equal(you.utopia, EARN.slip + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("slips the boom")));
});

test("a buoy lets a hull sail one hex farther", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.buoy, 57);
  const hexDist = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
  const hush = (realm) => {
    const seat = byId(realm, "you");
    realm.provinces = [seat];
    realm.bands = [];
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.nets = [];
    seat.buoys = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  let spot = null;
  let grass = null;
  for (let q = -40; q <= 40 && (!spot || !grass); q++) {
    for (let r = -40; r <= 40; r++) {
      const kind = terrainKind(q, r);
      if (!spot && kind === "coast") spot = { q, r };
      if (!grass && kind === "grass") grass = { q, r };
    }
  }
  assert.ok(spot && grass);
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  let far = { ...spot };
  for (let i = 0; i < 5; i++) {
    let best = null;
    let bestD = hexDist(far.q, far.r, spot.q, spot.r);
    for (const [dq, dr] of dirs) {
      const nq = far.q + dq;
      const nr = far.r + dr;
      const kind = terrainKind(nq, nr);
      if (kind !== "sea" && kind !== "coast" && kind !== "river") continue;
      const dist = hexDist(nq, nr, spot.q, spot.r);
      if (dist > bestD) {
        bestD = dist;
        best = { q: nq, r: nr };
      }
    }
    if (!best) break;
    far = best;
  }
  const start = hexDist(spot.q, spot.r, far.q, far.r);
  assert.ok(start >= 4);
  const sail = (lit) => {
    const realm = newWorld({ seed: 4 });
    const seat = hush(realm);
    seat.ships = [{ id: "cog", kind: "cog", q: spot.q, r: spot.r, destQ: far.q, destR: far.r }];
    if (lit) {
      assert.equal(applyAction(realm, "you", { type: "buoy", ship: "cog" }).ok, true);
      assert.equal(seat.ledger.buoy, EARN.buoy);
      assert.equal(seat.buoys[0].until, 6);
    }
    advanceHour(realm);
    return start - hexDist(seat.ships[0].q, seat.ships[0].r, far.q, far.r);
  };
  assert.equal(sail(true), sail(false) + 1);
  const dry = newWorld({ seed: 4 });
  const you = hush(dry);
  you.ships = [{ id: "cog", kind: "cog", q: grass.q, r: grass.r, destQ: null, destR: null }];
  assert.equal(applyAction(dry, "you", { type: "buoy", ship: "cog" }).ok, false);
  you.ships[0].q = spot.q;
  you.ships[0].r = spot.r;
  assert.equal(applyAction(dry, "you", { type: "buoy", ship: "cog" }).ok, true);
  you.orders = 1;
  assert.equal(applyAction(dry, "you", { type: "buoy", ship: "cog" }).ok, false);
  you.buoys.push({ q: spot.q + 4, r: spot.r, until: 9 });
  you.orders = 1;
  you.ships[0].q = spot.q + 4;
  you.ships[0].r = spot.r;
  assert.equal(applyAction(dry, "you", { type: "buoy", ship: "cog" }).ok, false);
});

test("a trader carries a cargo to a far port", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.cargo, 58);
  const hexDist = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.nets = [];
    seat.buoys = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  let far = { ...spot };
  for (let i = 0; i < 5; i++) {
    let best = null;
    let bestD = hexDist(far.q, far.r, spot.q, spot.r);
    for (const [dq, dr] of dirs) {
      const nq = far.q + dq;
      const nr = far.r + dr;
      const kind = terrainKind(nq, nr);
      if (kind !== "sea" && kind !== "coast" && kind !== "river") continue;
      const dist = hexDist(nq, nr, spot.q, spot.r);
      if (dist > bestD) {
        bestD = dist;
        best = { q: nq, r: nr };
      }
    }
    if (!best) break;
    far = best;
  }
  assert.ok(hexDist(far.q, far.r, spot.q, spot.r) > 3);
  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = hush(w, "you");
  w.provinces = [you];
  you.colonies = [{ id: "c", name: "Salt Step", q: spot.q, r: spot.r, port: true }];
  you.ships = [{ id: "war", kind: "galley", q: far.q, r: far.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "cargo", ship: "war", colony: "c" }).ok, false);
  you.ships = [{ id: "cog", kind: "cog", q: spot.q, r: spot.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "cargo", ship: "cog", colony: "c" }).ok, false);
  you.ships[0].q = far.q;
  you.ships[0].r = far.r;
  const sent = applyAction(w, "you", { type: "cargo", ship: "cog", colony: "c" });
  assert.equal(sent.ok, true);
  assert.equal(you.ships[0].cargo, "c");
  assert.equal(you.ledger.cargo || 0, 0);
  you.orders = 2;
  assert.equal(applyAction(w, "you", { type: "direct", unit: "ship", id: "cog", q: far.q, r: far.r }).ok, true);
  assert.equal(you.ships[0].cargo, null);
  assert.equal(applyAction(w, "you", { type: "cargo", ship: "cog", colony: "c" }).ok, true);
  for (let i = 0; i < 6 && you.ships[0].cargo; i++) advanceHour(w);
  assert.equal(you.ships[0].cargo, null);
  assert.ok(hexDist(you.ships[0].q, you.ships[0].r, spot.q, spot.r) <= 1);
  assert.equal(you.ledger.cargo, EARN.cargo);
  assert.ok(you.gold >= 1000 + 32);
  assert.ok(you.grain >= 5000 + 20);
  assert.equal(you.utopia, EARN.cargo + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("lands a cargo") && row.text.includes("Salt Step")));
});

test("a war hull cuts out a lighter hull", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.cut, 59);
  const hexDist = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.nets = [];
    seat.buoys = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast" || terrainKind(q, r) === "sea") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  let far = { ...spot };
  for (let step = 0; step < 2; step++) {
    let best = null;
    let bestD = hexDist(far.q, far.r, spot.q, spot.r);
    for (const [dq, dr] of dirs) {
      const nq = far.q + dq;
      const nr = far.r + dr;
      const kind = terrainKind(nq, nr);
      if (kind !== "sea" && kind !== "coast" && kind !== "river") continue;
      const dist = hexDist(nq, nr, spot.q, spot.r);
      if (dist > bestD) {
        bestD = dist;
        best = { q: nq, r: nr };
      }
    }
    if (!best) break;
    far = best;
  }
  assert.ok(hexDist(far.q, far.r, spot.q, spot.r) >= 1);
  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  foe.gold = 200;
  foe.name = "Salt Ledger";
  you.ships = [{ id: "skiff", kind: "skiff", q: spot.q, r: spot.r, destQ: null, destR: null }];
  foe.ships = [{ id: "cog", kind: "cog", q: spot.q, r: spot.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "cut", ship: "skiff", owner: "brine", hull: "cog" }).ok, false);
  you.ships = [{ id: "galley", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null }];
  foe.ships = [{ id: "heavy", kind: "dromon", q: spot.q, r: spot.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "cut", ship: "galley", owner: "brine", hull: "heavy" }).ok, false);
  foe.ships = [{ id: "cog", kind: "cog", q: spot.q, r: spot.r, destQ: null, destR: null }];
  you.ships = [
    { id: "galley", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null },
    { id: "a", kind: "skiff", q: spot.q, r: spot.r, destQ: null, destR: null },
    { id: "b", kind: "skiff", q: spot.q, r: spot.r, destQ: null, destR: null },
    { id: "c", kind: "skiff", q: spot.q, r: spot.r, destQ: null, destR: null },
    { id: "d", kind: "skiff", q: spot.q, r: spot.r, destQ: null, destR: null },
    { id: "e", kind: "skiff", q: spot.q, r: spot.r, destQ: null, destR: null },
  ];
  assert.equal(applyAction(w, "you", { type: "cut", ship: "galley", owner: "brine", hull: "cog" }).ok, false);
  you.ships = [{ id: "galley", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null, cargo: "gone" }];
  const sent = applyAction(w, "you", { type: "cut", ship: "galley", owner: "brine", hull: "cog" });
  assert.equal(sent.ok, true);
  assert.equal(you.ships[0].cut.id, "cog");
  assert.equal(you.ships[0].cargo, null);
  assert.equal(you.ledger.cut || 0, 0);
  you.orders = 2;
  assert.equal(applyAction(w, "you", { type: "direct", unit: "ship", id: "galley", q: spot.q, r: spot.r }).ok, true);
  assert.equal(you.ships[0].cut, null);
  you.ships[0].q = far.q;
  you.ships[0].r = far.r;
  assert.equal(applyAction(w, "you", { type: "cut", ship: "galley", owner: "brine", hull: "cog" }).ok, true);
  const youGold = you.gold;
  const foeGold = foe.gold;
  advanceHour(w);
  const prize = you.ships.find((row) => row.kind === "cog");
  assert.ok(prize);
  assert.equal(prize.prizeUntil, (w.hour || 0) + 3);
  assert.equal(foe.ships.length, 0);
  assert.equal((w.wrecks || []).length, 0);
  assert.equal(you.ships[0].cut, null);
  const take = Math.min(foeGold + 8, 28 + 3 * 8);
  assert.equal(foe.gold, foeGold + 8 - take);
  assert.equal(you.gold, youGold + 4 + take);
  assert.equal(you.ledger.cut, EARN.cut);
  assert.equal(you.utopia, EARN.cut + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("cuts out") && row.text.includes("Salt Ledger")));
  you.ships = [{ id: "hulk", kind: "hulk", q: spot.q, r: spot.r, destQ: null, destR: null }];
  foe.ships = [
    { id: "cog", kind: "cog", q: spot.q, r: spot.r, destQ: null, destR: null },
    { id: "guard", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null, escort: "cog" },
  ];
  you.orders = ORDERS;
  you.acted = false;
  you.ledger = {};
  you.utopia = 0;
  assert.equal(applyAction(w, "you", { type: "cut", ship: "hulk", owner: "brine", hull: "cog" }).ok, true);
  advanceHour(w);
  assert.equal(you.ships.length, 1);
  assert.equal(foe.ships.some((row) => row.id === "cog"), true);
  assert.equal(you.ships[0].cut, null);
  assert.equal(you.ledger.cut || 0, 0);
  assert.ok(w.log.some((row) => row.text.includes("slips the cut")));
  you.ships = [{ id: "galley", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null }];
  foe.ships = [{ id: "cog", kind: "cog", q: spot.q, r: spot.r, destQ: null, destR: null }];
  foe.colonies = [{ id: "c", name: "Reed Haven", q: spot.q, r: spot.r, port: true, leeUntil: 9 }];
  you.orders = ORDERS;
  you.acted = false;
  assert.equal(applyAction(w, "you", { type: "cut", ship: "galley", owner: "brine", hull: "cog" }).ok, true);
  advanceHour(w);
  assert.equal(foe.ships.length, 1);
  assert.equal(foe.ships[0].kind, "cog");
  assert.equal(you.ships[0].cut, null);
  assert.ok(w.log.some((row) => row.text.includes("turns") && row.text.includes("cut aside")));
});

test("a war hull lands a company on an enemy quay", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.raid, 61);
  const hexDist = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.nets = [];
    seat.buoys = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  const water = (q, r) => {
    const kind = terrainKind(q, r);
    return kind === "sea" || kind === "coast" || kind === "river";
  };
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const stepAway = (from, origin, steps) => {
    let far = { ...from };
    for (let n = 0; n < steps; n++) {
      let best = null;
      let bestD = hexDist(far.q, far.r, origin.q, origin.r);
      for (const [dq, dr] of dirs) {
        const nq = far.q + dq;
        const nr = far.r + dr;
        if (!water(nq, nr)) continue;
        const dist = hexDist(nq, nr, origin.q, origin.r);
        if (dist > bestD) {
          bestD = dist;
          best = { q: nq, r: nr };
        }
      }
      if (!best) break;
      far = best;
    }
    return far;
  };
  const near = dirs.map(([dq, dr]) => ({ q: spot.q + dq, r: spot.r + dr })).find((cell) => water(cell.q, cell.r));
  assert.ok(near);
  const away = stepAway(spot, spot, 4);
  const offshore = stepAway(near, near, 3);
  assert.ok(hexDist(away.q, away.r, spot.q, spot.r) > 2);
  assert.equal(hexDist(offshore.q, offshore.r, near.q, near.r), 3);
  const w = newWorld({ seed: 4 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  foe.name = "Salt Ledger";
  you.colonies = [{ id: "home", name: "Salt Step", q: spot.q, r: spot.r, port: true }];
  foe.colonies = [{ id: "c", name: "Reed Haven", q: near.q, r: near.r, port: true }];
  you.soldiers = 6;
  you.ships = [{ id: "skiff", kind: "skiff", q: spot.q, r: spot.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "raid", ship: "skiff", owner: "brine", colony: "c" }).ok, false);
  you.ships = [{ id: "galley", kind: "galley", q: away.q, r: away.r, destQ: null, destR: null }];
  assert.equal(applyAction(w, "you", { type: "raid", ship: "galley", owner: "brine", colony: "c" }).ok, false);
  you.ships[0].q = spot.q;
  you.ships[0].r = spot.r;
  you.soldiers = 5;
  assert.equal(applyAction(w, "you", { type: "raid", ship: "galley", owner: "brine", colony: "c" }).ok, false);
  you.soldiers = 6;
  const sent = applyAction(w, "you", { type: "raid", ship: "galley", owner: "brine", colony: "c" });
  assert.equal(sent.ok, true);
  assert.equal(you.soldiers, 0);
  assert.equal(you.ships[0].marines, 6);
  assert.equal(you.ships[0].raid.id, "c");
  assert.equal(you.ledger.raid || 0, 0);
  you.orders = 2;
  assert.equal(applyAction(w, "you", { type: "direct", unit: "ship", id: "galley", q: spot.q, r: spot.r }).ok, true);
  assert.equal(you.ships[0].raid, null);
  assert.equal(you.ships[0].marines, 6);
  assert.equal(applyAction(w, "you", { type: "raid", ship: "galley", owner: "brine", colony: "c" }).ok, true);
  assert.equal(you.soldiers, 0);
  const youGold = you.gold;
  const foeGold = foe.gold;
  const youGrain = you.grain;
  const foeGrain = foe.grain;
  advanceHour(w);
  assert.equal(you.ships[0].raid, null);
  assert.equal(you.ships[0].marines, 0);
  assert.equal(you.soldiers, 6);
  assert.equal(foe.gold, foeGold - 36);
  assert.equal(you.gold, youGold + 4 + 36);
  assert.equal(foe.grain, foeGrain + 12 - 20);
  assert.equal(you.grain, youGrain + 12 + 20);
  assert.equal(you.ledger.raid, EARN.raid);
  assert.equal(you.utopia, EARN.raid + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("lands a company") && row.text.includes("Reed Haven")));
  you.ships = [{ id: "galley", kind: "galley", q: offshore.q, r: offshore.r, destQ: null, destR: null, marines: 6 }];
  foe.colonies[0].moleUntil = 9;
  you.soldiers = 0;
  you.orders = ORDERS;
  you.acted = false;
  you.ledger = {};
  you.utopia = 0;
  assert.equal(applyAction(w, "you", { type: "raid", ship: "galley", owner: "brine", colony: "c" }).ok, true);
  advanceHour(w);
  assert.equal(you.ships[0].marines, 4);
  assert.equal(you.soldiers, 0);
  assert.equal(you.ships[0].raid, null);
  assert.equal(you.ledger.raid || 0, 0);
  assert.ok(w.log.some((row) => row.text.includes("breaks") && row.text.includes("landing")));
  foe.colonies[0].moleUntil = 0;
  you.ships = [{ id: "galley", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null, marines: 6 }];
  you.soldiers = 0;
  you.orders = ORDERS;
  you.acted = false;
  you.ledger = {};
  assert.equal(applyAction(w, "you", { type: "raid", ship: "galley", owner: "you", colony: "home" }).ok, true);
  advanceHour(w);
  assert.equal(you.soldiers, 6);
  assert.equal(you.ships[0].marines, 0);
  assert.equal(you.ledger.raid || 0, 0);
  assert.ok(w.log.some((row) => row.text.includes("lands the company") && row.text.includes("Salt Step")));
  you.ships[0].marines = 0;
  you.orders = ORDERS;
  assert.equal(applyAction(w, "you", { type: "raid", ship: "galley", owner: "you", colony: "home" }).ok, false);
});

test("a quay watch throws a landing back and then comes home", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.quay, 62);
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.nets = [];
    seat.buoys = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  const w = newWorld({ seed: 5 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  you.colonies = [{ id: "home", name: "Salt Step", q: spot.q, r: spot.r, port: false }];
  assert.equal(applyAction(w, "you", { type: "quay", colony: "home" }).ok, false);
  you.colonies[0].port = true;
  you.soldiers = 3;
  assert.equal(applyAction(w, "you", { type: "quay", colony: "home" }).ok, false);
  you.soldiers = 4;
  you.gold = 100;
  assert.equal(applyAction(w, "you", { type: "quay", colony: "home" }).ok, false);
  you.gold = 1000;
  const posted = applyAction(w, "you", { type: "quay", colony: "home" });
  assert.equal(posted.ok, true);
  assert.equal(you.soldiers, 0);
  assert.equal(you.gold, 880);
  assert.equal(you.colonies[0].quay, 4);
  assert.equal(you.colonies[0].quayUntil, 6);
  assert.equal(you.ledger.quay, EARN.quay);
  assert.equal(applyAction(w, "you", { type: "quay", colony: "home" }).ok, false);
  foe.ships = [{ id: "galley", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null, marines: 6 }];
  foe.orders = ORDERS;
  const raid = applyAction(w, "brine", { type: "raid", ship: "galley", owner: "you", colony: "home" });
  assert.equal(raid.ok, true);
  const foeGold = foe.gold;
  advanceHour(w);
  assert.equal(you.grain, 5000 + 18);
  assert.equal(you.colonies[0].quay, 3);
  assert.equal(foe.ships[0].marines, 4);
  assert.equal(foe.soldiers, 0);
  assert.equal(foe.gold, foeGold + 4);
  assert.equal(foe.ledger.raid || 0, 0);
  assert.equal(you.utopia, EARN.quay + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("quay watch throws") && row.text.includes("Salt Step")));
  you.colonies[0].quayUntil = w.hour;
  advanceHour(w);
  assert.equal(you.soldiers, 3);
  assert.equal(you.colonies[0].quay, 0);
});

test("ages issue bows, guns, cannon, and landcars", () => {
  assert.equal(ORDERS, 10);
  const w = newWorld({ seed: 12 });
  const you = byId(w, "you");
  you.gold = 8000;
  you.soldiers = 20;
  you.orders = ORDERS;
  assert.equal(ageName(you), "Camp");
  assert.equal(applyAction(w, "you", { type: "armory", weapon: "bow" }).ok, false);
  assert.equal(applyAction(w, "you", { type: "study", study: "furrow" }).ok, true);
  assert.equal(applyAction(w, "you", { type: "study", study: "kiln" }).ok, true);
  assert.equal(ageName(you), "Borough");
  const before = offense(you);
  const gold = you.gold;
  const issued = applyAction(w, "you", { type: "armory", weapon: "bow" });
  assert.equal(issued.ok, true, issued.message);
  assert.equal(you.weapon, "bow");
  assert.equal(you.gold, gold - 180);
  assert.equal(you.ledger.armory, EARN.armory);
  assert.ok(offense(you) > before);
  assert.equal(applyAction(w, "you", { type: "armory", weapon: "lock" }).ok, false);
  you.studies = { furrow: 1, kiln: 1, palisade: 1, charter: 1, ledger: 1, rite: 1, oath: 1, crown: 1 };
  you.aether = 200;
  you.orders = 3;
  assert.equal(ageName(you), "Crown");
  assert.equal(applyAction(w, "you", { type: "armory", weapon: "cannon" }).ok, true);
  assert.equal(you.weapon, "cannon");
  assert.equal(applyAction(w, "you", { type: "study", study: "powder" }).ok, true);
  assert.equal(ageName(you), "Arsenal");
  you.orders = 1;
  assert.equal(applyAction(w, "you", { type: "armory", weapon: "car" }).ok, true);
  assert.equal(you.weapon, "car");
  assert.equal(applyAction(w, "you", { type: "armory", weapon: "bow" }).ok, false);
});

test("harbor dues take gold from a hull beside the quay", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.dues, 64);
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const hexDist = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  let far = { ...spot };
  for (let n = 0; n < 4; n++) {
    let best = null;
    let bestD = hexDist(far.q, far.r, spot.q, spot.r);
    for (const [dq, dr] of dirs) {
      const nq = far.q + dq;
      const nr = far.r + dr;
      const kind = terrainKind(nq, nr);
      if (kind !== "sea" && kind !== "coast" && kind !== "river") continue;
      const dist = hexDist(nq, nr, spot.q, spot.r);
      if (dist > bestD) {
        bestD = dist;
        best = { q: nq, r: nr };
      }
    }
    if (!best) break;
    far = best;
  }
  assert.ok(hexDist(far.q, far.r, spot.q, spot.r) > 2);
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.nets = [];
    seat.buoys = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  const w = newWorld({ seed: 6 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  foe.name = "Salt Ledger";
  you.colonies = [{ id: "home", name: "Salt Step", q: spot.q, r: spot.r, port: false }];
  assert.equal(applyAction(w, "you", { type: "dues", colony: "home" }).ok, false);
  you.colonies[0].port = true;
  you.gold = 100;
  assert.equal(applyAction(w, "you", { type: "dues", colony: "home" }).ok, false);
  you.gold = 1000;
  const opened = applyAction(w, "you", { type: "dues", colony: "home" });
  assert.equal(opened.ok, true);
  assert.equal(you.gold, 850);
  assert.equal(you.colonies[0].duesUntil, 6);
  assert.equal(you.ledger.dues, EARN.dues);
  assert.equal(applyAction(w, "you", { type: "dues", colony: "home" }).ok, false);
  foe.ships = [
    { id: "galley", kind: "galley", q: spot.q, r: spot.r, destQ: null, destR: null },
    { id: "skiff", kind: "skiff", q: far.q, r: far.r, destQ: null, destR: null },
  ];
  advanceHour(w);
  assert.equal(you.gold, 850 + 12);
  assert.equal(foe.gold, 1000 - 12 + 4);
  assert.equal(you.utopia, EARN.dues + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("harbor dues") && row.text.includes("Salt Ledger") && row.text.includes("Salt Step")));
  const foeGold = foe.gold;
  const youGold = you.gold;
  you.colonies[0].duesUntil = w.hour;
  advanceHour(w);
  assert.equal(foe.gold, foeGold + 4);
  assert.equal(you.gold, youGold);
});

test("a harbor lamp slows an enemy hull and not your own", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.lamp, 65);
  const hexDist = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  let far = { ...spot };
  for (let n = 0; n < 4; n++) {
    let best = null;
    let bestD = hexDist(far.q, far.r, spot.q, spot.r);
    for (const [dq, dr] of dirs) {
      const nq = far.q + dq;
      const nr = far.r + dr;
      const kind = terrainKind(nq, nr);
      if (kind !== "sea" && kind !== "coast" && kind !== "river") continue;
      const dist = hexDist(nq, nr, spot.q, spot.r);
      if (dist > bestD) {
        bestD = dist;
        best = { q: nq, r: nr };
      }
    }
    if (!best) break;
    far = best;
  }
  assert.equal(hexDist(far.q, far.r, spot.q, spot.r), 4);
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.nets = [];
    seat.buoys = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  const w = newWorld({ seed: 8 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  you.colonies = [{ id: "home", name: "Salt Step", q: spot.q, r: spot.r, port: false }];
  assert.equal(applyAction(w, "you", { type: "lamp", colony: "home" }).ok, false);
  you.colonies[0].port = true;
  you.gold = 100;
  assert.equal(applyAction(w, "you", { type: "lamp", colony: "home" }).ok, false);
  you.gold = 1000;
  foe.ships = [{ id: "galley", kind: "galley", q: spot.q, r: spot.r, destQ: far.q, destR: far.r }];
  advanceHour(w);
  assert.equal(hexDist(foe.ships[0].q, foe.ships[0].r, spot.q, spot.r), 3);
  foe.ships[0].q = spot.q;
  foe.ships[0].r = spot.r;
  foe.ships[0].destQ = far.q;
  foe.ships[0].destR = far.r;
  you.ships = [{ id: "own", kind: "galley", q: spot.q, r: spot.r, destQ: far.q, destR: far.r }];
  const raised = applyAction(w, "you", { type: "lamp", colony: "home" });
  assert.equal(raised.ok, true);
  assert.equal(you.gold, 800);
  assert.equal(you.colonies[0].lampUntil, w.hour + 8);
  assert.equal(you.ledger.lamp, EARN.lamp);
  assert.equal(applyAction(w, "you", { type: "lamp", colony: "home" }).ok, false);
  advanceHour(w);
  assert.equal(hexDist(foe.ships[0].q, foe.ships[0].r, spot.q, spot.r), 2);
  assert.equal(hexDist(you.ships[0].q, you.ships[0].r, spot.q, spot.r), 3);
  assert.equal(you.utopia, EARN.lamp + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("raises a lamp") && row.text.includes("Salt Step")));
});

test("a harbor chain holds an enemy hull and lets your own sail", () => {
  assert.equal(ORDERS, 10);
  assert.equal(TICK_MS, 60 * 1000);
  assert.equal(EARN.chain, 66);
  const hexDist = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
  let spot = null;
  for (let q = -40; q <= 40 && !spot; q++) {
    for (let r = -40; r <= 40; r++) {
      if (terrainKind(q, r) === "coast") {
        spot = { q, r };
        break;
      }
    }
  }
  assert.ok(spot);
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  let cursor = { ...spot };
  const path = [{ ...cursor }];
  for (let n = 0; n < 4; n++) {
    let best = null;
    let bestD = hexDist(cursor.q, cursor.r, spot.q, spot.r);
    for (const [dq, dr] of dirs) {
      const nq = cursor.q + dq;
      const nr = cursor.r + dr;
      const kind = terrainKind(nq, nr);
      if (kind !== "sea" && kind !== "coast" && kind !== "river") continue;
      const dist = hexDist(nq, nr, spot.q, spot.r);
      if (dist > bestD) {
        bestD = dist;
        best = { q: nq, r: nr };
      }
    }
    assert.ok(best);
    cursor = best;
    path.push({ ...cursor });
  }
  const mid = path[2];
  const far = path[4];
  assert.equal(hexDist(mid.q, mid.r, spot.q, spot.r), 2);
  assert.equal(hexDist(far.q, far.r, spot.q, spot.r), 4);
  const hush = (realm, id) => {
    const seat = byId(realm, id);
    for (const key of Object.keys(seat.buildings)) seat.buildings[key] = 0;
    seat.peasants = 0;
    seat.soldiers = 0;
    seat.elites = 0;
    seat.thieves = 0;
    seat.mystics = 0;
    seat.plots = [];
    seat.colonies = [];
    seat.founders = [];
    seat.ships = [];
    seat.nets = [];
    seat.buoys = [];
    seat.grain = 5000;
    seat.gold = 1000;
    seat.utopia = 0;
    seat.ledger = {};
    seat.orders = ORDERS;
    seat.acted = false;
    seat.kind = "human";
    return seat;
  };
  const w = newWorld({ seed: 9 });
  w.bands = [];
  const you = hush(w, "you");
  const foe = hush(w, "brine");
  w.provinces = [you, foe];
  foe.name = "Salt Ledger";
  you.colonies = [{ id: "home", name: "Salt Step", q: spot.q, r: spot.r, port: false }];
  assert.equal(applyAction(w, "you", { type: "chain", colony: "home" }).ok, false);
  you.colonies[0].port = true;
  you.gold = 100;
  assert.equal(applyAction(w, "you", { type: "chain", colony: "home" }).ok, false);
  you.gold = 1000;
  foe.ships = [
    { id: "held", kind: "galley", q: spot.q, r: spot.r, destQ: far.q, destR: far.r },
    { id: "outer", kind: "galley", q: mid.q, r: mid.r, destQ: far.q, destR: far.r },
  ];
  you.ships = [{ id: "own", kind: "galley", q: spot.q, r: spot.r, destQ: far.q, destR: far.r }];
  const raised = applyAction(w, "you", { type: "chain", colony: "home" });
  assert.equal(raised.ok, true);
  assert.equal(you.gold, 760);
  assert.equal(you.orders, ORDERS - 1);
  assert.equal(you.colonies[0].chainUntil, w.hour + 7);
  assert.equal(you.ledger.chain, EARN.chain);
  assert.equal(applyAction(w, "you", { type: "chain", colony: "home" }).ok, false);
  advanceHour(w);
  const held = foe.ships.find((row) => row.id === "held");
  const outer = foe.ships.find((row) => row.id === "outer");
  assert.equal(hexDist(held.q, held.r, spot.q, spot.r), 0);
  assert.ok(hexDist(outer.q, outer.r, spot.q, spot.r) > 2);
  assert.equal(hexDist(you.ships[0].q, you.ships[0].r, spot.q, spot.r), 3);
  assert.equal(you.gold, 780);
  assert.equal(foe.gold, 992);
  assert.equal(you.utopia, EARN.chain + EARN.hourActive);
  assert.ok(w.log.some((row) => row.text.includes("stretches a chain") && row.text.includes("Salt Step")));
  assert.ok(w.log.some((row) => row.text.includes("chain") && row.text.includes("Salt Ledger") && row.text.includes("holds")));
  held.q = spot.q;
  held.r = spot.r;
  held.destQ = far.q;
  held.destR = far.r;
  you.colonies[0].chainUntil = w.hour;
  advanceHour(w);
  assert.equal(hexDist(held.q, held.r, spot.q, spot.r), 3);
});

test("save and load keep the hour and the random stream", () => {
  const w = newWorld({ seed: 7 });
  advanceHour(w);
  const again = hydrate(serialize(w));
  assert.equal(again.hour, w.hour);
  assert.equal(again.rng.state(), w.rng.state());
  assert.equal(byId(again, "you").name, "First Acre");
});
