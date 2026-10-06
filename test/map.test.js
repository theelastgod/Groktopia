import test from "node:test";
import assert from "node:assert/strict";
import { blankProvince, newWorld } from "../src/sim.js";
import { fitCamera, hitProvince, provinceGeom, screenToWorld } from "../src/map.js";

test("the seat is a disc on the overhead map and a click lands on it", () => {
  const you = blankProvince({ id: "you", land: 200 });
  const g = provinceGeom(you);
  assert.equal(hitProvince([you], g.x, g.y), "you");
  assert.equal(hitProvince([you], g.x + g.r + 4, g.y), null);
});

test("screen center is the camera focus", () => {
  const cam = { x: 12, y: -4, z: 2 };
  const world = screenToWorld(400, 300, cam, 800, 600);
  assert.equal(world.x, 12);
  assert.equal(world.y, -4);
});

test("a new realm fits inside the view", () => {
  const world = newWorld({ seed: 3 });
  const cam = fitCamera(world.provinces, 1280, 720);
  for (const p of world.provinces) {
    const g = provinceGeom(p);
    const sx = 640 + (g.x - cam.x) * cam.z;
    const sy = 360 + (g.y - cam.y) * cam.z;
    assert.ok(sx > 20 && sx < 1260, p.id);
    assert.ok(sy > 20 && sy < 700, p.id);
  }
});
