import {
  coerce,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  string,
} from "valibot";

import type { Output } from "valibot";

export const AddressSchema = object({
  address: string([
    minLength(1, "Address must be at least 1 character long"),
    maxLength(100, "Address must be at most 100 characters long"),
  ]),
});
export type AddressSchema = Output<typeof AddressSchema>;

export const CoordinatesSchema = object({
  latitude: coerce(
    number([
      minValue(-90, "Latitude must be between -90 and 90"),
      maxValue(90, "Latitude must be between -90 and 90"),
    ]),
    Number,
  ),
  longitude: coerce(
    number([
      minValue(-180, "Longitude must be between -180 and 180"),
      maxValue(180, "Longitude must be between -180 and 180"),
    ]),
    Number,
  ),
});
export type CoordinatesSchema = Output<typeof CoordinatesSchema>;
