import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import flavors from "~/routes/flavors";
import restaurants from "./routes/restaurants";

import type { Bindings } from "~/types/env";

const api = new Hono<{ Bindings: Bindings }>();

api.route("/restaurants", restaurants);
api.route("/flavors", flavors);

api.onError((err, c) => {
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
