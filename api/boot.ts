// Must stay the first import: sets process TZ to Africa/Lagos for the whole server.
import "./lib/timezone";
import dns from "node:dns";

import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { startRoiScheduler } from "./lib/roi";
import { startCrmScheduler } from "./lib/crm-scheduler";

// Prefer IPv4 when both IPv4 and IPv6 are available.
// This avoids IPv6 ENETUNREACH errors in some cloud environments.
dns.setDefaultResultOrder("ipv4first");

const app = new Hono<{ Bindings: HttpBindings }>();

// Monthly ROI automation: credits profits on schedule, hourly sweep
startRoiScheduler();
// CRM automation: appointment + follow-up reminders, 5-minute sweep
startCrmScheduler();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
