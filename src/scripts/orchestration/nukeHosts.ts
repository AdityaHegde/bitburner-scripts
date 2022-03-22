import { PlayerServerPrefix } from "../../constants";
import { CrackTypeToMethod } from "../../types/Cracks";
import { NS } from "../../types/gameTypes";
import { getMetadata, Metadata, saveMetadata } from "../../types/Metadata";
import { setOrchestrationActions, OrchestrationActions } from "../../types/Orchestration";
import { copyScriptToServer } from "../../utils/copyScriptsToServer";
import { Logger } from "../../utils/logger";
import { updateHackOrchestratorServer } from "../../utils/updateHackOrchestratorServer";

async function crackNPCHost(
  ns: NS, metadata: Metadata, server: string,
): Promise<boolean> {
  const requiredPorts = ns.getServerNumPortsRequired(server);
  const portCraks = Object.keys(metadata.cracks);

  if (requiredPorts > portCraks.length) return false;

  for (let i = 0; i < requiredPorts && i < portCraks.length; i++) {
    ns[CrackTypeToMethod[portCraks[i]]](server);
  }
  ns.nuke(server);
  
  return true;
}

const logger = new Logger("NukeHost");

export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = await getMetadata(ns);

  let i = 0;
  while (i < metadata.newServers.length) {
    const server = metadata.newServers[i];

    if (server.startsWith(PlayerServerPrefix) ||
        await crackNPCHost(ns, metadata, server)) {
      await copyScriptToServer(ns, server);
      metadata.newServers.splice(i, 1);
      if (server.startsWith(PlayerServerPrefix)) {
        metadata.playerServers.push(server);
      } else {
        metadata.servers.push(server);
        setOrchestrationActions(metadata, OrchestrationActions.NewNPCServer);
      }
      await logger.log(ns, `Initilised ${server}`);
    } else {
      i++;
      await logger.log(ns, `Failed to Initilised ${server}`);
    }

    await ns.sleep(100);
  }

  if (!metadata.hackOrchestratorServer) {
    metadata.hackOrchestratorServer = metadata.servers.shift();
  }
  await updateHackOrchestratorServer(ns, metadata);

  await saveMetadata(ns, metadata);
  await logger.ended(ns);
}
