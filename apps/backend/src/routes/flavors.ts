import { Hono } from "hono";
import { validator } from "hono/validator";

import { beforeOpening } from "~/lib/expires";
import { scrapeAllFlavors, scrapeFlavorBySlug } from "~/lib/fetchers";
import { formatScrapedAllFlavors, formatScrapedFlavor } from "~/lib/formatters";
import { validateSlug } from "~/schemas/api";

import type { Bindings } from "~/types/env";

const flavors = new Hono<{ Bindings: Bindings }>();

// All flavors
flavors.get("/", async (c) => {
  c.header("Expires", beforeOpening());

  const nextData = await scrapeAllFlavors({ c });

  return c.json(formatScrapedAllFlavors({ c, nextData }), 200);
});

// By slug
flavors.get("/:slug", validator("param", validateSlug), async (c) => {
  const { slug } = c.req.valid("param");

  c.header("Expires", beforeOpening());

  const nextData = await scrapeFlavorBySlug({ c, slug });

  return c.json(formatScrapedFlavor({ c, nextData }), 200);
});

export default flavors;
