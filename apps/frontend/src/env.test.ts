import { env } from "env";
import { expect, test } from "vitest";

test("Validate environment variables", () => {
  Object.keys(env).forEach((key) => {
    expect(env[key as keyof typeof env]).toBeDefined();
  });
});
