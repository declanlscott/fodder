import { useCallback, useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { Dessert, Loader2, MapPin, MapPinOff, Send } from "lucide-react";
import { safeParse } from "valibot";

import { DroppedCone } from "~/components/dropped-cone";
import { ErrorCard } from "~/components/error-card";
import { FodCard, FodCardSkeleton } from "~/components/fod-card";
import { useGeolocation } from "~/hooks/geolocation";
import { queryOptionsFactory } from "~/lib/query-options-factory";
import { LocateRestaurantsSchema } from "~/schemas/locate-restaurants";

import type { Coordinates } from "~/hooks/geolocation";

const route = getRouteApi("/");

export function Component() {
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

function LocateForm() {
  const search = route.useSearch();

  const [formData, setFormData] = useState(search);
  const [error, setError] = useState<string | null>(null);

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
    () => setFormData({ type: "address", address: "" }),
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

  const query = useQuery(queryOptionsFactory.restaurants(search));

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { output, success, issues } = safeParse(
      LocateRestaurantsSchema,
      formData,
    );

    if (!success) {
      setError(issues.map((issue) => issue.message).join(", "));
      return;
    }

    setError(null);

    await navigate({ search: output });

    await query.refetch();
  }

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
                <label className={cn(labelVariants())} htmlFor="location">
                  City, State, or ZIP code
                </label>

                <Label htmlFor="geolocate" className="w-10 text-center">
                  GPS
                </Label>
              </div>

              <div className="flex justify-between">
                <Input
                  id="location"
                  className="shrink"
                  value={formData.type === "address" ? formData.address : ""}
                  onChange={(e) => {
                    setFormData({
                      type: "address",
                      address: e.target.value,
                    });
                  }}
                  onFocus={() => setGpsEnabled(false)}
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
                    geolocation.status === "error"
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

            {error ? <p className="text-sm text-red-500">{error}</p> : null}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-6">
          <Button
            className="w-full gap-2"
            type="submit"
            disabled={
              query.isFetching ||
              (gpsEnabled && geolocation.status !== "success")
            }
          >
            {query.isFetching ? (
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
        </CardFooter>
      </Card>
    </form>
  );
}

function LocatedFods() {
  const search = route.useSearch();

  const query = useQuery(queryOptionsFactory.restaurants(search));

  if (query.isFetching) {
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