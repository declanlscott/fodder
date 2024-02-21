import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Label, labelVariants } from "@repo/ui/components/label";
import { Toggle } from "@repo/ui/components/toggle";
import { cn } from "@repo/ui/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Loader2, MapPin, MapPinOff, Send } from "lucide-react";

import { useGeolocation } from "~/hooks/geolocation";
import { queryOptionsFactory } from "~/lib/query-options-factory";
import { LocateFormSchema } from "~/schemas/locate-form";

import type { Coordinates } from "~/hooks/geolocation";

export function LocateForm() {
  const form = useForm<LocateFormSchema>({
    resolver: valibotResolver(LocateFormSchema),
    defaultValues: {
      location: {
        type: "address",
        address: "",
      },
    },
  });

  const gpsSuccessCallback = useCallback(
    (coordinates: Coordinates) => {
      form.setValue("location.latitude", coordinates.latitude);
      form.setValue("location.longitude", coordinates.longitude);
    },
    [form],
  );

  const gpsErrorCallback = useCallback(() => {
    form.resetField("location", {
      defaultValue: { type: "address", address: "" },
    });
  }, [form]);

  const {
    geolocation,
    enabled: gpsEnabled,
    setEnabled: setGpsEnabled,
  } = useGeolocation({
    successCallback: gpsSuccessCallback,
    errorCallback: gpsErrorCallback,
  });

  const mutation = useMutation(queryOptionsFactory.restaurants.mutation());
  const queryClient = useQueryClient();

  function handleGpsPressed(pressed: boolean) {
    setGpsEnabled(pressed);

    form.resetField("location", {
      defaultValue: pressed
        ? { type: "coordinates", latitude: 0, longitude: 0 }
        : { type: "address", address: "" },
    });
  }

  function onSubmit(data: LocateFormSchema) {
    if (!mutation.isPending) {
      mutation.mutate(data, {
        onSuccess: (data) => {
          queryClient.setQueryData(queryOptionsFactory.restaurants.key, data);
        },
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Locate</CardTitle>

            <CardDescription>Find your Flavor Of The Day.</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="location.address"
                defaultValue=""
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between">
                      <FormLabel
                        className={cn(labelVariants())}
                        htmlFor="location"
                      >
                        City, State, or ZIP code
                      </FormLabel>

                      <Label htmlFor="geolocate" className="w-10 text-center">
                        GPS
                      </Label>
                    </div>

                    <div className="flex justify-between">
                      <FormControl>
                        <Input
                          {...field}
                          id="location"
                          disabled={gpsEnabled}
                          className="shrink"
                        />
                      </FormControl>

                      <div className="before:bg-muted-foreground/50 after:bg-muted-foreground/50 mx-4 flex h-10 w-4 shrink-0 select-none flex-col items-center gap-1 whitespace-nowrap text-xs uppercase before:h-full before:w-0.5 before:flex-grow after:h-full after:w-0.5 after:flex-grow">
                        or
                      </div>

                      <Toggle
                        id="geolocate"
                        variant="outline"
                        pressed={gpsEnabled}
                        onPressedChange={handleGpsPressed}
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

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-6">
            <Button
              className="w-full gap-2"
              type="submit"
              disabled={
                !form.formState.isValid ||
                mutation.isPending ||
                (gpsEnabled && geolocation.status !== "success")
              }
            >
              {mutation.isPending ? (
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

            {mutation.isError ? (
              <div className="text-destructive flex items-center gap-4 self-start">
                <Ban />
                <p className="text-sm font-medium">Something went wrong...</p>
              </div>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}