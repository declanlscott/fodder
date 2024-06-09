import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import * as v from "valibot";

import { ValidationException } from "~/lib/exceptions";
import { fetchRestaurants, scrapeRestaurantBySlug } from "~/lib/fetchers";
import {
  formatFetchedRestaurants,
  formatScrapedRestaurant,
} from "~/lib/formatters";
import { LocateRestaurantsSchema, validateSlug } from "~/schemas/api";

import type { Bindings } from "~/lib/bindings";

const restaurants = new Hono<{ Bindings: Bindings }>();

// By location
restaurants.get(
  "/",
  validator("query", (queryParams) => {
    const { success, issues, output } = v.safeParse(
      LocateRestaurantsSchema,
      queryParams,
    );

    if (!success)
      throw new ValidationException<typeof LocateRestaurantsSchema>(
        400,
        "Invalid query parameters",
        issues,
      );

    return output;
  }),
  async (c) => {
    const queryParams = c.req.valid("query");

    const json = await fetchRestaurants(queryParams);

    if (json.data.totalResults === 0)
      throw new HTTPException(404, { message: "No restaurants found" });

    const body = formatFetchedRestaurants(json);

    return c.json(body, 200);
  },
);

// By slug
restaurants.get("/:slug", validator("param", validateSlug), async (c) => {
  const { slug } = c.req.valid("param");

  const nextData = await scrapeRestaurantBySlug(slug);

  const body = formatScrapedRestaurant(nextData);

  return c.json(body, 200);
});

export default restaurants;
