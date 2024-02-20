import {
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  string,
  union,
} from "valibot";

import type { Output } from "valibot";

export const ByLocationSchema = union([
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

export type ByLocationSchema = Output<typeof ByLocationSchema>;

export const hasAddress = (
  query: ByLocationSchema,
): query is { address: string } => "address" in query;

export const hasCoordinates = (
  query: ByLocationSchema,
): query is { latitude: number; longitude: number } =>
  "latitude" in query && "longitude" in query;

export const BySlugSchema = object({
  slug: string(),
});

export type BySlugSchema = Output<typeof BySlugSchema>;
