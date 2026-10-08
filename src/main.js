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
  foldLive,
  curfewUp,
  hospiceUp,
  innUp,
  innToll,
  weirLive,
  weirYield,
  timberYards,
  quarryPits,
  patrolUp,
  keelUp,
  keelHaul,
  NAVY,
  stonePrice,
  siegeLive,
  leveeUp,
  roadLive,
  seasonName,
  seasonMod,
  stallQuote,
  byId,
  worldToAxial,
  axialToWorld,
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
  WEAPONS,
  thiefCap,
  eliteCap,
} from "./sim.js";
import { drawMini, drawRealm, fitCamera, hitBand, hitProvince, hitSite, provinceGeom, screenToWorld } from "./map.js";

const SESSION = "groktopia.session";
const app = document.querySelector("#app");

let world = null;
let session = null;
let meta = { status: "filling", startedAt: null, endsAt: null, fillUntil: null, nextTickAt: null, humans: 0, maxHumans: 12, serverNow: Date.now() };
let standings = [];
let socket = null;
let socketGen = 0;
let skew = 0;
let toast = "";
let selectedId = "";
let selectedSite = null;
let selectedBand = null;
let aim = null;
let stake = 100;
let soundOn = true;
let trailerAt = 0;
let trailerMuted = true;
let introSeen = false;
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

function finishIntro() {
  introSeen = true;
  document.body.classList.remove("intro-open");
  const node = document.querySelector("#intro");
  if (node) node.remove();
}

function mountTrailer() {
  const video = document.querySelector("#trailer");
  if (!video) return;
  video.muted = trailerMuted;
  const resume = () => {
    const end = Number.isFinite(video.duration) ? video.duration : 45;
    if (trailerAt > 0.25 && trailerAt < end - 0.35) {
      try { video.currentTime = trailerAt; } catch { /* seek before the file is ready */ }
    }
    video.play().catch(() => {});
  };
  video.addEventListener("timeupdate", () => { trailerAt = video.currentTime; });
  video.addEventListener("ended", finishIntro, { once: true });
  if (video.readyState >= 1) resume();
  else video.addEventListener("loadedmetadata", resume, { once: true });
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
  return action.target && action.target !== seat().id && (action.type === "attack" || action.type === "siege" || action.type === "sally" || action.type === "thief" || action.type === "trade" || action.type === "envoy" || action.type === "tribute" || action.type === "ransom" || action.type === "release" || action.type === "bounty" || action.type === "relief" || action.type === "road" || action.spell === "meteor");
}

