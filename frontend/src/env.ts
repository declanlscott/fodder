import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE",
  client: {
    VITE_API_BASE_URL: z.string().url(),
  },
  runtimeEnv: import.meta.env,
});
