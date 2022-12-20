import type { NS } from "../../types/gameTypes";
import type { Metadata } from "../../metadata/metadata";
import { getMetadata } from "../../metadata/metadata";
import { Logger } from "../../utils/logger";
import { purchaseServers, upgradeServers } from "../helpers/playerServerHelpers";

export async function main(ns: NS) {
  const logger = new Logger(ns, "PlayerServers");

  const metadata: Metadata = getMetadata(ns);

  if (
    metadata.playerServerMetadata.playerServerCount <
    metadata.playerServerMetadata.playerServerMaxCount
  ) {
    await purchaseServers(ns, logger, metadata);
  }

  while (await upgradeServers(ns, logger, metadata)) {
    // no-op
  }
}
