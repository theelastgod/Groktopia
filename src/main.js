import {
  BUILDINGS,
  EARN,
  FACTIONS,
  ORDERS,
  STUDIES,
  ageName,
  byId,
  defense,
  foodNeed,
  formatUtopia,
  freeLand,
  intelFresh,
  mysticCap,
  networth,
  nwFactor,
  offense,
  population,
  soldierCap,
  spellbook,
  studyCount,
  thiefCap,
  eliteCap,
} from "./sim.js";
import { drawMini, drawRealm, fitCamera, hitProvince, provinceGeom, screenToWorld } from "./map.js";

const SESSION = "groktopia.session";
const app = document.querySelector("#app");

let world = null;
let session = null;
let meta = { status: "filling", startedAt: null, endsAt: null, fillUntil: null, nextTickAt: null, humans: 0, maxHumans: 8, serverNow: Date.now() };
let standings = [];
let socket = null;
let socketGen = 0;
let skew = 0;
let toast = "";
let selectedId = "";
let stake = 100;
let soundOn = true;
let wallet = "";
let chainBalance = null;
let mint = { symbol: "UTOPIA", mint: "", decimals: 6, cluster: "mainnet-beta" };
let audioReady = false;
let mounted = false;
let cam = { x: 0, y: 0, z: 1 };
let goal = { x: 0, y: 0, z: 1 };
let march = null;
let dragging = null;
let hoverId = null;
let pointer = null;
let motes = [];
let seenLog = "";
let purseSeen = null;
let keys = {};
let windowBound = false;
let raf = 0;
let lastFrame = 0;
const clips = {};

