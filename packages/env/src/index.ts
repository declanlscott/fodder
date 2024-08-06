/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */

// MIT License

// Copyright (c) 2023 Julius Marminge

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// https://github.com/t3-oss/t3-env/blob/f1e07911af6f7c41290d112abe8e7dae63f084e5/packages/core/src/index.ts
// Ported from Zod to Valibot by Declan L. Scott

import * as v from "valibot";

export type ErrorMessage<T extends string> = T;
export type Simplify<T> = {
  [P in keyof T]: T[P];
} & {};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Impossible<T extends Record<string, any>> = Partial<
  Record<keyof T, never>
>;

type UnReadonlyObject<T> = T extends Readonly<infer U> ? U : T;

type Reduce<
  TArr extends Array<Record<string, unknown>>,
  TAcc = {},
> = TArr extends []
  ? TAcc
  : TArr extends [infer Head, ...infer Tail]
    ? Tail extends Array<Record<string, unknown>>
      ? Head & Reduce<Tail, TAcc>
      : never
    : never;

export interface BaseOptions<
  TShared extends Record<string, v.GenericSchema>,
  TExtends extends Array<Record<string, unknown>>,
> {
  /**
   * How to determine whether the app is running on the server or the client.
   * @default typeof window === "undefined"
   */
  isServer?: boolean;

  /**
   * Shared variables, often those that are provided by build tools and is available to both client and server,
   * but isn't prefixed and doesn't require to be manually supplied. For example `NODE_ENV`, `VERCEL_URL` etc.
   */
  shared?: TShared;

  /**
   * Extend presets
   */
  extends?: TExtends;

  /**
   * Called when validation fails. By default the error is logged,
   * and an error is thrown telling what environment variables are invalid.
   */
  onValidationError?: <TSchema extends v.GenericSchema>(
    issues: [v.InferIssue<TSchema>, ...v.InferIssue<TSchema>[]],
  ) => never;

  /**
   * Called when a server-side environment variable is accessed on the client.
   * By default an error is thrown.
   */
  onInvalidAccess?: (variable: string) => never;

  /**
   * Whether to skip validation of environment variables.
   * @default false
   */
  skipValidation?: boolean;

  /**
   * By default, this library will feed the environment variables directly to
   * the Valibot validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Valibot will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined?: boolean;
}

export interface LooseOptions<
  TShared extends Record<string, v.GenericSchema>,
  TExtends extends Array<Record<string, unknown>>,
> extends BaseOptions<TShared, TExtends> {
  runtimeEnvStrict?: never;

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  // Unlike `runtimeEnvStrict`, this doesn't enforce that all environment variables are set.
  runtimeEnv: Record<string, string | boolean | number | undefined>;
}

export interface StrictOptions<
  TPrefix extends string | undefined,
  TServer extends Record<string, v.GenericSchema>,
  TClient extends Record<string, v.GenericSchema>,
  TShared extends Record<string, v.GenericSchema>,
  TExtends extends Array<Record<string, unknown>>,
> extends BaseOptions<TShared, TExtends> {
  /**
   * Runtime Environment variables to use for validation - `process.env`, `import.meta.env` or similar.
   * Enforces all environment variables to be set. Required in for example Next.js Edge and Client runtimes.
   */
  runtimeEnvStrict: Record<
    | {
        [TKey in keyof TClient]: TPrefix extends undefined
          ? never
          : TKey extends `${TPrefix}${string}`
            ? TKey
            : never;
      }[keyof TClient]
    | {
        [TKey in keyof TServer]: TPrefix extends undefined
          ? TKey
          : TKey extends `${TPrefix}${string}`
            ? never
            : TKey;
      }[keyof TServer]
    | {
        [TKey in keyof TShared]: TKey extends string ? TKey : never;
      }[keyof TShared],
    string | boolean | number | undefined
  >;
  runtimeEnv?: never;
}

export interface ClientOptions<
  TPrefix extends string | undefined,
  TClient extends Record<string, v.GenericSchema>,
> {
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: TPrefix;

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  client: Partial<{
    [TKey in keyof TClient]: TKey extends `${TPrefix}${string}`
      ? TClient[TKey]
      : ErrorMessage<`${TKey extends string
          ? TKey
          : never} is not prefixed with ${TPrefix}.`>;
  }>;
}

export interface ServerOptions<
  TPrefix extends string | undefined,
  TServer extends Record<string, v.GenericSchema>,
> {
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server: Partial<{
    [TKey in keyof TServer]: TPrefix extends undefined
      ? TServer[TKey]
      : TPrefix extends ""
        ? TServer[TKey]
        : TKey extends `${TPrefix}${string}`
          ? ErrorMessage<`${TKey extends `${TPrefix}${string}`
              ? TKey
              : never} should not prefixed with ${TPrefix}.`>
          : TServer[TKey];
  }>;
}

