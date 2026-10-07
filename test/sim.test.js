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
  buildingCount,
  byId,
  formatUtopia,
  ageName,
  hydrate,
  redact,
  newWorld,
  terrainKind,
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

test("save and load keep the hour and the random stream", () => {
  const w = newWorld({ seed: 7 });
  advanceHour(w);
  const again = hydrate(serialize(w));
  assert.equal(again.hour, w.hour);
  assert.equal(again.rng.state(), w.rng.state());
  assert.equal(byId(again, "you").name, "First Acre");
});