function clampZoom(z) {
  return Math.max(0.35, Math.min(2.8, z));
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function seat() {
  return byId(world, world.seat) || byId(world, "you");
}

function saveSession() {
  if (session) localStorage.setItem(SESSION, JSON.stringify(session));
}

function nowServer() {
  return Date.now() + skew;
}

function bootAudio() {
  if (audioReady) return;
  audioReady = true;
  for (const name of ["throne", "battle", "click", "build", "march", "spell", "coin", "win", "lose", "hour"]) {
    const audio = new Audio(`/public/audio/${name}.wav`);
    audio.preload = "auto";
    if (name === "throne" || name === "battle") audio.loop = true;
    clips[name] = audio;
  }
}

function play(name) {
  if (!soundOn) return;
  bootAudio();
  const clip = clips[name];
  if (!clip) return;
  clip.currentTime = 0;
  clip.play().catch(() => {});
}

function bed(name) {
  if (!soundOn || !audioReady) return;
  for (const key of ["throne", "battle"]) {
    if (key !== name) clips[key].pause();
  }
  const clip = clips[name];
  if (clip.paused) clip.play().catch(() => {});
}

function note(message) {
  toast = message;
  paint();
  window.setTimeout(() => {
    if (toast === message) {
      toast = "";
      const node = document.querySelector(".toast");
      if (node) node.remove();
    }
  }, 2400);
}

function act(action, sound) {
  if (!socket || socket.readyState !== 1) {
    note("The realm connection is down.");
    return;
  }
  if (meta.status !== "live") {
    note(meta.status === "ended" ? "The age is over." : "The age clock has not started.");
    return;
  }
  play(sound || "click");
  socket.send(JSON.stringify({ type: "action", action }));
}

function needsMarch(action) {
  return action.target && action.target !== seat().id && (action.type === "attack" || action.type === "thief" || action.spell === "meteor");
}

function order(action, sound) {
  if (needsMarch(action) && !march) {
    const fromP = seat();
    const target = byId(world, action.target);
    if (fromP && target) {
      const from = provinceGeom(fromP);
      const to = provinceGeom(target);
      march = { ax: from.x, ay: from.y, bx: to.x, by: to.y, t: 0, action: null, sound };
      bed("battle");
    }
  }
  act(action, sound);
}

function gate() {
  const saved = localStorage.getItem(SESSION);
  const options = Object.values(FACTIONS).map((f) => `<option value="${f.id}">${esc(f.name)} — ${esc(f.blurb)}</option>`).join("");
  return `<main class="gate">
    <img src="/public/art/banner.jpg" alt="A walled riverside province at dusk">
    <img class="coin-hero" src="/public/art/coin.jpg" alt="$UTOPIA coin">
    <h1>Groktopia</h1>
    <p class="lede">An open realm, seen from above. You earn <b>$UTOPIA</b> by playing: settle acres, complete studies, march inside the fair band, and keep an hour active. The age runs from Camp to Crown. After two hours, placement pays the purse. Matchmaking seats up to eight humans. The Grok agents hold the wilds, and a camp stays dark until you scout it.</p>
    <form class="card" id="found">
      <label>Ruler <input name="ruler" required maxlength="32" value="Ada"></label>
      <label>Province <input name="province" required maxlength="32" value="First Acre"></label>
      <label>Faction <select name="faction">${options}</select></label>
      <div class="row">
        <button class="btn primary" type="submit">Find a realm</button>
        ${saved ? `<button class="btn" type="button" id="resume">Rejoin</button>` : ""}
      </div>
    </form>
  </main>`;
}

function shell() {
  return `<div class="play">
    <canvas id="realm"></canvas>
    <header class="hud-top">
      <div class="brand-row hud-chip"><img class="coin-mark" src="/public/art/coin.jpg" alt=""><div class="brand">Groktopia</div></div>
      <div class="hud-chip" id="hud-hour"></div>
      <div class="hud-chip" id="hud-age"></div>
      <div class="hud-chip"><b id="clock">2:00:00</b><span id="clock-note">age clock</span></div>
      <div class="hud-chip" id="hud-purse"></div>
      <button class="btn" id="home" type="button">My acres</button>
      <button class="btn" id="fit" type="button">Whole realm</button>
      <button class="btn" id="sound" type="button">${soundOn ? "Sound on" : "Sound off"}</button>
    </header>
    <canvas id="mini" width="168" height="168"></canvas>
    <section class="hud-card" id="card"></section>
    <ol class="hud-log log" id="log"></ol>
    <div id="veil" class="veil" hidden></div>
    ${toast ? `<div class="toast">${esc(toast)}</div>` : ""}
  </div>`;
}

function render() {
  if (!world) {
    mounted = false;
    document.body.classList.remove("playing");
    cancelAnimationFrame(raf);
    app.innerHTML = gate();
    return;
  }
  document.body.classList.add("playing");
  if (!mounted) {
    app.innerHTML = shell();
    mounted = true;
    const canvas = document.querySelector("#realm");
    resize();
    const home = provinceGeom(seat());
    cam = { x: home.x, y: home.y, z: 1.15 };
    goal = { ...cam };
    bindMap(canvas);
    lastFrame = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (march) {
        march.t += dt / 1.15;
        if (march.t >= 1) march = null;
      }
      stepCamera(dt);
      stepMotes(dt);
      watchLog();
      const clock = document.querySelector("#clock");
      const noteEl = document.querySelector("#clock-note");
      if (clock) {
        const label = clockLabel();
        clock.textContent = label.time;
        if (noteEl) noteEl.textContent = label.note;
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  paint();
  draw();
}

function pixelRatio() {
  return Math.min(2, window.devicePixelRatio || 1);
}

function resize() {
  const canvas = document.querySelector("#realm");
  if (!canvas) return;
  const dpr = pixelRatio();
  const w = Math.max(1, canvas.clientWidth);
  const h = Math.max(1, canvas.clientHeight);
  const bw = Math.floor(w * dpr);
  const bh = Math.floor(h * dpr);
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
}

function draw() {
  const canvas = document.querySelector("#realm");
  if (!canvas || !world) return;
  const dpr = pixelRatio();
  const w = Math.max(1, canvas.clientWidth);
  const h = Math.max(1, canvas.clientHeight);
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) resize();
  const ctx = canvas.getContext("2d");
  drawRealm(ctx, w, h, world, seat().id, selectedId, cam, march, performance.now() / 1000, hoverId, dpr, motes);
  const mini = document.querySelector("#mini");
  if (mini) drawMini(mini.getContext("2d"), mini.width, mini.height, world, seat().id, cam);
}

function stepCamera(dt) {
  const canvas = document.querySelector("#realm");
  if (!canvas || dragging) return;
  let vx = 0;
  let vy = 0;
  if (keys.w || keys.arrowup) vy -= 1;
  if (keys.s || keys.arrowdown) vy += 1;
  if (keys.a || keys.arrowleft) vx -= 1;
  if (keys.d || keys.arrowright) vx += 1;
  if (pointer) {
    const edge = 28;
    if (pointer.x < edge) vx -= 1;
    if (pointer.x > pointer.w - edge) vx += 1;
    if (pointer.y < edge) vy -= 1;
    if (pointer.y > pointer.h - edge) vy += 1;
  }
  if (vx || vy) {
    const n = Math.hypot(vx, vy) || 1;
    const speed = 340 / Math.max(0.45, cam.z);
    goal.x += (vx / n) * speed * dt;
    goal.y += (vy / n) * speed * dt;
  }
  if (keys.q) goal.z = clampZoom(goal.z * (1 - dt * 0.85));
  if (keys.e) goal.z = clampZoom(goal.z * (1 + dt * 0.85));
  const k = 1 - Math.exp(-6 * dt);
  cam.x += (goal.x - cam.x) * k;
  cam.y += (goal.y - cam.y) * k;
  cam.z += (goal.z - cam.z) * k;
}

function stepMotes(dt) {
  motes = motes.filter((mote) => {
    mote.x += mote.vx * dt;
    mote.y += mote.vy * dt;
    mote.life -= dt * 0.65;
    return mote.life > 0;
  });
}

function burst(x, y, color) {
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    const speed = 28 + (i % 5) * 10;
    motes.push({ x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 1, color });
  }
}

function watchLog() {
  const line = world?.log?.[0]?.text || "";
  if (line === seenLog) return;
  const previous = seenLog;
  seenLog = line;
  if (!previous || !/seized|sacked|razed|meteor|burn|pilfer/i.test(line)) return;
  const target = byId(world, selectedId) || seat();
  const g = provinceGeom(target);
  burst(g.x, g.y, /meteor|burn|razed/i.test(line) ? "#e07a68" : "#e2c078");
}

function paint() {
  if (!mounted || !world) return;
  const p = seat();
  const hour = document.querySelector("#hud-hour");
  const purse = document.querySelector("#hud-purse");
  const card = document.querySelector("#card");
  const log = document.querySelector("#log");
  const veil = document.querySelector("#veil");
  if (hour) hour.innerHTML = `<b>Hour ${world.hour}</b><span>${esc(p.name)} · ${p.orders}/${ORDERS} orders · ${meta.humans || 1}/${meta.maxHumans || 8} players</span>`;
  const age = document.querySelector("#hud-age");
  if (age) age.innerHTML = `<b>${esc(ageName(p))} age</b><span>${studyCount(p)}/8 studies · play earns the purse</span>`;
  if (purse) purse.innerHTML = `<b class="coin"><img class="coin-mark" src="/public/art/coin.jpg" alt="">${formatUtopia(p.utopia)} $UTOPIA</b><span>gold ${p.gold} · grain ${p.grain}</span>`;
  if (log) {
    const board = standings.slice(0, 6).map((row, index) => `${index + 1}. ${row.name} ${formatUtopia(row.utopia || 0)}`).join(" · ");
    log.innerHTML = `<li><b>Board</b> ${esc(board)}</li>` + world.log.slice(0, 7).map((row) => `<li><b>${row.hour}</b> ${esc(row.text)}</li>`).join("");
  }
  if (veil) {
    if (meta.status === "ended") {
      veil.hidden = false;
      veil.innerHTML = `<div class="veil-card"><h2>The age is over</h2><p>Two hours on the clock. Placement is already in the $UTOPIA purses.</p><ol>${standings.filter((row) => row.kind === "human").map((row, index) => `<li>${index + 1}. ${esc(row.ruler)} of ${esc(row.name)} · networth ${row.networth}</li>`).join("")}</ol><button class="btn primary" type="button" id="again">Find another realm</button></div>`;
    } else if (meta.status !== "live") {
      veil.hidden = false;
      const wait = Math.max(0, (meta.fillUntil || nowServer()) - nowServer());
      veil.innerHTML = `<div class="veil-card"><h2>Matchmaking</h2><p>${meta.humans || 1} of ${meta.maxHumans || 8} players on the open map. The two-hour age starts when a second ruler arrives, or in ${fmt(wait)}.</p></div>`;
    } else veil.hidden = true;
  }
  if (card) card.innerHTML = cardFor(p, byId(world, selectedId) || p);
  let toastNode = document.querySelector(".toast");
  if (toast) {
    if (!toastNode) {
      toastNode = document.createElement("div");
      toastNode.className = "toast";
      document.querySelector(".play").appendChild(toastNode);
    }
    toastNode.textContent = toast;
  }
}

function advisor(actor) {
  const next = STUDIES.find((row) => !(actor.studies || {})[row.id] && studyCount(actor) >= row.need);
  if (!next) return `${ageName(actor)} age. The crown is seated. Keep an hour active and the purse still grows until placement.`;
  return `${ageName(actor)} age. Next study: ${next.name}. ${next.blurb} It pays ${formatUtopia(next.purse)} $UTOPIA.`;
}

function studyButtons(actor) {
  return STUDIES.map((row) => {
    const owned = Boolean((actor.studies || {})[row.id]);
    const open = studyCount(actor) >= row.need;
    if (owned) return `<button class="btn" type="button" disabled>${esc(row.name)} seated</button>`;
    if (!open) return "";
    const ae = row.aether ? ` · ${row.aether} ae` : "";
    return `<button class="btn primary" type="button" data-study="${row.id}">${esc(row.name)} · ${row.cost}g${ae} · +${formatUtopia(row.purse)}</button>`;
  }).join("");
}

function oddsLine(actor, selected) {
  const fresh = intelFresh(actor, selected.id, world.hour);
  if (!fresh) return "Scout to read the garrison. Keys 1, 2, and 3 send seize, sack, and raze.";
  const off = offense(actor);
  const def = defense(selected);
  const ratio = off / Math.max(1, def);
  const lean = ratio >= 1.25 ? "Your march looks favored." : ratio <= 0.8 ? "Their garrison looks heavier." : "The two hosts look close.";
  return `${lean} ${off} offense against ${def} defense. Keys 1, 2, and 3 send seize, sack, and raze.`;
}

function cardFor(actor, selected) {
  const self = selected.id === actor.id;
  const fresh = intelFresh(actor, selected.id, world.hour);
  const knownDef = self || fresh ? defense(selected) : "hidden";
  const band = self ? "" : nwFactor(actor, selected) > 0 ? "Inside the fair band." : "Outside the fair band. A march pays nothing.";
  const f = FACTIONS[selected.faction];
  const head = `<h2>${esc(selected.name)}</h2>
    <p class="muted">${esc(selected.ruler)} · ${esc(f.name)} · ${selected.kind === "agent" ? "Grok agent" : "human"}</p>
    <p>${selected.line ? esc(selected.line) : ""}</p>
    <p class="muted">${esc(ageName(selected))} age · ${studyCount(selected)} studies · land ${selected.land} · empty ${freeLand(selected)} · people ${self || fresh ? population(selected) : "—"} · networth ${self || fresh ? networth(selected) : "—"}</p>
    <p>Offense ${self ? offense(actor) : fresh ? fresh.offense : "—"} · defense ${knownDef}. ${esc(band)}</p>
    ${self ? "" : `<p class="muted">${esc(oddsLine(actor, selected))}</p>`}`;
  if (self) {
    const builds = Object.entries(BUILDINGS).map(([key, spec]) => {
      const cost = spec.cost(actor.buildings[key]);
      return `<button class="btn" type="button" data-build="${key}">${esc(spec.name)} ${actor.buildings[key]} · ${cost}g</button>`;
    }).join("");
    const explore = 300 + actor.land * 3;
    const spells = Object.entries(spellbook()).filter(([key]) => key !== "meteor").map(([key, spec]) => {
      const left = actor.spells[key] ? ` · ${actor.spells[key]}h` : "";
      return `<button class="btn" type="button" data-spell="${key}">${esc(spec.name)} · ${spec.cost} ae${left}</button>`;
    }).join("");
    return `${head}
      <p class="muted">Click a structure to raise it on your acres. Soldiers ${actor.soldiers}/${soldierCap(actor)} · ${esc(f.elite)} ${actor.elites}/${eliteCap(actor)} · thieves ${actor.thieves}/${thiefCap(actor)} · mystics ${actor.mystics}/${mysticCap(actor)}. Food need ${foodNeed(actor)}. Aether ${actor.aether}.</p>
      <div class="row">${builds}</div>
      <div class="row">
        <button class="btn" type="button" data-train="soldier">Draft 10</button>
        <button class="btn" type="button" data-train="elite">Train 2 ${esc(f.elite)}</button>
        <button class="btn" type="button" data-train="thief">Train 2 thieves</button>
        <button class="btn" type="button" data-train="disband">Release 10</button>
        <button class="btn primary" type="button" id="explore">Settle 10 acres · ${explore}g</button>
      </div>
      <div class="row">${spells}</div>
      <p class="advisor">${esc(advisor(actor))}</p>
      <div class="row">${studyButtons(actor)}</div>
      <p class="muted">Play to earn: an active hour pays ${formatUtopia(EARN.hourActive + (actor.studies && actor.studies.ledger ? EARN.ledger : 0))} $UTOPIA, settling pays ${formatUtopia(actor.studies && actor.studies.charter ? EARN.charter : EARN.settle)}, and each study pays its own purse. Fair marches still pay inside the combat cap of ${formatUtopia(actor.earnLeft)} this hour. Placement at the bell is 25, 15, 8, 4, 2, then 1.00. Key 4 starts the next study. WASD pans. Q and E zoom.</p>
      ${earnStrip(actor)}`;
  }
  const stakeRow = selected.kind === "human"
    ? `<label class="muted">Stake each side
        <select id="stake">
          <option value="100" ${stake === 100 ? "selected" : ""}>1.00 $UTOPIA</option>
          <option value="500" ${stake === 500 ? "selected" : ""}>5.00 $UTOPIA</option>
          <option value="1000" ${stake === 1000 ? "selected" : ""}>10.00 $UTOPIA</option>
        </select>
      </label>`
    : "";
  return `${head}
    ${stakeRow}
    <div class="row">
      <button class="btn danger" type="button" data-march="seize">Seize</button>
      <button class="btn danger" type="button" data-march="sack">Sack</button>
      <button class="btn danger" type="button" data-march="raze">Raze</button>
      <button class="btn" type="button" data-thief="scout">Scout</button>
      <button class="btn" type="button" data-thief="pilfer">Pilfer</button>
      <button class="btn" type="button" data-thief="arson">Arson</button>
      <button class="btn" type="button" data-spell="meteor">Meteor</button>
    </div>
    <p class="muted">The party crosses the map, then the hour's order resolves. ${selected.kind === "agent" ? "Agents pay $UTOPIA when the march lands inside the band." : "A human stake is paid in $UTOPIA by both purses."}</p>`;
}

function earnStrip(actor) {
  const minted = Boolean(mint.mint);
  return `<p class="muted">Solana ${esc(mint.cluster)}. Mint ${minted ? esc(mint.mint) : "not set"}. Wallet ${wallet ? esc(wallet) : "not connected"}. On-chain ${chainBalance == null ? "—" : esc(chainBalance)}.</p>
    <div class="row">
      <button class="btn" type="button" id="phantom">${wallet ? "Refresh Phantom" : "Connect Phantom"}</button>
      <button class="btn" type="button" id="receipt">Purse receipt</button>
    </div>`;
}

function focusHolding(id) {
  const target = byId(world, id);
  if (!target) return;
  const g = provinceGeom(target);
  goal.x = g.x;
  goal.y = g.y;
  goal.z = Math.max(goal.z, 1.25);
}

function marchMode(mode) {
  if (!world || !selectedId || selectedId === seat().id) return;
  readStake();
  const target = byId(world, selectedId);
  order({
    type: "attack",
    target: selectedId,
    mode,
    stake: target && target.kind === "human" ? stake : 0,
  }, "march");
}

function bindMap(canvas) {
  const track = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      w: rect.width,
      h: rect.height,
    };
    if (!world) return;
    const worldPoint = screenToWorld(pointer.x, pointer.y, cam, rect.width, rect.height);
    hoverId = hitProvince(world.provinces, worldPoint.x, worldPoint.y);
    canvas.classList.toggle("pointing", Boolean(hoverId) && !dragging);
  };
  canvas.addEventListener("pointerdown", (event) => {
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY, cx: cam.x, cy: cam.y, moved: false };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (event) => {
    track(event);
    if (!dragging || dragging.id !== event.pointerId) return;
    const dx = event.clientX - dragging.x;
    const dy = event.clientY - dragging.y;
    if (Math.hypot(dx, dy) > 5) dragging.moved = true;
    cam.x = goal.x = dragging.cx - dx / cam.z;
    cam.y = goal.y = dragging.cy - dy / cam.z;
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!dragging || dragging.id !== event.pointerId) return;
    const moved = dragging.moved;
    dragging = null;
    canvas.classList.remove("dragging");
    track(event);
    if (moved || !world) return;
    if (!hoverId) return;
    selectedId = hoverId;
    play("click");
    bed(hoverId === seat().id ? "throne" : "battle");
    paint();
  });
  canvas.addEventListener("pointerleave", () => {
    pointer = null;
    hoverId = null;
    canvas.classList.remove("pointing");
  });
  canvas.addEventListener("dblclick", (event) => {
    const rect = canvas.getBoundingClientRect();
    const worldPoint = screenToWorld(event.clientX - rect.left, event.clientY - rect.top, cam, rect.width, rect.height);
    const id = hitProvince(world.provinces, worldPoint.x, worldPoint.y);
    if (id) focusHolding(id);
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const before = screenToWorld(event.clientX - rect.left, event.clientY - rect.top, cam, rect.width, rect.height);
    const next = clampZoom(cam.z * (event.deltaY > 0 ? 0.92 : 1.08));
    cam.z = goal.z = next;
    const after = screenToWorld(event.clientX - rect.left, event.clientY - rect.top, cam, rect.width, rect.height);
    cam.x = goal.x = cam.x + before.x - after.x;
    cam.y = goal.y = cam.y + before.y - after.y;
  }, { passive: false });
  const mini = document.querySelector("#mini");
  if (mini) {
    mini.addEventListener("pointerdown", (event) => {
      const rect = mini.getBoundingClientRect();
      const sx = (event.clientX - rect.left) * (mini.width / rect.width);
      const sy = (event.clientY - rect.top) * (mini.height / rect.height);
      const scale = mini.width / 4800;
      goal.x = (sx - mini.width / 2) / scale;
      goal.y = (sy - mini.height / 2) / scale;
    });
  }
  if (!windowBound) {
    windowBound = true;
    window.addEventListener("resize", () => {
      resize();
      draw();
    });
    window.addEventListener("keydown", (event) => {
      const tag = event.target && event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const key = event.key.toLowerCase();
      keys[key] = true;
      if (!document.body.classList.contains("playing")) return;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
      if (event.repeat) return;
      if (event.key === "1") marchMode("seize");
      if (event.key === "2") marchMode("sack");
      if (event.key === "3") marchMode("raze");
      if (event.key === "4" && world) {
        const next = STUDIES.find((row) => !(seat().studies || {})[row.id] && studyCount(seat()) >= row.need);
        if (next) order({ type: "study", study: next.id }, "build");
      }
      if (key === "h") {
        const home = world && provinceGeom(seat());
        if (home) {
          goal.x = home.x;
          goal.y = home.y;
          goal.z = 1.25;
        }
      }
    });
    window.addEventListener("keyup", (event) => {
      keys[event.key.toLowerCase()] = false;
    });
  }
}

