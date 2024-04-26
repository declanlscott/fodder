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

  // NOTE: I don't know what happened, but their API has become inconsistent and sometimes
  // returns 0 results so I give it up to half a dozen attempts before giving up. I hope this
  // hack is only temporary. This isn't ideal if the location really is empty because it will
  // take all 6 attempts to realize that.
  const attempts = 6;
  let data = {} as FetchedRestaurants;
  let res: Response;
  let json: unknown;
  for (let i = 0; i < attempts; i++) {
    res = await fetch(url.toString());

    if (!res.ok)
      throw new HTTPException(500, {
        message: "Failed to fetch restaurants",
      });

    json = await res.json();

    data = parseJson(FetchedRestaurants, json);

    const totalResults = data.data.totalResults;
    if (totalResults > 0) {
      console.log(`✅ Success on attempt ${i}, ${totalResults} results found`);
      break;
    } else {
      console.log(`❌ Failed on attempt ${i}, no results found`);
    }
  }

  if (data.data.totalResults === 0) {
    throw new HTTPException(404, {
      message: "No restaurants found",
    });
  }

  return data;
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
