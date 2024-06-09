import { HTTPException } from "hono/http-exception";
import * as v from "valibot";

import type { StatusCode } from "hono/utils/http-status";

export class ValidationException<
  TSchema extends v.GenericSchema,
> extends HTTPException {
  constructor(
    statusCode: StatusCode,
    errorMessage: string,
    issues: [v.InferIssue<TSchema>, ...v.InferIssue<TSchema>[]],
  ) {
    super(statusCode, {
      res: new Response(
        JSON.stringify({
          error: errorMessage,
          reasons: v.flatten(issues),
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
