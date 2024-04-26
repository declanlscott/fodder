import { useCallback, useRef, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
  Input,
  Label,
  labelVariants,
  Toggle,
} from "@repo/ui";
import { useIsFetching, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Dessert, Loader2, MapPin, MapPinOff, Send } from "lucide-react";
import { isDeepEqual } from "remeda";
import { fallback, parse, safeParse } from "valibot";

import { DroppedCone } from "~/components/dropped-cone";
import { ErrorCard } from "~/components/error-card";
import { FodCard, FodCardSkeleton } from "~/components/fod-card";
import { NotFound } from "~/components/not-found";
import { useGeolocation } from "~/hooks/geolocation";
import { queryOptionsFactory } from "~/lib/query-options-factory";
import {
  initialSearch,
  LocateRestaurantsSchema,
} from "~/schemas/locate-restaurants";

import type { SchemaIssues } from "valibot";
import type { Coordinates } from "~/hooks/geolocation";

export const Route = createFileRoute("/")({
  validateSearch: (search) =>
    parse(fallback(LocateRestaurantsSchema, initialSearch), search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, context: { queryClient } }) => {
    if (isDeepEqual(search, initialSearch)) {
      return;
    }

    await queryClient.ensureQueryData(queryOptionsFactory.restaurants(search));
  },
  component: () => <Component />,
  pendingComponent: () => <Component />,
  notFoundComponent: () => <NotFound />,
});

function Component() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div className="col-span-1">
        <LocateForm />
      </div>

      <div className="col-span-1 lg:col-span-2 xl:col-span-3">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <LocatedFods />
        </div>
      </div>
    </div>
  );
}

type FormErrors = SchemaIssues | undefined;

function LocateForm() {
  const isRoutePending = !!Route.useMatch().isFetching;

  const search = Route.useSearch();

  const [formData, setFormData] = useState(search);
  const [formErrors, setFormErrors] = useState<FormErrors>();

  const gpsSuccessCallback = useCallback(
    (coordinates: Coordinates) =>
      setFormData({
        type: "coordinates",
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }),
    [setFormData],
  );

  const gpsErrorCallback = useCallback(
    () => setFormData(initialSearch),
    [setFormData],
  );

  const {
    geolocation,
    enabled: gpsEnabled,
    setEnabled: setGpsEnabled,
  } = useGeolocation({
    successCallback: gpsSuccessCallback,
    errorCallback: gpsErrorCallback,
    initiallyEnabled: search.type === "coordinates",
  });

  const isFetching =
    useIsFetching({
      queryKey: [queryOptionsFactory.restaurants(search).queryKey[0]],
    }) > 0;

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { output, success, issues } = safeParse(
      LocateRestaurantsSchema,
      formData,
    );

    setFormErrors(issues);

    if (!success) {
      if (hasError(issues, "address")) {
        return inputRef.current?.focus();
      }

      return;
    }

    await navigate({ search: output });
  }

  function hasError(formErrors: FormErrors, key: string) {
    return formErrors?.some((issue) => issue.path?.[0].key === key);
  }

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Locate</CardTitle>

          <CardDescription>Find your Flavor Of The Day.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label
                  className={cn(
                    labelVariants(),
                    hasError(formErrors, "address") && "text-red-500",
                  )}
                  htmlFor="location"
                >
                  City, State, or ZIP code
                </label>

                <Label htmlFor="geolocate" className="w-10 text-center">
                  GPS
                </Label>
              </div>

              <div className="flex justify-between">
                <Input
                  id="location"
                  className={cn(
                    "shrink",
                    hasError(formErrors, "address") &&
                      "border-red-500 focus-visible:ring-red-500 text-red-500",
                  )}
                  value={formData.type === "address" ? formData.address : ""}
                  onChange={(e) => {
                    setFormData({
                      type: "address",
                      address: e.target.value,
                    });
                  }}
                  onFocus={() => setGpsEnabled(false)}
                  ref={inputRef}
                  disabled={isRoutePending}
                />

                <div className="before:bg-muted-foreground/50 after:bg-muted-foreground/50 mx-4 flex h-10 w-4 shrink-0 select-none flex-col items-center gap-1 whitespace-nowrap text-xs uppercase before:h-full before:w-0.5 before:flex-grow after:h-full after:w-0.5 after:flex-grow">
                  or
                </div>

                <Toggle
                  id="geolocate"
                  variant="outline"
                  pressed={gpsEnabled}
                  onPressedChange={(pressed) => {
                    setGpsEnabled(pressed);

                    setFormData((prev) =>
                      pressed ? prev : { type: "address", address: "" },
                    );
                  }}
                  disabled={
                    geolocation.status === "loading" ||
                    geolocation.status === "error" ||
                    isRoutePending
                  }
                  className="h-10 w-10 shrink-0 p-0"
                  aria-label={`GPS ${gpsEnabled ? "" : "un"}toggled`}
                >
                  {geolocation.status === "ready" ||
                  geolocation.status === "error" ? (
                    <MapPinOff />
                  ) : geolocation.status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : gpsEnabled ? (
                    <MapPin />
                  ) : (
                    <MapPinOff />
                  )}
                </Toggle>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-6">
          <Button
            className="w-full gap-2"
            type="submit"
            disabled={
              isFetching ||
              (gpsEnabled && geolocation.status !== "success") ||
              isRoutePending
            }
          >
            {isFetching || isRoutePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Send />
                Submit
              </>
            )}
          </Button>

          {formErrors ? (
            <ul className="flex flex-col gap-2 self-start">
              {formErrors.map(({ message }, index) => (
                <li key={index} className="text-sm text-red-500">
                  {message}
                </li>
              ))}
            </ul>
          ) : null}
        </CardFooter>
      </Card>
    </form>
  );
}

function LocatedFods() {
  const { isFetching: isRoutePending } = Route.useMatch();

  const search = Route.useSearch();

  const query = useQuery(queryOptionsFactory.restaurants(search));
  const isFetching =
    useIsFetching({
      queryKey: [queryOptionsFactory.restaurants(search).queryKey[0]],
    }) > 0;

  if (isFetching || isRoutePending) {
    return Array.from({ length: 3 }).map((_, index) => (
      <FodCardSkeleton key={index} />
    ));
  }

  if (query.isError) {
    return <ErrorCard className="col-span-full" />;
  }

  if (!query.data) {
    return (
      <Card className="text-muted-foreground col-span-full flex h-64 flex-col items-center justify-center gap-4">
        <Dessert className="text-muted-foreground h-28 w-28" />
        Nothing here yet...
      </Card>
    );
  }

  if (query.data.length === 0) {
    return (
      <Card className="text-muted-foreground col-span-full flex h-64 flex-col items-center justify-center gap-4">
        <DroppedCone className="fill-muted-foreground h-28" />
        No locations found...
      </Card>
    );
  }

  return query.data.map((restaurant) => (
    <FodCard key={restaurant.slug} restaurant={restaurant} />
  ));
}
