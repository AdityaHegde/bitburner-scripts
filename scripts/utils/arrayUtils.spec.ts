import { describe, expect, it } from "vitest";
import { binaryInsert } from "$scripts/utils/arrayUtils";

describe("arrayUtils", () => {
  describe("binaryInsert", () => {
    it("happy path", () => {
      const arr = new Array<number>();
      binaryInsert(arr, 5, (mid, ele) => mid - ele);
      expect(arr).toEqual([5]);

      binaryInsert(arr, 2, (mid, ele) => mid - ele);
      binaryInsert(arr, 7, (mid, ele) => mid - ele);
      binaryInsert(arr, 6, (mid, ele) => mid - ele);
      binaryInsert(arr, 1, (mid, ele) => mid - ele);
      expect(arr).toEqual([1, 2, 5, 6, 7]);

      binaryInsert(arr, 5, (mid, ele) => mid - ele);
      expect(arr).toEqual([1, 2, 5, 5, 6, 7]);
    });
  });
});
