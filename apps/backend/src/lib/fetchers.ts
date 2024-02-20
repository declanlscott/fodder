import { Context } from "hono";
import { env } from "hono/adapter";
import { safeParse } from "valibot";

import {
  HTTPExceptionWithJsonBody,
  ValidationException,
} from "~/lib/exceptions";
import { EnvSchema } from "~/schemas/env";
import {
  RestaurantsApiResponseSchema,
  RestaurantScrapeNextDataSchema,
} from "~/schemas/external-api";
import { hasAddress } from "~/schemas/restaurants";

import type { ByLocationSchema } from "~/schemas/restaurants";

export async function locateRestaurants({
  c,
  queryParams,
}: {
  c: Context;
  queryParams: ByLocationSchema;
}) {
  const url = new URL(
    `${env<EnvSchema>(c).RESTAURANTS_API_BASE_URL}/restaurants/getLocations`,
  );

  const searchParams = new URLSearchParams({
    limit: "1000",
  });

  if (hasAddress(queryParams)) {
    searchParams.append("location", queryParams.address);
  } else {
    searchParams.append("lat", queryParams.latitude.toString());
    searchParams.append("long", queryParams.longitude.toString());
  }

  url.search = searchParams.toString();
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new HTTPExceptionWithJsonBody(500, {
      error: "Failed to fetch restaurants",
    });
  }

  const json = await res.json();

  const { success, issues, output } = safeParse(
    RestaurantsApiResponseSchema,
    json,
  );

  if (!success) {
    throw new ValidationException<typeof RestaurantsApiResponseSchema>(
      500,
      "Failed to parse restaurants response",
      issues,
    );
  }

  return output;
}

export async function scrapeRestaurant({
  c,
  slug,
}: {
  c: Context;
  slug: string;
}) {
  const url = new URL(
    `${env<EnvSchema>(c).RESTAURANT_SCRAPE_BASE_URL}/${slug}`,
  );

  const res = await fetch(url.toString());
  if (!res.ok) {
    switch (res.status) {
      case 404:
        throw new HTTPExceptionWithJsonBody(404, {
          error: "Restaurant not found",
        });
      default:
        throw new HTTPExceptionWithJsonBody(500, {
          error: "Failed to fetch restaurant",
        });
    }
  }

  const body = await res.text();

  const matches = body.match(
    /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/,
  );

  if (matches?.length !== 2) {
    throw new HTTPExceptionWithJsonBody(500, {
      error: "Failed to match __NEXT_DATA__",
    });
  }

  const { success, issues, output } = safeParse(
    RestaurantScrapeNextDataSchema,
    JSON.parse(matches[1]),
  );

  if (!success) {
    throw new ValidationException<typeof RestaurantScrapeNextDataSchema>(
      500,
      "Failed to parse __NEXT_DATA__",
      issues,
    );
  }

  return output;
}