function marchKind(action) {
  if (action.type === "trade") return "trade";
  if (action.type === "tribute") return "tribute";
  if (action.type === "ransom") return "ransom";
  if (action.type === "release") return "release";
  if (action.type === "bounty") return "bounty";
  if (action.type === "relief") return "relief";
  if (action.type === "road") return "road";
  if (action.type === "siege") return "siege";
  if (action.type === "sally") return "sally";
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
  if (action.type === "ride" || action.type === "bribe") {
    const fromP = seat();
    const band = (world.bands || []).find((row) => row.id === action.band);
    if (fromP && band) {
      const from = provinceGeom(fromP);
      pushParty(from.x, from.y, band.x, band.y, action.type === "bribe" ? "bribe" : "ride");
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
  const film = introSeen ? "" : `<div class="intro" id="intro">
      <video id="trailer" class="intro-film" poster="/public/art/banner.jpg" src="/public/trailer.mp4" autoplay muted playsinline preload="auto"></video>
      <div class="intro-chrome">
        <p class="intro-mark">Groktopia</p>
        <div class="intro-actions">
          <button class="btn" id="trailer-sound" type="button">${trailerMuted ? "Hear the score" : "Quiet"}</button>
          <button class="btn primary" id="trailer-skip" type="button">Enter</button>
        </div>
      </div>
    </div>`;
  return `${film}<main class="gate">
    <header class="gate-bar">
      <div class="brand-row"><img class="coin-mark" src="/public/art/coin.jpg" alt=""><span class="brand">Groktopia</span></div>
      <div class="row gate-wallet">
        <button class="btn" id="phantom" type="button">${wallet ? esc(shortWallet()) : "Connect Phantom"}</button>
        ${wallet ? `<button class="btn" id="phantom-off" type="button">Disconnect</button>` : ""}
      </div>
    </header>
    <section class="home">
      <div class="home-lead">
        <p class="eyebrow">Play to earn $UTOPIA</p>
        <h1>A realm, seen from above</h1>
        <p class="lede">Sit, and the age starts. The map is the game. The purse is the ledger on this page.</p>
        <ol class="steps">
          <li><b>Sit</b><span>Name a ruler and a province. Twelve seats stay open for two minutes. Hours you play before the others arrive are yours.</span></li>
          <li><b>Settle</b><span>Two rings beside your city start open. Buy further ground, then choose a building and the tile to raise it.</span></li>
          <li><b>Earn</b><span>An active hour, new acres, studies, and fair marches fill the purse. Connect Phantom if you want. This page never asks for a seed phrase.</span></li>
          <li><b>Move</b><span>Drag the map. The wheel zooms. On a phone, Orders is the sheet at the bottom. Ports fish, and hulls sail where you point them.</span></li>
        </ol>
      </div>
      <form class="card found home-seat" id="found">
        <p class="wallet-line">${linked}</p>
        <h2>Take a seat</h2>
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
    </section>
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
    document.body.classList.toggle("intro-open", !introSeen);
    app.innerHTML = gate();
    if (!introSeen) mountTrailer();
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
  const band = (world.bands || []).find((row) => text.includes(row.name));
  if (band && named[0]) {
    const hold = provinceGeom(named[0]);
    if (/rides through|rides at|breaks on the wall|scatters/i.test(text)) pushParty(band.x, band.y, hold.x, hold.y, "band");
    else pushParty(hold.x, hold.y, band.x, band.y, "ride");
    return;
  }
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
  if (hour) hour.innerHTML = `<b>Hour ${world.hour}</b><span>${esc(p.name)} · ${p.orders}/${ORDERS} orders · ${meta.humans || 1}/${meta.maxHumans || 12} players${watch}</span>`;
  const age = document.querySelector("#hud-age");
  if (age) age.innerHTML = `<b>${esc(ageName(p))} age</b><span>${esc(seasonName(world.hour))} · ${esc((WEAPONS[p.weapon] || WEAPONS.spear).name)} · ${esc(seasonMod(world.hour).line)} · legacy ${networth(p) + (p.utopia || 0)} · ${studyCount(p)}/${STUDIES.length} studies</span>`;
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
      const humans = standings.filter((row) => row.kind === "human");
      const mine = humans.find((row) => row.id === p.id);
      const prize = mine
        ? `You placed ${placeWord(humans.indexOf(mine) + 1)} and won ${formatUtopia(mine.placePay || 0)} $UTOPIA. Your purse is ${formatUtopia(mine.utopia || 0)}.`
        : "Placement is in the $UTOPIA purses.";
      const marked = mine && mine.wallet
        ? ` Marked for ${esc(mine.wallet.slice(0, 4))}…${esc(mine.wallet.slice(-4))}.`
        : " Connect Phantom to mark the win to an address.";
      veil.innerHTML = `<div class="veil-card"><h2>The age is over</h2><p>${prize}${marked} The purse is the matched ledger on this page. This page never asks for a seed phrase.</p><ol>${humans.map((row, index) => `<li>${index + 1}. ${esc(row.ruler)} of ${esc(row.name)} · ${formatUtopia(row.utopia || 0)} $UTOPIA${row.placePay ? ` · place ${formatUtopia(row.placePay)}` : ""}</li>`).join("")}</ol><div class="row"><button class="btn primary" type="button" id="receipt">Download purse</button><button class="btn" type="button" id="again">Find another realm</button></div></div>`;
    } else if (meta.status !== "live") {
      veil.hidden = false;
      veil.innerHTML = `<div class="veil-card"><h2>The age is opening</h2><p>${meta.humans || 1} of ${meta.maxHumans || 12} players. Seats stay open, and the hours already on the clock belong to whoever is here.</p></div>`;
    } else veil.hidden = true;
  }
  if (card) card.innerHTML = selectedBand ? bandCard(p, selectedBand) : selectedSite ? siteCard(p, selectedSite) : cardFor(p, byId(world, selectedId) || p);
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

function sallyButtons(actor) {
  const hour = world.hour || 0;
  return (world.provinces || [])
    .filter((p) => siegeLive(p, hour) && p.siege.target === actor.id)
    .map((foe) => `<button class="btn danger" type="button" data-sally="${foe.id}">Sally ${esc(foe.name)} · +${formatUtopia(EARN.sally)}</button>`)
    .join("");
}

function siegeNote(actor, selected) {
  const hour = world.hour || 0;
  const bits = [];
  if (siegeLive(actor, hour) && (selected.id === actor.id || actor.siege.target === selected.id)) {
    const camp = byId(world, actor.siege.target);
    bits.push(`Your siege works sit outside ${camp ? camp.name : "a camp"} through hour ${actor.siege.until - 1}. They eat grain each hour and sap a soft wall. A march spends the works and hits harder. Key Z pitches them.`);
  }
  const incoming = (world.provinces || []).filter((p) => siegeLive(p, hour) && p.siege.target === selected.id);
  for (const foe of incoming) {
    if (foe.id === actor.id) continue;
    bits.push(`${foe.name} has siege works outside this holding through hour ${foe.siege.until - 1}. Sally them if the wall is heavier than the camp. Key M sallies.`);
  }
  if ((selected.standards || 0) > 0) bits.push(`${selected.standards} captured ${selected.standards === 1 ? "banner hangs" : "banners hang"} over the holding.`);
  if (!bits.length) return "";
  return bits.map((line) => `<p class="muted">${esc(line)}</p>`).join("");
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
    ${(selected.smithUntil || 0) > world.hour ? `<p class="muted">The forge is banked through hour ${selected.smithUntil - 1}. Soldiers hit harder while the smoke rises.</p>` : ""}
    ${(selected.sealUntil || 0) > world.hour ? `<p class="muted">The grain bins are sealed through hour ${selected.sealUntil - 1}. A sack takes half the grain.</p>` : ""}
    ${leveeUp(selected, world.hour) ? `<p class="muted">A levee rings the holding through hour ${selected.leveeUntil - 1}. It takes one building blow, and the ditch waters the near fields.</p>` : ""}
    ${foldLive(selected, world.hour) ? `<p class="muted">A flock of ${selected.fold} is penned through hour ${selected.foldUntil - 1}. Each hour the fold yields wool and milk. A sack scatters them.</p>` : ""}
    ${curfewUp(selected, world.hour) ? `<p class="muted">Curfew lanterns hang through hour ${selected.curfewUntil - 1}. A pilfer takes half the gold.</p>` : ""}
    ${hospiceUp(selected, world.hour) ? `<p class="muted">A hospice tent stands through hour ${selected.hospiceUntil - 1}. Battle losses are halved, and a few people arrive each hour.</p>` : ""}
    ${innUp(selected, world.hour) ? `<p class="muted">A wayside inn stands through hour ${selected.innUntil - 1}. The taproom pays ${innToll(selected, world.hour)} gold this hour. A sack burns it.</p>` : ""}
    ${weirLive(selected, world.hour) ? `<p class="muted">${selected.weir} nets hold through hour ${selected.weirUntil - 1}. This hour they yield ${weirYield(selected, world.hour).grain} grain and ${weirYield(selected, world.hour).gold} gold. A sack tears them up.</p>` : ""}
    ${timberYards(selected) > 0 ? `<p class="muted">${timberYards(selected)} timber ${timberYards(selected) === 1 ? "yard stands" : "yards stand"} on the woods. Each pays 26 gold an hour, and a causeway costs 180 gold. A sack can burn one stack.</p>` : ""}
    ${quarryPits(selected) > 0 ? `<p class="muted">${quarryPits(selected)} ${quarryPits(selected) === 1 ? "quarry cuts" : "quarries cut"} the hills. Each pays 22 gold an hour and 5 defense. Keeps and barracks cost 40 gold less per face. A sack can collapse one pit.</p>` : ""}
    ${(self || fresh) && patrolUp(selected, world.hour) ? `<p class="muted">${selected.patrol} outriders screen the acres through hour ${selected.patrolUntil - 1}. A wild ride that cannot break them turns aside.</p>` : ""}
    ${(self || fresh) && keelUp(selected, world.hour) ? `<p class="muted">A keel with ${selected.keel} crew rides through hour ${selected.keelUntil - 1}. This hour it hauls ${keelHaul(selected, world.hour).grain} grain and ${keelHaul(selected, world.hour).gold} gold. It escorts caravans, and a sack burns the hull.</p>` : ""}
    ${siegeNote(actor, selected)}
    ${!self && roadLive(actor, selected.id, world.hour) ? `<p class="muted">Your causeway holds through hour ${actor.roads[selected.id] - 1}. Caravans on it haul a quarter more. A march tears the stones up.</p>` : ""}
    ${self ? "" : `<p class="muted">${esc(oddsLine(actor, selected))}</p>`}`;
  if (self) {
    const builds = Object.entries(BUILDINGS).map(([key, spec]) => {
      const cost = stonePrice(actor, key);
      return `<button class="btn" type="button" data-build="${key}">${esc(spec.name)} ${actor.buildings[key]} · ${cost}g · on a tile</button>`;
    }).join("");
    let explore = 300 + actor.land * 3;
    if (actor.studies && actor.studies.charter) explore = Math.floor(explore * 0.85);
    const spells = Object.entries(spellbook()).filter(([key]) => key !== "meteor").map(([key, spec]) => {
      const left = actor.spells[key] ? ` · ${actor.spells[key]}h` : "";
      return `<button class="btn" type="button" data-spell="${key}">${esc(spec.name)} · ${spec.cost} ae${left}</button>`;
    }).join("");
    return `${head}
      <p class="muted">${esc(armsLine(actor))}</p>
      ${weaponLine(actor)}
      <p class="muted">Two rings beside your seat start open. Buy further ground, then click a structure and the tile to raise it there. Soldiers ${actor.soldiers}/${soldierCap(actor)} · ${esc(f.elite)} ${actor.elites}/${eliteCap(actor)} · thieves ${actor.thieves}/${thiefCap(actor)} · mystics ${actor.mystics}/${mysticCap(actor)}. Food need ${foodNeed(actor)}. Aether ${actor.aether}.</p>
      <div class="row">${builds}</div>
      <div class="row">
        <button class="btn" type="button" data-train="soldier">Draft 10</button>
        <button class="btn" type="button" data-train="elite">Train 2 ${esc(f.elite)}</button>
        <button class="btn" type="button" data-train="thief">Train 2 thieves</button>
        <button class="btn" type="button" data-train="disband">Release 10</button>
        <button class="btn primary" type="button" id="explore">Settle 10 acres · 2 tiles · ${explore}g</button>
        <button class="btn" type="button" data-buy="1">Buy a tile · click the map · +${formatUtopia(EARN.tile)}</button>
        <button class="btn" type="button" data-arm="foot">Foot · 80g</button>
        <button class="btn" type="button" data-arm="rider">Riders · 240g</button>
        <button class="btn" type="button" data-arm="engine">Catapults · 380g</button>
        <button class="btn" type="button" data-arm="sapper">Sappers · 280g</button>
        <button class="btn" type="button" data-hamlet="1">Raise a hamlet · 260g</button>
        <button class="btn" type="button" data-timber="1">Cut a timber yard · 170g</button>
        <button class="btn" type="button" data-quarry="1">Open a quarry · 190g · +${formatUtopia(EARN.quarry)}</button>
        <button class="btn" type="button" data-wheel="1">Raise a tide wheel · 210g · +${formatUtopia(EARN.wheel)}</button>
        <button class="btn" type="button" data-look="1">Raise a lookout · 180g · +${formatUtopia(EARN.look)}</button>
        <button class="btn" type="button" data-pale="1">Raise a palisade · 170g · +${formatUtopia(EARN.pale)}</button>
        <button class="btn" type="button" data-pan="1">Cut a salt pan · 150g · +${formatUtopia(EARN.pan)}</button>
        <button class="btn" type="button" data-grove="1">Plant a grove · 160g · +${formatUtopia(EARN.grove)}</button>
        <button class="btn" type="button" data-hive="1">Raise a hive · 150g · +${formatUtopia(EARN.hive)}</button>
        <button class="btn" type="button" data-drift="1">Raise a drift yard · 170g · +${formatUtopia(EARN.drift)}</button>
        <button class="btn" type="button" data-vine="1">Plant a vineyard · 190g · +${formatUtopia(EARN.vine)}</button>
        <button class="btn" type="button" data-bell="1">Hang a bell · 170g · +${formatUtopia(EARN.bell)}</button>
        <button class="btn" type="button" data-sail="1">Raise a sail · 220g · +${formatUtopia(EARN.sail)}</button>
        <button class="btn" type="button" data-cistern="1">Dig a cistern · 180g · +${formatUtopia(EARN.cistern)}</button>
        <button class="btn" type="button" data-char="1">Bank a charcoal hearth · 200g · +${formatUtopia(EARN.char)}</button>
        <button class="btn" type="button" data-reed="1">Cut a reed bed · 160g · +${formatUtopia(EARN.reed)}</button>
        <button class="btn" type="button" data-malt="1">Raise a malt house · 180g · +${formatUtopia(EARN.malt)}</button>
        <button class="btn" type="button" data-dove="1">Raise a dovecote · 170g · +${formatUtopia(EARN.dove)}</button>
        <button class="btn" type="button" data-oven="1">Raise a bakehouse · 190g · +${formatUtopia(EARN.oven)}</button>
        <button class="btn" type="button" data-churn="1">Raise a creamery · 175g · +${formatUtopia(EARN.churn)}</button>
        <button class="btn" type="button" data-tan="1">Raise a tannery · 165g · +${formatUtopia(EARN.tan)}</button>
        <button class="btn" type="button" data-dye="1">Raise a dye works · 155g · +${formatUtopia(EARN.dye)}</button>
        <button class="btn" type="button" data-pot="1">Raise a pot bank · 170g · +${formatUtopia(EARN.pot)}</button>
        <button class="btn" type="button" data-founder="1">Raise a founder · 260g · +${formatUtopia(EARN.founder)}</button>
        ${fleetLine(actor)}
        ${patrolButton(actor)}
        ${keelButton(actor)}
      </div>
      <div class="row">${sallyButtons(actor)}</div>
      ${bandAlert(actor)}
      <div class="row">${spells}</div>
      <p class="muted">${esc(weirLine(actor))}</p>
      <div class="row">${weirButton(actor)}</div>
      <p class="muted">${esc(innLine(actor))}</p>
      <div class="row">${innButton(actor)}</div>
      <p class="muted">${esc(hospiceLine(actor))}</p>
      <div class="row">${hospiceButton(actor)}</div>
      <p class="muted">${esc(curfewLine(actor))}</p>
      <div class="row">${curfewButton(actor)}</div>
      <p class="muted">${esc(foldLine(actor))}</p>
      <div class="row">${foldButton(actor)}</div>
      <p class="muted">${esc(leveeLine(actor))}</p>
      <div class="row">${leveeButton(actor)}</div>
      <p class="muted">${esc(sealLine(actor))}</p>
      <div class="row">${sealButton(actor)}</div>
      <p class="muted">${esc(smithLine(actor))}</p>
      <div class="row">${smithButton(actor)}</div>
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
      ${fresh && roadLive(actor, selected.id, world.hour) ? `<button class="btn" type="button" disabled>Causeway through hour ${actor.roads[selected.id] - 1}</button>` : ""}
      ${fresh && !roadLive(actor, selected.id, world.hour) ? `<button class="btn primary" type="button" data-road="1">Causeway · ${timberYards(actor) > 0 ? 180 : 220}g · +${formatUtopia(EARN.road)}</button>` : ""}
      ${fresh && siegeLive(actor, world.hour) && actor.siege.target === selected.id ? `<button class="btn" type="button" disabled>Siege through hour ${actor.siege.until - 1}</button>` : ""}
      ${fresh && !(siegeLive(actor, world.hour) && actor.siege.target === selected.id) ? `<button class="btn danger" type="button" data-siege="1">Pitch siege · 260g · +${formatUtopia(EARN.siege)}</button>` : ""}
      ${siegeLive(selected, world.hour) && selected.siege.target === actor.id ? `<button class="btn danger" type="button" data-sally="${selected.id}">Sally the works · +${formatUtopia(EARN.sally)}</button>` : ""}
      ${(actor.pens && actor.pens[selected.id]) ? `<button class="btn primary" type="button" data-ransom="1">Ransom ${actor.pens[selected.id]}</button>` : ""}
      ${(actor.pens && actor.pens[selected.id]) ? `<button class="btn" type="button" data-release="1">Release ${actor.pens[selected.id]}</button>` : ""}
      <button class="btn" type="button" data-thief="scout">Scout</button>
      <button class="btn" type="button" data-thief="pilfer">Pilfer</button>
      <button class="btn" type="button" data-thief="arson">Arson</button>
      <button class="btn" type="button" data-spell="meteor">Meteor</button>
    </div>
    ${bountyOn(world, selected.id, world.hour) ? `<p class="muted">${esc(bountyLine(selected))}</p>` : ""}
    <p class="muted">Watch the party cross the map. The order resolves as they step off. ${fresh ? "A caravan needs this scout and pays inside the fair band, up to the hour's combat cap. A causeway makes that haul a quarter heavier for eight hours." : "Scout the camp before a caravan can roll."} ${selected.kind === "agent" ? "Agents pay $UTOPIA when the march lands inside the band." : "A human stake is paid in $UTOPIA by both purses."}</p>`;
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
    ["arms", book.arm],
    ["relief", book.relief],
    ["smith", book.smith],
    ["seals", book.seal],
    ["levees", book.levee],
    ["roads", book.road],
    ["folds", book.fold],
    ["curfews", book.curfew],
    ["hospices", book.hospice],
    ["hamlets", book.hamlet],
    ["inns", book.inn],
    ["weirs", book.weir],
    ["yards", book.timber],
    ["quarries", book.quarry],
    ["sieges", book.siege],
    ["sallies", book.sally],
    ["rides", book.ride],
    ["outriders", book.patrol],
    ["keels", book.keel],
    ["founders", book.founder],
    ["colonies", book.colony],
    ["hulls", book.hull],
    ["prizes", book.prize],
    ["blockades", book.block],
    ["salvage", book.salvage],
    ["convoys", book.convoy],
    ["tiles", book.tile],
    ["armory", book.armory],
    ["wharves", book.wharf],
    ["refits", book.refit],
    ["moles", book.mole],
    ["tows", book.tow],
    ["lees", book.lee],
    ["nets", book.net],
    ["slips", book.slip],
    ["buoys", book.buoy],
    ["cargoes", book.cargo],
    ["chains", book.chain],
    ["ferries", book.ferry],
    ["wheels", book.wheel],
    ["lookouts", book.look],
    ["pales", book.pale],
    ["coopers", book.cooper],
    ["pans", book.pan],
    ["groves", book.grove],
    ["hives", book.hive],
    ["drift yards", book.drift],
    ["vineyards", book.vine],
    ["ropes", book.rope],
    ["bells", book.bell],
    ["sails", book.sail],
    ["cisterns", book.cistern],
    ["charcoal", book.char],
    ["reeds", book.reed],
    ["malt", book.malt],
    ["dovecotes", book.dove],
    ["bakehouses", book.oven],
    ["creameries", book.churn],
    ["tanneries", book.tan],
    ["dye works", book.dye],
    ["pot banks", book.pot],
    ["smokehouses", book.smoke],
    ["fishmongers", book.monger],
    ["pilots", book.pilot],
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

function weirLine(actor) {
  if (weirLive(actor, world.hour)) {
    const take = weirYield(actor, world.hour);
    return `${actor.weir} nets hold through hour ${actor.weirUntil - 1}. This hour they yield ${take.grain} grain and ${take.gold} gold. Caravans haul fish. A sack tears the weir up.`;
  }
  return "Stake nets for 160 gold on a coast or river tile. Up to three posts yield fish for seven hours, more in High Sun and less in Frost. Caravans haul a tenth more. A sack tears them up. Key G sets them.";
}

function weirButton(actor) {
  if (weirLive(actor, world.hour)) return `<button class="btn" type="button" disabled>Nets through hour ${actor.weirUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-weir="1">Set the nets · 160g · +${formatUtopia(EARN.weir)}</button>`;
}

function innLine(actor) {
  if (innUp(actor, world.hour)) return `The inn stands through hour ${actor.innUntil - 1}. This hour the taproom pays ${innToll(actor, world.hour)} gold. Caravans haul more while the sign is up. A sack burns it.`;
  return "Open a wayside inn for 175 gold and 220 grain. For six hours travelers pay a toll, more with a pact or a causeway and less in Frost. Your caravans haul more. A sack burns the taproom. Key I opens it.";
}

function innButton(actor) {
  if (innUp(actor, world.hour)) return `<button class="btn" type="button" disabled>Inn through hour ${actor.innUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-inn="1">Open the inn · 175g · 220 grain · +${formatUtopia(EARN.inn)}</button>`;
}

function hospiceLine(actor) {
  if (hospiceUp(actor, world.hour)) return `The hospice stands through hour ${actor.hospiceUntil - 1}. Your losses in a march are halved, and three people arrive each hour while grain lasts.`;
  return "Pitch a hospice for 140 gold and 180 grain. For five hours battle losses are halved and the tent adds people. Key H raises it.";
}

function hospiceButton(actor) {
  if (hospiceUp(actor, world.hour)) return `<button class="btn" type="button" disabled>Hospice through hour ${actor.hospiceUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-hospice="1">Pitch the hospice · 140g · 180 grain · +${formatUtopia(EARN.hospice)}</button>`;
}

function curfewLine(actor) {
  if (curfewUp(actor, world.hour)) return `The lanterns stay lit through hour ${actor.curfewUntil - 1}. A successful pilfer takes half the gold.`;
  return "Hang curfew lanterns for 85 gold. For five hours a pilfer takes half the gold. Key N lights them.";
}

function curfewButton(actor) {
  if (curfewUp(actor, world.hour)) return `<button class="btn" type="button" disabled>Curfew through hour ${actor.curfewUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-curfew="1">Hang the lanterns · 85g · +${formatUtopia(EARN.curfew)}</button>`;
}

function foldLine(actor) {
  if (foldLive(actor, world.hour)) return `The flock of ${actor.fold} stays penned through hour ${actor.foldUntil - 1}. Each hour adds 22 gold and 48 grain. A sack takes 90 grain more and drives them off.`;
  return "Pen 28 sheep for 110 gold. For six hours the fold yields wool and milk. A sack scatters them. Key F calls the fold.";
}

function foldButton(actor) {
  if (foldLive(actor, world.hour)) return `<button class="btn" type="button" disabled>Flock through hour ${actor.foldUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-fold="1">Pen the flock · 110g · +${formatUtopia(EARN.fold)}</button>`;
}

function leveeLine(actor) {
  if (leveeUp(actor, world.hour)) return `The levee holds through hour ${actor.leveeUntil - 1}. Raze, meteor, and arson each lose one building blow, and fields yield 4% more grain.`;
  return "Raise a levee for 150 gold. For six hours the bank takes one building blow and the ditch waters the near fields. Key L throws it up.";
}

function leveeButton(actor) {
  if (leveeUp(actor, world.hour)) return `<button class="btn" type="button" disabled>Levee through hour ${actor.leveeUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-levee="1">Raise the levee · 150g · +${formatUtopia(EARN.levee)}</button>`;
}

function sealLine(actor) {
  if ((actor.sealUntil || 0) > world.hour) return `The bins stay sealed through hour ${actor.sealUntil - 1}. A sack takes half the grain.`;
  return "Seal the grain bins for 90 gold. For five hours a sack takes half the grain. Key Y lays the seal.";
}

function sealButton(actor) {
  if ((actor.sealUntil || 0) > world.hour) return `<button class="btn" type="button" disabled>Sealed through hour ${actor.sealUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-seal="1">Seal the bins · 90g · +${formatUtopia(EARN.seal)}</button>`;
}

function smithLine(actor) {
  if ((actor.smithUntil || 0) > world.hour) return `The forge is banked through hour ${actor.smithUntil - 1}. Each soldier hits harder while the smoke stands.`;
  return "Bank the forge for 200 gold. For six hours each soldier hits harder. Key S calls the smith.";
}

function smithButton(actor) {
  if ((actor.smithUntil || 0) > world.hour) return `<button class="btn" type="button" disabled>Forge through hour ${actor.smithUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-smith="1">Bank the forge · 200g · +${formatUtopia(EARN.smith)}</button>`;
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

function armsLine(actor) {
  const plots = actor.plots || [];
  const count = (crew) => plots.filter((tile) => tile.crew === crew).length;
  return `${plots.length} tiles. Open lots ${count("lot")}, hands ${count("hand")}, foot ${count("foot")}, riders ${count("rider")}, catapults ${count("engine")}, sappers ${count("sapper")}, hamlets ${count("hamlet")}, timber ${count("timber")}, quarries ${count("quarry")}, wheels ${count("wheel")}, lookouts ${count("look")}, pales ${count("pale")}, pans ${count("pan")}, groves ${count("grove")}, hives ${count("hive")}, drift yards ${count("drift")}, vineyards ${count("vine")}, bells ${count("bell")}, sails ${count("sail")}, cisterns ${count("cistern")}, hearths ${count("char")}, reeds ${count("reed")}, malt ${count("malt")}, doves ${count("dove")}, ovens ${count("oven")}, churns ${count("churn")}, tanneries ${count("tan")}, dye works ${count("dye")}, pot banks ${count("pot")}. Horses take open ground. Catapults take a hill or a field. Sappers take stone and timber. A hamlet keeps a grass or wheat tile. A timber yard keeps a wood tile. A quarry keeps a hill or a mountain. A tide wheel keeps a coast or river lot and pays 28 grain and 12 gold. A lookout keeps a hill or a mountain, pays 6 gold, and marks an enemy hull within six hexes. A salt pan keeps marsh, coast, or a river bank and pays 16 gold. Two pans is the shore's limit. Key K opens a quarry. Key # raises a wheel. Key % raises a lookout. Key ^ raises a palisade on up to three edge lots. A grove keeps grass or plain and pays 24 grain and 4 gold. Two groves is the field's limit. Key ? cuts a salt pan. Key : plants a grove. A hive keeps one grass or plain tile, pays 8 grain and 6 gold, and each grove yields 10 more grain. Key $ raises it. A drift yard keeps one shore lot, pays 5 gold, and strips 16 gold of timber from a wreck within two hexes. Key D raises it. A vineyard keeps a hill and pays 6 grain and 14 gold. Two vineyards is the limit. A hive adds 8 gold to each row. A sail presses 8 grain from each row into 14 gold. Key Shift+A plants it. Key | hangs a bell. A bell keeps grass or plain, pays 5 gold, and a wild ride takes half. A sail keeps one hill. While stores hold 36 grain it mills 16 into 28 gold. A thin store pays 4 gold. Key _ raises it. A cistern keeps grass, plain, or marsh. Above 48 grain it banks 10 an hour up to 80, and below 24 it gives back up to 20. A full cistern seeps 4 grain. Key > digs it. A charcoal hearth keeps one wood lot. While stores hold 40 grain it burns 12 into 30 gold. A timber yard feeds it for 22 gold and spends no grain. A drift yard adds 8 gold. A thin store pays 6 gold. Smoke takes 12 gold and 2 riders from a wild ride. Key Shift+C banks it. A reed bed keeps marsh and pays 20 grain and 6 gold. Two beds is the limit. A tide wheel adds 8 grain to each bed. One bed feeds a charcoal hearth for 14 gold, and two beds feed it for 22, with no grain spent. Key Shift+R cuts one. A malt house keeps one grass or plain lot. While stores hold 30 grain it malts 10 into 18 gold. A reed bed adds 6 gold and a vineyard adds 8. A thin store pays 4 gold. The charcoal hearth drinks first. Key Shift+M raises it. A dovecote keeps one grass or plain lot and pays 14 grain and 5 gold. A bell brings the birds home for 8 more grain. A wild ride loses 2 people to the doves. Key Shift+D raises it. A bakehouse keeps one grass or plain lot. It bakes only after a malt house has stood. While 24 grain remains it spends 8 for 20 gold, and each grove adds 6. A cold oven pays 6 gold. Key Shift+B raises it. A creamery keeps one grass or plain lot. An empty shed pays 5 gold. A penned flock churns 18 gold, and a bakehouse adds 10 more. Key Shift+F raises it. A tannery keeps one marsh lot. An empty yard pays 6 gold. A penned flock tans 16 gold, and a charcoal hearth adds 8. The hearth still drinks grain first. Key Shift+T raises it. A dye works keeps one grass or plain lot. An empty line pays 4 gold. A reed bed dyes 14 gold, and a tannery adds 10 for the hide. The tannery still works the flock first. Key Shift+W raises it. A pot bank keeps one grass or plain lot. An empty wheel pays 4 gold. A quarry throws 15 gold. A charcoal hearth adds 8, and a salt pan adds 6 for the glaze. The hearth still drinks grain first. Key Shift+E raises it. Each stake adds 4 to the wall.`;
}

function relicLine(actor) {
  const held = Object.keys(actor.relics || {}).map((id) => RELICS[id]).filter(Boolean);
  if (!held.length) return "Old places on the map still hold a relic. Open one and it stays with your acres.";
  return `Relics: ${held.map((row) => `${row.name}. ${row.line}`).join(" ")}`;
}

function weaponLine(actor) {
  const held = WEAPONS[actor.weapon] || WEAPONS.spear;
  const rows = [`<p class="muted">${esc(ageName(actor))} age. The host carries ${esc(held.name)}. ${esc(held.line)}</p>`];
  for (const [id, spec] of Object.entries(WEAPONS)) {
    if (id === "spear" || actor.weapon === id) continue;
    if (studyCount(actor) < spec.need) continue;
    if (id === "car" && !(actor.studies && actor.studies.powder)) continue;
    const older = WEAPONS[actor.weapon];
    if (older && older.bite > spec.bite) continue;
    rows.push(`<button class="btn" type="button" data-armory="${id}">Issue ${esc(spec.name)} · ${spec.gold}g · +${formatUtopia(EARN.armory)}</button>`);
  }
  return rows.join("");
}

function fleetLine(actor) {
  const founders = (actor.founders || []).filter((row) => !row.spent);
  const ships = actor.ships || [];
  const ports = (actor.colonies || []).filter((row) => row.port);
  const towns = actor.colonies || [];
  const rows = [];
  if (towns.length) {
    const quay = ports.length ? `${ports.length} ${ports.length === 1 ? "port fishes" : "ports fish"} 12 grain an hour and can lay a hull. A wharf pays 8 gold and refits wrecks. A mole shoves enemy hulls off the quay. A lee shelters hulls beside the quay.` : "No quay yet. A coast or a river bank makes a port.";
    rows.push(`<p class="muted">${towns.map((row) => esc(row.name)).join(", ")}. ${quay}</p>`);
  }
  for (const founder of founders) {
    const course = founder.destQ == null ? "waiting" : `bound ${founder.destQ},${founder.destR}`;
    rows.push(`<button class="btn" type="button" data-direct="founder" data-id="${esc(founder.id)}">Direct founder · ${course}</button>`);
  }
  for (const ship of ships) {
    const spec = NAVY[ship.kind];
    let course = `${ship.q},${ship.r}`;
    if (ship.prey) {
      const foe = byId(world, ship.prey.owner);
      const prey = foe && (foe.ships || []).find((row) => row.id === ship.prey.id);
      const preyName = prey && NAVY[prey.kind] ? NAVY[prey.kind].name : "hull";
      course = `closing on ${foe ? foe.name : "them"}'s ${preyName}`;
    } else if (ship.block) {
      const foe = byId(world, ship.block.owner);
      const colony = foe && (foe.colonies || []).find((row) => row.id === ship.block.id);
      course = `blockading ${colony ? colony.name : "a port"}`;
    } else if (ship.salvage) {
      course = `salvaging ${ship.salvage.q},${ship.salvage.r}`;
    } else if (ship.tow) {
      course = `towing ${ship.tow.q},${ship.tow.r}`;
    } else if (ship.cargo) {
      const quay = ports.find((row) => row.id === ship.cargo);
      course = `carrying a cargo to ${quay ? quay.name : "a port"}`;
    } else if (ship.cut) {
      const foe = byId(world, ship.cut.owner);
      const prey = foe && (foe.ships || []).find((row) => row.id === ship.cut.id);
      const preyName = prey && NAVY[prey.kind] ? NAVY[prey.kind].name : "hull";
      course = `cutting out ${foe ? foe.name : "them"}'s ${preyName}`;
    } else if (ship.raid) {
      const foe = byId(world, ship.raid.owner);
      const colony = foe && (foe.colonies || []).find((row) => row.id === ship.raid.id);
      course = foe && foe.id === actor.id ? `landing the company at ${colony ? colony.name : "a port"}` : `raiding ${colony ? colony.name : "a port"}`;
    } else if (ship.escort) {
      const trader = ships.find((row) => row.id === ship.escort);
      const tradeName = trader && NAVY[trader.kind] ? NAVY[trader.kind].name : "a trader";
      course = `escorting the ${tradeName}`;
    }
    if ((ship.prizeUntil || 0) > world.hour) course += " · prize";
    if ((ship.marines || 0) >= 6) course += " · company";
    rows.push(`<button class="btn" type="button" data-direct="ship" data-id="${esc(ship.id)}">Direct ${esc(spec ? spec.name : ship.kind)} · ${course}</button>`);
    rows.push(`<button class="btn" type="button" data-buoy="${esc(ship.id)}">Drop a buoy from the ${esc(spec ? spec.name : ship.kind)} · +${formatUtopia(EARN.buoy)}</button>`);
    rows.push(`<button class="btn" type="button" data-salvage="${esc(ship.id)}">Salvage with the ${esc(spec ? spec.name : ship.kind)} · click a wreck</button>`);
    rows.push(`<button class="btn" type="button" data-tow="${esc(ship.id)}">Tow with the ${esc(spec ? spec.name : ship.kind)} · click a wreck</button>`);
    if (spec && spec.teeth < 5) {
      rows.push(`<button class="btn" type="button" data-net="${esc(ship.id)}">Lay nets with the ${esc(spec.name)} · +${formatUtopia(EARN.net)}</button>`);
      const span = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
      for (const port of ports) {
        if (span(ship.q, ship.r, port.q, port.r) <= 3) continue;
        rows.push(`<button class="btn" type="button" data-cargo="${esc(port.id)}" data-ship="${esc(ship.id)}">Send the ${esc(spec.name)} to ${esc(port.name)} with a cargo · +${formatUtopia(EARN.cargo)}</button>`);
      }
    }
    if (spec && spec.teeth >= 5) {
      rows.push(`<button class="btn danger" type="button" data-grapple="${esc(ship.id)}">Close the ${esc(spec.name)} · click a hull</button>`);
      if (ships.length < 6) rows.push(`<button class="btn danger" type="button" data-cut="${esc(ship.id)}">Cut out with the ${esc(spec.name)} · click a lighter hull</button>`);
      rows.push(`<button class="btn danger" type="button" data-raid="${esc(ship.id)}">Land a company from the ${esc(spec.name)} · click a port · +${formatUtopia(EARN.raid)}</button>`);
      rows.push(`<button class="btn" type="button" data-blockade="${esc(ship.id)}">Blockade with the ${esc(spec.name)} · click a port</button>`);
      rows.push(`<button class="btn" type="button" data-convoy="${esc(ship.id)}">Escort with the ${esc(spec.name)} · click a trader</button>`);
    }
  }
  for (const port of ports) {
    if (!port.wharf) {
      rows.push(`<button class="btn" type="button" data-wharf="${esc(port.id)}">Raise a wharf at ${esc(port.name)} · 220g · +${formatUtopia(EARN.wharf)}</button>`);
    }
    if (port.cooper) {
      rows.push(`<p class="muted">${esc(port.name)}'s cooperage pays 10 gold an hour. A hull laid from a cooperage costs 40 gold less.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-cooper="${esc(port.id)}">Raise a cooperage at ${esc(port.name)} · 220g · +${formatUtopia(EARN.cooper)}</button>`);
    }
    if (port.rope) {
      rows.push(`<p class="muted">${esc(port.name)}'s ropewalk pays 6 gold an hour. A hull within three hexes sails one hex farther.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-rope="${esc(port.id)}">Lay a ropewalk at ${esc(port.name)} · 190g · +${formatUtopia(EARN.rope)}</button>`);
    }
    if (port.smoke) {
      rows.push(`<p class="muted">${esc(port.name)}'s smokehouse pays 4 gold an hour and holds ${port.cured || 0} cured fish, up to 48. An open quay cures 8. A closed quay feeds 12 from the racks. Key &lt; raises one.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-smoke="${esc(port.id)}">Raise a smokehouse at ${esc(port.name)} · 200g · +${formatUtopia(EARN.smoke)}</button>`);
    }
    if (port.monger) {
      rows.push(`<p class="muted">${esc(port.name)}'s fishmonger pays 3 gold an hour. An open quay sells up to 8 cured fish above a reserve of 16, at 3 gold each. A closed quay keeps the racks.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-monger="${esc(port.id)}">Open a fishmonger at ${esc(port.name)} · 210g · +${formatUtopia(EARN.monger)}</button>`);
    }
    if (port.pilot) {
      rows.push(`<p class="muted">${esc(port.name)}'s pilot pays 5 gold an hour. A friendly hull within three hexes ignores an enemy lamp. A chain still holds. Key { posts one.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-pilot="${esc(port.id)}">Post a pilot at ${esc(port.name)} · 200g · +${formatUtopia(EARN.pilot)}</button>`);
    }
    if ((port.lampUntil || 0) > world.hour) {
      rows.push(`<p class="muted">${esc(port.name)}'s lamp burns through hour ${port.lampUntil - 1}. Enemy hulls within four hexes sail one hex slower.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-lamp="${esc(port.id)}">Raise a lamp at ${esc(port.name)} · 200g · +${formatUtopia(EARN.lamp)}</button>`);
    }
    if ((port.chainUntil || 0) > world.hour) {
      rows.push(`<p class="muted">${esc(port.name)}'s chain holds through hour ${port.chainUntil - 1}. An enemy hull within one hex does not sail and pays 16 gold.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-chain="${esc(port.id)}">Stretch a chain at ${esc(port.name)} · 240g · +${formatUtopia(EARN.chain)}</button>`);
    }
    if ((port.duesUntil || 0) > world.hour) {
      rows.push(`<p class="muted">${esc(port.name)} collects harbor dues through hour ${port.duesUntil - 1}. An enemy hull within two hexes pays 12 gold.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-dues="${esc(port.id)}">Open harbor dues at ${esc(port.name)} · 150g · +${formatUtopia(EARN.dues)}</button>`);
    }
    if ((port.quayUntil || 0) > world.hour && (port.quay || 0) > 0) {
      rows.push(`<p class="muted">${esc(port.name)}'s quay watch stands through hour ${port.quayUntil - 1}. ${port.quay} soldiers throw a landing back.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-quay="${esc(port.id)}">Post a quay watch at ${esc(port.name)} · 120g · 4 soldiers · +${formatUtopia(EARN.quay)}</button>`);
    }
    if ((port.moleUntil || 0) > world.hour) {
      rows.push(`<p class="muted">${esc(port.name)}'s mole stands through hour ${port.moleUntil - 1}. Enemy hulls within two hexes are shoved off.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-mole="${esc(port.id)}">Raise a mole at ${esc(port.name)} · 180g · +${formatUtopia(EARN.mole)}</button>`);
    }
    if ((port.leeUntil || 0) > world.hour) {
      rows.push(`<p class="muted">${esc(port.name)}'s lee stands through hour ${port.leeUntil - 1}. Hulls within two hexes are sheltered.</p>`);
    } else {
      rows.push(`<button class="btn" type="button" data-lee="${esc(port.id)}">Raise a lee at ${esc(port.name)} · 160g · +${formatUtopia(EARN.lee)}</button>`);
    }
    const span = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
    const closed = (world.provinces || []).some((realm) => realm.id !== actor.id && (realm.ships || []).some((ship) => ship.block && ship.block.owner === actor.id && ship.block.id === port.id && NAVY[ship.kind] && NAVY[ship.kind].teeth >= 5 && span(ship.q, ship.r, port.q, port.r) <= 2));
    if ((port.slipUntil || 0) > world.hour) {
      rows.push(`<p class="muted">${esc(port.name)} slipped the boom. The quay lands its fish this hour.</p>`);
    } else if (closed) {
      const runner = ships.find((ship) => NAVY[ship.kind] && NAVY[ship.kind].teeth < 5 && span(ship.q, ship.r, port.q, port.r) <= 2);
      if (runner) rows.push(`<button class="btn" type="button" data-slip="${esc(port.id)}" data-ship="${esc(runner.id)}">Slip ${esc(port.name)} with the ${esc(NAVY[runner.kind].name)} · +${formatUtopia(EARN.slip)}</button>`);
    }
  }
  if (ports.some((row) => row.wharf) && ships.length < 6) {
    for (const wreck of world.wrecks || []) {
      if ((wreck.until || 0) <= world.hour) continue;
      const spec = NAVY[wreck.kind];
      if (!spec) continue;
      const near = ports.some((row) => row.wharf && ((Math.abs(row.q - wreck.q) + Math.abs(row.r - wreck.r) + Math.abs(row.q + row.r - (wreck.q + wreck.r))) / 2) <= 3);
      if (!near) continue;
      rows.push(`<button class="btn" type="button" data-refit="1" data-q="${wreck.q}" data-r="${wreck.r}">Refit the ${esc(spec.name)} · ${Math.ceil(spec.gold / 2)}g · +${formatUtopia(EARN.refit)}</button>`);
    }
  }
  const liveFerry = (actor.ferries || []).find((row) => (row.until || 0) > world.hour);
  if (liveFerry) {
    const from = (actor.colonies || []).find((row) => row.id === liveFerry.from);
    const to = (actor.colonies || []).find((row) => row.id === liveFerry.to);
    rows.push(`<p class="muted">A ferry runs from ${esc(from ? from.name : "a quay")} to ${esc(to ? to.name : "a quay")} through hour ${liveFerry.until - 1}. Each landing pays 18 gold and 14 grain.</p>`);
  } else if (ports.length >= 2) {
    rows.push(`<button class="btn" type="button" data-ferry="1">Run a ferry between your ports · 280g · +${formatUtopia(EARN.ferry)}</button>`);
  }
  if (ports.length && ships.length < 6) {
    const yard = ports.find((row) => row.cooper) || ports[0];
    for (const [id, spec] of Object.entries(NAVY)) {
      const work = spec.fish ? `${spec.fish} fish` : "";
      const coin = spec.haul ? `${spec.haul} gold` : "";
      const yieldLine = [work, coin].filter(Boolean).join(", ") || "a fast hull";
      const ask = yard && yard.cooper ? Math.max(80, spec.gold - 40) : spec.gold;
      rows.push(`<button class="btn" type="button" data-hull="${id}">Lay a ${esc(spec.name)} · ${ask}g · ${yieldLine}</button>`);
    }
  }
  if (aim) {
    const hint = aim.unit === "grapple" ? "Click an enemy hull to close." : aim.unit === "cut" ? "Click a lighter enemy hull to cut it out." : aim.unit === "raid" ? "Click a port. An enemy quay is raided. Your own quay lands the company." : aim.unit === "blockade" ? "Click an enemy port to close it." : aim.unit === "salvage" ? "Click a wreck to take the timber." : aim.unit === "tow" ? "Click a wreck to tow it toward a wharf." : aim.unit === "convoy" ? "Click one of your traders to escort." : `Click the map to send the ${esc(aim.unit)}.`;
    rows.push(`<p class="muted">${hint}</p>`);
  }
  if ((world.wrecks || []).some((row) => (row.until || 0) > world.hour)) {
    rows.push(`<p class="muted">A wreck rides the water. A gold glint marks the timber.</p>`);
  }
  rows.push(`<p class="muted">A galley, dromon, or hulk can close on another hull. Heavier teeth take the gold and sink it. The same hull can blockade a port: the quay lands no fish and 18 gold is taken each hour it sits within two hexes. Any hull can salvage a wreck for its timber. A war hull can escort a skiff, fisher, or cog. Within two hexes the haul is heavier and the trader has three more teeth. A port can raise a wharf. The yard pays 8 gold an hour and refits a wreck within three hexes for half the hull. A mole stands for five hours and shoves an enemy hull off the quay, taking 14 gold. Key X grapples. Key \\ blockades. Key ; salvages. Key [ escorts. Key ] raises a wharf. Key ' raises a mole. Key , tows a wreck toward a wharf. Key . raises a lee. Key - lays nets from a skiff, fisher, or cog. An enemy hull on that water does not sail for four hours and pays 10 gold. Key = slips a boom with a trader within two hexes, and the quay lands its fish that hour. Key / drops a buoy. For five hours your hulls within three hexes sail one hex farther. The grave key sends a skiff, fisher, or cog to a far port with a cargo. The quay pays 32 gold and 20 grain. Key + sends a galley, dromon, or hulk to cut out a lighter hull. The prize joins your fleet and flies a pennant for three hours. The old ruler pays 28 gold plus 8 for each tooth. A lee, or an escort that matches your teeth, turns the cut aside. Key * sends a galley, dromon, or hulk to land a company. Six soldiers board at your port. An enemy quay loses 36 gold and 20 grain, then the company comes home. A mole breaks the landing and two soldiers are lost. Click your own port to put the company ashore. Key ( posts four soldiers as a quay watch for 120 gold. A landing company is thrown back and two soldiers are lost. The quay lands 6 more grain. The watch comes home when the hours end. Key ) opens harbor dues for 150 gold. For five hours an enemy hull within two hexes pays 12 gold. A booth and a DUES label show on the town. Key ! raises a harbor lamp for 200 gold. For seven hours an enemy hull that starts within four hexes sails one hex slower. Your own hulls are not slowed. A tower and a sweeping beam show on the town. Key & stretches a harbor chain for 240 gold. For six hours an enemy hull within one hex does not sail and pays 16 gold. Your own hulls pass. Posts and a CHAIN label show on the town. Key @ runs a ferry between your two farthest ports for 280 gold. For seven hours it sails two hexes an hour. Each landing pays 18 gold and 14 grain, then it turns back. A boat and a FERRY label show on the water. Chains and nets do not catch it.</p>`);
  return rows.join("");
}

function keelButton(actor) {
  if (keelUp(actor, world.hour)) return `<button class="btn" type="button" disabled>Keel through hour ${actor.keelUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-keel="1">Launch a keel · 200g · 6 soldiers · +${formatUtopia(EARN.keel)}</button>`;
}

function patrolButton(actor) {
  if (patrolUp(actor, world.hour)) return `<button class="btn" type="button" disabled>Outriders through hour ${actor.patrolUntil - 1}</button>`;
  return `<button class="btn primary" type="button" data-patrol="1">Post outriders · 150g · 8 soldiers · +${formatUtopia(EARN.patrol)}</button>`;
}

function bandAlert(actor) {
  const hour = world.hour || 0;
  const rows = (world.bands || []).filter((band) => band.raid && band.raid.hour === hour && band.raid.target === actor.id && (band.men || 0) >= 8);
  if (!rows.length) return "";
  return rows.map((band) => `<p class="muted">${esc(band.name)} struck this hour. ${band.men} riders are still camped. Key V rides the nearest camp.</p>`).join("")
    + `<div class="row">${rows.map((band) => `<button class="btn danger" type="button" data-ride="${band.id}">Ride ${esc(band.name)} · +${formatUtopia(EARN.ride)}</button>`).join("")}</div>`;
}

function bandCard(actor, band) {
  const hour = world.hour || 0;
  const live = (band.men || 0) >= 8 && (band.downUntil || 0) <= hour;
  const truce = band.truce && band.truce[actor.id];
  const quiet = typeof truce === "number" && truce > hour;
  return `<h2>${esc(band.name)}</h2>
    <p>${live ? `${band.men} riders camp here with ${band.hoard || 0} gold in the tents.` : `The camp is ash until hour ${band.downUntil}.`}</p>
    <p class="muted">Each hour one live camp rides the nearest human inside reach. A strong wall throws them back. Outriders can turn a ride before it hits. A soft holding loses gold, grain, and people. They stake no $UTOPIA. Riding them down takes 12 soldiers. Buying them off costs 160 gold and keeps them off your acres for five hours. Key O posts outriders.</p>
    ${quiet ? `<p class="muted">Paid off through hour ${truce - 1}.</p>` : ""}
    <div class="row">
      ${live ? `<button class="btn danger" type="button" data-ride="${esc(band.id)}">Ride them down · +${formatUtopia(EARN.ride)}</button>` : ""}
      ${live && !quiet ? `<button class="btn" type="button" data-bribe="${esc(band.id)}">Buy them off · 160g</button>` : ""}
      <button class="btn" type="button" data-band-close="1">Back to acres</button>
    </div>
    ${earnStrip(actor)}`;
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

function wreckAt(x, y) {
  let best = null;
  let bestD = 52;
  for (const wreck of world.wrecks || []) {
    if ((wreck.until || 0) <= world.hour) continue;
    const pos = axialToWorld(wreck.q, wreck.r);
    const dist = Math.hypot(pos.x - x, pos.y - y);
    if (dist < bestD) {
      bestD = dist;
      best = { q: wreck.q, r: wreck.r };
    }
  }
  return best;
}

function portAt(x, y) {
  let best = null;
  let bestD = 52;
  for (const realm of world.provinces || []) {
    for (const colony of realm.colonies || []) {
      if (!colony.port) continue;
      const pos = axialToWorld(colony.q, colony.r);
      const dist = Math.hypot(pos.x - x, pos.y - y);
      if (dist < bestD) {
        bestD = dist;
        best = { owner: realm.id, id: colony.id };
      }
    }
  }
  return best;
}

function shipAt(x, y) {
  let best = null;
  let bestD = 52;
  for (const realm of world.provinces || []) {
    for (const ship of realm.ships || []) {
      const pos = axialToWorld(ship.q, ship.r);
      const dist = Math.hypot(pos.x - x, pos.y - y);
      if (dist < bestD) {
        bestD = dist;
        best = { owner: realm.id, id: ship.id };
      }
    }
  }
  return best;
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
    const point = worldPointFrom(event, canvas);
    if (aim && seat()) {
      const course = aim;
      aim = null;
      if (course.unit === "grapple") {
        const hit = shipAt(point.x, point.y);
        if (!hit || hit.owner === seat().id) {
          aim = course;
          note(hit ? "Close on another ruler's hull." : "Click an enemy hull.");
          paint();
          return;
        }
        order({ type: "grapple", ship: course.id, owner: hit.owner, hull: hit.id }, "battle");
      } else if (course.unit === "cut") {
        const hit = shipAt(point.x, point.y);
        if (!hit || hit.owner === seat().id) {
          aim = course;
          note(hit ? "Cut out another ruler's hull." : "Click an enemy hull.");
          paint();
          return;
        }
        order({ type: "cut", ship: course.id, owner: hit.owner, hull: hit.id }, "battle");
      } else if (course.unit === "raid") {
        const hit = portAt(point.x, point.y);
        if (!hit) {
          aim = course;
          note("Click a port.");
          paint();
          return;
        }
        order({ type: "raid", ship: course.id, owner: hit.owner, colony: hit.id }, "battle");
      } else if (course.unit === "blockade") {
        const hit = portAt(point.x, point.y);
        if (!hit || hit.owner === seat().id) {
          aim = course;
          note(hit ? "Close another ruler's port." : "Click an enemy port.");
          paint();
          return;
        }
        order({ type: "blockade", ship: course.id, owner: hit.owner, colony: hit.id }, "battle");
      } else if (course.unit === "salvage") {
        const hit = wreckAt(point.x, point.y);
        if (!hit) {
          aim = course;
          note("Click a wreck.");
          paint();
          return;
        }
        order({ type: "salvage", ship: course.id, q: hit.q, r: hit.r }, "coin");
      } else if (course.unit === "tow") {
        const hit = wreckAt(point.x, point.y);
        if (!hit) {
          aim = course;
          note("Click a wreck.");
          paint();
          return;
        }
        order({ type: "tow", ship: course.id, q: hit.q, r: hit.r }, "build");
      } else if (course.unit === "convoy") {
        const hit = shipAt(point.x, point.y);
        const hull = hit && (seat().ships || []).find((row) => row.id === hit.id);
        if (!hit || hit.owner !== seat().id || !hull || !NAVY[hull.kind] || NAVY[hull.kind].teeth >= 5) {
          aim = course;
          note("Click one of your traders.");
          paint();
          return;
        }
        order({ type: "convoy", ship: course.id, hull: hit.id }, "build");
      } else if (course.unit === "buy" || course.unit === "raise") {
        const axial = worldToAxial(point.x, point.y);
        if (course.unit === "buy") order({ type: "buy", q: axial.q, r: axial.r }, "build");
        else order({ type: "build", building: course.building, q: axial.q, r: axial.r }, "build");
      } else {
        const axial = worldToAxial(point.x, point.y);
        order({ type: "direct", unit: course.unit, id: course.id, q: axial.q, r: axial.r }, "build");
      }
      paint();
      return;
    }
    const now = performance.now();
    if (hoverId && now - lastTap < 300) focusHolding(hoverId);
    lastTap = now;
    const siteHit = hitSite(world.sites, point.x, point.y);
    const bandHit = hitBand(world.bands, point.x, point.y);
    if (!hoverId && (siteHit || bandHit)) {
      selectedSite = siteHit ? (world.sites || []).find((row) => row.id === siteHit) || null : null;
      selectedBand = !siteHit && bandHit ? (world.bands || []).find((row) => row.id === bandHit) || null : null;
      if (window.matchMedia("(max-width: 760px)").matches) setSheet(true);
      play("click");
      paint();
      return;
    }
    selectedSite = null;
    selectedBand = null;
    if (!hoverId) {
      if (window.matchMedia("(max-width: 760px)").matches) setSheet(false);
      return;
    }
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
      const scale = mini.width / 24000;
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
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", () => {
        resize();
        draw();
      });
    }
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
      if (event.key.toLowerCase() === "s" && world) order({ type: "smith" }, "build");
      if (event.key.toLowerCase() === "y" && world) order({ type: "seal" }, "build");
      if (event.key.toLowerCase() === "l" && world) order({ type: "levee" }, "build");
      if (event.key === "f" && world) order({ type: "fold" }, "build");
      if (event.key.toLowerCase() === "n" && world) order({ type: "curfew" }, "build");
      if (event.key.toLowerCase() === "h" && world) order({ type: "hospice" }, "build");
      if (event.key.toLowerCase() === "j" && world) order({ type: "hamlet" }, "build");
      if (event.key.toLowerCase() === "i" && world) order({ type: "inn" }, "build");
      if (event.key.toLowerCase() === "g" && world) order({ type: "weir" }, "build");
      if (event.key === "t" && world) order({ type: "timber" }, "build");
      if (event.key.toLowerCase() === "k" && world) order({ type: "quarry" }, "build");
      if (event.key === "#" && world) order({ type: "wheel" }, "build");
      if (event.key === "%" && world) order({ type: "look" }, "build");
      if (event.key === "^" && world) order({ type: "pale" }, "build");
      if (event.key === "?" && world) order({ type: "pan" }, "build");
      if (event.key === ":" && world) order({ type: "grove" }, "build");
      if (event.key === "$" && world) order({ type: "hive" }, "build");
      if (event.key === "d" && world) order({ type: "drift" }, "build");
      if (event.key === "D" && world) order({ type: "dove" }, "build");
      if (event.key === "B" && world) order({ type: "oven" }, "build");
      if (event.key === "F" && world) order({ type: "churn" }, "build");
      if (event.key === "T" && world) order({ type: "tan" }, "build");
      if (event.key === "W" && world) order({ type: "dye" }, "build");
      if (event.key === "E" && world) order({ type: "pot" }, "build");
      if (event.key === "A" && world) order({ type: "vine" }, "build");
      if (event.key === "|" && world) order({ type: "bell" }, "build");
      if (event.key === "_" && world) order({ type: "sail" }, "build");
      if (event.key === ">" && world) order({ type: "cistern" }, "build");
      if (event.key === "C" && world) order({ type: "char" }, "build");
      if (event.key === "R" && world) order({ type: "reed" }, "build");
      if (event.key === "M" && world) order({ type: "malt" }, "build");
      if (event.key === "~" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && !row.cooper);
        if (port) order({ type: "cooper", colony: port.id }, "build");
      }
      if (event.key === "\"" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && !row.rope);
        if (port) order({ type: "rope", colony: port.id }, "build");
      }
      if (event.key === "<" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && !row.smoke);
        if (port) order({ type: "smoke", colony: port.id }, "build");
      }
      if (event.key === "}" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && !row.monger);
        if (port) order({ type: "monger", colony: port.id }, "build");
      }
      if (event.key === "{" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && !row.pilot);
        if (port) order({ type: "pilot", colony: port.id }, "build");
      }
      if (event.key.toLowerCase() === "u" && world) order({ type: "founder" }, "build");
      if (event.key.toLowerCase() === "x" && world && seat()) {
        const fleet = seat().ships || [];
        const war = fleet.find((row) => NAVY[row.kind] && NAVY[row.kind].teeth >= 5 && !row.prey)
          || fleet.find((row) => NAVY[row.kind] && NAVY[row.kind].teeth >= 5);
        if (war) {
          aim = { unit: "grapple", id: war.id };
          paint();
        }
      }
      if (event.key === "[" && world && seat()) {
        const fleet = seat().ships || [];
        const war = fleet.find((row) => NAVY[row.kind] && NAVY[row.kind].teeth >= 5 && !row.escort)
          || fleet.find((row) => NAVY[row.kind] && NAVY[row.kind].teeth >= 5);
        if (war) {
          aim = { unit: "convoy", id: war.id };
          paint();
        }
      }
      if (event.key === ";" && world && seat()) {
        const fleet = seat().ships || [];
        const hull = fleet.find((row) => !row.salvage) || fleet[0];
        if (hull) {
          aim = { unit: "salvage", id: hull.id };
          paint();
        }
      }
      if (event.key === "," && world && seat()) {
        const fleet = seat().ships || [];
        const hull = fleet.find((row) => !row.tow) || fleet[0];
        if (hull) {
          aim = { unit: "tow", id: hull.id };
          paint();
        }
      }
      if (event.key === "]" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && !row.wharf);
        if (port) order({ type: "wharf", colony: port.id }, "build");
      }
      if (event.key === "!" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && (row.lampUntil || 0) <= world.hour);
        if (port) order({ type: "lamp", colony: port.id }, "build");
      }
      if (event.key === "&" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && (row.chainUntil || 0) <= world.hour);
        if (port) order({ type: "chain", colony: port.id }, "build");
      }
      if (event.key === "@" && world && seat()) order({ type: "ferry" }, "build");
      if (event.key === ")" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && (row.duesUntil || 0) <= world.hour);
        if (port) order({ type: "dues", colony: port.id }, "build");
      }
      if (event.key === "(" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && (row.quayUntil || 0) <= world.hour);
        if (port) order({ type: "quay", colony: port.id }, "build");
      }
      if (event.key === "'" && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && (row.moleUntil || 0) <= world.hour);
        if (port) order({ type: "mole", colony: port.id }, "build");
      }
      if (event.key === "." && world && seat()) {
        const port = (seat().colonies || []).find((row) => row.port && (row.leeUntil || 0) <= world.hour);
        if (port) order({ type: "lee", colony: port.id }, "build");
      }
      if (event.key === "-" && world && seat()) {
        const hull = (seat().ships || []).find((row) => NAVY[row.kind] && NAVY[row.kind].teeth < 5);
        if (hull) order({ type: "net", ship: hull.id }, "build");
      }
      if (event.key === "/" && world && seat()) {
        const hull = (seat().ships || []).find((row) => NAVY[row.kind]);
        if (hull) order({ type: "buoy", ship: hull.id }, "build");
      }
      if (event.key === "*" && world && seat()) {
        const war = (seat().ships || []).find((row) => NAVY[row.kind] && NAVY[row.kind].teeth >= 5 && !row.raid)
          || (seat().ships || []).find((row) => NAVY[row.kind] && NAVY[row.kind].teeth >= 5);
        if (war) {
          aim = { unit: "raid", id: war.id };
          paint();
        }
      }
      if (event.key === "+" && world && seat()) {
        const fleet = seat().ships || [];
        const war = fleet.find((row) => NAVY[row.kind] && NAVY[row.kind].teeth >= 5 && !row.cut && fleet.length < 6)
          || fleet.find((row) => NAVY[row.kind] && NAVY[row.kind].teeth >= 5 && fleet.length < 6);
        if (war) {
          aim = { unit: "cut", id: war.id };
          paint();
        }
      }
      if (event.key === "`" && world && seat()) {
        const me = seat();
        const span = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
        const hull = (me.ships || []).find((row) => NAVY[row.kind] && NAVY[row.kind].teeth < 5);
        const port = hull && (me.colonies || []).filter((row) => row.port && span(hull.q, hull.r, row.q, row.r) > 3).sort((a, b) => span(hull.q, hull.r, b.q, b.r) - span(hull.q, hull.r, a.q, a.r))[0];
        if (hull && port) order({ type: "cargo", ship: hull.id, colony: port.id }, "build");
      }
      if (event.key === "=" && world && seat()) {
        const me = seat();
        const span = (aq, ar, bq, br) => (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - (bq + br))) / 2;
        const port = (me.colonies || []).find((row) => row.port && (row.slipUntil || 0) <= world.hour && (world.provinces || []).some((realm) => realm.id !== me.id && (realm.ships || []).some((ship) => ship.block && ship.block.owner === me.id && ship.block.id === row.id && NAVY[ship.kind] && NAVY[ship.kind].teeth >= 5 && span(ship.q, ship.r, row.q, row.r) <= 2)));
        const runner = port && (me.ships || []).find((ship) => NAVY[ship.kind] && NAVY[ship.kind].teeth < 5 && span(ship.q, ship.r, port.q, port.r) <= 2);
        if (port && runner) order({ type: "slip", ship: runner.id, colony: port.id }, "build");
      }
      if (event.key === "\\" && world && seat()) {
        const fleet = seat().ships || [];
        const war = fleet.find((row) => NAVY[row.kind] && NAVY[row.kind].teeth >= 5 && !row.block)
          || fleet.find((row) => NAVY[row.kind] && NAVY[row.kind].teeth >= 5);
        if (war) {
          aim = { unit: "blockade", id: war.id };
          paint();
        }
      }
      if (event.key.toLowerCase() === "o" && world) order({ type: "patrol" }, "march");
      if (event.key.toLowerCase() === "p" && world) order({ type: "keel" }, "march");
      if (event.key.toLowerCase() === "z" && world && selectedId && selectedId !== seat().id) order({ type: "siege", target: selectedId }, "battle");
      if (event.key.toLowerCase() === "v" && world) {
        const picked = selectedBand && (world.bands || []).find((band) => band.id === selectedBand.id && (band.men || 0) >= 8);
        const band = picked || (world.bands || []).find((row) => (row.men || 0) >= 8 && (row.downUntil || 0) <= (world.hour || 0));
        if (band) order({ type: "ride", band: band.id }, "battle");
      }
      if (event.key === "m" && world) {
        const foe = (world.provinces || []).find((p) => siegeLive(p, world.hour) && p.siege.target === seat().id && (!selectedId || selectedId === seat().id || p.id === selectedId));
        if (foe) order({ type: "sally", target: foe.id }, "battle");
      }
      if (event.key === "c" && world && selectedId && selectedId !== seat().id) order({ type: "road", target: selectedId }, "build");
      if (event.key === "b" && world && selectedId && selectedId !== seat().id) order({ type: "bounty", target: selectedId }, "coin");
      if (event.key === "r" && world && selectedId && selectedId !== seat().id) order({ type: "relief", target: selectedId }, "coin");
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
  if (node.id === "trailer-sound") {
    const video = document.querySelector("#trailer");
    if (!video) return;
    trailerMuted = !trailerMuted;
    video.muted = trailerMuted;
    node.textContent = trailerMuted ? "Hear the score" : "Quiet";
    video.play().catch(() => {});
    return;
  }
  if (node.id === "trailer-skip") {
    const video = document.querySelector("#trailer");
    if (video) video.pause();
    finishIntro();
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
    aim = { unit: "raise", building: node.dataset.build };
    note("Click one of your tiles.");
    paint();
    return;
  }
  if (node.dataset.buy) {
    aim = { unit: "buy" };
    note("Click open ground beside your acres.");
    paint();
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
  if (node.dataset.smith) {
    order({ type: "smith" }, "build");
    return;
  }
  if (node.dataset.seal) {
    order({ type: "seal" }, "build");
    return;
  }
  if (node.dataset.levee) {
    order({ type: "levee" }, "build");
    return;
  }
  if (node.dataset.fold) {
    order({ type: "fold" }, "build");
    return;
  }
  if (node.dataset.curfew) {
    order({ type: "curfew" }, "build");
    return;
  }
  if (node.dataset.hospice) {
    order({ type: "hospice" }, "build");
    return;
  }
  if (node.dataset.hamlet) {
    order({ type: "hamlet" }, "build");
    return;
  }
  if (node.dataset.timber) {
    order({ type: "timber" }, "build");
    return;
  }
  if (node.dataset.quarry) {
    order({ type: "quarry" }, "build");
    return;
  }
  if (node.dataset.wheel) {
    order({ type: "wheel" }, "build");
    return;
  }
  if (node.dataset.look) {
    order({ type: "look" }, "build");
    return;
  }
  if (node.dataset.pale) {
    order({ type: "pale" }, "build");
    return;
  }
  if (node.dataset.pan) {
    order({ type: "pan" }, "build");
    return;
  }
  if (node.dataset.grove) {
    order({ type: "grove" }, "build");
    return;
  }
  if (node.dataset.hive) {
    order({ type: "hive" }, "build");
    return;
  }
  if (node.dataset.drift) {
    order({ type: "drift" }, "build");
    return;
  }
  if (node.dataset.vine) {
    order({ type: "vine" }, "build");
    return;
  }
  if (node.dataset.bell) {
    order({ type: "bell" }, "build");
    return;
  }
  if (node.dataset.sail) {
    order({ type: "sail" }, "build");
    return;
  }
  if (node.dataset.cistern) {
    order({ type: "cistern" }, "build");
    return;
  }
  if (node.dataset.char) {
    order({ type: "char" }, "build");
    return;
  }
  if (node.dataset.reed) {
    order({ type: "reed" }, "build");
    return;
  }
  if (node.dataset.malt) {
    order({ type: "malt" }, "build");
    return;
  }
  if (node.dataset.dove) {
    order({ type: "dove" }, "build");
    return;
  }
  if (node.dataset.oven) {
    order({ type: "oven" }, "build");
    return;
  }
  if (node.dataset.churn) {
    order({ type: "churn" }, "build");
    return;
  }
  if (node.dataset.tan) {
    order({ type: "tan" }, "build");
    return;
  }
  if (node.dataset.dye) {
    order({ type: "dye" }, "build");
    return;
  }
  if (node.dataset.pot) {
    order({ type: "pot" }, "build");
    return;
  }
  if (node.dataset.founder) {
    order({ type: "founder" }, "build");
    return;
  }
  if (node.dataset.hull) {
    order({ type: "hull", hull: node.dataset.hull }, "build");
    return;
  }
  if (node.dataset.direct) {
    aim = { unit: node.dataset.direct, id: node.dataset.id };
    paint();
    return;
  }
  if (node.dataset.grapple) {
    aim = { unit: "grapple", id: node.dataset.grapple };
    paint();
    return;
  }
  if (node.dataset.cut) {
    aim = { unit: "cut", id: node.dataset.cut };
    paint();
    return;
  }
  if (node.dataset.raid) {
    aim = { unit: "raid", id: node.dataset.raid };
    paint();
    return;
  }
  if (node.dataset.blockade) {
    aim = { unit: "blockade", id: node.dataset.blockade };
    paint();
    return;
  }
  if (node.dataset.salvage) {
    aim = { unit: "salvage", id: node.dataset.salvage };
    paint();
    return;
  }
  if (node.dataset.tow) {
    aim = { unit: "tow", id: node.dataset.tow };
    paint();
    return;
  }
  if (node.dataset.net) {
    order({ type: "net", ship: node.dataset.net }, "build");
    return;
  }
  if (node.dataset.buoy) {
    order({ type: "buoy", ship: node.dataset.buoy }, "build");
    return;
  }
  if (node.dataset.cargo) {
    order({ type: "cargo", ship: node.dataset.ship, colony: node.dataset.cargo }, "build");
    return;
  }
  if (node.dataset.slip) {
    order({ type: "slip", ship: node.dataset.ship, colony: node.dataset.slip }, "build");
    return;
  }
  if (node.dataset.convoy) {
    aim = { unit: "convoy", id: node.dataset.convoy };
    paint();
    return;
  }
  if (node.dataset.wharf) {
    order({ type: "wharf", colony: node.dataset.wharf }, "build");
    return;
  }
  if (node.dataset.cooper) {
    order({ type: "cooper", colony: node.dataset.cooper }, "build");
    return;
  }
  if (node.dataset.rope) {
    order({ type: "rope", colony: node.dataset.rope }, "build");
    return;
  }
  if (node.dataset.smoke) {
    order({ type: "smoke", colony: node.dataset.smoke }, "build");
    return;
  }
  if (node.dataset.monger) {
    order({ type: "monger", colony: node.dataset.monger }, "build");
    return;
  }
  if (node.dataset.pilot) {
    order({ type: "pilot", colony: node.dataset.pilot }, "build");
    return;
  }
  if (node.dataset.lamp) {
    order({ type: "lamp", colony: node.dataset.lamp }, "build");
    return;
  }
  if (node.dataset.chain) {
    order({ type: "chain", colony: node.dataset.chain }, "build");
    return;
  }
  if (node.dataset.ferry) {
    order({ type: "ferry" }, "build");
    return;
  }
  if (node.dataset.dues) {
    order({ type: "dues", colony: node.dataset.dues }, "build");
    return;
  }
  if (node.dataset.quay) {
    order({ type: "quay", colony: node.dataset.quay }, "build");
    return;
  }
  if (node.dataset.mole) {
    order({ type: "mole", colony: node.dataset.mole }, "build");
    return;
  }
  if (node.dataset.lee) {
    order({ type: "lee", colony: node.dataset.lee }, "build");
    return;
  }
  if (node.dataset.refit) {
    order({ type: "refit", q: Number(node.dataset.q), r: Number(node.dataset.r) }, "build");
    return;
  }
  if (node.dataset.patrol) {
    order({ type: "patrol" }, "march");
    return;
  }
  if (node.dataset.keel) {
    order({ type: "keel" }, "march");
    return;
  }
  if (node.dataset.siege) {
    order({ type: "siege", target: selectedId }, "battle");
    return;
  }
  if (node.dataset.sally) {
    order({ type: "sally", target: node.dataset.sally }, "battle");
    return;
  }
  if (node.dataset.inn) {
    order({ type: "inn" }, "build");
    return;
  }
  if (node.dataset.weir) {
    order({ type: "weir" }, "build");
    return;
  }
  if (node.dataset.road) {
    order({ type: "road", target: selectedId }, "build");
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
  if (node.dataset.arm) {
    order({ type: "arm", unit: node.dataset.arm }, "build");
    return;
  }
  if (node.dataset.armory) {
    order({ type: "armory", weapon: node.dataset.armory }, "build");
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
  if (node.dataset.ride) {
    order({ type: "ride", band: node.dataset.ride }, "battle");
    return;
  }
  if (node.dataset.bribe) {
    order({ type: "bribe", band: node.dataset.bribe }, "coin");
    return;
  }
  if (node.dataset.bandClose) {
    selectedBand = null;
    paint();
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
        wallet: wallet || "",
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
  const open = seats > 0 && (meta.humans || 0) < (meta.maxHumans || 12) ? ` · seats ${fmt(seats)}` : "";
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
  if (selectedBand) selectedBand = (world.bands || []).find((row) => row.id === selectedBand.id) || null;
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
  socket.addEventListener("open", () => {
    if (gen !== socketGen) return;
    publishWallet();
  });
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
      const ended = msg.meta && msg.meta.status === "ended" && meta.status !== "ended";
      const won = msg.world && world && msg.world.log[0] && world.log[0] && msg.world.log[0].text !== world.log[0].text && /breaks|seized|sacked|Earned|wins/.test(msg.world.log[0].text);
      takeState(msg);
      if (won || ended) play("win");
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

function placeWord(n) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

function publishWallet() {
  if (!wallet || !socket || socket.readyState !== 1) return;
  socket.send(JSON.stringify({ type: "wallet", wallet }));
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
    place: p.place || null,
    placePay: p.placePay ? formatUtopia(p.placePay) : null,
    utopia: formatUtopia(p.utopia),
    utopiaCents: p.utopia,
    wallet: p.wallet || wallet || null,
    note: "Local earn ledger for this matched age. Not a Solana transfer.",
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
    publishWallet();
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
