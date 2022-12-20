import type { NS } from "../../types/gameTypes";
import type { Metadata } from "../../metadata/metadata";
import { newMetadata, saveMetadata } from "../../metadata/metadata";
import { copyScriptToServer } from "../../utils/copyScriptsToServer";
import { BatchOrchestratorScript, NewServerCommunicationMem } from "../../constants";
import { startBatchOrchestratorServer } from "../helpers/startBatchOrchestratorServer";
import { crackNPCServer } from "../../hack/helpers/cracks";
import { Logger } from "$scripts/utils/logger";

/**
 * Does a breadth first search for accessible hosts within the city.
 * Saves the identified servers in {@link Metadata.newServers}
 */
export async function main(ns: NS) {
  const logger = new Logger(ns, "InitServers");
  const metadata: Metadata = newMetadata(ns);

  const foundServers = new Set();
  metadata.hackTargetMetadata.newServers.forEach((server) => foundServers.add(server));

  let newFoundServersCount: number;
  let newFoundServers = ns.scan();

  const batchOrchestratorMem = ns.getScriptRam(BatchOrchestratorScript) + NewServerCommunicationMem;

  do {
    newFoundServersCount = 0;
    const newFoundServersTemp = newFoundServers;
    newFoundServers = [];

    for (const newFoundServer of newFoundServersTemp) {
      if (foundServers.has(newFoundServer)) continue;
      foundServers.add(newFoundServer);

      newFoundServersCount++;
      newFoundServers.push(...ns.scan(newFoundServer));
      copyScriptToServer(ns, newFoundServer);
      metadata.hackTargetMetadata.newServers.push(newFoundServer);
      logger.log("CrackedServer", {
        server: newFoundServer,
      });
      if (
        !metadata.batchOrchestratorServer &&
        ns.getServerMaxRam(newFoundServer) > batchOrchestratorMem &&
        crackNPCServer(ns, metadata.hackTargetMetadata, newFoundServer)
      ) {
        // if this server can act as orchestrator crack it and assign it
        metadata.batchOrchestratorServer = newFoundServer;
        logger.log("BatchOrchestrator", {
          server: newFoundServer,
        });
      }
    }

    await ns.sleep(100);
  } while (newFoundServersCount > 0);

  metadata.hackTargetMetadata.newServers.sort(
    (a, b) => ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b),
  );

  await startBatchOrchestratorServer(ns, metadata);

  saveMetadata(ns, metadata);
}
