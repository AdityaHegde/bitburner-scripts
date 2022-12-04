import { OrchestratorScript, PlayerServerPrefix } from "../../constants";
import { CrackType, CrackTypeToFile, runCracks } from "../../types/Cracks";
import { NS } from "../../types/gameTypes";
import { getMetadata, Metadata, saveMetadata } from "../../types/Metadata";
import { copyScriptToServer } from "../../utils/copyScriptsToServer";
import { Logger } from "../../utils/logger";
import { updateHackOrchestratorServer } from "../../utils/updateHackOrchestratorServer";

async function crackNPCHost(
  ns: NS,
  metadata: Metadata,
  server: string
): Promise<boolean> {
  const requiredPorts = ns.getServerNumPortsRequired(server);
  const cracksAvailable = Object.keys(metadata.cracks) as Array<CrackType>;

  if (requiredPorts > cracksAvailable.length) return false;

  runCracks(ns, cracksAvailable, server, requiredPorts);
  ns.nuke(server);

  return true;
}

const logger = new Logger("NukeHost");

export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = await getMetadata(ns);

  // collect available cracks
  for (const crack of Object.keys(CrackTypeToFile)) {
    if (ns.fileExists(CrackTypeToFile[crack])) {
      metadata.cracks[crack] = true;
    }
  }

  let i = 0;
  while (i < metadata.newServers.length) {
    const server = metadata.newServers[i];

    if (
      // if it is a new player server
      server.startsWith(PlayerServerPrefix) ||
      // or is cracked
      (await crackNPCHost(ns, metadata, server))
    ) {
      // copy all scripts
      await copyScriptToServer(ns, server);
      // update metadata
      metadata.newServers.splice(i, 1);
      if (server.startsWith(PlayerServerPrefix)) {
        metadata.playerServers.push(server);
      } else {
        metadata.servers.push(server);
      }
      await logger.log(ns, `Initialised ${server}`);
    } else {
      i++;
    }

    await ns.sleep(100);
  }

  // update the hack orchestrator
  if (!metadata.hackOrchestratorServer) {
    metadata.hackOrchestratorServer = metadata.servers.shift();
  }
  await updateHackOrchestratorServer(ns, metadata);

  // save metadata
  await saveMetadata(ns, metadata);
  await logger.ended(ns);
}
