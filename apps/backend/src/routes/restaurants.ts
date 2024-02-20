import { Hono } from "hono";
import { validator } from "hono/validator";
import { safeParse } from "valibot";

import { ValidationException } from "~/lib/exceptions";
import { beforeOpening } from "~/lib/expires";
import { locateRestaurants, scrapeRestaurant } from "~/lib/fetchers";
import {
  formatLocatedRestaurants,
  formatSluggedRestaurant,
} from "~/lib/formatters";
import { ByLocationSchema, BySlugSchema } from "~/schemas/restaurants";

const restaurants = new Hono();

// By location
restaurants.get(
  "/",
  validator("query", (queryParams, c) => {
    const { success, issues, output } = safeParse(
      ByLocationSchema,
      queryParams,
    );

    if (!success) {
      throw new ValidationException<typeof ByLocationSchema>(
        400,
        "Invalid query parameters",
        issues,
      );
    }

    return output;
  }),
  async (c) => {
    const queryParams = c.req.valid("query");

    c.header("Expires", beforeOpening());

    const data = await locateRestaurants({
      c,
      queryParams,
    });

    return c.json(formatLocatedRestaurants({ c, data }), 200);
  },
);

// By slug
restaurants.get(
  "/:slug",
  validator("param", (pathParams, c) => {
    const { success, issues, output } = safeParse(BySlugSchema, pathParams);

    if (!success) {
      throw new ValidationException<typeof BySlugSchema>(
        400,
        "Invalid path parameters",
        issues,
      );
    }

    return output;
  }),
  async (c) => {
    const { slug } = c.req.valid("param");

    c.header("Expires", beforeOpening());

    const data = await scrapeRestaurant({ c, slug });

    return c.json(formatSluggedRestaurant({ c, data }), 200);
  },
);

export default restaurants;
