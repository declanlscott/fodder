import { useEffect, useRef, useState } from "react";

export type Coordinates = Pick<
  GeolocationCoordinates,
  "latitude" | "longitude"
>;

export type UseGeolocationProps = {
  options?: PositionOptions;
  initiallyEnabled?: boolean;
  successCallback: (coordinates: Coordinates) => void;
  errorCallback: () => void;
};

export function useGeolocation({
  options = {},
  initiallyEnabled = false,
  successCallback,
  errorCallback,
}: UseGeolocationProps) {
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
      const latitude = parseFloat(position.coords.latitude.toFixed(2));
      const longitude = parseFloat(position.coords.longitude.toFixed(2));

      setGeolocation({
        status: "success",
        position: {
          ...position,
          coords: {
            ...position.coords,
            latitude,
            longitude,
          },
        },
      });

      successCallback({ latitude, longitude });
    };

    const onEventError = (error: GeolocationPositionError) => {
      setGeolocation({
        status: "error",
        error,
      });

      errorCallback();
    };

    let watchId: number;

    if (enabled) {
      setGeolocation({
        status: "loading",
      });

      navigator.geolocation.getCurrentPosition(
        onEvent,
        onEventError,
        optionsRef.current,
      );

      watchId = navigator.geolocation.watchPosition(
        onEvent,
        onEventError,
        optionsRef.current,
      );
    }

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled, successCallback, errorCallback]);

  return { geolocation, enabled, setEnabled };
}
