import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
        position: {
          ...position,
          coords: {
            ...position.coords,
            latitude: parseFloat(position.coords.latitude.toFixed(2)),
            longitude: parseFloat(position.coords.longitude.toFixed(2)),
          },
        },
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

export function useTitle(
  props: { title?: string; isLoading?: boolean } = { isLoading: false },
) {
  const { title, isLoading } = props;

  const appName = "Fodder";

  useEffect(() => {
    if (isLoading) {
      document.title = `Loading... | ${appName}`;
    } else if (title) {
      document.title = `${title} | ${appName}`;
    }

    return () => {
      document.title = appName;
    };
  }, [title, isLoading]);
}
