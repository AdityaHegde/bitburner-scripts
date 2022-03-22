import { DistributedHackScript } from "../constants";
import { NS } from "../types/gameTypes";
import { Metadata, saveMetadataOnServer } from "../types/Metadata";
import { killScriptIfRunning } from "./killScriptIfRunning";

export async function updateHackOrchestratorServer(ns: NS, metadata: Metadata) {
  const hackOrchestratorServer = metadata.hackOrchestratorServer;
  killScriptIfRunning(ns, hackOrchestratorServer, DistributedHackScript);

  const savePID = saveMetadataOnServer(ns, metadata, metadata.hackOrchestratorServer);
  while (ns.isRunning(savePID, metadata.hackOrchestratorServer)) {
    await ns.sleep(100);
  }
  await ns.sleep(100);
  ns.exec(DistributedHackScript, metadata.hackOrchestratorServer);
}
