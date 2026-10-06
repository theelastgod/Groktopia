import {
  FILL_MS,
  JOIN_GRACE_MS,
  MATCH_MS,
  MAX_HUMANS,
  TICK_MS,
  advanceHour,
  applyAction,
  byId,
  claimSeat,
  closeAge,
  createOpenRealm,
  humanCount,
  hydrate,
  realmJoinable,
  redact,
  serialize,
  standings,
} from "./sim.js";

function clean(value, fallback) {
  const text = String(value || "").replace(/[^\w\s'-]/g, "").trim().slice(0, 32);
  return text || fallback;
}

function metaOf(data, now) {
  return {
    status: data.status,
    startedAt: data.startedAt,
    endsAt: data.endsAt,
    fillUntil: data.fillUntil,
    nextTickAt: data.nextTickAt,
    humans: humanCount(data.world),
    maxHumans: MAX_HUMANS,
    serverNow: now,
    ended: data.status === "ended",
  };
}

export class RealmRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade") === "websocket") return this.connect(request);
    if (url.pathname.endsWith("/status")) return this.status();
    if (url.pathname.endsWith("/join") && request.method === "POST") return this.join(request);
    return new Response("Not found", { status: 404 });
  }

  async load() {
    const saved = await this.ctx.storage.get("realm");
    if (!saved) return null;
    return { ...saved, world: hydrate(saved.worldJSON) };
  }

  async save(data) {
    await this.ctx.storage.put("realm", {
      status: data.status,
      startedAt: data.startedAt,
      endsAt: data.endsAt,
      fillUntil: data.fillUntil,
      nextTickAt: data.nextTickAt,
      tokens: data.tokens,
      worldJSON: serialize(data.world),
    });
  }

  async status() {
    const now = Date.now();
    const data = await this.load();
    if (!data) return Response.json({ joinable: true, humans: 0, status: "empty" });
    const meta = metaOf(data, now);
    return Response.json({ ...meta, joinable: realmJoinable(meta, now) });
  }

  async join(request) {
    const now = Date.now();
    const body = await request.json();
    let data = await this.load();
    if (!data) {
      data = {
        status: "filling",
        startedAt: null,
        endsAt: null,
        fillUntil: now + FILL_MS,
        nextTickAt: null,
        tokens: {},
        world: createOpenRealm(now % 100000),
      };
    }
    const meta = metaOf(data, now);
    if (!realmJoinable(meta, now)) return Response.json({ ok: false, message: "Realm is closed." }, { status: 409 });
    const token = crypto.randomUUID();
    const seatId = `p${crypto.randomUUID().slice(0, 8)}`;
    const claimed = claimSeat(data.world, {
      id: seatId,
      ruler: clean(body.ruler, "Ruler"),
      province: clean(body.province, "New Acre"),
      faction: body.faction,
    });
    if (!claimed.ok) return Response.json(claimed, { status: 409 });
    data.tokens[token] = seatId;
    if (data.status === "filling") this.begin(data, now);
    await this.save(data);
    if (data.status === "live") await this.ctx.storage.setAlarm(data.nextTickAt);
    this.push(data, now);
    return Response.json({
      ok: true,
      token,
      seatId,
      world: redact(data.world, seatId),
      meta: metaOf(data, now),
      standings: standings(data.world),
    });
  }

  begin(data, now) {
    data.status = "live";
    data.startedAt = now;
    data.endsAt = now + MATCH_MS;
    data.nextTickAt = now + TICK_MS;
    data.world.log.unshift({ hour: data.world.hour, text: "The age clock starts now. Two hours until the realm closes. Other rulers may sit for two minutes, and the hours already played stay with the early seats." });
  }

  async connect(request) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";
    const data = await this.load();
    if (!data || !data.tokens[token]) return new Response("Unauthorized", { status: 401 });
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    pair[1].serializeAttachment({ token });
    const seatId = data.tokens[token];
    pair[1].send(JSON.stringify(this.payload(data, seatId, Date.now())));
    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  async webSocketMessage(ws, message) {
    const attached = ws.deserializeAttachment() || {};
    const data = await this.load();
    const now = Date.now();
    if (!data) return;
    const seatId = data.tokens[attached.token];
    if (!seatId) return;
    let body = {};
    try {
      body = JSON.parse(typeof message === "string" ? message : new TextDecoder().decode(message));
    } catch {
      return;
    }
    if (body.type !== "action") return;
    if (data.status !== "live") {
      ws.send(JSON.stringify({ type: "error", message: "The age clock has not started." }));
      return;
    }
    if (now >= data.endsAt) {
      await this.finish(data, now);
      return;
    }
    const action = body.action || {};
    const moving = action.target && action.target !== seatId && (action.type === "attack" || action.type === "thief" || action.type === "trade" || action.type === "envoy" || action.spell === "meteor");
    if (moving && byId(data.world, action.target)) {
      const kind = action.type === "trade" ? "trade" : action.type === "envoy" ? "envoy" : "host";
      this.pushRaw({ type: "march", from: seatId, to: action.target, kind });
    }
    const result = applyAction(data.world, seatId, action);
    await this.save(data);
    this.push(data, now, result.ok ? null : result.message);
  }

  async webSocketClose() {}

  async alarm() {
    const data = await this.load();
    if (!data) return;
    const now = Date.now();
    if (data.status === "filling") {
      if (humanCount(data.world) >= 1) this.begin(data, now);
      await this.save(data);
      await this.ctx.storage.setAlarm(now + TICK_MS);
      this.push(data, now);
      return;
    }
    if (data.status === "ended") return;
    if (now >= data.endsAt) {
      await this.finish(data, now);
      return;
    }
    advanceHour(data.world);
    data.nextTickAt = now + TICK_MS;
    await this.save(data);
    await this.ctx.storage.setAlarm(data.nextTickAt);
    this.push(data, now);
  }

  async finish(data, now) {
    closeAge(data.world);
    data.status = "ended";
    data.nextTickAt = null;
    await this.save(data);
    this.push(data, now);
  }

  payload(data, seatId, now) {
    return {
      type: "state",
      world: redact(data.world, seatId),
      seatId,
      meta: metaOf(data, now),
      standings: standings(data.world),
    };
  }

  push(data, now, error) {
    for (const ws of this.ctx.getWebSockets()) {
      const attached = ws.deserializeAttachment() || {};
      const seatId = data.tokens[attached.token];
      if (!seatId) continue;
      ws.send(JSON.stringify(this.payload(data, seatId, now)));
      if (error) ws.send(JSON.stringify({ type: "error", message: error }));
    }
  }

  pushRaw(message) {
    const text = JSON.stringify(message);
    for (const ws of this.ctx.getWebSockets()) ws.send(text);
  }
}

export class Matchmaker {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const body = await request.text();
    const now = Date.now();
    const book = (await this.ctx.storage.get("book")) || { realms: [] };
    for (const id of book.realms) {
      const stub = this.env.REALMS.get(this.env.REALMS.idFromName(id));
      const statusRes = await stub.fetch("https://realm/status");
      const status = await statusRes.json();
      if (status.joinable) {
        const joined = await stub.fetch("https://realm/join", { method: "POST", body });
        const json = await joined.json();
        return Response.json({ ...json, realmId: id }, { status: joined.status });
      }
    }
    const id = crypto.randomUUID();
    book.realms = [...book.realms, id].slice(-24);
    await this.ctx.storage.put("book", book);
    const stub = this.env.REALMS.get(this.env.REALMS.idFromName(id));
    const joined = await stub.fetch("https://realm/join", { method: "POST", body });
    const json = await joined.json();
    void now;
    return Response.json({ ...json, realmId: id }, { status: joined.status });
  }
}
