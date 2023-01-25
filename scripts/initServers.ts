import { GameStage, GameStageToRunner, getGameStage } from "$src/gameStage/gameStage";
import type { Metadata } from "$src/metadata/metadata";
import { newMetadata, saveMetadata } from "$src/metadata/metadata";
import { Cracks } from "$src/servers/cracks";
import { startEarlyGameRunner } from "$src/servers/startEarlyGameRunner";
import type { NS } from "$src/types/gameTypes";
import { copyScriptToServer } from "$src/utils/copyScriptsToServer";
import { Logger } from "$src/utils/logger/logger";

/**
 * Does a breadth first search for accessible hosts within the city.
 * Saves the identified servers in {@link Metadata.newServers}
 */
export async function main(ns: NS) {
  const logger = Logger.ConsoleLogger(ns, "InitServers");
  const metadata: Metadata = newMetadata(ns);

  const foundServers = new Set();
  foundServers.add("darkweb");
  metadata.newServers.forEach((server) => foundServers.add(server));
  metadata.runnerServer = "";

  let newFoundServersCount: number;
  let newFoundServers = ns.scan();

  const gameStage = getGameStage(ns);
  const runnerScript = GameStageToRunner[gameStage];
  const runnerScriptMem = ns.getScriptRam(runnerScript);
  logger.log("Initialising", {
    gameStage: GameStage[gameStage],
    runnerScript,
    runnerScriptMem,
  });

  const cracks = new Cracks(ns);
  cracks.collectCracks();
  const npcServers = new Array<string>();

  do {
    newFoundServersCount = 0;
    const newFoundServersTemp = newFoundServers;
    newFoundServers = [];

    for (const newFoundServer of newFoundServersTemp) {
      if (foundServers.has(newFoundServer)) continue;
      foundServers.add(newFoundServer);
      const serverMem = ns.getServerMaxRam(newFoundServer);

      newFoundServersCount++;
      newFoundServers.push(...ns.scan(newFoundServer));
      copyScriptToServer(ns, newFoundServer);
      npcServers.push(newFoundServer);
      if (!cracks.crackNPCServer(newFoundServer)) continue;
      if (!metadata.runnerServer && serverMem > runnerScriptMem) {
        // if this server can act as orchestrator crack it and assign it
        metadata.runnerServer = newFoundServer;
        logger.log("BatchOrchestrator", {
          server: newFoundServer,
        });
      }
    }

    await ns.sleep(100);
  } while (newFoundServersCount > 0);

  npcServers.sort((a, b) => {
    const portsA = ns.getServerNumPortsRequired(a);
    const portsB = ns.getServerNumPortsRequired(b);
    if (portsA === portsB) {
      return ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b);
    }
    return portsA - portsB;
  });
  metadata.newServers.push(...npcServers);

  await startEarlyGameRunner(ns, metadata, runnerScript);

  saveMetadata(ns, metadata);
}
