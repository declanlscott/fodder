import { Ban, Loader2, MapPin, MapPinOff, Send } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "~/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/Form";
import { Input } from "~/components/ui/Input";
import { Label, labelVariants } from "~/components/ui/Label";
import { Toggle } from "~/components/ui/Toggle";
import { useGeolocation, useLocate } from "~/lib/hooks";
import { LocateSchema, locateSchema } from "~/lib/schemas";
import { cn } from "~/lib/utils";

export function LocateCard() {
  const form = useForm<LocateSchema>({
    resolver: zodResolver(locateSchema),
    defaultValues: {
      location: {
        type: "address",
        address: "",
      },
    },
  });

  const {
    geolocation,
    enabled: gpsEnabled,
    setEnabled: setGpsEnabled,
  } = useGeolocation({});

  const { mutation, onSubmit } = useLocate();

  function handleGpsPressed(pressed: boolean) {
    setGpsEnabled(pressed);

    form.resetField("location", {
      defaultValue: pressed
        ? { type: "coordinates", latitude: 0, longitude: 0 }
        : { type: "address", address: "" },
    });
  }

  useEffect(() => {
    if (gpsEnabled && geolocation.status === "success") {
      form.setValue("location.latitude", geolocation.position.coords.latitude);
      form.setValue(
        "location.longitude",
        geolocation.position.coords.longitude,
      );
    } else if (geolocation.status === "error") {
      setGpsEnabled(false);

      form.resetField("location", {
        defaultValue: { type: "address", address: "" },
      });
    }
  }, [gpsEnabled, geolocation, form, setGpsEnabled]);

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

                      <div className="mx-4 flex h-10 w-4 shrink-0 select-none flex-col items-center gap-1 whitespace-nowrap text-xs uppercase before:h-full before:w-0.5 before:flex-grow before:bg-muted-foreground/50 after:h-full after:w-0.5 after:flex-grow after:bg-muted-foreground/50">
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
              <div className="flex items-center gap-4 self-start text-destructive">
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
