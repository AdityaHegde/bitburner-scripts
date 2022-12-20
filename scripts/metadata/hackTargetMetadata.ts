import type { NS } from "$scripts/types/gameTypes";
import type { ServerStats } from "$scripts/metadata/serverStats";
import { binaryInsert } from "$scripts/utils/arrayUtils";
import type { BatchTarget } from "$scripts/hack/helpers/batching/batchTarget";
import type { HackType } from "$scripts/hack/helpers/hackTypes";
import { Logger } from "$scripts/utils/logger";
import type { Metadata } from "$scripts/metadata/metadata";

export type HackTargetMetadata = {
  cracks: Array<number>;
  // servers not yet cracked
  newServers: Array<string>;
  // servers available to run hack on. contains player servers as well
  resources: Array<string>;
  // targets that are cracked but above skill level to hack
  newTargets: Array<string>;
  // targets sorted in descending order by batch score
  targets: Array<string>;
  // current batch targets
  targetAssignments: Array<BatchTargetAssignment>;
};

export type BatchTargetAssignment = {
  server: string;
  maxAssignments: number;
  assignments: Record<string, BatchTarget>;
  prepAssignments: Record<string, { type: HackType; threads: number }>;
};

export function newHackTargetMetadata(playerServers: Array<string>): HackTargetMetadata {
  return {
    cracks: [],
    newServers: ["home", ...playerServers],
    resources: [],
    newTargets: [],
    targets: [],
    targetAssignments: [],
  };
}

export function addServerToTargetGroups(
  ns: NS,
  hackTargetMetadata: HackTargetMetadata,
  serverStats: Record<string, ServerStats>,
  server: string,
) {
  binaryInsert(
    hackTargetMetadata.targets,
    server,
    (mid, ele) => serverStats[ele].batchScore - serverStats[mid].batchScore,
  );
}

export function correctResources(
  ns: NS,
  hackTargetMetadata: HackTargetMetadata,
  serverStats: Record<string, ServerStats>,
  correctedServers: Array<string>,
) {
  hackTargetMetadata.resources = hackTargetMetadata.resources.filter(
    (resource) => correctedServers.indexOf(resource) !== -1,
  );
  for (const updatedServer of correctedServers) {
    addToResources(hackTargetMetadata, serverStats, updatedServer);
  }
}

export function addToResources(
  hackTargetMetadata: HackTargetMetadata,
  serverStats: Record<string, ServerStats>,
  addedServer: string,
) {
  binaryInsert(
    hackTargetMetadata.resources,
    addedServer,
    (mid, ele) => serverStats[mid].maxMem - serverStats[ele].maxMem,
  );
}

export function addToNewTargets(
  hackTargetMetadata: HackTargetMetadata,
  serverStats: Record<string, ServerStats>,
  addedServer: string,
) {
  binaryInsert(
    hackTargetMetadata.newTargets,
    addedServer,
    (mid, ele) => serverStats[mid].reqLevel - serverStats[ele].reqLevel,
  );
}
