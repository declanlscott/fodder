import { Hono } from "hono";
import { validator } from "hono/validator";

import { scrapeAllFlavors, scrapeFlavorBySlug } from "~/lib/fetchers";
import { formatScrapedAllFlavors, formatScrapedFlavor } from "~/lib/formatters";
import { validateSlug } from "~/schemas/api";

import type { Bindings } from "~/lib/bindings";

const flavors = new Hono<{ Bindings: Bindings }>();

// All flavors
flavors.get("/", async (c) => {
  const nextData = await scrapeAllFlavors();

  const body = formatScrapedAllFlavors(nextData);

  return c.json(body, 200);
});

// By slug
flavors.get("/:slug", validator("param", validateSlug), async (c) => {
  const { slug } = c.req.valid("param");

  const nextData = await scrapeFlavorBySlug(slug);

  const body = formatScrapedFlavor(nextData);

  return c.json(body, 200);
});

export default flavors;
