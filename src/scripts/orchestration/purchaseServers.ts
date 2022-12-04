import { PlayerServerPrefix } from "../../constants";
import { NS } from "../../types/gameTypes";
import { getMetadata, Metadata, saveMetadata } from "../../types/Metadata";
import { Logger } from "../../utils/logger";

const logger = new Logger("PurchaseServer");

export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = await getMetadata(ns);

  // purchase
  const newHostName = ns.purchaseServer(
    PlayerServerPrefix + metadata.playerServerCount,
    metadata.playerServerSize
  );
  // update metadata
  metadata.playerServerCount++;
  metadata.newServers.push(newHostName);

  // save metadata
  await saveMetadata(ns, metadata);
  await logger.log(ns, `Purchased ${newHostName}`);

  await logger.ended(ns);
}
