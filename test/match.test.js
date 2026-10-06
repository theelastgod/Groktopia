import test from "node:test";
import assert from "node:assert/strict";
import {
  MATCH_MS,
  MAX_HUMANS,
  buildingCount,
  claimSeat,
  closeAge,
  createOpenRealm,
  humanCount,
  realmJoinable,
  redact,
} from "../src/sim.js";

test("an open realm keeps every wild holding on its own ground", () => {
  const world = createOpenRealm(4);
  assert.equal(humanCount(world), 0);
  assert.ok(world.provinces.length >= 8);
  for (const province of world.provinces) {
    assert.ok(buildingCount(province) <= province.land, province.id);
    assert.equal(Number.isFinite(province.x), true);
    assert.equal(Number.isFinite(province.y), true);
  }
});

test("matchmaking fills eight human seats and then refuses", () => {
  const world = createOpenRealm(5);
  for (let i = 0; i < MAX_HUMANS; i++) {
    const res = claimSeat(world, { id: `p${i}`, ruler: `R${i}`, province: `Acre ${i}`, faction: "warden" });
    assert.equal(res.ok, true, res.message);
  }
  assert.equal(humanCount(world), 8);
  const full = claimSeat(world, { id: "overflow", ruler: "Late", province: "Nowhere", faction: "marcher" });
  assert.equal(full.ok, false);
});

test("the age clock is two hours and late entry closes after the grace", () => {
  assert.equal(MATCH_MS, 2 * 60 * 60 * 1000);
  const start = 1_000_000;
  assert.equal(realmJoinable({ status: "filling", humans: 1, startedAt: null, ended: false }, start), true);
  assert.equal(realmJoinable({ status: "live", humans: 3, startedAt: start, ended: false }, start + 5 * 60 * 1000), true);
  assert.equal(realmJoinable({ status: "live", humans: 3, startedAt: start, ended: false }, start + 11 * 60 * 1000), false);
  assert.equal(realmJoinable({ status: "ended", humans: 1, ended: true }, start), false);
});

test("closing the age pays humans once, in networth order", () => {
  const world = createOpenRealm(6);
  claimSeat(world, { id: "low", ruler: "Low", province: "Low Acre", faction: "hearth" });
  claimSeat(world, { id: "high", ruler: "High", province: "High Acre", faction: "marcher" });
  const high = world.provinces.find((p) => p.id === "high");
  const low = world.provinces.find((p) => p.id === "low");
  high.land += 400;
  const before = high.utopia;
  closeAge(world);
  assert.ok(high.utopia > before);
  assert.equal(world.closed, true);
  const again = high.utopia;
  closeAge(world);
  assert.equal(high.utopia, again);
  const hidden = redact(world, "low");
  const other = hidden.provinces.find((p) => p.id === "harrow");
  assert.equal(other.gold, 0);
  assert.ok(low.gold > 0);
});
