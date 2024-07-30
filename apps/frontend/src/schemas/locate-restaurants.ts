import { AddressSchema, CoordinatesSchema } from "@fodder/schemas";
import * as v from "valibot";

export const LocateRestaurantsSchema = v.variant("type", [
  v.object({ type: v.literal("address"), ...AddressSchema.entries }),
  v.object({ type: v.literal("coordinates"), ...CoordinatesSchema.entries }),
]);

export type LocateRestaurantsSchema = v.InferOutput<
  typeof LocateRestaurantsSchema
>;

export const initialSearch = {
  type: "address",
  address: "",
} satisfies LocateRestaurantsSchema;
