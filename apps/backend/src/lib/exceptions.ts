import { HTTPException } from "hono/http-exception";
import { flatten } from "valibot";

import type { StatusCode } from "hono/utils/http-status";
import type { BaseSchema, SchemaIssues } from "valibot";

export class ValidationException<
  Schema extends BaseSchema,
> extends HTTPException {
  constructor(
    statusCode: StatusCode,
    errorMessage: string,
    issues: SchemaIssues,
  ) {
    super(statusCode, {
      res: new Response(
        JSON.stringify({
          error: errorMessage,
          reasons: flatten<Schema>(issues),
        }),
        {
          status: statusCode,
          headers: new Headers({
            "Content-Type": "application/json",
          }),
        },
      ),
    });
  }
}
