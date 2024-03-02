import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { HTTPException } from "hono/http-exception";

import flavors from "~/routes/flavors";
import restaurants from "~/routes/restaurants";

import type { Bindings } from "~/lib/bindings";

const api = new Hono<{ Bindings: Bindings }>();

api.route("/restaurants", restaurants);
api.route("/flavors", flavors);

api.onError((err, c) => {
  console.error("error: ", err);

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

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
