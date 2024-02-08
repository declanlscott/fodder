import { string, url } from "valibot";

import { createEnv } from "~/lib/vendor/env";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_API_BASE_URL: string([url()]),
  },
  runtimeEnv: import.meta.env,
});
