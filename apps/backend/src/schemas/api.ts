import { AddressSchema, CoordinatesSchema } from "@repo/schemas";
import { object, safeParse, string, union } from "valibot";

import { ValidationException } from "~/lib/exceptions";

import type { ValidationTargets } from "hono";
import type { Output } from "valibot";

export const LocateRestaurantsSchema = union(
  [AddressSchema, CoordinatesSchema],
  "address or latitude/longitude query parameters are required",
);

export type LocateRestaurantsSchema = Output<typeof LocateRestaurantsSchema>;

export const hasAddress = (
  query: LocateRestaurantsSchema,
): query is { address: string } => "address" in query;

export const hasCoordinates = (
  query: LocateRestaurantsSchema,
): query is { latitude: number; longitude: number } =>
  "latitude" in query && "longitude" in query;

export const SlugSchema = object({ slug: string() });

export type SlugSchema = Output<typeof SlugSchema>;

export const validateSlug = (pathParams: ValidationTargets["param"]) => {
  const { success, issues, output } = safeParse(SlugSchema, pathParams);

  if (!success) {
    throw new ValidationException<typeof SlugSchema>(
      400,
      "Invalid path parameters",
      issues,
    );
  }

  return output;
};
