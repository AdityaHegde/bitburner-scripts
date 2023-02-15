import type { Metadata } from "../metadata/metadata";
import { saveMetadataOnServer } from "../metadata/metadata";
import type { NS } from "../types/gameTypes";
import { killScriptIfRunning } from "../utils/killScriptIfRunning";

export async function startRemoteScript(ns: NS, metadata: Metadata, runnerScript: string, ...args) {
  const runnerServer = metadata.runnerServer;
  // copy BatchOrchestratorScript to make sure it exists
  ns.scp(runnerScript, runnerServer);

  // kill the hack orchestration script
  killScriptIfRunning(ns, runnerServer, runnerScript);

  // copy over the metadata
  const savePID = saveMetadataOnServer(ns, metadata, runnerServer);
  // wait till the file is saved
  while (ns.isRunning(savePID, runnerServer)) {
    await ns.sleep(100);
  }
  await ns.sleep(100);
  // start the orchestration script
  ns.exec(runnerScript, runnerServer, 1, ...args);
}
