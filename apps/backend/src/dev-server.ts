import { serve } from "@hono/node-server";

import api from "./index";

const port = 8787;
console.log(`Server running at http://localhost:${port}`);

serve({ fetch: api.fetch, port });
