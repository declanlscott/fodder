import { createEnv } from "@repo/env";
import { string, url } from "valibot";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_API_BASE_URL: string([url()]),
  },
  runtimeEnv: import.meta.env,
});
