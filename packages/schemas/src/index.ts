import * as v from "valibot";

export const AddressSchema = v.object({
  address: v.pipe(
    v.string(),
    v.minLength(1, "Address must be at least 1 character long"),
    v.maxLength(100, "Address must be at most 100 characters long"),
  ),
});
export type AddressSchema = v.InferOutput<typeof AddressSchema>;

export const CoordinatesSchema = v.object({
  latitude: v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.minValue(-90, "Latitude must be between -90 and 90"),
    v.maxValue(90, "Latitude must be between -90 and 90"),
  ),
  longitude: v.pipe(
    v.union([v.string(), v.number()]),
    v.transform(Number),
    v.minValue(-180, "Longitude must be between -180 and 180"),
    v.maxValue(180, "Longitude must be between -180 and 180"),
  ),
});
export type CoordinatesSchema = v.InferOutput<typeof CoordinatesSchema>;