app.addEventListener("click", async (event) => {
  const node = event.target.closest("button");
  if (!node) return;
  if (node.id === "resume") {
    const saved = JSON.parse(localStorage.getItem(SESSION) || "null");
    if (saved?.realmId && saved.token) connectSocket(saved);
    return;
  }
  if (node.id === "again") {
    session = null;
    socketGen += 1;
    localStorage.removeItem(SESSION);
    world = null;
    if (socket) socket.close();
    render();
    return;
  }
  if (!world) return;
  if (node.id === "home") {
    const home = provinceGeom(seat());
    goal.x = home.x;
    goal.y = home.y;
    goal.z = 1.25;
    return;
  }
  if (node.id === "fit") {
    const canvas = document.querySelector("#realm");
    goal = fitCamera(world.provinces, canvas.clientWidth, canvas.clientHeight);
    return;
  }
  if (node.id === "sound") {
    soundOn = !soundOn;
    node.textContent = soundOn ? "Sound on" : "Sound off";
    if (!soundOn && audioReady) {
      clips.throne.pause();
      clips.battle.pause();
    } else bed(selectedId === seat().id ? "throne" : "battle");
    return;
  }
  if (node.dataset.build) {
    order({ type: "build", building: node.dataset.build }, "build");
    return;
  }
  if (node.id === "explore") {
    order({ type: "explore" }, "march");
    return;
  }
  if (node.dataset.study) {
    order({ type: "study", study: node.dataset.study }, "build");
    return;
  }
  if (node.dataset.train) {
    const count = node.dataset.train === "soldier" || node.dataset.train === "disband" ? 10 : 2;
    order({ type: "train", unit: node.dataset.train, count }, "build");
    return;
  }
  if (node.dataset.march) {
    readStake();
    const target = byId(world, selectedId);
    order({
      type: "attack",
      target: selectedId,
      mode: node.dataset.march,
      stake: target && target.kind === "human" ? stake : 0,
    }, "march");
    return;
  }
  if (node.dataset.spell) {
    order({ type: "spell", spell: node.dataset.spell, target: selectedId }, "spell");
    return;
  }
  if (node.dataset.thief) {
    order({ type: "thief", op: node.dataset.thief, target: selectedId }, "spell");
    return;
  }
  if (node.id === "phantom") {
    await connectPhantom();
    return;
  }
  if (node.id === "receipt") {
    downloadReceipt();
    play("coin");
  }
});

