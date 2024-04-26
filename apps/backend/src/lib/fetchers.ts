import { HTTPException } from "hono/http-exception";
import { env } from "env";

import { parseJson, parseNextData } from "~/lib/parsers";
import { hasAddress } from "~/schemas/api";
import {
  FetchedRestaurants,
  ScrapedAllFlavorsNextData,
  ScrapedFlavorNextData,
  ScrapedRestaurantNextData,
} from "~/schemas/external-api";

import type { LocateRestaurantsSchema } from "~/schemas/api";

export async function fetchRestaurants(
  queryParams: LocateRestaurantsSchema,
): Promise<FetchedRestaurants> {
  const url = new URL(`${env.EXTERNAL_API_BASE_URL}/restaurants/getLocations`);

  const searchParams = new URLSearchParams({
    limit: "10",
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

  return parseJson(FetchedRestaurants, json);
}

export async function scrapeRestaurantBySlug(
  slug: string,
): Promise<ScrapedRestaurantNextData> {
  const url = new URL(`${env.RESTAURANT_SCRAPE_BASE_URL}/${slug}`);

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

  return parseNextData(ScrapedRestaurantNextData, body);
}

export async function scrapeAllFlavors() {
  const url = new URL(`${env.FLAVORS_SCRAPE_BASE_URL}`);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new HTTPException(500, {
      message: "Failed to fetch flavors",
    });
  }

  const body = await res.text();

  return parseNextData(ScrapedAllFlavorsNextData, body);
}

export async function scrapeFlavorBySlug(
  slug: string,
): Promise<ScrapedFlavorNextData> {
  const url = new URL(`${env.FLAVORS_SCRAPE_BASE_URL}/${slug}`);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new HTTPException(500, {
      message: "Failed to fetch flavor",
    });
  }

  const body = await res.text();

  return parseNextData(ScrapedFlavorNextData, body);
}
