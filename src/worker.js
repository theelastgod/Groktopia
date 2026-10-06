import { Matchmaker, RealmRoom } from "./realm.js";

export { Matchmaker, RealmRoom };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/join" && request.method === "POST") {
      const stub = env.MATCH.get(env.MATCH.idFromName("global"));
      return stub.fetch(request);
    }
    if (url.pathname === "/api/ws") {
      const realm = url.searchParams.get("realm");
      if (!realm) return new Response("Missing realm", { status: 400 });
      const stub = env.REALMS.get(env.REALMS.idFromName(realm));
      return stub.fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};