app.addEventListener("change", (event) => {
  if (event.target.id === "stake") stake = Number(event.target.value);
});

app.addEventListener("submit", async (event) => {
  if (event.target.id !== "found") return;
  event.preventDefault();
  const data = new FormData(event.target);
  const button = event.target.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const res = await fetch("/api/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ruler: String(data.get("ruler") || "Ruler"),
        province: String(data.get("province") || "First Acre"),
        faction: String(data.get("faction") || "marcher"),
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) throw new Error(json.message || "Matchmaking failed");
    session = { realmId: json.realmId, token: json.token, seatId: json.seatId };
    saveSession();
    takeState(json);
    connectSocket(session);
    bootAudio();
    play("hour");
    bed("throne");
  } catch (error) {
    button.disabled = false;
    const node = document.createElement("p");
    node.className = "warn";
    node.textContent = error.message || "Matchmaking failed";
    event.target.appendChild(node);
  }
});

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
}

function clockLabel() {
  const now = nowServer();
  if (meta.status === "ended") return { time: "0:00:00", note: "age closed" };
  if (meta.status !== "live") return { time: fmt((meta.fillUntil || now) - now), note: "until the age starts" };
  const left = (meta.endsAt || now) - now;
  const tick = (meta.nextTickAt || now) - now;
  return { time: fmt(left), note: `left · hour in ${fmt(tick)}` };
}

