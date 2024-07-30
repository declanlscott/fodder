import { createEnv } from "@fodder/env";
import * as v from "valibot";

export const env = createEnv({
  server: {
    EXTERNAL_API_BASE_URL: v.pipe(v.string(), v.url()),
    RESTAURANT_SCRAPE_BASE_URL: v.pipe(v.string(), v.url()),
    FLAVORS_SCRAPE_BASE_URL: v.pipe(v.string(), v.url()),
    FLAVOR_IMAGE_BASE_URL: v.pipe(v.string(), v.url()),
    LOGO_SVG_URL: v.pipe(v.string(), v.url()),
    CORS_ORIGIN: v.pipe(v.string(), v.url()),
  },
  runtimeEnv: process.env,
});
