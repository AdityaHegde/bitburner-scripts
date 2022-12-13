import { describe, expect, it } from "vitest";
import { ShorthandNotationSchema } from "$lib/utils/shorthand-notation";

describe("Shorthand Notation", () => {
  describe("USD", () => {
    it("900", () => {
      expect(ShorthandNotationSchema.usd.convert(900)).toBe("900.00$");
    });

    it("9000", () => {
      expect(ShorthandNotationSchema.usd.convert(9000)).toBe("9.00k$");
    });

    it("9500000", () => {
      expect(ShorthandNotationSchema.usd.convert(9500000)).toBe("9.50m$");
    });

    it("95000000000", () => {
      expect(ShorthandNotationSchema.usd.convert(95000000000)).toBe("95.00b$");
    });
  });

  describe("Disk Space", () => {
    it("1000", () => {
      expect(ShorthandNotationSchema.diskSpace.convert(1000)).toBe("1000.00B");
    });

    it("1050", () => {
      expect(ShorthandNotationSchema.diskSpace.convert(1050)).toBe("1.03KB");
    });

    it("1200000", () => {
      expect(ShorthandNotationSchema.diskSpace.convert(1200000)).toBe("1.14MB");
    });

    it("1200000000", () => {
      expect(ShorthandNotationSchema.diskSpace.convert(1200000000)).toBe("1.12TB");
    });
  });

  describe("Time", () => {
    it("900", () => {
      expect(ShorthandNotationSchema.time.convert(900)).toBe("900.00ms");
    });

    it("9000", () => {
      expect(ShorthandNotationSchema.time.convert(9000)).toBe("9.00s");
    });

    it("90000", () => {
      expect(ShorthandNotationSchema.time.convert(90000)).toBe("1.50min");
    });
  });
});
