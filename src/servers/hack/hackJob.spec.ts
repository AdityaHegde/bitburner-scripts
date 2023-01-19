import { HackJob } from "$src/servers/hack/hackJob";
import { HackType } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";
import { describe, expect, it } from "vitest";

const TestResource = {
  times: [4000, 3200, 1000, 10000],
} as Resource;

describe("HackJob", () => {
  describe("getPeriodAndOffsets", () => {
    it("GrowWeakenHackWeaken", () => {
      const job = new HackJob(
        [HackType.Grow, HackType.Weaken, HackType.Hack, HackType.Weaken],
        [1, 1, 1, 1],
        -1,
      );
      const [period, startOffsets, endOffsets] = job.getPeriodAndOffsets(TestResource);
      expect(period).toBe(5600);
      expect(startOffsets).toEqual([1400, 800, 4000, 1200]);
      expect(endOffsets).toEqual([4600, 4800, 5000, 5200]);
    });

    it("HackGrowWeaken", () => {
      const job = new HackJob([HackType.Hack, HackType.Grow, HackType.Weaken], [1, 1, 1], -1);
      const [period, startOffsets, endOffsets] = job.getPeriodAndOffsets(TestResource);
      expect(period).toBe(5400);
      expect(startOffsets).toEqual([3600, 1600, 1000]);
      expect(endOffsets).toEqual([4600, 4800, 5000]);
    });

    it("EarlyHackGrowWeaken", () => {
      const job = new HackJob(
        [HackType.Hack, HackType.Grow, HackType.Weaken],
        [1, 1, 1],
        -1,
        [4, 1, 1],
      );
      const [period, startOffsets, endOffsets] = job.getPeriodAndOffsets(TestResource);
      expect(period).toBe(5400);
      expect(startOffsets).toEqual([600, 1600, 1000]);
      expect(endOffsets).toEqual([4600, 4800, 5000]);
    });

    it("GrowWeaken", () => {
      const job = new HackJob([HackType.Grow, HackType.Weaken], [1, 1], -1);
      const [period, startOffsets, endOffsets] = job.getPeriodAndOffsets(TestResource);
      expect(period).toBe(5200);
      expect(startOffsets).toEqual([1400, 800]);
      expect(endOffsets).toEqual([4600, 4800]);
    });
  });

  describe("compressForMem", () => {
    it("Single type less available", () => {
      const job = new HackJob([HackType.Weaken], [100], 1);
      job.compressForMem(1.75 * 25);
      expect(job.runs).toBe(4);
      expect(job.threads).toEqual([25]);
    });

    it("Single type more available", () => {
      const job = new HackJob([HackType.Weaken], [100], 1);
      job.compressForMem(1.75 * 125);
      expect(job.runs).toBe(1);
      expect(job.threads).toEqual([100]);
    });
  });
});
