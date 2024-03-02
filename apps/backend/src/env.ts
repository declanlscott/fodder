import { createEnv } from "@repo/env";
import { string, url } from "valibot";

export const env = createEnv({
  server: {
    EXTERNAL_API_BASE_URL: string([url()]),
    RESTAURANT_SCRAPE_BASE_URL: string([url()]),
    FLAVORS_SCRAPE_BASE_URL: string([url()]),
    FLAVOR_IMAGE_BASE_URL: string([url()]),
    LOGO_SVG_URL: string([url()]),
  },
  runtimeEnv: process.env,
});
