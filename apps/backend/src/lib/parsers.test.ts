import { HTTPException } from "hono/http-exception";
import { literal, object } from "valibot";
import { describe, expect, it } from "vitest";

import { ValidationException } from "~/lib/exceptions";
import { parseJson, parseNextData } from "~/lib/parsers";

const TestSchema = object({
  hello: literal("world"),
});

describe("parseJson", () => {
  it("successfully parses valid json", () => {
    const input: unknown = { hello: "world" };

    expect(() => parseJson(TestSchema, input)).not.toThrowError();

    const output = parseJson(TestSchema, input);
    expect(output).toEqual({ hello: "world" });
  });

  it("throws `ValidationException` when parsing invalid json", () => {
    const input: unknown = { hello: "not-world" };

    expect(() => parseJson(TestSchema, input)).toThrowError(
      ValidationException,
    );
  });
});

describe("parseNextData", () => {
  it("successfully parses valid next data", () => {
    const input = `<html><body><div id="__next"></div></body><script id="__NEXT_DATA__" type="application/json">{ "hello": "world" }</script></html>`;

    expect(() => parseNextData(TestSchema, input)).not.toThrowError();

    const output = parseNextData(TestSchema, input);
    expect(output).toEqual({ hello: "world" });
  });

  it("throws `HTTPException` when parsing invalid next data", () => {
    const input = `<html><body><div id="__next"></div></body></html>`;

    expect(() => parseNextData(TestSchema, input)).toThrowError(HTTPException);
  });
});
