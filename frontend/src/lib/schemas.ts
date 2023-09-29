import { z } from "zod";

export const locateSchema = z.object({
  location: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("address"),
      address: z.string().nonempty().max(100),
    }),
    z.object({
      type: z.literal("coordinates"),
      latitude: z.number().gte(-90).lte(90),
      longitude: z.number().gte(-180).lte(180),
    }),
  ]),
  radius: z.number().int().gt(0).lte(100),
});

export type LocateSchema = z.infer<typeof locateSchema>;
