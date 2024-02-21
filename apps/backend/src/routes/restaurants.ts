import { Hono } from "hono";
import { validator } from "hono/validator";
import { safeParse } from "valibot";

import { ValidationException } from "~/lib/exceptions";
import { beforeOpening } from "~/lib/expires";
import { fetchRestaurants, scrapeRestaurantBySlug } from "~/lib/fetchers";
import {
  formatFetchedRestaurants,
  formatScrapedRestaurant,
} from "~/lib/formatters";
import { LocateRestaurantsSchema, validateSlug } from "~/schemas/api";

import type { Bindings } from "~/types/env";

const restaurants = new Hono<{ Bindings: Bindings }>();

// By location
restaurants.get(
  "/",
  validator("query", (queryParams) => {
    const { success, issues, output } = safeParse(
      LocateRestaurantsSchema,
      queryParams,
    );

    if (!success) {
      throw new ValidationException<typeof LocateRestaurantsSchema>(
        400,
        "Invalid query parameters",
        issues,
      );
    }

    return output;
  }),
  async (c) => {
    const queryParams = c.req.valid("query");

    const json = await fetchRestaurants({
      c,
      queryParams,
    });

    const body = formatFetchedRestaurants({ c, json });

    return c.json(body, 200, { Expires: beforeOpening() });
  },
);

// By slug
restaurants.get("/:slug", validator("param", validateSlug), async (c) => {
  const { slug } = c.req.valid("param");

  const nextData = await scrapeRestaurantBySlug({ c, slug });

  const body = formatScrapedRestaurant({ c, nextData });

  return c.json(body, 200, { Expires: beforeOpening() });
});

export default restaurants;
