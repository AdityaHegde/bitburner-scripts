import type { NS } from "$scripts/types/gameTypes";
import { Logger } from "$scripts/utils/logger";
import { getMetadata, logHackTargetMetadata, saveMetadata } from "$scripts/metadata/metadata";
import {
  NewServerCommunicationPort,
  readNewServerPacket,
} from "$scripts/servers/helpers/newServerHelpers";
import { orchestrationPreRun } from "$scripts/hack/helpers/orchestrationPreRun";
import { selectBatchTargets } from "$scripts/hack/helpers/target-selection/batchTargetSelector";
import { prepTargetSelection } from "$scripts/hack/helpers/target-selection/prepTargetSelection";
import { getResourceState, reconcileHackScripts } from "$scripts/hack/helpers/runHackScript";

export async function main(ns: NS) {
  const logger = new Logger(ns, "BatchOrchestrator");

  const metadata = getMetadata(ns);
  const portHandle = ns.getPortHandle(NewServerCommunicationPort);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    orchestrationPreRun(ns, metadata, await readNewServerPacket(ns, portHandle));
    saveMetadata(ns, metadata);

    logHackTargetMetadata(logger, metadata);

    const targetAssignments = selectBatchTargets(ns, logger, metadata);
    prepTargetSelection(ns, logger, metadata, targetAssignments);
    metadata.hackTargetMetadata.targetAssignments = targetAssignments;

    const newResourceState = getResourceState(ns, metadata);
    for (const resource in newResourceState) {
      reconcileHackScripts(ns, logger, metadata, resource, newResourceState[resource]);
    }

    saveMetadata(ns, metadata);

    await ns.sleep(5000);
  }
}
