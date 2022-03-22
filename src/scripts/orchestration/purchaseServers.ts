import { PlayerServerPrefix } from "../../constants";
import { NS } from "../../types/gameTypes";
import { getMetadata, Metadata, saveMetadata } from "../../types/Metadata";
import { copyScriptToServer } from "../../utils/copyScriptsToServer";
import { Logger } from "../../utils/logger";
import { updateHackOrchestratorServer } from "../../utils/updateHackOrchestratorServer";

const logger = new Logger("PurchaseServer");

export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = await getMetadata(ns);
  
  while (metadata.playerServerCount < metadata.playerServerMaxCount) {
    if (ns.getServerMoneyAvailable("home") >
        ns.getPurchasedServerCost(metadata.playerServerSize)) {

      const newHostName = ns.purchaseServer(
        PlayerServerPrefix + metadata.playerServerCount, metadata.playerServerSize);
      metadata.playerServerCount++;
      metadata.playerServers.push(newHostName);
      await copyScriptToServer(ns, newHostName);
      await updateHackOrchestratorServer(ns, metadata);

      await logger.log(ns, `Purchased ${newHostName}`);
      await saveMetadata(ns, metadata);
    }

    await ns.sleep(5000);
  }

  await logger.ended(ns);
}