function takeState(msg) {
  world = msg.world;
  world.seat = msg.seatId || session?.seatId;
  if (msg.meta) {
    meta = msg.meta;
    skew = msg.meta.serverNow - Date.now();
  }
  if (msg.standings) standings = msg.standings;
  if (!selectedId || !byId(world, selectedId)) selectedId = world.seat;
  const purse = seat() && seat().utopia;
  if (purseSeen == null) purseSeen = purse;
  else if (purse > purseSeen) {
    const gain = purse - purseSeen;
    purseSeen = purse;
    note(`Purse +${formatUtopia(gain)} $UTOPIA`);
    play("coin");
  } else purseSeen = purse;
  render();
}

function connectSocket(next) {
  const gen = ++socketGen;
  session = next;
  saveSession();
  if (socket) socket.close();
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${proto}//${location.host}/api/ws?realm=${encodeURIComponent(next.realmId)}&token=${encodeURIComponent(next.token)}`);
  socket.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "error") {
      note(msg.message);
      return;
    }
    if (msg.type === "march" && world && msg.from !== session.seatId) {
      const from = byId(world, msg.from);
      const to = byId(world, msg.to);
      if (from && to) {
        const a = provinceGeom(from);
        const b = provinceGeom(to);
        march = { ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, action: null };
        play("march");
      }
      return;
    }
    if (msg.type === "state") {
      const won = msg.world && world && msg.world.log[0] && world.log[0] && msg.world.log[0].text !== world.log[0].text && /breaks|seized|sacked|Earned/.test(msg.world.log[0].text);
      takeState(msg);
      if (won) play("win");
    }
  });
  socket.addEventListener("close", () => {
    if (gen !== socketGen || !session) return;
    window.setTimeout(() => {
      if (gen === socketGen && session) connectSocket(session);
    }, 1200);
  });
}

