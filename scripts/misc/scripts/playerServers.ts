import type { NS } from "../../types/gameTypes";
import type { Metadata } from "../../types/Metadata";
import { getMetadata } from "../../types/Metadata";
import { Logger } from "../../utils/logger";
import { purchaseServers, upgradeServers } from "../helpers/playerServerHelpers";

const logger = new Logger("PlayerServers");

export async function main(ns: NS) {
  await logger.started(ns);
  const metadata: Metadata = getMetadata(ns);

  if (metadata.playerServerCount < metadata.playerServerMaxCount) {
    await purchaseServers(ns, logger, metadata);
  }

  while (await upgradeServers(ns, logger, metadata)) {
    // no-op
  }

  logger.ended(ns);
}
