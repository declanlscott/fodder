import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { env } from "env";

import { isHttpBindings } from "~/lib/bindings";
import flavors from "~/routes/flavors";
import restaurants from "~/routes/restaurants";

import type { Bindings } from "~/lib/bindings";

const api = new Hono<{ Bindings: Bindings }>();

api.use(logger());

api.use("*", async (c, next) => {
  // Only enable CORS for HTTP bindings in Node.js for local development
  // When deployed to AWS Lambda, Cloudfront handles CORS
  if (isHttpBindings(c.env)) {
    const corsMiddleware = cors({
      origin: env.CORS_ORIGIN,
      allowMethods: ["GET"],
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await corsMiddleware(c, next);
  }

  await next();
});

api.route("/restaurants", restaurants);
api.route("/flavors", flavors);

api.onError((err, c) => {
  console.error("error: ", err);

  if (err instanceof HTTPException) return err.getResponse();

  return c.json(
    {
      error: "Internal server error",
      message: "An unexpected error occurred",
    },
    500,
  );
});

export default api;

export const handler = handle(api);
