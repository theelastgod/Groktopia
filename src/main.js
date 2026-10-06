import {
  BUILDINGS,
  EARN,
  FACTIONS,
  ORDERS,
  advanceHour,
  applyAction,
  byId,
  defense,
  foodNeed,
  formatUtopia,
  freeLand,
  hydrate,
  intelFresh,
  mysticCap,
  networth,
  newWorld,
  nwFactor,
  offense,
  population,
  seatRival,
  serialize,
  soldierCap,
  spellbook,
  thiefCap,
  eliteCap,
} from "./sim.js";
import { drawRealm, fitCamera, hitProvince, provinceGeom, screenToWorld } from "./map.js";

const SAVE = "groktopia.v1";
const app = document.querySelector("#app");

let world = null;
let toast = "";
let selectedId = "you";
let stake = 100;
let soundOn = true;
let wallet = "";
let chainBalance = null;
let mint = { symbol: "UTOPIA", mint: "", decimals: 6, cluster: "mainnet-beta" };
let audioReady = false;
let mounted = false;
let cam = { x: 0, y: 0, z: 1 };
let march = null;
let dragging = null;
let raf = 0;
let lastFrame = 0;
const clips = {};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function seat() {
  return byId(world, world.seat) || byId(world, "you");
}

function save() {
  localStorage.setItem(SAVE, serialize(world));
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
  const actor = seat();
  const res = applyAction(world, actor.id, action);
  if (res.ok) {
    play(sound || "click");
    if (res.win === true) play("win");
    if (res.win === false) play("lose");
    save();
  }
  note(res.message);
  return res;
}

function needsMarch(action) {
  return action.target && action.target !== seat().id && (action.type === "attack" || action.type === "thief" || action.spell === "meteor");
}

function order(action, sound) {
  if (!needsMarch(action) || march) {
    act(action, sound);
    return;
  }
  const from = provinceGeom(seat());
  const target = byId(world, action.target);
  if (!target) {
    act(action, sound);
    return;
  }
  const to = provinceGeom(target);
  march = { ax: from.x, ay: from.y, bx: to.x, by: to.y, t: 0, action, sound };
  bed("battle");
  play(sound || "march");
}

