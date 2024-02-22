import { Hono } from "hono";
import { validator } from "hono/validator";

import { scrapeAllFlavors, scrapeFlavorBySlug } from "~/lib/fetchers";
import { formatScrapedAllFlavors, formatScrapedFlavor } from "~/lib/formatters";
import { validateSlug } from "~/schemas/api";

import type { Bindings } from "~/types/env";

const flavors = new Hono<{ Bindings: Bindings }>();

// All flavors
flavors.get("/", async (c) => {
  const nextData = await scrapeAllFlavors({ c });

  const body = formatScrapedAllFlavors({ c, nextData });

  return c.json(body, 200);
});

// By slug
flavors.get("/:slug", validator("param", validateSlug), async (c) => {
  const { slug } = c.req.valid("param");

  const nextData = await scrapeFlavorBySlug({ c, slug });

  const body = formatScrapedFlavor({ c, nextData });

  return c.json(body, 200);
});

export default flavors;
