/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HTTPException } from "hono/http-exception";
import { safeParse } from "valibot";

import { ValidationException } from "~/lib/exceptions";

import type { BaseSchema } from "valibot";

export function parseJson<TSchema extends BaseSchema>(
  schema: TSchema,
  json: unknown,
) {
  const { success, issues, output } = safeParse(schema, json);

  if (!success) {
    throw new ValidationException<TSchema>(500, "Failed to parse json", issues);
  }

  return output;
}

export function parseNextData<TSchema extends BaseSchema>(
  schema: TSchema,
  body: string,
) {
  const matches = body.match(
    /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/,
  );

  if (matches?.length !== 2) {
    throw new HTTPException(500, {
      message: "Failed to match __NEXT_DATA__",
    });
  }

  const json = JSON.parse(matches[1]);

  return parseJson<TSchema>(schema, json);
}
