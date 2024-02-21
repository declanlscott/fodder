import {
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  string,
  variant,
} from "valibot";

import type { Output } from "valibot";

export const LocateFormSchema = object({
  location: variant("type", [
    object({
      type: literal("address"),
      address: string([
        minLength(1, "Needs to be at least 1 character."),
        maxLength(100, "Needs to be at most 100 characters."),
      ]),
    }),
    object({
      type: literal("coordinates"),
      latitude: number([minValue(-90), maxValue(90)]),
      longitude: number([minValue(-180), maxValue(180)]),
    }),
  ]),
});

export type LocateFormSchema = Output<typeof LocateFormSchema>;
