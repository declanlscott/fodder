import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import restaurants from "./routes/restaurants";

const api = new Hono();

api.route("/restaurants", restaurants);

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
