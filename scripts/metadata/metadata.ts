import { MetadataFile, WriteRemoteMetadataScript } from "../constants";
import type { NS } from "../types/gameTypes";
import type { HackTargetMetadata } from "$scripts/metadata/hackTargetMetadata";
import { newHackTargetMetadata } from "$scripts/metadata/hackTargetMetadata";
import type { ServerStats } from "$scripts/metadata/serverStats";
import type { Logger } from "$scripts/utils/logger";

export type Metadata = {
  hackTargetMetadata: HackTargetMetadata;
  serverStats: Record<string, ServerStats>;
  batchOrchestratorServer?: string;
  playerServerMetadata: PlayerServerMetadata;
};

export type PlayerServerMetadata = {
  playerServerCount: number;
  playerServerMaxCount: number;
  playerServerCursor: number;
  playerServerSize: number;
};

export function newMetadata(ns: NS): Metadata {
  const playerServers = ns.getPurchasedServers();
  return {
    hackTargetMetadata: newHackTargetMetadata(playerServers),
    serverStats: {},
    playerServerMetadata: {
      playerServerCount: playerServers.length,
      playerServerMaxCount: ns.getPurchasedServerLimit(),
      playerServerCursor: 0,
      playerServerSize: 8,
    },
  };
}

export function getMetadata(ns: NS): Metadata {
  const metadataString = ns.read(MetadataFile);
  return metadataString ? JSON.parse(metadataString) : undefined;
}

export function saveMetadata(ns: NS, metadata: Metadata) {
  ns.write(MetadataFile, JSON.stringify(metadata), "w");
}

export function saveMetadataOnServer(ns: NS, metadata: Metadata, server: string) {
  return ns.exec(WriteRemoteMetadataScript, server, 1, MetadataFile, JSON.stringify(metadata));
}

export function logHackTargetMetadata(logger: Logger, metadata: Metadata) {
  const hackTargetMetadata = metadata.hackTargetMetadata;
  const serverStats = metadata.serverStats;
  logger.log("Resources", {
    resources: hackTargetMetadata.resources
      .map(
        (resource) => `${resource}(${serverStats[resource].mem}/${serverStats[resource].maxMem})`,
      )
      .join(","),
  });
  logger.log("NewTargets", {
    newTargets: hackTargetMetadata.newTargets
      .map((target) => `${target}(${serverStats[target].reqLevel})`)
      .join(","),
  });
  logger.log("Targets", {
    targets: hackTargetMetadata.targets
      .map(
        (target) => `${target}(${serverStats[target].batchMem}/${serverStats[target].batchScore})`,
      )
      .join(","),
  });
}
