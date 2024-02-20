import { object, string, url } from "valibot";

import type { Output } from "valibot";

export const EnvSchema = object({
  RESTAURANTS_API_BASE_URL: string([url()]),
  RESTAURANT_SCRAPE_BASE_URL: string([url()]),
  BASE_IMAGE_URL: string([url()]),
  LOGO_SVG_URL: string([url()]),
});

export type EnvSchema = Output<typeof EnvSchema>;
