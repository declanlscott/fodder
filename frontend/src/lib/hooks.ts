import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { getFlavor, getFlavors, getRestaurant, locate } from "~/lib/requests";
import { LocateSchema } from "~/lib/schemas";
import { RestaurantsData } from "~/lib/types";

export function useGeolocation(
  options: PositionOptions,
  initiallyEnabled = false,
) {
  const [enabled, setEnabled] = useState(initiallyEnabled);

  const [geolocation, setGeolocation] = useState<
    | { status: "ready" }
    | { status: "loading" }
    | {
        status: "success";
        position: GeolocationPosition;
      }
    | {
        status: "error";
        error: GeolocationPositionError;
      }
  >({ status: "ready" });

  const optionsRef = useRef(options);

  useEffect(() => {
    const onEvent = (position: GeolocationPosition) => {
      setGeolocation({
        status: "success",
        position,
      });
    };

    const onEventError = (error: GeolocationPositionError) => {
      setGeolocation({
        status: "error",
        error,
      });
    };

    if (enabled) {
      setGeolocation({
        status: "loading",
      });

      navigator.geolocation.getCurrentPosition(
        onEvent,
        onEventError,
        optionsRef.current,
      );

      const watchId = navigator.geolocation.watchPosition(
        onEvent,
        onEventError,
        optionsRef.current,
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [enabled]);

  return { geolocation, enabled, setEnabled };
}

export function useLockBody() {
  useLayoutEffect((): (() => void) => {
    const originalStyle: string = window.getComputedStyle(
      document.body,
    ).overflow;

    document.body.style.overflow = "hidden";

    return () => (document.body.style.overflow = originalStyle);
  }, []);
}

export function useLocate() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["restaurants"],
    mutationFn: locate,
    onSuccess: (restaurants, data) => {
      queryClient.setQueryData(["restaurants", data], restaurants);
      queryClient.setQueryData(["restaurants"], restaurants);
    },
    onError: () => {
      queryClient.removeQueries({ queryKey: ["restaurants"], exact: true });
    },
  });

  function onSubmit(data: LocateSchema) {
    if (!mutation.isLoading) {
      const cache = queryClient.getQueryData<RestaurantsData>([
        "restaurants",
        data,
      ]);

      if (cache) {
        // cache hit
        queryClient.setQueryData(["restaurants"], cache);
      } else {
        // cache miss
        mutation.mutate(data);
      }
    }
  }

  return { mutation, onSubmit };
}

export function useRestaurants() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["restaurants"],
    queryFn: ({ queryKey }) => {
      const restaurants =
        queryClient.getQueryData<RestaurantsData>(queryKey) ?? null;

      return restaurants;
    },
  });

  return query;
}

export function useRestaurant(slug: string) {
  const query = useQuery({
    queryKey: ["restaurant", slug],
    queryFn: () => getRestaurant(slug),
  });

  return query;
}

export function useFlavors() {
  const query = useQuery({
    queryKey: ["flavors"],
    queryFn: getFlavors,
  });

  return query;
}

export function useFlavor(slug: string) {
  const query = useQuery({
    queryKey: ["flavor", slug],
    queryFn: () => getFlavor(slug),
  });

  return query;
}
