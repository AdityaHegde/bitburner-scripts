import { BatchOrchestratorScript, NewServerCommunicationScript } from "../../constants";
import type { NS } from "../../types/gameTypes";
import type { Metadata } from "../../metadata/metadata";
import { saveMetadataOnServer } from "../../metadata/metadata";
import { killScriptIfRunning } from "../../utils/killScriptIfRunning";
import type { NewServerType } from "$scripts/servers/helpers/newServerHelpers";

export async function startBatchOrchestratorServer(ns: NS, metadata: Metadata) {
  const batchOrchestratorServer = metadata.batchOrchestratorServer;
  // copy BatchOrchestratorScript to make sure it exists
  ns.scp(BatchOrchestratorScript, batchOrchestratorServer);

  // kill the hack orchestration script
  killScriptIfRunning(ns, batchOrchestratorServer, BatchOrchestratorScript);

  // copy over the metadata
  const savePID = saveMetadataOnServer(ns, metadata, batchOrchestratorServer);
  // wait till the file is saved
  while (ns.isRunning(savePID, batchOrchestratorServer)) {
    await ns.sleep(100);
  }
  await ns.sleep(100);
  // start the orchestration script
  ns.exec(BatchOrchestratorScript, batchOrchestratorServer);
}

export function notifyBatchOrchestratorServer(
  ns: NS,
  metadata: Metadata,
  type: NewServerType,
  servers: Array<string>,
) {
  ns.exec(NewServerCommunicationScript, metadata.batchOrchestratorServer, type, ...servers);
}
