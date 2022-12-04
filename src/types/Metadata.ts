import { MetadataFile, WriteRemoteMetadataScript } from "../constants";
import { CrackType } from "./Cracks";
import { NS } from "./gameTypes";

export interface Metadata {
  servers: Array<string>;
  playerServers: Array<string>;
  newServers: Array<string>;

  hackOrchestratorServer?: string;
  orchestratorServer?: string;

  lastCheckHackLevel: number;

  cracks: Partial<Record<CrackType, boolean>>;

  playerServerCount: number;
  playerServerMaxCount: number;
  playerServerSize: number;
}

export function metadataFactory(ns: NS): Metadata {
  const playerServers = ns.getPurchasedServers();
  return {
    servers: [],
    playerServers,
    newServers: [],

    orchestratorServer: "home",

    lastCheckHackLevel: 0,

    cracks: {},

    playerServerCount: playerServers.length,
    playerServerMaxCount: ns.getPurchasedServerLimit(),
    playerServerSize: 8,
  };
}

export async function getMetadata(ns: NS): Promise<Metadata> {
  const metadataString = await ns.read(MetadataFile);
  return metadataString ? JSON.parse(metadataString) : undefined;
}

export async function saveMetadata(ns: NS, metadata: Metadata) {
  await ns.write(MetadataFile, JSON.stringify(metadata), "w");
}

export function saveMetadataOnServer(
  ns: NS,
  metadata: Metadata,
  server = metadata.hackOrchestratorServer
) {
  return ns.exec(
    WriteRemoteMetadataScript,
    server,
    1,
    JSON.stringify(metadata)
  );
}
