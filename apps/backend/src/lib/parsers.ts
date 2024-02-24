/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { safeParse } from "valibot";

import {
  HTTPExceptionWithJsonBody,
  ValidationException,
} from "~/lib/exceptions";

import type { BaseSchema } from "valibot";

export function parseJson<TSchema extends BaseSchema>({
  schema,
  json,
}: {
  schema: TSchema;
  json: unknown;
}) {
  const { success, issues, output } = safeParse(schema, json);

  if (!success) {
    throw new ValidationException<TSchema>(500, "Failed to parse json", issues);
  }

  return output;
}

export function parseNextData<TSchema extends BaseSchema>({
  schema,
  body,
}: {
  schema: TSchema;
  body: string;
}) {
  const matches = body.match(
    /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/,
  );

  if (matches?.length !== 2) {
    throw new HTTPExceptionWithJsonBody(500, {
      error: "Failed to match __NEXT_DATA__",
    });
  }

  const json = JSON.parse(matches[1]);

  return parseJson<TSchema>({ schema, json });
}
