import { PlayerServerPrefix } from "../../constants";
import type { Metadata } from "../../types/Metadata";
import { saveMetadata } from "../../types/Metadata";
import type { NS } from "../../types/gameTypes";
import type { Logger } from "../../utils/logger";
import { updateHackOrchestratorServer } from "../../utils/updateHackOrchestratorServer";

const MaxServerSize = 1048576;
const WaitTime = 1000 * 5;

export async function purchaseServers(ns: NS, logger: Logger, metadata: Metadata) {
  while (metadata.playerServerCount < metadata.playerServerMaxCount) {
    await logger.ended(ns);
    await ns.sleep(WaitTime);
    await logger.started(ns);

    const money = ns.getServerMoneyAvailable("home");
    const purchaseCost = ns.getPurchasedServerCost(metadata.playerServerSize);
    logger.log(ns, "Purchasing", {
      money,
      cost: purchaseCost,
      ram: metadata.playerServerSize,
    });

    if (money < purchaseCost) continue;

    // purchase
    const newServerName = ns.purchaseServer(
      PlayerServerPrefix + metadata.playerServerCount,
      metadata.playerServerSize,
    );
    // update metadata
    metadata.playerServerCount++;
    metadata.newServers.push(newServerName);
    // save metadata
    saveMetadata(ns, metadata);
    await updateHackOrchestratorServer(ns, metadata);
    logger.log(ns, "Purchased", {
      server: newServerName,
      ram: metadata.playerServerSize,
    });
  }
}

export async function upgradeServers(ns: NS, logger: Logger, metadata: Metadata): Promise<boolean> {
  if (metadata.playerServerSize >= MaxServerSize) return false;
  metadata.playerServerSize = metadata.playerServerSize << 1;

  while (metadata.playerServerCursor < metadata.playerServerMaxCount) {
    await logger.ended(ns);
    await ns.sleep(WaitTime);
    await logger.started(ns);

    const money = ns.getServerMoneyAvailable("home");
    const upgradeCost = ns.getPurchasedServerUpgradeCost(
      PlayerServerPrefix + metadata.playerServerCursor,
      metadata.playerServerSize,
    );
    logger.log(ns, "Upgrading", {
      money,
      cost: upgradeCost,
      ram: metadata.playerServerSize,
    });

    if (money < upgradeCost) continue;
    // try upgrade
    if (
      !ns.upgradePurchasedServer(
        PlayerServerPrefix + metadata.playerServerCursor,
        metadata.playerServerSize,
      )
    )
      continue;
    // update metadata
    metadata.playerServerCursor++;
    // save metadata
    saveMetadata(ns, metadata);
    logger.log(ns, "Upgraded", {
      server: PlayerServerPrefix + metadata.playerServerCursor,
      ram: metadata.playerServerSize,
    });
  }

  return true;
}
