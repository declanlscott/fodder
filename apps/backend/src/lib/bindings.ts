import type { HttpBindings } from "@hono/node-server";
import type { LambdaContext, LambdaEvent } from "hono/aws-lambda";

export type LambdaBindings = {
  event: LambdaEvent;
  context: LambdaContext;
};

export type Bindings = LambdaBindings | HttpBindings;

export const isLambdaBindings = (
  bindings: Bindings,
): bindings is LambdaBindings => "event" in bindings && "context" in bindings;

export const isHttpBindings = (bindings: Bindings): bindings is HttpBindings =>
  "incoming" in bindings && "outgoing" in bindings;
