import { EarlyGameRunner } from "$src/constants";
import type { Metadata } from "$src/metadata/metadata";
import { newMetadata, saveMetadata } from "$src/metadata/metadata";
import { Cracks } from "$src/servers/cracks";
import { startEarlyGameRunner } from "$src/servers/startEarlyGameRunner";
import type { NS } from "$src/types/gameTypes";
import { copyScriptToServer } from "$src/utils/copyScriptsToServer";
import { Logger } from "$src/utils/logger";

/**
 * Does a breadth first search for accessible hosts within the city.
 * Saves the identified servers in {@link Metadata.newServers}
 */
export async function main(ns: NS) {
  const logger = Logger.ConsoleLogger(ns, "InitServers");
  const metadata: Metadata = newMetadata(ns);

  const foundServers = new Set();
  metadata.newServers.forEach((server) => foundServers.add(server));
  metadata.runnerServer = "";

  let newFoundServersCount: number;
  let newFoundServers = ns.scan();

  const earlyGameScriptMem = ns.getScriptRam(EarlyGameRunner);
  const earlyGameScriptMaxMem = Math.pow(2, Math.ceil(Math.log2(earlyGameScriptMem)));
  const cracks = new Cracks(ns);
  logger.log("Initialising", {
    earlyGame: earlyGameScriptMem,
    maxEarlyGame: earlyGameScriptMaxMem,
  });

  do {
    newFoundServersCount = 0;
    const newFoundServersTemp = newFoundServers;
    newFoundServers = [];

    for (const newFoundServer of newFoundServersTemp) {
      if (foundServers.has(newFoundServer) || newFoundServer === "darkweb") continue;
      foundServers.add(newFoundServer);
      const serverMem = ns.getServerMaxRam(newFoundServer);

      newFoundServersCount++;
      newFoundServers.push(...ns.scan(newFoundServer));
      copyScriptToServer(ns, newFoundServer);
      metadata.newServers.push(newFoundServer);
      if (
        !metadata.runnerServer &&
        serverMem > earlyGameScriptMem &&
        serverMem <= earlyGameScriptMaxMem &&
        cracks.crackNPCServer(newFoundServer)
      ) {
        // if this server can act as orchestrator crack it and assign it
        metadata.runnerServer = newFoundServer;
        logger.log("BatchOrchestrator", {
          server: newFoundServer,
        });
      }
    }

    await ns.sleep(100);
  } while (newFoundServersCount > 0);

  metadata.newServers.sort(
    (a, b) => ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b),
  );

  await startEarlyGameRunner(ns, metadata);

  saveMetadata(ns, metadata);
}
