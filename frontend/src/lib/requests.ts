import { env } from "env";
import ky from "ky";

import { LocateSchema } from "~/lib/schemas";
import { Restaurant } from "~/lib/types";

export async function locate(data: LocateSchema) {
  const res = await ky(`${env.VITE_API_BASE_URL}/restaurants`, {
    searchParams: {
      ...(data.location.type === "address"
        ? { address: data.location.address }
        : {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
          }),
      radius: data.radius,
    },
  });

  if (res.status === 204) {
    return [];
  }

  const restaurants = await res.json<Restaurant[]>();

  return restaurants;
}
