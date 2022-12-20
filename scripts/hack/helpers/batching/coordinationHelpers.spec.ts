import { describe, expect, it } from "vitest";
import type { BatchTargetPacket } from "$scripts/hack/helpers/batching/coordinationHelpers";
import { getBatchTargetPackets } from "$scripts/hack/helpers/batching/coordinationHelpers";
import { BatchHackType, BatchHackTypeMap } from "$scripts/hack/helpers/batching/batchMetadata";

const NoodlesServer = "n00dles";
const HackTypeTimings: [number, number, number] = [5000, 3500, 1500];

function assertTargetPackets(
  targetPackets: Array<BatchTargetPacket>,
  expectedStarts: Array<number>,
  expectedEnds: Array<number>,
) {
  expect(targetPackets[0].packet[0]).toBe(NoodlesServer);
  expect(
    targetPackets.map((targetPacket) => targetPacket.packet[1] - targetPackets[0].packet[1]),
  ).toEqual(expectedStarts);
  expect(
    targetPackets.map(
      (targetPacket) =>
        targetPacket.packet[1] -
        targetPackets[0].packet[1] +
        HackTypeTimings[BatchHackTypeMap[targetPacket.type]],
    ),
  ).toEqual(expectedEnds);
}

describe("coordinationHelpers", () => {
  describe("getBatchTargetPackets", () => {
    it("GWHW", () => {
      const targetPackets = getBatchTargetPackets({
        server: NoodlesServer,
        operations: [
          BatchHackType.Grow,
          BatchHackType.GrowWeaken,
          BatchHackType.Hack,
          BatchHackType.HackWeaken,
        ],
        timings: HackTypeTimings,
      });
      assertTargetPackets(targetPackets, [0, 1600, 3700, 1800], [5000, 5100, 5200, 5300]);
    });

    it("GHW", () => {
      const targetPackets = getBatchTargetPackets({
        server: NoodlesServer,
        operations: [BatchHackType.Grow, BatchHackType.Hack, BatchHackType.HackWeaken],
        timings: HackTypeTimings,
      });
      assertTargetPackets(targetPackets, [0, 3600, 1700], [5000, 5100, 5200]);
    });

    // Hypothetical to test the packet sorter
    it("HWG", () => {
      const targetPackets = getBatchTargetPackets({
        server: NoodlesServer,
        operations: [BatchHackType.Hack, BatchHackType.HackWeaken, BatchHackType.Grow],
        timings: HackTypeTimings,
      });
      assertTargetPackets(targetPackets, [0, -1900, -3300], [1500, 1600, 1700]);
    });
  });
});
