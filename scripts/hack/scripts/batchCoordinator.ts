import type { NS } from "$scripts/types/gameTypes";
import { Logger } from "$scripts/utils/logger";
import {
  BatchHackTypeMap,
  BatchHackTypeToPort,
  readBatchMetadata,
} from "$scripts/hack/helpers/batching/batchMetadata";
import { getBatchTargetPackets } from "$scripts/hack/helpers/batching/coordinationHelpers";
import { readBatchPacket } from "$scripts/hack/helpers/batching/batchCommunications";
import { writePacketToPort } from "$scripts/utils/portCommunication";

/**
 * Coordinates different hack scripts within a server.
 */
export async function main(ns: NS) {
  const logger = new Logger(ns, "BatchCoordinator");

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const batchMetadata = readBatchMetadata(ns);
    const targetPackets = getBatchTargetPackets(batchMetadata.target);
    logger.log("Sending", {
      targetPackets,
    });

    // send requests to `read` port
    for (const { type, packet } of targetPackets) {
      const handle = ns.getPortHandle(BatchHackTypeToPort[type].read);
      await writePacketToPort(ns, handle, packet);
    }

    // sleep until for the earliest one is done
    await ns.sleep(
      targetPackets[0].packet[1] +
        batchMetadata.target.timings[BatchHackTypeMap[targetPackets[0].type]],
    );

    // wait for response from all
    for (const targetPacket of targetPackets) {
      const handle = ns.getPortHandle(BatchHackTypeToPort[targetPacket.type].write);
      await readBatchPacket(ns, handle);
      logger.log("Received", {
        targetPacket,
      });
    }
  }
}
