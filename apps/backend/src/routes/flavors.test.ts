import { describe, expect, test } from "vitest";

import flavors from "~/routes/flavors";

import type { AllFlavors, SluggedFlavor } from "@repo/types";
import type { Bindings } from "~/types/env";

const env = getMiniflareBindings() satisfies Bindings;

describe("/flavors", () => {
  const mockAgent = getMiniflareFetchMock();
  mockAgent.disableNetConnect();

  const mockPool = mockAgent.get(new URL(env.EXTERNAL_API_BASE_URL).origin);

  const flavorsInterceptor = mockPool.intercept({
    method: "GET",
    path: "flavor-of-the-day",
  });

  flavorsInterceptor.reply(
    200,
    `<html><body><div id="__next"></div><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"page":{"zones":{"Content":[{"moduleName":"FlavorOfTheDayAllFlavors","customData":{"flavors":[{"idFlavor":1,"idMenuItem":1,"longFlavorName":"Vanilla Custard","flavorName":"Vanilla","flavorCategories":[{"id":1,"name":"Classic"}],"flavorNameLocalized":null,"fotdImage":"img-Vanilla.png","fotdUrlSlug":"vanilla","flavorNameSpanish":null,"fotdDescriptionSpanish":null},{"idFlavor":2,"idMenuItem":2,"longFlavorName":"Chocolate Custard","flavorName":"Chocolate","flavorCategories":[{"id":1,"name":"Classic"}],"flavorNameLocalized":null,"fotdImage":"img-Chocolate.png","fotdUrlSlug":"chocolate","flavorNameSpanish":null,"fotdDescriptionSpanish":null},{"idFlavor":3,"idMenuItem":3,"longFlavorName":"Strawberry Custard","flavorName":"Strawberry","flavorCategories":[{"id":1,"name":"Classic"}],"flavorNameLocalized":null,"fotdImage":"img-Strawberry.png","fotdUrlSlug":"strawberry","flavorNameSpanish":null,"fotdDescriptionSpanish":null}]}}]}}}}}</script></body></html>`,
  );

  test("GET /", async () => {
    const res = await flavors.request("/", { method: "GET" }, env);

    const received = await res.json();

    const expected = [
      {
        name: "Vanilla",
        imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/img-Vanilla.png?w=400`,
        slug: "vanilla",
      },
      {
        name: "Chocolate",
        imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/img-Chocolate.png?w=400`,
        slug: "chocolate",
      },
      {
        name: "Strawberry",
        imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/img-Strawberry.png?w=400`,
        slug: "strawberry",
      },
    ] satisfies AllFlavors;

    expect(res.status).toEqual(200);
    expect(received).toEqual(expected);
  });

  const slug = "chocolate";
  const flavorInterceptor = mockPool.intercept({
    method: "GET",
    path: `flavor-of-the-day/${slug}`,
  });

  flavorInterceptor.reply(
    200,
    `<html><body><div id="__next"></div><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"page":{"customData":{"flavorDetails":{"idFlavor":1,"idMenuItem":1,"slug":"chocolate","name":"Chocolate Custard","description":"Delicious chocolate custard.","fotdImage":"img-Chocolate.png","allergens":"Egg, Milk","ingredients":[{"id":1,"title":"Chocolate Custard","subIngredients":"Milk, Cream, Sugar, Egg Yolk, Cocoa Powder, Vanilla Extract, Salt"}],"flavorCategories":[{"id":1,"name":"Chocolate"}]}}}}}}</script></body></html>`,
  );

  test("GET /:slug", async () => {
    const res = await flavors.request(`/${slug}`, { method: "GET" }, env);

    const received = await res.json();

    const expected = {
      name: "Chocolate Custard",
      description: "Delicious chocolate custard.",
      imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/img-Chocolate.png`,
      allergens: ["Egg", "Milk"],
    } satisfies SluggedFlavor;

    expect(res.status).toEqual(200);
    expect(received).toEqual(expected);
  });

  const badSlug = "not-a-flavor";
  const badSlugFlavorInterceptor = mockPool.intercept({
    method: "GET",
    path: `flavor-of-the-day/${badSlug}`,
  });

  badSlugFlavorInterceptor.reply(
    200,
    `<html><body><div id="__next"></div><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"page":{"customData":{"flavorDetails":{}}}}}}</script></body></html>`,
  );

  test("GET /:slug (bad slug)", async () => {
    const res = await flavors.request(`/${badSlug}`, { method: "GET" }, env);

    const received = await res.text();

    const expected = "Flavor not found";

    expect(res.status).toEqual(404);
    expect(received).toEqual(expected);
  });
});
