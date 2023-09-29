import { env } from "env";
import ky from "ky";

import { LocateSchema } from "~/lib/schemas";
import { Restaurant } from "~/lib/types";

export async function locate(values: LocateSchema) {
  const restaurants = await ky(`${env.VITE_API_BASE_URL}/restaurants`, {
    searchParams: {
      ...(values.location.type === "address"
        ? { address: values.location.address }
        : {
            latitude: values.location.latitude,
            longitude: values.location.longitude,
          }),
      radius: values.radius,
    },
  }).json<Restaurant[]>();

  return restaurants;
}
