import { HTTPException } from "hono/http-exception";
import * as v from "valibot";

import { ValidationException } from "~/lib/exceptions";

export function parseJson<TSchema extends v.GenericSchema>(
  schema: TSchema,
  json: unknown,
) {
  const { success, issues, output } = v.safeParse(schema, json);

  if (!success)
    throw new ValidationException<TSchema>(500, "Failed to parse json", issues);

  return output;
}

export function parseNextData<TSchema extends v.GenericSchema>(
  schema: TSchema,
  body: string,
) {
  const matches =
    /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/.exec(
      body,
    );

  if (matches?.length !== 2)
    throw new HTTPException(500, {
      message: "Failed to match __NEXT_DATA__",
    });

  const json = JSON.parse(matches[1]) as unknown;

  return parseJson<TSchema>(schema, json);
}