function readStake() {
  const stakeNode = document.querySelector("#stake");
  if (stakeNode) stake = Number(stakeNode.value);
}

function downloadReceipt() {
  const p = seat();
  const blob = new Blob([JSON.stringify({
    game: "Groktopia",
    symbol: "UTOPIA",
    cluster: mint.cluster,
    mint: mint.mint || null,
    seat: p.id,
    ruler: p.ruler,
    province: p.name,
    hour: world.hour,
    utopia: formatUtopia(p.utopia),
    utopiaCents: p.utopia,
    wallet: wallet || null,
    note: "Local earn ledger. Not a Solana transfer.",
  }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "groktopia-utopia-receipt.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function connectPhantom() {
  const provider = window.solana;
  if (!provider?.isPhantom) {
    note("Phantom is not installed in this browser.");
    return;
  }
  try {
    const res = await provider.connect();
    wallet = res.publicKey.toString();
    await refreshChain();
    play("coin");
    note(wallet.slice(0, 4) + "…" + wallet.slice(-4));
  } catch (error) {
    note(error?.message || "Phantom closed.");
  }
}

async function refreshChain() {
  chainBalance = null;
  if (!mint.mint || !wallet) return;
  const { Connection, PublicKey } = await import("https://esm.sh/@solana/web3.js@1.95.8");
  const endpoint = mint.cluster === "devnet" ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com";
  const connection = new Connection(endpoint, "confirmed");
  const rows = await connection.getParsedTokenAccountsByOwner(new PublicKey(wallet), { mint: new PublicKey(mint.mint) });
  const raw = rows.value.reduce((sum, row) => sum + Number(row.account.data.parsed.info.tokenAmount.uiAmount || 0), 0);
  chainBalance = `${raw} $${mint.symbol}`;
}

async function loadMint() {
  try {
    const res = await fetch("/public/mint.json");
    if (res.ok) mint = { ...mint, ...(await res.json()) };
  } catch {
    /* keep the empty mint */
  }
}

loadMint().then(render);
