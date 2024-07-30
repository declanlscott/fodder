import { AddressSchema, CoordinatesSchema } from "@fodder/schemas";
import * as v from "valibot";

import { ValidationException } from "~/lib/exceptions";

import type { ValidationTargets } from "hono";

export const LocateRestaurantsSchema = v.union(
  [AddressSchema, CoordinatesSchema],
  "address or latitude/longitude query parameters are required",
);

export type LocateRestaurantsSchema = v.InferOutput<
  typeof LocateRestaurantsSchema
>;

export const hasAddress = (
  query: LocateRestaurantsSchema,
): query is { address: string } => "address" in query;

export const hasCoordinates = (
  query: LocateRestaurantsSchema,
): query is { latitude: number; longitude: number } =>
  "latitude" in query && "longitude" in query;

export const SlugSchema = v.object({ slug: v.string() });

export type SlugSchema = v.InferOutput<typeof SlugSchema>;

export const validateSlug = (pathParams: ValidationTargets["param"]) => {
  const { success, issues, output } = v.safeParse(SlugSchema, pathParams);

  if (!success)
    throw new ValidationException<typeof SlugSchema>(
      400,
      "Invalid path parameters",
      issues,
    );

  return output;
};
