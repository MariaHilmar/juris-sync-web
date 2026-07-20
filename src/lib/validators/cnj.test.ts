import { describe, expect, it } from "vitest";
import { CNJ_REGEX, isValidCnj } from "./cnj";

describe("CNJ validator", () => {
  it("aceita número CNJ válido", () => {
    expect(isValidCnj("0001234-56.2023.8.15.0001")).toBe(true);
    expect(CNJ_REGEX.test("1000001-00.2024.5.02.0001")).toBe(true);
  });

  it("rejeita formato inválido", () => {
    expect(isValidCnj("")).toBe(false);
    expect(isValidCnj("123")).toBe(false);
    expect(isValidCnj("0001234-56.2023.8.15")).toBe(false);
    expect(isValidCnj("abcd123-56.2023.8.15.0001")).toBe(false);
  });
});
