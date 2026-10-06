import {
  BUILDINGS,
  DOCTRINES,
  EARN,
  FACTIONS,
  WONDERS,
  RELICS,
  ORDERS,
  AMBITIONS,
  STUDIES,
  VEINS,
  JOIN_GRACE_MS,
  ageName,
  beaconLit,
  bountyOn,
  feastLive,
  seasonName,
  seasonMod,
  stallQuote,
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
import { drawMini, drawRealm, fitCamera, hitProvince, hitSite, provinceGeom, screenToWorld } from "./map.js";

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
let selectedSite = null;
let stake = 100;
let soundOn = true;
let wallet = "";
let chainBalance = null;
let mint = { symbol: "UTOPIA", mint: "", decimals: 6, cluster: "mainnet-beta" };
let audioReady = false;
let mounted = false;
let cam = { x: 0, y: 0, z: 1 };
let goal = { x: 0, y: 0, z: 1 };
let parties = [];
let logReady = false;
let strikes = [];
let dragging = null;
let hoverId = null;
let pointer = null;
let motes = [];
const seenLines = new Set();
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
  return action.target && action.target !== seat().id && (action.type === "attack" || action.type === "thief" || action.type === "trade" || action.type === "envoy" || action.type === "tribute" || action.type === "ransom" || action.type === "release" || action.type === "bounty" || action.type === "relief" || action.spell === "meteor");
}

function marchKind(action) {
  if (action.type === "trade") return "trade";
  if (action.type === "tribute") return "tribute";
  if (action.type === "ransom") return "ransom";
  if (action.type === "release") return "release";
  if (action.type === "bounty") return "bounty";
  if (action.type === "relief") return "relief";
  if (action.type === "envoy") return "envoy";
  if (action.type === "thief") return "thief";
  if (action.spell === "meteor") return "meteor";
  if (action.type === "attack") return action.mode || "seize";
  return "host";
}

function pushParty(ax, ay, bx, by, kind) {
  const dist = Math.hypot(bx - ax, by - ay);
  parties.push({
    ax,
    ay,
    bx,
    by,
    t: 0,
    kind: kind || "host",
    dur: Math.max(3.2, Math.min(8, dist / 240)),
  });
  if (parties.length > 18) parties.shift();
}

function order(action, sound) {
  if (action.type === "clear") {
    const fromP = seat();
    const site = (world.sites || []).find((row) => row.id === action.site);
    if (fromP && site) {
      const from = provinceGeom(fromP);
      pushParty(from.x, from.y, site.x, site.y, "clear");
      bed("battle");
    }
  }
  if (needsMarch(action)) {
    const fromP = seat();
    const target = byId(world, action.target);
    if (fromP && target) {
      const from = provinceGeom(fromP);
      const to = provinceGeom(target);
      pushParty(from.x, from.y, to.x, to.y, marchKind(action));
      bed("battle");
    }
  }
  act(action, sound);
}

function shortWallet() {
  if (!wallet) return "";
  return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
}

