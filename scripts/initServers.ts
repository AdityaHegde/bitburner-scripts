import { GameStage, GameStageToRunner, getGameStage } from "$src/gameStage/gameStage";
import type { Metadata } from "$src/metadata/metadata";
import { newMetadata, saveMetadata } from "$src/metadata/metadata";
import { Cracks } from "$src/servers/cracks";
import { startRemoteScript } from "$src/servers/startRemoteScript";
import type { NS } from "$src/types/gameTypes";
import { copyScriptToServer } from "$src/utils/copyScriptsToServer";
import { Logger } from "$src/utils/logger/logger";
import { isPlayerServer } from "$src/utils/isPlayerServer";
import { validateFlags } from "$src/utils/validateFlags";
import type { EarlyGameFlags } from "./runner";

/**
 * Does a breadth first search for accessible hosts within the city.
 * Saves the identified servers in {@link Metadata.newServers}
 */
export async function main(ns: NS) {
  const [ok] = validateFlags<EarlyGameFlags>(ns, [
    ["boolean", "noPurchase", "No purchasing.", false],
    ["boolean", "corp", "Enable corp.", false],
  ]);
  if (!ok) {
    return;
  }

  const logger = Logger.ConsoleLogger(ns, "InitServers");
  const metadata: Metadata = newMetadata();

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

      // skip player servers
      if (isPlayerServer(newFoundServer)) {
        metadata.newServers.push(newFoundServer);
        continue;
      }

      npcServers.push(newFoundServer);
      if (
        !cracks.crackNPCServer({
          name: newFoundServer,
          requiredPorts: ns.getServerNumPortsRequired(newFoundServer),
        } as any)
      )
        continue;
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

  if (!metadata.runnerServer) {
    for (const server of metadata.newServers) {
      const serverMem = ns.getServerMaxRam(server);
      if (serverMem < runnerScriptMem) continue;
      metadata.runnerServer = server;
      break;
    }
  }

  if (!metadata.runnerServer) {
    ns.tprintf("Failed to assign runner");
    return;
  }
  ns.tprintf("Running %s on %s", runnerScript, metadata.runnerServer);

  npcServers.sort((a, b) => {
    const portsA = ns.getServerNumPortsRequired(a);
    const portsB = ns.getServerNumPortsRequired(b);
    if (portsA === portsB) {
      return ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b);
    }
    return portsA - portsB;
  });
  metadata.newServers.push(...npcServers);

  await startRemoteScript(ns, metadata, runnerScript, ...ns.args);

  saveMetadata(ns, metadata);
}
