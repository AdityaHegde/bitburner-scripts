import { MetadataFile, WriteRemoteMetadataScript } from "../constants";
import type { CrackType } from "../hack/helpers/cracks";
import type { NS } from "./gameTypes";

export interface Metadata {
  servers: Array<string>;
  newServers: Array<string>;
  hackOrchestratorServer?: string;

  cracks: Partial<Record<CrackType, boolean>>;

  playerServerCount: number;
  playerServerMaxCount: number;
  playerServerCursor: number;
  playerServerSize: number;
}

export function newMetadata(ns: NS): Metadata {
  const playerServers = ns.getPurchasedServers();
  return {
    servers: [],
    newServers: ["home", ...playerServers],

    cracks: {},

    playerServerCount: playerServers.length,
    playerServerMaxCount: ns.getPurchasedServerLimit(),
    playerServerCursor: 0,
    playerServerSize: 16,
  };
}

export function getMetadata(ns: NS): Metadata {
  const metadataString = ns.read(MetadataFile);
  return metadataString ? JSON.parse(metadataString) : undefined;
}

export function saveMetadata(ns: NS, metadata: Metadata) {
  ns.write(MetadataFile, JSON.stringify(metadata), "w");
}

export function saveMetadataOnServer(
  ns: NS,
  metadata: Metadata,
  server = metadata.hackOrchestratorServer,
) {
  return ns.exec(WriteRemoteMetadataScript, server, 1, JSON.stringify(metadata));
}
