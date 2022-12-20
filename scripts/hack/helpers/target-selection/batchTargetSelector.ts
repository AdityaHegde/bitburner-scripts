import type { NS } from "$scripts/types/gameTypes";
import type { BatchTarget, BatchTargetGetter } from "$scripts/hack/helpers/batching/batchTarget";
import { BatchCoordinationMem } from "$scripts/constants";
import type { ServerStats } from "$scripts/metadata/serverStats";
import type { Metadata } from "$scripts/metadata/metadata";
import { binarySearch } from "$scripts/utils/arrayUtils";
import { getGHWBatchTarget } from "$scripts/hack/helpers/batching/batchTarget";
import { HackType } from "$scripts/hack/helpers/hackTypes";
import type { BatchTargetAssignment } from "$scripts/metadata/hackTargetMetadata";
import type { Logger } from "$scripts/utils/logger";

export const BatchMaxMoneyPercent = 0.05;

function fitBatchInServer(
  ns: NS,
  targetStats: ServerStats,
  resourceStats: ServerStats,
  getter: BatchTargetGetter,
): BatchTarget {
  const availableMem = resourceStats.maxMem - resourceStats.memOffset - BatchCoordinationMem;
  const approximateCount = Math.floor(availableMem / targetStats.batchMem);
  for (let count = approximateCount; count > 0; count--) {
    const bt = getter(ns, targetStats, count);
    if (bt.mem < availableMem) {
      return bt;
    }
  }
  return undefined;
}

export function selectBatchTargets(
  ns: NS,
  logger: Logger,
  metadata: Metadata,
): Array<BatchTargetAssignment> {
  const hackTargetMetadata = metadata.hackTargetMetadata;
  const serverStats = metadata.serverStats;
  const targetAssignments: Array<BatchTargetAssignment> = [];
  const assigned = new Set<string>();

  for (let targetIdx = 0; targetIdx < hackTargetMetadata.targets.length; targetIdx++) {
    const target = hackTargetMetadata.targets[targetIdx];
    const targetStats = serverStats[target];
    const targetAssignment: BatchTargetAssignment = {
      server: target,
      maxAssignments: Math.ceil(BatchMaxMoneyPercent / targetStats.rates[HackType.Hack]),
      assignments: {},
      prepAssignments: {},
    };

    let assignedBatches = 0;
    let resIdx = binarySearch(
      hackTargetMetadata.resources,
      (mid) => serverStats[mid].maxMem - targetStats.batchMem,
    );
    logger.log("Targeting", {
      target,
      startIdx: resIdx,
      start: hackTargetMetadata.resources[resIdx],
    });
    if (resIdx < 0) continue;
    for (
      ;
      resIdx < hackTargetMetadata.resources.length &&
      assignedBatches < targetAssignment.maxAssignments;
      resIdx++
    ) {
      const resource = hackTargetMetadata.resources[resIdx];
      if (assigned.has(resource)) continue;

      const batch = fitBatchInServer(ns, targetStats, serverStats[resource], getGHWBatchTarget);
      if (!batch) continue;
      assignedBatches += batch.threads[1];
      targetAssignment.assignments[resource] = batch;
      serverStats[resource].mem -= batch.mem + BatchCoordinationMem;
      logger.log("Targeting Chosen", {
        target,
        resource,
        order: batch.order,
        mem: serverStats[resource].mem,
      });
    }

    if (assignedBatches > 0) {
      targetAssignments.push(targetAssignment);
    }
  }

  return targetAssignments;
}