function gate() {
  const saved = localStorage.getItem(SAVE);
  const options = Object.values(FACTIONS).map((f) => `<option value="${f.id}">${esc(f.name)} — ${esc(f.blurb)}</option>`).join("");
  return `<main class="gate">
    <img src="/public/art/banner.jpg" alt="A walled riverside province at dusk">
    <img class="coin-hero" src="/public/art/coin.jpg" alt="$UTOPIA coin">
    <h1>Groktopia</h1>
    <p class="lede">Look down on the realm. Your province and six Grok agents sit on the same land. Click a holding, then march, build, or steal. Victories inside a fair size band pay <b>$UTOPIA</b>. Drag to pan. The wheel zooms.</p>
    <form class="card" id="found">
      <label>Ruler <input name="ruler" required maxlength="32" value="Ada"></label>
      <label>Province <input name="province" required maxlength="32" value="First Acre"></label>
      <label>Faction <select name="faction">${options}</select></label>
      <div class="row">
        <button class="btn primary" type="submit">Found the province</button>
        ${saved ? `<button class="btn" type="button" id="resume">Resume</button>` : ""}
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
      <div class="hud-chip" id="hud-purse"></div>
      <button class="btn primary" id="hour" type="button">Let the hour pass</button>
      <button class="btn" id="sound" type="button">${soundOn ? "Sound on" : "Sound off"}</button>
      <span id="hud-seats"></span>
    </header>
    <section class="hud-card" id="card"></section>
    <ol class="hud-log log" id="log"></ol>
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
    cam = fitCamera(world.provinces, canvas.clientWidth, canvas.clientHeight);
    bindMap(canvas);
    lastFrame = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (march) {
        march.t += dt / 0.7;
        if (march.t >= 1) {
          const done = march;
          march = null;
          act(done.action, done.sound);
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  paint();
  draw();
}

function resize() {
  const canvas = document.querySelector("#realm");
  if (!canvas) return;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

function draw() {
  const canvas = document.querySelector("#realm");
  if (!canvas || !world) return;
  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) resize();
  const ctx = canvas.getContext("2d");
  drawRealm(ctx, canvas.width, canvas.height, world, seat().id, selectedId, cam, march);
}

function paint() {
  if (!mounted || !world) return;
  const p = seat();
  const hour = document.querySelector("#hud-hour");
  const purse = document.querySelector("#hud-purse");
  const seats = document.querySelector("#hud-seats");
  const card = document.querySelector("#card");
  const log = document.querySelector("#log");
  if (hour) hour.innerHTML = `<b>Hour ${world.hour}</b><span>${esc(p.name)} · ${p.orders}/${ORDERS}</span>`;
  if (purse) purse.innerHTML = `<b class="coin"><img class="coin-mark" src="/public/art/coin.jpg" alt="">${formatUtopia(p.utopia)}</b><span>gold ${p.gold} · grain ${p.grain}</span>`;
  if (seats) {
    const humans = world.provinces.filter((row) => row.kind === "human");
    seats.innerHTML = humans.map((row) => `<button class="btn" type="button" data-seat="${row.id}" ${world.seat === row.id ? 'aria-current="page"' : ""}>${esc(row.name)}</button>`).join("")
      + (byId(world, "rival") ? "" : `<button class="btn" type="button" id="rival">Seat a rival</button>`);
  }
  if (log) log.innerHTML = world.log.slice(0, 8).map((row) => `<li><b>${row.hour}</b> ${esc(row.text)}</li>`).join("");
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

function cardFor(actor, selected) {
  const self = selected.id === actor.id;
  const fresh = intelFresh(actor, selected.id, world.hour);
  const knownDef = self || fresh ? defense(selected) : "hidden";
  const band = self ? "" : nwFactor(actor, selected) > 0 ? "Inside the fair band." : "Outside the fair band. A march pays nothing.";
  const f = FACTIONS[selected.faction];
  const head = `<h2>${esc(selected.name)}</h2>
    <p class="muted">${esc(selected.ruler)} · ${esc(f.name)} · ${selected.kind === "agent" ? "Grok agent" : "human"}</p>
    <p>${selected.line ? esc(selected.line) : ""}</p>
    <p class="muted">Land ${selected.land} · empty ${freeLand(selected)} · people ${population(selected)} · networth ${self || fresh ? networth(selected) : "—"}</p>
    <p>Offense ${self ? offense(actor) : fresh ? fresh.offense : "—"} · defense ${knownDef}. ${esc(band)}</p>`;
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
      <p class="muted">Active hour pays ${formatUtopia(EARN.hourActive)} $UTOPIA after you act. Combat pay this hour can still reach ${formatUtopia(actor.earnLeft)}.</p>
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

function bindMap(canvas) {
  canvas.addEventListener("pointerdown", (event) => {
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY, cx: cam.x, cy: cam.y, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging || dragging.id !== event.pointerId) return;
    const dx = event.clientX - dragging.x;
    const dy = event.clientY - dragging.y;
    if (Math.hypot(dx, dy) > 5) dragging.moved = true;
    cam.x = dragging.cx - dx / cam.z;
    cam.y = dragging.cy - dy / cam.z;
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!dragging || dragging.id !== event.pointerId) return;
    const moved = dragging.moved;
    dragging = null;
    if (moved) return;
    const rect = canvas.getBoundingClientRect();
    const worldPoint = screenToWorld(event.clientX - rect.left, event.clientY - rect.top, cam, rect.width, rect.height);
    const id = hitProvince(world.provinces, worldPoint.x, worldPoint.y);
    if (!id) return;
    selectedId = id;
    play("click");
    bed(id === seat().id ? "throne" : "battle");
    paint();
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const before = screenToWorld(event.clientX - rect.left, event.clientY - rect.top, cam, rect.width, rect.height);
    const next = Math.max(0.35, Math.min(2.8, cam.z * (event.deltaY > 0 ? 0.92 : 1.08)));
    cam.z = next;
    const after = screenToWorld(event.clientX - rect.left, event.clientY - rect.top, cam, rect.width, rect.height);
    cam.x += before.x - after.x;
    cam.y += before.y - after.y;
  }, { passive: false });
  window.addEventListener("resize", () => {
    resize();
    draw();
  });
}

app.addEventListener("click", async (event) => {
  const node = event.target.closest("button");
  if (!node) return;
  if (node.id === "resume") {
    world = hydrate(localStorage.getItem(SAVE));
    selectedId = world.seat || "you";
    play("hour");
    render();
    return;
  }
  if (!world) return;
  if (node.id === "sound") {
    soundOn = !soundOn;
    node.textContent = soundOn ? "Sound on" : "Sound off";
    if (!soundOn && audioReady) {
      clips.throne.pause();
      clips.battle.pause();
    } else bed(selectedId === seat().id ? "throne" : "battle");
    return;
  }
  if (node.id === "hour") {
    if (march) return;
    advanceHour(world);
    play("hour");
    save();
    note(`Hour ${world.hour}.`);
    return;
  }
  if (node.id === "rival") {
    const res = seatRival(world, "Second Acre", seat().faction === "marcher" ? "warden" : "marcher");
    note(res.message);
    if (res.ok) {
      save();
      cam = fitCamera(world.provinces, document.querySelector("#realm").clientWidth, document.querySelector("#realm").clientHeight);
    }
    return;
  }
  if (node.dataset.seat) {
    world.seat = node.dataset.seat;
    selectedId = world.seat;
    save();
    paint();
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

app.addEventListener("submit", (event) => {
  if (event.target.id !== "found") return;
  event.preventDefault();
  const data = new FormData(event.target);
  world = newWorld({
    seed: Date.now() % 100000,
    ruler: String(data.get("ruler") || "Ruler").slice(0, 32),
    province: String(data.get("province") || "First Acre").slice(0, 32),
    faction: String(data.get("faction") || "marcher"),
  });
  selectedId = "you";
  save();
  bootAudio();
  play("hour");
  render();
  bed("throne");
});

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
