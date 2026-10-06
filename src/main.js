import {
  BUILDINGS,
  EARN,
  FACTIONS,
  ORDERS,
  advanceHour,
  applyAction,
  buildingCount,
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

const SAVE = "groktopia.v1";
const app = document.querySelector("#app");

let world = null;
let tab = "throne";
let toast = "";
let targetId = "harrow";
let stake = 100;
let soundOn = true;
let wallet = "";
let chainBalance = null;
let mint = { symbol: "UTOPIA", mint: "", decimals: 6, cluster: "mainnet-beta" };
let audioReady = false;
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

function note(message) {
  toast = message;
  render();
  window.setTimeout(() => {
    if (toast === message) {
      toast = "";
      const node = document.querySelector(".toast");
      if (node) node.remove();
    }
  }, 2400);
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
}

function drawSkyline() {
  const canvas = document.querySelector("canvas.sky");
  const p = world && seat();
  if (!canvas || !p) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth * dpr;
  const h = 90 * dpr;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#120e0b";
  ctx.fillRect(0, 0, w, h);
  const blocks = [
    ["hearth", "#6a5340", 0.35],
    ["field", "#6f8a52", 0.22],
    ["workshop", "#8a6a3a", 0.48],
    ["barracks", "#7d3f36", 0.55],
    ["keep", "#c8b48a", 0.78],
    ["chapel", "#d8d2c4", 0.62],
    ["den", "#3e3a44", 0.4],
    ["spire", "#e2c078", 0.92],
  ];
  const total = Math.max(1, buildingCount(p));
  let x = 8 * dpr;
  for (const [key, color, height] of blocks) {
    const share = p.buildings[key] / total;
    const bw = Math.max(2, (w - 16 * dpr) * share);
    const bh = h * height;
    ctx.fillStyle = color;
    ctx.fillRect(x, h - bh - 8 * dpr, bw - dpr, bh);
    x += bw;
  }
}

function render() {
  app.innerHTML = world ? shell() : gate();
  drawSkyline();
  if (world && soundOn) bed(tab === "war" ? "battle" : "throne");
}

function gate() {
  const saved = localStorage.getItem(SAVE);
  const options = Object.values(FACTIONS).map((f) => `<option value="${f.id}">${esc(f.name)} — ${esc(f.blurb)}</option>`).join("");
  return `<main class="gate">
    <img src="/public/art/banner.jpg" alt="A walled riverside province at dusk">
    <img class="coin-hero" src="/public/art/coin.jpg" alt="$UTOPIA coin">
    <h1>Groktopia</h1>
    <p class="lede">You hold one province. Six Grok agents hold the rest of the realm and spend their hours against you. Victories inside a fair size band pay <b>$UTOPIA</b>. A second human on this device can stake the same purse. The mint is Solana. This page does not invent a contract address and does not spend your wallet.</p>
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
  const p = seat();
  const tabs = [
    ["throne", "Throne"],
    ["build", "Build"],
    ["host", "Host"],
    ["war", "War"],
    ["mystics", "Mystics"],
    ["shadows", "Shadows"],
    ["realm", "Realm"],
    ["earn", "Earn"],
  ];
  return `<div class="app">
    <img class="banner" src="/public/art/banner.jpg" alt="">
    <header class="app">
      <div class="brand-row"><img class="coin-mark" src="/public/art/coin.jpg" alt=""><div class="brand">Groktopia</div></div>
      <div class="stat"><b>Hour ${world.hour}</b><span>${esc(p.name)}</span></div>
      <div class="stat"><b>${p.orders}/${ORDERS}</b><span>orders</span></div>
      <div class="stat"><b class="coin"><img class="coin-mark" src="/public/art/coin.jpg" alt="">${formatUtopia(p.utopia)}</b><span>$UTOPIA</span></div>
      <div class="stat"><button class="btn" id="sound" type="button">${soundOn ? "Sound on" : "Sound off"}</button></div>
    </header>
    <nav>${tabs.map(([id, label]) => `<button class="btn" type="button" data-tab="${id}" ${tab === id ? 'aria-current="page"' : ""}>${label}</button>`).join("")}</nav>
    <div class="layout">
      <section class="panel">${page(p)}</section>
      <aside class="side">
        <canvas class="sky"></canvas>
        <h3>Chronicle</h3>
        <ol class="log">${world.log.slice(0, 14).map((row) => `<li><b>${row.hour}</b> ${esc(row.text)}</li>`).join("")}</ol>
        <div class="row"><button class="btn primary" type="button" id="hour">Let the hour pass</button></div>
      </aside>
    </div>
    ${toast ? `<div class="toast">${esc(toast)}</div>` : ""}
  </div>`;
}

function page(p) {
  if (tab === "throne") return throne(p);
  if (tab === "build") return build(p);
  if (tab === "host") return host(p);
  if (tab === "war") return war(p);
  if (tab === "mystics") return mystics(p);
  if (tab === "shadows") return shadows(p);
  if (tab === "realm") return realm(p);
  return earn(p);
}

function throne(p) {
  const f = FACTIONS[p.faction];
  const humans = world.provinces.filter((row) => row.kind === "human");
  return `<h2>${esc(p.name)}</h2>
    <p class="muted">${esc(p.ruler)} · ${esc(f.name)} · elite ${esc(f.elite)}. ${esc(f.blurb)}</p>
    <div class="grid">
      ${metric("Land", p.land)}
      ${metric("Empty acres", freeLand(p))}
      ${metric("People", population(p))}
      ${metric("Peasants", p.peasants)}
      ${metric("Gold", p.gold)}
      ${metric("Grain", p.grain)}
      ${metric("Aether", p.aether)}
      ${metric("Networth", networth(p))}
      ${metric("Offense", offense(p))}
      ${metric("Defense", defense(p))}
      ${metric("Food need", foodNeed(p))}
      ${metric("Wage", p.grain >= foodNeed(p) ? "fed" : "hungry")}
    </div>
    <h3>Seat</h3>
    <div class="row">
      ${humans.map((row) => `<button class="btn" type="button" data-seat="${row.id}" ${world.seat === row.id ? 'aria-current="page"' : ""}>${esc(row.ruler)} · ${esc(row.name)}</button>`).join("")}
      ${byId(world, "rival") ? "" : `<button class="btn" type="button" id="rival">Seat a rival</button>`}
    </div>
    <p class="muted">Hotseat PvP uses the rival chair. Stakes come out of each purse in $UTOPIA. Agents never sit that chair. They act when the hour passes.</p>`;
}

function metric(label, value) {
  return `<div class="tile"><span class="muted">${esc(label)}</span><br><b>${esc(value)}</b></div>`;
}

function build(p) {
  const rows = Object.entries(BUILDINGS).map(([key, spec]) => {
    const cost = spec.cost(p.buildings[key]);
    return `<tr>
      <td>${esc(spec.name)}<div class="muted">${esc(spec.blurb)}</div></td>
      <td>${p.buildings[key]}</td>
      <td>${cost} gold</td>
      <td><button class="btn" type="button" data-build="${key}">Raise</button></td>
    </tr>`;
  }).join("");
  const explore = 300 + p.land * 3;
  return `<h2>Acres</h2>
    <p class="muted">${freeLand(p)} empty of ${p.land}. Raising a building spends gold and one empty acre. It does not spend an order.</p>
    <table><thead><tr><th>Structure</th><th>Count</th><th>Next</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    <div class="row"><button class="btn primary" type="button" id="explore">Settle 10 acres · ${explore} gold · 1 order</button></div>`;
}

function host(p) {
  const f = FACTIONS[p.faction];
  return `<h2>Host</h2>
    <p class="muted">Soldiers ${p.soldiers}/${soldierCap(p)} · ${esc(f.elite)}s ${p.elites}/${eliteCap(p)} · thieves ${p.thieves}/${thiefCap(p)} · mystics ${p.mystics}/${mysticCap(p)}</p>
    <div class="row">
      <button class="btn" type="button" data-train="soldier">Draft 10 soldiers · 45 gold</button>
      <button class="btn" type="button" data-train="elite">Train 2 ${esc(f.elite)}s · 160 gold</button>
      <button class="btn" type="button" data-train="thief">Train 2 thieves · 130 gold</button>
      <button class="btn" type="button" data-train="disband">Release 10 soldiers</button>
    </div>
    <p class="muted">Mystics arrive from chapels when the hour passes. Offense is soldiers and ${esc(f.elite)}s. Keeps stand on defense even with an empty yard.</p>`;
}

function targetOptions(p) {
  return world.provinces.filter((row) => row.id !== p.id).map((row) => {
    const band = nwFactor(p, row);
    const fresh = intelFresh(p, row.id, world.hour);
    const known = fresh ? `def ${fresh.defense}` : band > 0 ? "in band" : "out of band";
    return `<option value="${row.id}" ${row.id === targetId ? "selected" : ""}>${esc(row.name)} · ${esc(row.ruler)} · ${known}</option>`;
  }).join("");
}

function war(p) {
  const target = byId(world, targetId);
  const band = target ? nwFactor(p, target) : 0;
  const stakes = target && target.kind === "human"
    ? `<label>Stake each side
        <select id="stake">
          <option value="100" ${stake === 100 ? "selected" : ""}>1.00 $UTOPIA</option>
          <option value="500" ${stake === 500 ? "selected" : ""}>5.00 $UTOPIA</option>
          <option value="1000" ${stake === 1000 ? "selected" : ""}>10.00 $UTOPIA</option>
        </select>
      </label>`
    : `<p class="muted">Agent marches pay the earn table, up to ${formatUtopia(p.earnLeft)} $UTOPIA left this hour. No stake.</p>`;
  return `<h2>War room</h2>
    <p>Your offense <b>${offense(p)}</b>. ${target ? `${esc(target.name)} is ${band > 0 ? "inside" : "outside"} the fair band.` : ""} A march spends one order. The same target rests for two hours.</p>
    <label>Target <select id="target">${targetOptions(p)}</select></label>
    ${stakes}
    <div class="row">
      <button class="btn danger" type="button" data-march="seize">Seize land</button>
      <button class="btn danger" type="button" data-march="sack">Sack stores</button>
      <button class="btn danger" type="button" data-march="raze">Raze buildings</button>
    </div>`;
}

function mystics(p) {
  const book = spellbook();
  const buttons = Object.entries(book).map(([key, spec]) => {
    const left = p.spells[key] ? ` · ${p.spells[key]}h left` : "";
    return `<button class="btn" type="button" data-spell="${key}">${esc(spec.name)} · ${spec.cost} aether${left}<div class="muted">${esc(spec.blurb)}</div></button>`;
  }).join("");
  return `<h2>Mystics</h2>
    <p class="muted">${p.mystics} mystics · ${p.aether} aether. Meteor uses the target chosen in the war room.</p>
    <label>Target <select id="target">${targetOptions(p)}</select></label>
    <div class="grid">${buttons}</div>`;
}

function shadows(p) {
  return `<h2>Shadows</h2>
    <p class="muted">${p.thieves} thieves. Scout, pilfer, and arson each spend one order. Gold stolen from an agent can also pay $UTOPIA inside the band.</p>
    <label>Target <select id="target">${targetOptions(p)}</select></label>
    <div class="row">
      <button class="btn" type="button" data-thief="scout">Scout</button>
      <button class="btn" type="button" data-thief="pilfer">Pilfer gold</button>
      <button class="btn" type="button" data-thief="arson">Arson</button>
    </div>`;
}

function realm(p) {
  const rows = world.provinces.map((row) => {
    const fresh = intelFresh(p, row.id, world.hour);
    const kind = row.kind === "agent" ? "agent" : "human";
    return `<tr>
      <td>${esc(row.name)}<div class="muted">${esc(row.ruler)} · ${kind}${row.line ? ` · ${esc(row.line)}` : ""}</div></td>
      <td>${esc(FACTIONS[row.faction].name)}</td>
      <td>${row.land}</td>
      <td>${row.id === p.id || fresh ? networth(row) : "—"}</td>
      <td>${fresh ? fresh.defense : row.id === p.id ? defense(row) : "—"}</td>
    </tr>`;
  }).join("");
  return `<h2>Realm</h2>
    <img class="map" src="/public/art/map.jpg" alt="A painted map of the seven provinces">
    <img class="map" src="/public/art/council.jpg" alt="The six lattice agents at council">
    <table><thead><tr><th>Province</th><th>Faction</th><th>Land</th><th>Networth</th><th>Defense</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="muted">Defense and networth of another province show after a scout, and for a few hours after you march them. Agents: Harrow seizes, Sable answers a grudge, Vellum casts, Quill steals, Brine sacks fat treasuries, Moss plants acres.</p>`;
}

function earn(p) {
  const minted = Boolean(mint.mint);
  return `<h2>$UTOPIA</h2>
    <img class="coin-hero" src="/public/art/coin.jpg" alt="$UTOPIA coin">
    <p>Purse on this seat: <b>${formatUtopia(p.utopia)} $UTOPIA</b>. Burned in PvP fees across the realm: ${formatUtopia(world.burned)}.</p>
    <div class="grid">
      ${metric("Active hour", formatUtopia(EARN.hourActive))}
      ${metric("Combat cap / hour", formatUtopia(EARN.combatCap))}
      ${metric("Seize", formatUtopia(EARN.seize))}
      ${metric("Sack", formatUtopia(EARN.sack))}
      ${metric("Raze", formatUtopia(EARN.raze))}
      ${metric("Meteor", formatUtopia(EARN.meteor))}
      ${metric("Pilfer", formatUtopia(EARN.pilfer))}
      ${metric("PvP fee", "5%")}
    </div>
    <p class="muted">Pay needs a real action inside the fair networth band. Marching a tiny province or a whale pays nothing. The active-hour coin requires you to have built, trained, explored, marched, cast, or stolen before the hour turns.</p>
    <h3>Solana</h3>
    <p>Cluster ${esc(mint.cluster)}. Symbol ${esc(mint.symbol)}. Mint ${minted ? `<b>${esc(mint.mint)}</b>` : `<span class="warn">not set</span>`}.</p>
    <p class="muted">Wallet ${wallet ? esc(wallet) : "not connected"}. On-chain balance ${chainBalance == null ? "—" : esc(chainBalance)}.</p>
    <div class="row">
      <button class="btn primary" type="button" id="phantom">${wallet ? "Refresh Phantom" : "Connect Phantom"}</button>
      <button class="btn" type="button" id="receipt">Download purse receipt</button>
    </div>
    <p class="muted">A receipt is a local record. It is not a transfer. On-chain claim stays closed until <code>public/mint.json</code> names a real $UTOPIA mint and a treasury pays it. This page never asks for a seed phrase.</p>`;
}

app.addEventListener("click", async (event) => {
  const node = event.target.closest("button");
  if (!node) return;
  if (node.id === "resume") {
    world = hydrate(localStorage.getItem(SAVE));
    play("hour");
    render();
    return;
  }
  if (!world) return;
  if (node.dataset.tab) {
    tab = node.dataset.tab;
    play("click");
    render();
    return;
  }
  if (node.id === "sound") {
    soundOn = !soundOn;
    if (!soundOn && audioReady) {
      clips.throne.pause();
      clips.battle.pause();
    }
    render();
    return;
  }
  if (node.id === "hour") {
    advanceHour(world);
    play("hour");
    save();
    note(`Hour ${world.hour}.`);
    return;
  }
  if (node.id === "rival") {
    const res = seatRival(world, "Second Acre", seat().faction === "marcher" ? "warden" : "marcher");
    note(res.message);
    if (res.ok) save();
    return;
  }
  if (node.dataset.seat) {
    world.seat = node.dataset.seat;
    save();
    render();
    return;
  }
  if (node.dataset.build) {
    act({ type: "build", building: node.dataset.build }, "build");
    return;
  }
  if (node.id === "explore") {
    act({ type: "explore" }, "march");
    return;
  }
  if (node.dataset.train) {
    const count = node.dataset.train === "soldier" || node.dataset.train === "disband" ? 10 : 2;
    act({ type: "train", unit: node.dataset.train, count }, "build");
    return;
  }
  if (node.dataset.march) {
    readTarget();
    const target = byId(world, targetId);
    act({
      type: "attack",
      target: targetId,
      mode: node.dataset.march,
      stake: target && target.kind === "human" ? stake : 0,
    }, "march");
    return;
  }
  if (node.dataset.spell) {
    readTarget();
    act({ type: "spell", spell: node.dataset.spell, target: targetId }, "spell");
    return;
  }
  if (node.dataset.thief) {
    readTarget();
    act({ type: "thief", op: node.dataset.thief, target: targetId }, "spell");
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
  if (event.target.id === "target") targetId = event.target.value;
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
  tab = "throne";
  save();
  bootAudio();
  play("hour");
  render();
});

function readTarget() {
  const select = document.querySelector("#target");
  if (select) targetId = select.value;
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
