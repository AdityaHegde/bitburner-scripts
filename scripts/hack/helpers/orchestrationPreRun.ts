import type { NS } from "$scripts/types/gameTypes";
import { fillServerStats, newServerStats } from "$scripts/metadata/serverStats";
import type { ServerStats } from "$scripts/metadata/serverStats";
import { isPlayerServer } from "$scripts/utils/isPlayerServer";
import { nukeServers } from "$scripts/hack/helpers/cracks";
import { NewServerType } from "$scripts/servers/helpers/newServerHelpers";
import type { NewServerPacket } from "$scripts/servers/helpers/newServerHelpers";
import type { HackTargetMetadata } from "$scripts/metadata/hackTargetMetadata";
import {
  addServerToTargetGroups,
  addToNewTargets,
  addToResources,
  correctResources,
} from "$scripts/metadata/hackTargetMetadata";
import type { Metadata } from "$scripts/metadata/metadata";
import { BatchOrchestratorScript, NewServerCommunicationMem } from "$scripts/constants";
import { HackType } from "$scripts/hack/helpers/hackTypes";

export function orchestrationPreRun(
  ns: NS,
  metadata: Metadata,
  [type, ...newServers]: NewServerPacket,
) {
  for (const resource of metadata.hackTargetMetadata.resources) {
    fillServerStats(ns, metadata.serverStats[resource]);
  }

  switch (type) {
    case NewServerType.NoData:
      break;

    case NewServerType.NPC:
    case NewServerType.Player:
      newCrackedServers(ns, metadata, newServers);
      break;

    case NewServerType.PlayerUpdate:
      correctResources(ns, metadata.hackTargetMetadata, metadata.serverStats, newServers);
      break;
  }

  updateTargetByHackingLevel(ns, metadata);

  metadata.hackTargetMetadata.targets.sort(
    (a, b) => metadata.serverStats[b].batchScore - metadata.serverStats[a].batchScore,
  );
}

function newCrackedServers(ns: NS, metadata: Metadata, newServers: Array<string>) {
  for (const crackedServer of newServers) {
    metadata.serverStats[crackedServer] = newServerStats(ns, crackedServer);
    fillServerStats(ns, metadata.serverStats[crackedServer]);
    if (crackedServer === metadata.batchOrchestratorServer) {
      metadata.serverStats[crackedServer].memOffset +=
        ns.getScriptRam(BatchOrchestratorScript) + NewServerCommunicationMem;
    } else if (crackedServer === "home") {
      metadata.serverStats[crackedServer].memOffset += 8;
    }
    addToResources(metadata.hackTargetMetadata, metadata.serverStats, crackedServer);
    if (!isPlayerServer(crackedServer)) {
      newTargetServer(ns, metadata.hackTargetMetadata, metadata.serverStats, crackedServer);
    }
  }
}

function updateTargetByHackingLevel(ns: NS, metadata: Metadata) {
  // temporary until we have a separate cracking script
  newCrackedServers(ns, metadata, nukeServers(ns, metadata.hackTargetMetadata));
  let i = 0;
  // move new targets
  for (; i < metadata.hackTargetMetadata.newTargets.length; i++) {
    const targetStats = metadata.serverStats[metadata.hackTargetMetadata.newTargets[i]];
    if (ns.getHackingLevel() >= targetStats.reqLevel) {
      if (targetStats.rates[HackType.Hack] === 0) {
        // un-hackable servers should be ignored
        continue;
      }
      addServerToTargetGroups(
        ns,
        metadata.hackTargetMetadata,
        metadata.serverStats,
        metadata.hackTargetMetadata.newTargets[i],
      );
    } else {
      break;
    }
  }
  if (i > 0) {
    metadata.hackTargetMetadata.newTargets = metadata.hackTargetMetadata.newTargets.splice(i);
  }
}

function newTargetServer(
  ns: NS,
  hackTargetMetadata: HackTargetMetadata,
  serverStats: Record<string, ServerStats>,
  crackedServer: string,
) {
  if (ns.getHackingLevel() >= serverStats[crackedServer].reqLevel) {
    addServerToTargetGroups(ns, hackTargetMetadata, serverStats, crackedServer);
  } else {
    addToNewTargets(hackTargetMetadata, serverStats, crackedServer);
  }
}
