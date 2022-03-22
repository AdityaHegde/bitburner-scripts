import { MetadataFile, OrchestratorScript, WriteRemoteMetadataScript } from "../constants";
import { CrackType } from "./Cracks";
import { NS } from "./gameTypes";
import { HackState } from "./Hack";
import { OrchestrationActions } from "./Orchestration";

export interface Metadata {
  servers: Array<string>;
  playerServers: Array<string>;
  newServers: Array<string>;

  hackOrchestratorServer?: string;
  orchestratorServer?: string;

  lastCheckHackLevel: number;
  currentHackTarget?: string;
  hackState?: HackState;

  cracks: Partial<Record<CrackType, boolean>>;

  playerServerCount: number;
  playerServerMaxCount: number;
  playerServerSize: number;

  orchestrationActions: number;
  actionsThrottle: Partial<Record<OrchestrationActions, number>>;
}

export function metadataFactory(ns: NS): Metadata {
  return {
    servers: [],
    playerServers: ns.getPurchasedServers(),
    newServers: [],

    orchestratorServer: "home",

    lastCheckHackLevel: 0,

    cracks: {},

    playerServerCount: 0,
    playerServerMaxCount: ns.getPurchasedServerLimit(),
    playerServerSize: 8,

    orchestrationActions: 0,
    actionsThrottle: {},
  };
}

export async function getMetadata(ns: NS): Promise<Metadata> {
  const metadataString = await ns.read(MetadataFile);
  return metadataString ? JSON.parse(metadataString) : undefined;
}

export async function saveMetadata(
  ns: NS, metadata: Metadata, runOrchestrator = false,
) {
  await ns.write(MetadataFile, JSON.stringify(metadata), "w");
  if (runOrchestrator) {
    ns.run(OrchestratorScript);
  }
}

export function saveMetadataOnServer(
  ns: NS, metadata: Metadata, server = metadata.hackOrchestratorServer,
) {
  return ns.exec(WriteRemoteMetadataScript, server, 1, JSON.stringify(metadata));
}
