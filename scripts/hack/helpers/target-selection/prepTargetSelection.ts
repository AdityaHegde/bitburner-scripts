import type { NS } from "$scripts/types/gameTypes";
import type { Metadata } from "$scripts/metadata/metadata";
import type { BatchTargetAssignment } from "$scripts/metadata/hackTargetMetadata";
import { HackType, HackTypeToMemMap } from "$scripts/hack/helpers/hackTypes";
import type { Logger } from "$scripts/utils/logger";

export function prepTargetSelection(
  ns: NS,
  logger: Logger,
  metadata: Metadata,
  targetAssignments: Array<BatchTargetAssignment>,
) {
  for (const targetAssignment of targetAssignments) {
    const targetStats = metadata.serverStats[targetAssignment.server];
    let hackType: HackType;
    let threads: number;
    if (targetStats.security > targetStats.minSecurity) {
      hackType = HackType.Weaken;
      threads =
        (targetStats.security - targetStats.minSecurity) / targetStats.rates[HackType.Weaken];
    } else if (targetStats.money < targetStats.maxMoney) {
      hackType = HackType.Grow;
      threads = ns.growthAnalyze(targetAssignment.server, targetStats.maxMoney / targetStats.money);
    }

    logger.log("Prepping", {
      target: targetAssignment.server,
      type: hackType,
      threads,
    });

    for (const resource of metadata.hackTargetMetadata.resources) {
      const resourceStats = metadata.serverStats[resource];
      if (resourceStats.mem < HackTypeToMemMap[hackType]) continue;

      logger.log("Selecting", {
        target: targetAssignment.server,
        resource,
        threads,
        possible: Math.floor(resourceStats.mem / HackTypeToMemMap[hackType]),
      });

      const resThreads = Math.min(
        threads,
        Math.floor(resourceStats.mem / HackTypeToMemMap[hackType]),
      );
      threads -= resThreads;
      targetAssignment.prepAssignments[resource] = { type: hackType, threads: resThreads };

      if (threads <= 0) break;
    }
  }
}
