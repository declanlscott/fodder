import {
  coerce,
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

export const LocateRestaurantsSchema = union(
  [
    object({
      address: string([
        minLength(1, "address must be at least 1 character long"),
        maxLength(100, "address must be at most 100 characters long"),
      ]),
    }),
    object({
      latitude: coerce(
        number([
          minValue(-90, "latitude must be between -90 and 90"),
          maxValue(90, "latitude must be between -90 and 90"),
        ]),
        Number,
      ),
      longitude: coerce(
        number([
          minValue(-180, "longitude must be between -180 and 180"),
          maxValue(180, "longitude must be between -180 and 180"),
        ]),
        Number,
      ),
    }),
  ],
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
