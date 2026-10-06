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
  advanceHour,
  applyAction,
  buildingCount,
  byId,
  formatUtopia,
  ageName,
  hydrate,
  redact,
  newWorld,
  nwFactor,
  seatRival,
  serialize,
  studyCount,
  beaconLit,
  intelFresh,
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
  assert.equal(ORDERS, 4);
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

test("save and load keep the hour and the random stream", () => {
  const w = newWorld({ seed: 7 });
  advanceHour(w);
  const again = hydrate(serialize(w));
  assert.equal(again.hour, w.hour);
  assert.equal(again.rng.state(), w.rng.state());
  assert.equal(byId(again, "you").name, "First Acre");
});