export type ServerClientOptions<
  TPrefix extends string | undefined,
  TServer extends Record<string, v.GenericSchema>,
  TClient extends Record<string, v.GenericSchema>,
> =
  | (ClientOptions<TPrefix, TClient> & ServerOptions<TPrefix, TServer>)
  | (ServerOptions<TPrefix, TServer> & Impossible<ClientOptions<never, never>>)
  | (ClientOptions<TPrefix, TClient> & Impossible<ServerOptions<never, never>>);

export type EnvOptions<
  TPrefix extends string | undefined,
  TServer extends Record<string, v.GenericSchema>,
  TClient extends Record<string, v.GenericSchema>,
  TShared extends Record<string, v.GenericSchema>,
  TExtends extends Array<Record<string, unknown>>,
> =
  | (LooseOptions<TShared, TExtends> &
      ServerClientOptions<TPrefix, TServer, TClient>)
  | (StrictOptions<TPrefix, TServer, TClient, TShared, TExtends> &
      ServerClientOptions<TPrefix, TServer, TClient>);

export function createEnv<
  TPrefix extends string | undefined,
  TServer extends Record<string, v.GenericSchema> = NonNullable<unknown>,
  TClient extends Record<string, v.GenericSchema> = NonNullable<unknown>,
  TShared extends Record<string, v.GenericSchema> = NonNullable<unknown>,
  const TExtends extends Array<Record<string, unknown>> = [],
>(
  opts: EnvOptions<TPrefix, TServer, TClient, TShared, TExtends>,
): Readonly<
  Simplify<
    v.InferOutput<v.ObjectSchema<TServer, "">> &
      v.InferOutput<v.ObjectSchema<TClient, "">> &
      v.InferOutput<v.ObjectSchema<TShared, "">> &
      UnReadonlyObject<Reduce<TExtends>>
  >
> {
  const runtimeEnv = opts.runtimeEnvStrict ?? opts.runtimeEnv ?? process.env;

  const emptyStringAsUndefined = opts.emptyStringAsUndefined ?? false;
  if (emptyStringAsUndefined)
    for (const [key, value] of Object.entries(runtimeEnv)) {
      if (value === "") delete runtimeEnv[key];
    }

  const skip = !!opts.skipValidation;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  if (skip) return runtimeEnv as any;

  const _client = typeof opts.client === "object" ? opts.client : {};
  const _server = typeof opts.server === "object" ? opts.server : {};
  const _shared = typeof opts.shared === "object" ? opts.shared : {};
  const client = v.object(_client);
  const server = v.object(_server);
  const shared = v.object(_shared);
  const isServer = opts.isServer ?? typeof window === "undefined";

  const allClient = v.object({ ...client.entries, ...shared.entries });
  const allServer = v.object({
    ...client.entries,
    ...shared.entries,
    ...server.entries,
  });
  const parsed = v.safeParse(
    isServer
      ? allServer // on server we can validate all env vars
      : allClient, // on client we can only validate the ones that are exposed
    runtimeEnv,
  );

  const onValidationError =
    opts.onValidationError ??
    ((
      issues: [
        v.InferIssue<typeof allServer | typeof allClient>,
        ...v.InferIssue<typeof allServer | typeof allClient>[],
      ],
    ) => {
      console.error("❌ Invalid environment variables:", v.flatten(issues));
      throw new Error("Invalid environment variables");
    });

  const onInvalidAccess =
    opts.onInvalidAccess ??
    ((_variable: string) => {
      throw new Error(
        "❌ Attempted to access a server-side environment variable on the client",
      );
    });

  if (parsed.success === false) return onValidationError(parsed.issues);

  const isServerAccess = (prop: string) => {
    if (!opts.clientPrefix) return true;
    return !prop.startsWith(opts.clientPrefix) && !(prop in shared.entries);
  };
  const isValidServerAccess = (prop: string) =>
    isServer || !isServerAccess(prop);
  const ignoreProp = (prop: string) =>
    prop === "__esModule" || prop === "$$typeof";

  const extendedObj = (opts.extends ?? []).reduce(
    (acc, curr) => Object.assign(acc, curr),
    {},
  );
  const fullObj = Object.assign(parsed.output, extendedObj);

  const env = new Proxy(fullObj, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (ignoreProp(prop)) return undefined;
      if (!isValidServerAccess(prop)) return onInvalidAccess(prop);
      return Reflect.get(target, prop);
    },
    // Maybe reconsider this in the future:
    // https://github.com/t3-oss/t3-env/pull/111#issuecomment-1682931526
    // set(_target, prop) {
    //   // Readonly - this is the error message you get from assigning to a frozen object
    //   throw new Error(
    //     typeof prop === "string"
    //       ? `Cannot assign to read only property ${prop} of object #<Object>`
    //       : `Cannot assign to read only property of object #<Object>`
    //   );
    // },
  });

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return env as any;
}
