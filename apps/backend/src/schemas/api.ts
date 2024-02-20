import {
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  safeParse,
  string,
  union,
} from "valibot";

import { ValidationException } from "~/lib/exceptions";

import type { ValidationTargets } from "hono";
import type { Output } from "valibot";

export const LocateRestaurantsSchema = union([
  object({
    address: string("address query parameter is required", [
      minLength(1),
      maxLength(100),
    ]),
  }),
  object({
    latitude: number("latitude query parameter is required", [
      minValue(-90),
      maxValue(90),
    ]),
    longitude: number("longitude query parameter is required", [
      minValue(-180),
      maxValue(180),
    ]),
  }),
]);

export type LocateRestaurantsSchema = Output<typeof LocateRestaurantsSchema>;

export const hasAddress = (
  query: LocateRestaurantsSchema,
): query is { address: string } => "address" in query;

export const hasCoordinates = (
  query: LocateRestaurantsSchema,
): query is { latitude: number; longitude: number } =>
  "latitude" in query && "longitude" in query;

export const SlugSchema = object({
  slug: string(),
});

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
