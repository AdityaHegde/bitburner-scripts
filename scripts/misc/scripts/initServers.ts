import type { NS } from "../../types/gameTypes";
import type { Metadata } from "../../types/Metadata";
import { newMetadata, saveMetadata } from "../../types/Metadata";
import { copyScriptToServer } from "../../utils/copyScriptsToServer";
import { Logger } from "../../utils/logger";
import { HackOrchestratorScript } from "../../constants";
import { updateHackOrchestratorServer } from "../../utils/updateHackOrchestratorServer";
import { crackNPCServer } from "../../hack/helpers/cracks";

const logger = new Logger("InitServer");

/**
 * Does a breadth first search for accessible hosts within the city.
 * Saves the identified servers in {@link Metadata.newServers}
 */
export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = newMetadata(ns);

  const foundServers = new Set();

  let newFoundServersCount: number;
  let newFoundServers = ns.scan();

  const hackOrchestratorMem = ns.getScriptRam(HackOrchestratorScript);

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
      metadata.newServers.push(newFoundServer);
      if (
        !metadata.hackOrchestratorServer &&
        ns.getServerMaxRam(newFoundServer) > hackOrchestratorMem &&
        crackNPCServer(ns, metadata, newFoundServer)
      ) {
        // if this server can act as orchestrator crack it and assign it
        metadata.hackOrchestratorServer = newFoundServer;
      }
    }

    await ns.sleep(100);
  } while (newFoundServersCount > 0);

  await updateHackOrchestratorServer(ns, metadata);

  saveMetadata(ns, metadata);
  logger.ended(ns);
}
