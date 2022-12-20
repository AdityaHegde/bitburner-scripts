import { PlayerServerPrefix } from "../../constants";
import type { Metadata } from "../../metadata/metadata";
import { saveMetadata } from "../../metadata/metadata";
import type { NS } from "../../types/gameTypes";
import type { Logger } from "../../utils/logger";
import { notifyBatchOrchestratorServer } from "./startBatchOrchestratorServer";
import { NewServerType } from "$scripts/servers/helpers/newServerHelpers";

const MaxServerSize = 1048576;
const WaitTime = 1000 * 5;

export async function purchaseServers(ns: NS, logger: Logger, metadata: Metadata) {
  const playerServerMetadata = metadata.playerServerMetadata;
  while (playerServerMetadata.playerServerCount < playerServerMetadata.playerServerMaxCount) {
    await ns.sleep(WaitTime);

    const money = ns.getServerMoneyAvailable("home");
    const purchaseCost = ns.getPurchasedServerCost(playerServerMetadata.playerServerSize);
    logger.log("Purchasing", {
      money,
      cost: purchaseCost,
      ram: playerServerMetadata.playerServerSize,
    });

    if (money < purchaseCost) continue;

    // purchase
    const newServerName = ns.purchaseServer(
      PlayerServerPrefix + playerServerMetadata.playerServerCount,
      playerServerMetadata.playerServerSize,
    );
    // update metadata
    playerServerMetadata.playerServerCount++;
    // save metadata
    saveMetadata(ns, metadata);
    // notify batch orchestrator
    notifyBatchOrchestratorServer(ns, metadata, NewServerType.Player, [newServerName]);
    logger.log("Purchased", {
      server: newServerName,
      ram: playerServerMetadata.playerServerSize,
    });
  }
}

export async function upgradeServers(ns: NS, logger: Logger, metadata: Metadata): Promise<boolean> {
  const playerServerMetadata = metadata.playerServerMetadata;
  if (playerServerMetadata.playerServerCursor === playerServerMetadata.playerServerMaxCount) {
    playerServerMetadata.playerServerCursor = 0;
    playerServerMetadata.playerServerSize = playerServerMetadata.playerServerSize << 1;
    saveMetadata(ns, metadata);
  }
  if (playerServerMetadata.playerServerSize >= MaxServerSize) return false;

  while (playerServerMetadata.playerServerCursor < playerServerMetadata.playerServerMaxCount) {
    await ns.sleep(WaitTime);

    const money = ns.getServerMoneyAvailable("home");
    const serverName = PlayerServerPrefix + playerServerMetadata.playerServerCursor;
    const upgradeCost = ns.getPurchasedServerUpgradeCost(
      serverName,
      playerServerMetadata.playerServerSize,
    );
    logger.log("Upgrading", {
      money,
      cost: upgradeCost,
      ram: playerServerMetadata.playerServerSize,
    });

    if (money < upgradeCost) continue;
    // try upgrade
    if (!ns.upgradePurchasedServer(serverName, playerServerMetadata.playerServerSize)) continue;
    // update metadata
    playerServerMetadata.playerServerCursor++;
    // save metadata
    saveMetadata(ns, metadata);
    // notify batch orchestrator
    notifyBatchOrchestratorServer(ns, metadata, NewServerType.Player, [serverName]);
    logger.log("Upgraded", {
      server: serverName,
      ram: playerServerMetadata.playerServerSize,
    });
  }

  return true;
}
