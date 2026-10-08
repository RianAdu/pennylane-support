import { describe, expect, it } from "vitest";
import { parseListParams } from "../parseListParams";

const parse = (query: string) => parseListParams(new URLSearchParams(query));

describe("list parameters", () => {
  it("uses the defaults when no parameters are given", () => {
    expect(parse("")).toEqual({ tab: "latest", page: 1, pageSize: 20 });
  });

  it("caps the page size at 50", () => {
    expect(parse("pageSize=500").pageSize).toBe(50);
  });

  it.each([
    { name: "zero", value: "0" },
    { name: "a negative number", value: "-2" },
    { name: "a decimal", value: "2.5" },
    { name: "text", value: "many" },
  ])("falls back to the defaults when page and page size are $name", ({ value }) => {
    expect(parse(`page=${value}&pageSize=${value}`)).toMatchObject({ page: 1, pageSize: 20 });
  });

  it("falls back to the latest tab for an unknown tab", () => {
    expect(parse("tab=trending").tab).toBe("latest");
  });

  it("drops an unknown priority", () => {
    expect(parse("priority=critical").priority).toBeUndefined();
  });

  it("ignores a blank search", () => {
    expect(parse("q=%20%20").q).toBeUndefined();
  });
});
