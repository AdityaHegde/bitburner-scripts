import { PlayerServerPrefix } from "../../constants";
import { NS } from "../../types/gameTypes";
import { getMetadata, Metadata, saveMetadata } from "../../types/Metadata";
import { Logger } from "../../utils/logger";

const logger = new Logger("PurchaseServer");

export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = getMetadata(ns);

  while (metadata.playerServerCount < metadata.playerServerMaxCount) {
    if (
      ns.getServerMoneyAvailable("home") >
      ns.getPurchasedServerCost(metadata.playerServerSize)
    ) {
      // purchase
      const newHostName = ns.purchaseServer(
        PlayerServerPrefix + metadata.playerServerCount,
        metadata.playerServerSize
      );
      // update metadata
      metadata.playerServerCount++;
      metadata.newServers.push(newHostName);
      // save metadata
      saveMetadata(ns, metadata);
      logger.log(ns, `Purchased ${newHostName}`);
    }

    await ns.sleep(1000 * 60);
  }

  logger.ended(ns);
}
