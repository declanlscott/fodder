import { AddressSchema, CoordinatesSchema } from "@repo/schemas";
import { literal, merge, object, variant } from "valibot";

import type { Output } from "valibot";

export const LocateRestaurantsSchema = variant("type", [
  merge([object({ type: literal("address") }), AddressSchema]),
  merge([object({ type: literal("coordinates") }), CoordinatesSchema]),
]);

export type LocateRestaurantsSchema = Output<typeof LocateRestaurantsSchema>;
