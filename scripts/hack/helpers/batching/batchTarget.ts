import { BatchHackType, BatchHackTypeMap } from "$scripts/hack/helpers/batching/batchMetadata";
import { HackType, HackTypeToScript, ScriptToMemMap } from "$scripts/hack/helpers/hackTypes";
import type { NS } from "$scripts/types/gameTypes";
import type { ServerStats } from "$scripts/metadata/serverStats";

const ServerFortifyAmount = 0.002;

export type BatchTarget = {
  server?: string;
  order?: number;
  mem?: number;
  time?: number;
  score?: number;
  operations: Array<BatchHackType>;
  threads: Array<number>;
};

// TODO: formula APIs

function fillBatchTarget(stats: ServerStats, batchTarget: BatchTarget, order: number): BatchTarget {
  batchTarget.server = stats.server;
  batchTarget.mem = 0;
  batchTarget.time = 0;
  for (let i = 0; i < batchTarget.operations.length; i++) {
    const hackType = BatchHackTypeMap[batchTarget.operations[i]];
    batchTarget.mem += batchTarget.threads[i] * ScriptToMemMap[HackTypeToScript[hackType]];
    if (batchTarget.time < stats.times[hackType]) {
      batchTarget.time = stats.times[hackType];
    }
  }
  batchTarget.score = stats.maxMoney / (batchTarget.mem * batchTarget.time);
  batchTarget.order = order;
  return batchTarget;
}

export type BatchTargetGetter = (ns: NS, stats: ServerStats, hackThreads?: number) => BatchTarget;

/**
 * Grow - Weaken - Hack - Weaken
 */
export function getGWHWBatchTarget(ns: NS, stats: ServerStats, hackThreads = 1): BatchTarget {
  const growthThreads = Math.ceil(
    ns.growthAnalyze(stats.server, 1 + stats.rates[HackType.Hack] * hackThreads, stats.cores),
  );
  const growWeakenThreads = Math.ceil(
    (growthThreads * ServerFortifyAmount) / stats.rates[HackType.Weaken],
  );
  const hackWeakenThreads = Math.ceil(
    (hackThreads * ServerFortifyAmount) / stats.rates[HackType.Weaken],
  );

  return fillBatchTarget(
    stats,
    {
      operations: [
        BatchHackType.Grow,
        BatchHackType.GrowWeaken,
        BatchHackType.Hack,
        BatchHackType.HackWeaken,
      ],
      threads: [growthThreads, growWeakenThreads, hackThreads, hackWeakenThreads],
    },
    hackThreads,
  );
}

/**
 * Grow - Hack - Weaken
 */
export function getGHWBatchTarget(ns: NS, stats: ServerStats, hackThreads = 1): BatchTarget {
  const growthThreads = Math.ceil(
    ns.growthAnalyze(stats.server, 1 + stats.rates[HackType.Hack] * hackThreads, stats.cores),
  );
  const hackWeakenThreads = Math.ceil(
    ((hackThreads + growthThreads) * ServerFortifyAmount) / stats.rates[HackType.Weaken],
  );

  return fillBatchTarget(
    stats,
    {
      operations: [BatchHackType.Grow, BatchHackType.Hack, BatchHackType.HackWeaken],
      threads: [growthThreads, hackThreads, hackWeakenThreads],
    },
    hackThreads,
  );
}

/**
 * Grow - Weaken
 */
export function getGWBatchTarget(ns: NS, stats: ServerStats, hackThreads = 1): BatchTarget {
  const growthThreads = Math.ceil(
    ns.growthAnalyze(stats.server, 1 + stats.rates[HackType.Hack] * hackThreads, stats.cores),
  );
  const growWeakenThreads = Math.ceil(
    (growthThreads * ServerFortifyAmount) / stats.rates[HackType.Weaken],
  );

  return fillBatchTarget(
    stats,
    {
      operations: [BatchHackType.Grow, BatchHackType.GrowWeaken],
      threads: [growthThreads, growWeakenThreads],
    },
    hackThreads,
  );
}
