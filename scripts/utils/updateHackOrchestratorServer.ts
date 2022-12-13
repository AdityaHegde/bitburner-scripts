import { HackOrchestratorScript } from "../constants";
import type { NS } from "../types/gameTypes";
import type { Metadata } from "../types/Metadata";
import { saveMetadataOnServer } from "../types/Metadata";
import { killScriptIfRunning } from "./killScriptIfRunning";

export async function updateHackOrchestratorServer(ns: NS, metadata: Metadata) {
  const hackOrchestratorServer = metadata.hackOrchestratorServer;
  // kill the hack orchestration script
  killScriptIfRunning(ns, hackOrchestratorServer, HackOrchestratorScript);

  // copy over the metadata
  const savePID = saveMetadataOnServer(ns, metadata, hackOrchestratorServer);
  // wait till the file is saved
  while (ns.isRunning(savePID, hackOrchestratorServer)) {
    await ns.sleep(100);
  }
  await ns.sleep(100);
  // start the orchestration script
  ns.exec(HackOrchestratorScript, hackOrchestratorServer);
}
