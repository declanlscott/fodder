import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";

import { parseJson, parseNextData } from "~/lib/parsers";
import { hasAddress } from "~/schemas/api";
import {
  FetchedRestaurants,
  ScrapedAllFlavorsNextData,
  ScrapedFlavorNextData,
  ScrapedRestaurantNextData,
} from "~/schemas/external-api";

import type { Context } from "hono";
import type { LocateRestaurantsSchema } from "~/schemas/api";
import type { Bindings } from "~/types/env";

export async function fetchRestaurants({
  c,
  queryParams,
}: {
  c: Context<{ Bindings: Bindings }>;
  queryParams: LocateRestaurantsSchema;
}): Promise<FetchedRestaurants> {
  const url = new URL(
    `${env(c).EXTERNAL_API_BASE_URL}/restaurants/getLocations`,
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
    throw new HTTPException(500, {
      message: "Failed to fetch restaurants",
    });
  }

  const json = await res.json();

  return parseJson({
    schema: FetchedRestaurants,
    json,
  });
}

export async function scrapeRestaurantBySlug({
  c,
  slug,
}: {
  c: Context<{ Bindings: Bindings }>;
  slug: string;
}): Promise<ScrapedRestaurantNextData> {
  const url = new URL(`${env(c).RESTAURANT_SCRAPE_BASE_URL}/${slug}`);

  const res = await fetch(url.toString());
  if (!res.ok) {
    switch (res.status) {
      case 404:
        throw new HTTPException(404, {
          message: "Restaurant not found",
        });
      default:
        throw new HTTPException(500, {
          message: "Failed to fetch restaurant",
        });
    }
  }

  const body = await res.text();

  return parseNextData({
    schema: ScrapedRestaurantNextData,
    body,
  });
}

export async function scrapeAllFlavors({
  c,
}: {
  c: Context<{ Bindings: Bindings }>;
}) {
  const url = new URL(`${env(c).FLAVORS_SCRAPE_BASE_URL}`);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new HTTPException(500, {
      message: "Failed to fetch flavors",
    });
  }

  const body = await res.text();

  return parseNextData({
    schema: ScrapedAllFlavorsNextData,
    body,
  });
}

export async function scrapeFlavorBySlug({
  c,
  slug,
}: {
  c: Context<{ Bindings: Bindings }>;
  slug: string;
}): Promise<ScrapedFlavorNextData> {
  const url = new URL(`${env(c).FLAVORS_SCRAPE_BASE_URL}/${slug}`);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new HTTPException(500, {
      message: "Failed to fetch flavor",
    });
  }

  const body = await res.text();

  return parseNextData({
    schema: ScrapedFlavorNextData,
    body,
  });
}
