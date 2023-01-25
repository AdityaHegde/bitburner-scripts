import { lreCompression } from "$src/coding-contracts/solutions/compression";
import { describe, expect, it } from "vitest";

describe("Compressions", () => {
  describe("LRE Compression", () => {
    it("samples", () => {
      expect(lreCompression("aaaaabccc")).toBe("5a1b3c");
      expect(lreCompression("aAaAaA")).toBe("1a1A1a1A1a1A");
      expect(lreCompression("111112333")).toBe("511233");
      expect(lreCompression("zzzzzzzzzzzzzzzzzzz")).toBe("9z9z1z");
    });
  });
});
