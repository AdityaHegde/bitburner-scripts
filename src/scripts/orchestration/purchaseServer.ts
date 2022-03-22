import { PlayerServerPrefix } from "../../constants";
import { NS } from "../../types/gameTypes";
import { getMetadata, Metadata, saveMetadata } from "../../types/Metadata";
import { OrchestrationActions, setOrchestrationActions } from "../../types/Orchestration";
import { Logger } from "../../utils/logger";

const logger = new Logger("PurchaseServer");

export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = await getMetadata(ns);
  
  if (metadata.playerServerCount < ns.getPurchasedServerLimit()) {
    const newHostName = ns.purchaseServer(
      PlayerServerPrefix + metadata.playerServerCount, metadata.playerServerSize);
    metadata.playerServerCount++;
    metadata.newServers.push(newHostName);
    setOrchestrationActions(metadata, OrchestrationActions.NewPurchasedServer);
  }

  await ns.sleep(500);
  await saveMetadata(ns, metadata);
  await logger.ended(ns);
}
