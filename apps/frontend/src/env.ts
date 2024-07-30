import { createEnv } from "@fodder/env";
import * as v from "valibot";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_API_BASE_URL: v.pipe(v.string(), v.url()),
  },
  runtimeEnv: import.meta.env,
});