function gate() {
  const saved = localStorage.getItem(SESSION);
  const options = Object.values(FACTIONS).map((f) => `<option value="${f.id}">${esc(f.name)} — ${esc(f.blurb)}</option>`).join("");
  const linked = wallet
    ? `Phantom ${esc(shortWallet())}${chainBalance ? ` · ${esc(chainBalance)}` : ""}`
    : "Connect Phantom. This page never asks for a seed phrase.";
  return `<main class="gate">
    <header class="gate-bar">
      <div class="brand-row"><img class="coin-mark" src="/public/art/coin.jpg" alt=""><span class="brand">Groktopia</span></div>
      <div class="row gate-wallet">
        <button class="btn primary" id="phantom" type="button">${wallet ? esc(shortWallet()) : "Connect Phantom"}</button>
        ${wallet ? `<button class="btn" id="phantom-off" type="button">Disconnect</button>` : ""}
      </div>
    </header>
    <section class="hero">
      <img class="hero-art" src="/public/art/banner.jpg" alt="A walled riverside province at dusk">
      <div class="hero-copy">
        <img class="coin-hero" src="/public/art/coin.jpg" alt="$UTOPIA coin">
        <p class="eyebrow">Play to earn $UTOPIA</p>
        <h1>Groktopia</h1>
        <p class="lede">A two-hour realm, seen from above. The age starts the moment you sit. Seven more rulers can join for two minutes, and every hour you play before they arrive is yours. Settle acres, climb from Camp to Crown, and open the old places on the map.</p>
        <ul class="pillars">
          <li><b>Earn</b><span>Hours, acres, studies, caravans, marches</span></li>
          <li><b>Ages</b><span>Camp, Borough, Realm, Crown</span></li>
          <li><b>Match</b><span>Starts now. Eight seats stay open for two minutes</span></li>
        </ul>
      </div>
    </section>
    <form class="card found" id="found">
      <p class="wallet-line">${linked}</p>
      <div class="found-grid">
        <label>Ruler <input name="ruler" required maxlength="32" value="Ada" autocomplete="nickname"></label>
        <label>Province <input name="province" required maxlength="32" value="First Acre"></label>
        <label>Faction <select name="faction">${options}</select></label>
      </div>
      <div class="row">
        <button class="btn primary" type="submit">Find a realm</button>
        ${saved ? `<button class="btn" type="button" id="resume">Rejoin</button>` : ""}
      </div>
    </form>
    ${toast ? `<div class="toast">${esc(toast)}</div>` : ""}
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
      <button class="btn" id="hud-phantom" type="button">${wallet ? esc(shortWallet()) : "Phantom"}</button>
      <button class="btn" id="fit" type="button">Whole realm</button>
      <button class="btn" id="sound" type="button">${soundOn ? "Sound on" : "Sound off"}</button>
    </header>
    <canvas id="mini" width="168" height="168"></canvas>
    <div class="sheet">
      <button class="btn sheet-handle" id="sheet" type="button">Orders</button>
      <section class="hud-card" id="card"></section>
    </div>
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
      parties = parties.filter((party) => {
        party.t += dt / party.dur;
        if (party.t < 1) return true;
        impact(party.bx, party.by, party.kind);
        return false;
      });
      stepCamera(dt);
      stepMotes(dt);
      stepStrikes(dt);
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
  drawRealm(ctx, w, h, world, seat().id, selectedId, cam, parties, performance.now() / 1000, hoverId, dpr, motes, strikes);
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

const STRIKE = {
  trade: "#e2c078",
  tribute: "#f0d7a4",
  clear: "#d7c4a3",
  envoy: "#f3e6c8",
  seize: "#e07a68",
  sack: "#e2c078",
  raze: "#ffb15a",
  thief: "#9a86c8",
  meteor: "#e07a68",
  host: "#f0d7a4",
};

function burst(x, y, color) {
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    const speed = 28 + (i % 5) * 10;
    motes.push({ x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 1, color });
  }
}

function impact(x, y, kind) {
  const color = STRIKE[kind] || "#e2c078";
  strikes.push({ x, y, r: 10, life: 1, color });
  burst(x, y, color);
}

function stepStrikes(dt) {
  strikes = strikes.filter((row) => {
    row.life -= dt * 0.55;
    row.r += dt * 52;
    return row.life > 0;
  });
}

function watchLog() {
  const lines = (world?.log || []).slice(0, 12);
  if (!logReady) {
    for (const row of lines) seenLines.add(`${row.hour}|${row.text}`);
    logReady = true;
    return;
  }
  for (const row of [...lines].reverse()) {
    const key = `${row.hour}|${row.text}`;
    if (seenLines.has(key)) continue;
    seenLines.add(key);
    spawnFromLog(row.text);
  }
}

function spawnFromLog(text) {
  const mine = seat();
  if (!text || (mine && text.startsWith(`${mine.name} `))) return;
  const named = (world.provinces || [])
    .filter((p) => p.name && p.name !== "Unscouted" && text.includes(p.name))
    .sort((a, b) => b.name.length - a.name.length);
  const site = (world.sites || []).find((row) => text.includes(row.name));
  if (named.length < 2 && site && named[0]) {
    const from = provinceGeom(named[0]);
    pushParty(from.x, from.y, site.x, site.y, "clear");
    return;
  }
  if (named.length < 2) return;
  const fromP = named.find((p) => text.startsWith(`${p.name} `)) || named[0];
  const toP = named.find((p) => p.id !== fromP.id);
  if (!toP) return;
  const from = provinceGeom(fromP);
  const to = provinceGeom(toP);
  let kind = "host";
  if (/caravan/i.test(text)) kind = "trade";
  else if (/pact/i.test(text)) kind = "envoy";
  else if (/tribute/i.test(text)) kind = "tribute";
  else if (/scout|pilfer|burn/i.test(text)) kind = "thief";
  else if (/meteor/i.test(text)) kind = "meteor";
  else if (/razed/i.test(text)) kind = "raze";
  else if (/sacked/i.test(text)) kind = "sack";
  pushParty(from.x, from.y, to.x, to.y, kind);
}

function paint() {
  if (!mounted || !world) return;
  const p = seat();
  const hour = document.querySelector("#hud-hour");
  const purse = document.querySelector("#hud-purse");
  const card = document.querySelector("#card");
  const log = document.querySelector("#log");
  const veil = document.querySelector("#veil");
  const watch = beaconLit(p, world.hour) ? ` · watch through ${p.beaconUntil - 1}` : "";
  if (hour) hour.innerHTML = `<b>Hour ${world.hour}</b><span>${esc(p.name)} · ${p.orders}/${ORDERS} orders · ${meta.humans || 1}/${meta.maxHumans || 8} players${watch}</span>`;
  const age = document.querySelector("#hud-age");
  if (age) age.innerHTML = `<b>${esc(ageName(p))} age</b><span>${esc(seasonName(world.hour))} · ${esc(seasonMod(world.hour).line)} · legacy ${networth(p) + (p.utopia || 0)} · ${studyCount(p)}/8 studies</span>`;
  if (purse) purse.innerHTML = `<b class="coin"><img class="coin-mark" src="/public/art/coin.jpg" alt="">${formatUtopia(p.utopia)} $UTOPIA</b><span>gold ${p.gold} · grain ${p.grain}</span>`;
  const hudWallet = document.querySelector("#hud-phantom");
  if (hudWallet) hudWallet.textContent = wallet ? shortWallet() : "Phantom";
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
      veil.innerHTML = `<div class="veil-card"><h2>The age is opening</h2><p>${meta.humans || 1} of ${meta.maxHumans || 8} players. Seats stay open, and the hours already on the clock belong to whoever is here.</p></div>`;
    } else veil.hidden = true;
  }
  if (card) card.innerHTML = selectedSite ? siteCard(p, selectedSite) : cardFor(p, byId(world, selectedId) || p);
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

function ambitionLine(actor) {
  const spec = AMBITIONS.find((row) => row.id === actor.ambition);
  if (!spec) return "No ambition yet. The next seat you take will name one.";
  return `Ambition: ${spec.name}. ${spec.blurb} It pays ${formatUtopia(spec.purse)} $UTOPIA.`;
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
    const cost = actor.doctrine === "college" ? Math.max(80, row.cost - 100) : row.cost;
    const ae = row.aether ? ` · ${row.aether} ae` : "";
    return `<button class="btn primary" type="button" data-study="${row.id}">${esc(row.name)} · ${cost}g${ae} · +${formatUtopia(row.purse)}</button>`;
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
    <p class="muted">${esc(ageName(selected))} age · ${studyCount(selected)} studies${Number.isFinite(selected.seatedHour) ? ` · seated at hour ${selected.seatedHour}` : ""} · land ${selected.land} · empty ${freeLand(selected)} · people ${self || fresh ? population(selected) : "—"} · networth ${self || fresh ? networth(selected) : "—"}</p>
    <p>Offense ${self ? offense(actor) : fresh ? fresh.offense : "—"} · defense ${knownDef}. ${esc(band)}</p>
    ${beaconLit(selected, world.hour) ? `<p class="muted">A watch fire burns through hour ${selected.beaconUntil - 1}. Camps in its light are read, and a second fire chains one hop.</p>` : ""}
    ${feastLive(selected, world.hour) ? `<p class="muted">A long table is set through hour ${selected.feastUntil - 1}. The hearth grows faster while the flags fly.</p>` : ""}
    ${selected.vein && VEINS[selected.vein] && selected.veinUntil > world.hour ? `<p class="muted">${esc(VEINS[selected.vein].name)} through hour ${selected.veinUntil - 1}. ${esc(VEINS[selected.vein].line)}</p>` : ""}
    ${self ? "" : `<p class="muted">${esc(oddsLine(actor, selected))}</p>`}`;
  if (self) {
    const builds = Object.entries(BUILDINGS).map(([key, spec]) => {
      const cost = spec.cost(actor.buildings[key]);
      return `<button class="btn" type="button" data-build="${key}">${esc(spec.name)} ${actor.buildings[key]} · ${cost}g</button>`;
    }).join("");
    let explore = 300 + actor.land * 3;
    if (actor.studies && actor.studies.charter) explore = Math.floor(explore * 0.85);
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
      <p class="muted">${esc(veinLine(actor))}</p>
      <div class="row">${veinButton(actor)}</div>
      <p class="muted">${esc(feastLine(actor))}</p>
      <div class="row">${feastButton(actor)}</div>
      <p class="muted">${esc(stallLine(actor))}</p>
      <div class="row">${stallButtons(actor)}</div>
      <p class="muted">${esc(musterLine(actor))}</p>
      <div class="row">${musterButton(actor)}</div>
      <p class="muted">${esc(penLine(actor))}</p>
      <p class="muted">${esc(beaconLine(actor))}</p>
      <div class="row">${beaconButton(actor)}</div>
      <p class="muted">${esc(relicLine(actor))}</p>
      <p class="advisor">${esc(ambitionLine(actor))}</p>
      <p class="advisor">${esc(advisor(actor))}</p>
      <div class="row">${doctrineButtons(actor)}</div>
      <div class="row">${studyButtons(actor)}</div>
      <div class="row">${wonderButtons(actor)}</div>
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
      ${fresh && pactOpen(actor, selected.id) ? `<button class="btn" type="button" disabled>Pact through hour ${actor.pacts[selected.id]}</button>` : ""}
      ${fresh && !pactOpen(actor, selected.id) ? `<button class="btn primary" type="button" data-pact="1">Envoy · 120g</button>` : ""}
      ${fresh ? `<button class="btn primary" type="button" data-trade="1">Caravan · 200g</button>` : ""}
      ${fresh ? `<button class="btn" type="button" data-tribute="1">Demand tribute</button>` : ""}
      ${fresh && !bountyOn(world, selected.id, world.hour) ? `<button class="btn" type="button" data-bounty="1">Post bounty · 200g</button>` : ""}
      ${fresh ? `<button class="btn" type="button" data-relief="1">Relief · 360 grain</button>` : ""}
      ${(actor.pens && actor.pens[selected.id]) ? `<button class="btn primary" type="button" data-ransom="1">Ransom ${actor.pens[selected.id]}</button>` : ""}
      ${(actor.pens && actor.pens[selected.id]) ? `<button class="btn" type="button" data-release="1">Release ${actor.pens[selected.id]}</button>` : ""}
      <button class="btn" type="button" data-thief="scout">Scout</button>
      <button class="btn" type="button" data-thief="pilfer">Pilfer</button>
      <button class="btn" type="button" data-thief="arson">Arson</button>
      <button class="btn" type="button" data-spell="meteor">Meteor</button>
    </div>
    ${bountyOn(world, selected.id, world.hour) ? `<p class="muted">${esc(bountyLine(selected))}</p>` : ""}
    <p class="muted">Watch the party cross the map. The order resolves as they step off. ${fresh ? "A caravan needs this scout and pays inside the fair band, up to the hour's combat cap." : "Scout the camp before a caravan can roll."} ${selected.kind === "agent" ? "Agents pay $UTOPIA when the march lands inside the band." : "A human stake is paid in $UTOPIA by both purses."}</p>`;
}

function wonderButtons(actor) {
  const built = world.wonders || {};
  return Object.entries(WONDERS).map(([id, spec]) => {
    const owner = built[id];
    if (actor.marks && actor.marks[id]) return `<button class="btn" type="button" disabled>${esc(spec.name)} · yours</button>`;
    if (owner) {
      const holder = byId(world, owner);
      const who = holder && holder.name !== "Unscouted" ? holder.name : "somewhere in the wild";
      return `<button class="btn" type="button" disabled>${esc(spec.name)} · ${esc(who)}</button>`;
    }
    if (studyCount(actor) < spec.need) return "";
    const cost = actor.doctrine === "college" ? Math.max(200, spec.cost - 100) : spec.cost;
    const ae = spec.aether ? ` · ${spec.aether} ae` : "";
    return `<button class="btn primary" type="button" data-wonder="${id}">${esc(spec.name)} · ${cost}g${ae} · +${formatUtopia(spec.purse)}</button>`;
  }).join("");
}

function pactOpen(actor, id) {
  const until = actor.pacts && actor.pacts[id];
  return typeof until === "number" && world.hour <= until;
}

function doctrineButtons(actor) {
  return Object.entries(DOCTRINES).map(([id, spec]) => {
    const on = actor.doctrine === id;
    return `<button class="btn${on ? " primary" : ""}" type="button" data-doctrine="${id}" ${on ? "disabled" : ""}>${esc(spec.name)}${on ? " · civic" : " · 180g"}</button>`;
  }).join("");
}

function ledgerLine(actor) {
  const book = actor.ledger || {};
  const bits = [
    ["hours", book.hour],
    ["acres", book.settle],
    ["studies", book.study],
    ["marches", book.combat],
    ["stakes", book.stake],
    ["placement", book.place],
    ["wonders", book.wonder],
    ["caravans", book.trade],
    ["pacts", book.pact],
    ["ambitions", book.ambition],
    ["places", book.site],
    ["relics", book.relic],
    ["tribute", book.tribute],
    ["watch", book.beacon],
    ["ransoms", book.ransom],
    ["musters", book.muster],
    ["stalls", book.stall],
    ["feasts", book.feast],
    ["bounties", book.bounty],
    ["veins", book.vein],
    ["relief", book.relief],
  ].filter((row) => row[1] > 0);
  if (!bits.length) return "The purse is empty. Settle land, complete a study, adopt a civic and keep the hour active, or march inside the fair band.";
  return `Purse from ${bits.map(([name, cents]) => `${name} ${formatUtopia(cents)}`).join(" · ")}.`;
}

function earnStrip(actor) {
  const minted = Boolean(mint.mint);
  return `<p class="muted">${esc(ledgerLine(actor))}</p>
    <p class="muted">Solana ${esc(mint.cluster)}. Mint ${minted ? esc(mint.mint) : "not set"}. Wallet ${wallet ? esc(wallet) : "not connected"}. On-chain ${chainBalance == null ? "—" : esc(chainBalance)}.</p>
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

function worldPointFrom(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return screenToWorld(event.clientX - rect.left, event.clientY - rect.top, cam, rect.width, rect.height);
}

function bountyLine(selected) {
  const row = bountyOn(world, selected.id, world.hour);
  if (!row) return "";
  const who = byId(world, row.poster);
  return `A bounty of ${row.gold} gold sits through hour ${row.until - 1}, posted by ${who ? who.name : "someone"}. A winning seize or sack by anyone else collects it.`;
}

function veinLine(actor) {
  const spec = actor.vein && VEINS[actor.vein];
  if (spec && actor.veinUntil > world.hour) return `${spec.name} through hour ${actor.veinUntil - 1}. ${spec.line}`;
  return "Prospect the acres for 180 gold. The strike is a salt pan, an iron seam, or a sweet spring, and it holds for 8 hours. Key 0 digs.";
}

function veinButton(actor) {
  const spec = actor.vein && VEINS[actor.vein];
  if (spec && actor.veinUntil > world.hour) return `<button class="btn" type="button" disabled>${esc(spec.name)} through hour ${actor.veinUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-prospect="1">Prospect · 180g · +${formatUtopia(EARN.vein)}</button>`;
}

function feastLine(actor) {
  if (feastLive(actor, world.hour)) return `The long table holds through hour ${actor.feastUntil - 1}. Workshops run a little hotter, and the hearth takes in more people.`;
  return "Set a long table for 160 gold and 450 grain. For five hours the hearth grows faster. Key 9 sets it.";
}

function feastButton(actor) {
  if (feastLive(actor, world.hour)) return `<button class="btn" type="button" disabled>Feast through hour ${actor.feastUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-feast="1">Set the table · 160g · +${formatUtopia(EARN.feast)}</button>`;
}

function stallLine(actor) {
  const quote = stallQuote(world.hour);
  const open = actor.stallHour === world.hour ? " The awning is up this hour." : "";
  return `${quote.name} stall: sell ${quote.grain} grain for ${quote.sell} gold, or buy it for ${quote.buy}. Keep ${quote.keep} grain for the hearth.${open} Key 8 sells.`;
}

function stallButtons(actor) {
  const quote = stallQuote(world.hour);
  const pay = actor.stallHour === world.hour ? "" : ` · +${formatUtopia(EARN.stall)}`;
  return `<button class="btn primary" type="button" data-stall="sell">Sell ${quote.grain} grain · ${quote.sell}g${pay}</button><button class="btn" type="button" data-stall="buy">Buy ${quote.grain} grain · ${quote.buy}g</button>`;
}

function musterLine(actor) {
  if ((actor.muster || 0) > 0 && actor.musterUntil > world.hour) {
    return `Field host: ${actor.muster} stand through hour ${actor.musterUntil - 1}. They fight lighter than soldiers, then go home.`;
  }
  return "Ring the bell for 120 gold. Up to 36 peasants stand in the field host for 4 hours. Key 7 calls them.";
}

function musterButton(actor) {
  if ((actor.muster || 0) > 0 && actor.musterUntil > world.hour) {
    return `<button class="btn" type="button" disabled>Field host through hour ${actor.musterUntil - 1}</button>`;
  }
  return `<button class="btn primary" type="button" data-muster="1">Ring the bell · 120g · +${formatUtopia(EARN.muster)}</button>`;
}

function penLine(actor) {
  const rows = Object.entries(actor.pens || {}).filter((row) => row[1] > 0);
  if (!rows.length) return "A winning seize or sack pens some of their people. Ransom them for gold, or release them. Each one eats a grain an hour.";
  const names = rows.map(([id, n]) => `${n} from ${byId(world, id)?.name || "a camp"}`).join(", ");
  const eat = rows.reduce((sum, row) => sum + row[1], 0);
  return `Pens: ${names}. They eat ${eat} grain an hour. Select their camp to ransom or release them.`;
}

function beaconLine(actor) {
  if (beaconLit(actor, world.hour)) return `The watch fire holds through hour ${actor.beaconUntil - 1}. Nearby camps stay scouted, and a lit fire beside them chains one hop.`;
  return "Light the watch fire for 160 gold and 80 grain. For six hours it scouts camps within reach. Key 5 lights it.";
}

function beaconButton(actor) {
  if (beaconLit(actor, world.hour)) return `<button class="btn" type="button" disabled>Watch fire through hour ${actor.beaconUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-beacon="1">Light the watch · 160g · +${formatUtopia(EARN.beacon)}</button>`;
}

function relicLine(actor) {
  const held = Object.keys(actor.relics || {}).map((id) => RELICS[id]).filter(Boolean);
  if (!held.length) return "Old places on the map still hold a relic. Open one and it stays with your acres.";
  return `Relics: ${held.map((row) => `${row.name}. ${row.line}`).join(" ")}`;
}

function siteCard(actor, site) {
  const who = site.clearedBy ? (byId(world, site.clearedBy)?.name || "someone") : "";
  const relic = RELICS[site.id];
  return `<h2>${esc(site.name)}</h2>
    <p>${esc(site.blurb)}</p>
    <p class="muted">${relic ? `${esc(relic.name)}. ${esc(relic.line)}` : ""}</p>
    ${who ? `<p class="muted">Opened by ${esc(who)}.</p>` : `<p class="muted">A party of 15 soldiers. Brings ${site.gold} gold and ${formatUtopia(site.purse)} $UTOPIA.</p>`}
    <div class="row">
      ${who ? "" : `<button class="btn primary" type="button" data-clear="${esc(site.id)}">Open ${esc(site.name)}</button>`}
      <button class="btn" type="button" data-site-close="1">Back to acres</button>
    </div>
    ${earnStrip(actor)}`;
}

function setSheet(open) {
  document.body.classList.toggle("sheet-open", open);
  const handle = document.querySelector("#sheet");
  if (handle) handle.textContent = open ? "Map" : "Orders";
}

function bindMap(canvas) {
  const fingers = new Map();
  let pinch = null;
  let lastTap = 0;
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
    fingers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (fingers.size === 2) {
      const pts = [...fingers.values()];
      pinch = { dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1, z: cam.z };
      dragging = null;
      canvas.classList.remove("dragging");
      return;
    }
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY, cx: cam.x, cy: cam.y, moved: false };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (fingers.has(event.pointerId)) fingers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    track(event);
    if (fingers.size >= 2 && pinch) {
      const pts = [...fingers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      cam.z = goal.z = clampZoom(pinch.z * (dist / pinch.dist));
      return;
    }
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
    fingers.delete(event.pointerId);
    if (fingers.size < 2) pinch = null;
    canvas.classList.remove("dragging");
    track(event);
    if (moved || !world) return;
    const now = performance.now();
    if (hoverId && now - lastTap < 300) focusHolding(hoverId);
    lastTap = now;
    const point = worldPointFrom(event, canvas);
    const siteHit = hitSite(world.sites, point.x, point.y);
    if (!hoverId && siteHit) {
      selectedSite = (world.sites || []).find((row) => row.id === siteHit) || null;
      if (window.matchMedia("(max-width: 760px)").matches) setSheet(true);
      play("click");
      paint();
      return;
    }
    selectedSite = null;
    if (!hoverId) return;
    selectedId = hoverId;
    if (window.matchMedia("(max-width: 760px)").matches) setSheet(true);
    play("click");
    bed(hoverId === seat().id ? "throne" : "battle");
    paint();
  });
  canvas.addEventListener("pointerup", (event) => {
    if (fingers.has(event.pointerId) && (!dragging || dragging.id !== event.pointerId)) {
      fingers.delete(event.pointerId);
      if (fingers.size < 2) pinch = null;
    }
  });
  canvas.addEventListener("pointercancel", (event) => {
    fingers.delete(event.pointerId);
    if (dragging && dragging.id === event.pointerId) dragging = null;
    if (fingers.size < 2) pinch = null;
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
      if (event.key === "5" && world) order({ type: "beacon" }, "spell");
      if (event.key === "6" && world && selectedId && seat().pens && seat().pens[selectedId]) order({ type: "ransom", target: selectedId }, "coin");
      if (event.key === "7" && world) order({ type: "muster" }, "build");
      if (event.key === "8" && world) order({ type: "stall", mode: "sell" }, "coin");
      if (event.key === "9" && world) order({ type: "feast" }, "coin");
      if (event.key === "0" && world) order({ type: "prospect" }, "build");
      if (event.key.toLowerCase() === "b" && world && selectedId && selectedId !== seat().id) order({ type: "bounty", target: selectedId }, "coin");
      if (event.key.toLowerCase() === "r" && world && selectedId && selectedId !== seat().id) order({ type: "relief", target: selectedId }, "coin");
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
  if (node.id === "sheet") {
    setSheet(!document.body.classList.contains("sheet-open"));
    return;
  }
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
  if (node.dataset.beacon) {
    order({ type: "beacon" }, "spell");
    return;
  }
  if (node.dataset.muster) {
    order({ type: "muster" }, "build");
    return;
  }
  if (node.dataset.stall) {
    order({ type: "stall", mode: node.dataset.stall }, "coin");
    return;
  }
  if (node.dataset.feast) {
    order({ type: "feast" }, "coin");
    return;
  }
  if (node.dataset.bounty) {
    order({ type: "bounty", target: selectedId }, "coin");
    return;
  }
  if (node.dataset.relief) {
    order({ type: "relief", target: selectedId }, "coin");
    return;
  }
  if (node.dataset.prospect) {
    order({ type: "prospect" }, "build");
    return;
  }
  if (node.dataset.doctrine) {
    order({ type: "doctrine", doctrine: node.dataset.doctrine }, "click");
    return;
  }
  if (node.dataset.wonder) {
    order({ type: "wonder", wonder: node.dataset.wonder }, "build");
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
  if (node.dataset.clear) {
    order({ type: "clear", site: node.dataset.clear }, "march");
    return;
  }
  if (node.dataset.siteClose) {
    selectedSite = null;
    paint();
    return;
  }
  if (node.dataset.pact) {
    order({ type: "envoy", target: selectedId }, "click");
    return;
  }
  if (node.dataset.trade) {
    order({ type: "trade", target: selectedId }, "coin");
    return;
  }
  if (node.dataset.tribute) {
    order({ type: "tribute", target: selectedId }, "coin");
    return;
  }
  if (node.dataset.ransom) {
    order({ type: "ransom", target: selectedId }, "coin");
    return;
  }
  if (node.dataset.release) {
    order({ type: "release", target: selectedId }, "click");
    return;
  }
  if (node.dataset.thief) {
    order({ type: "thief", op: node.dataset.thief, target: selectedId }, "spell");
    return;
  }
  if (node.id === "phantom" || node.id === "hud-phantom") {
    await connectPhantom();
    return;
  }
  if (node.id === "phantom-off") {
    try { await window.solana?.disconnect(); } catch { /* already closed */ }
    wallet = "";
    chainBalance = null;
    note("Phantom disconnected.");
    render();
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
  const seats = meta.startedAt ? meta.startedAt + JOIN_GRACE_MS - now : 0;
  const open = seats > 0 && (meta.humans || 0) < (meta.maxHumans || 8) ? ` · seats ${fmt(seats)}` : "";
  return { time: fmt(left), note: `left · hour in ${fmt(tick)}${open}` };
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
  if (selectedSite) selectedSite = (world.sites || []).find((row) => row.id === selectedSite.id) || null;
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
      const site = (world.sites || []).find((row) => row.id === msg.to);
      if (from && (to || site || Number.isFinite(msg.x))) {
        const a = provinceGeom(from);
        const b = Number.isFinite(msg.x) ? { x: msg.x, y: msg.y } : provinceGeom(to);
        pushParty(a.x, a.y, b.x, b.y, msg.kind || "host");
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
    note(shortWallet());
    render();
  } catch (error) {
    note(error?.message || "Phantom closed.");
    render();
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

loadMint().then(async () => {
  render();
  const provider = window.solana;
  if (!provider?.isPhantom) return;
  try {
    const res = await provider.connect({ onlyIfTrusted: true });
    wallet = res.publicKey.toString();
    await refreshChain();
    render();
  } catch {
    /* the player has not approved Phantom yet */
  }
});
