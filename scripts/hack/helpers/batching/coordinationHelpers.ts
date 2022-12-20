import { BatchHackType, BatchHackTypeMap } from "$scripts/hack/helpers/batching/batchMetadata";
import type { BatchHackTarget } from "$scripts/hack/helpers/batching/batchMetadata";
import type { BatchPacket } from "$scripts/hack/helpers/batching/batchCommunications";
import { BatchOperationBuffer } from "$scripts/constants";
import { largestInArray } from "$scripts/utils/arrayUtils";

export type BatchTargetPacket = {
  type: BatchHackType;
  packet: BatchPacket;
};

export function getBatchTargetPackets(target: BatchHackTarget): Array<BatchTargetPacket> {
  const packets = new Array<BatchTargetPacket>();

  for (const batchHackType of target.operations) {
    packets.push({
      type: batchHackType,
      packet: [target.server, target.timings[BatchHackTypeMap[batchHackType]]],
    });
  }

  const longestPacket = largestInArray(packets, (e) => e.packet[1]);
  const end = Date.now() + BatchOperationBuffer + longestPacket.packet[1];
  for (let i = 0; i < packets.length; i++) {
    packets[i].packet[1] = end + BatchOperationBuffer * i - packets[i].packet[1];
  }

  return packets;
}
