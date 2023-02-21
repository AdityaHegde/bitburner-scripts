import { PurchaserModule } from "$src/purchaser/PurchaserModule";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import type { ServerDataList } from "$src/servers/serverDataList";
import { PlayerServerPrefix } from "$src/constants";
import { copyScriptToServer } from "$src/utils/copyScriptsToServer";
import { config } from "$src/config";
import { FormulaPurchaserName, PlayerServerPurchaserName } from "$src/purchaser/Purchaser";
import { FormulaPrice } from "$src/servers/cracks";

export class PlayerServerPurchaser extends PurchaserModule {
  public name = PlayerServerPurchaserName;

  private playerServerCount = 0;
  private readonly playerServerMaxCount: number;
  private playerServerCursor = 0;
  private playerServerSize: number;
  private readonly playerServerMaxSize: number;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly serverDataList: ServerDataList,
  ) {
    super();
    this.playerServerMaxCount = ns.getPurchasedServerLimit();
    this.playerServerMaxSize = Math.min(config.playerServerMaxMem, ns.getPurchasedServerMaxRam());
    this.playerServerSize = config.playerServerInitMem;
  }

  public init() {
    for (const serverData of this.serverDataList.allServerData) {
      if (!serverData.name.startsWith(PlayerServerPrefix)) continue;
      const cursor = Number(serverData.name.replace(PlayerServerPrefix, "")) + 1;

      if (cursor > this.playerServerCount) {
        this.playerServerCount = cursor;
      }

      if (serverData.maxMem > this.playerServerSize) {
        this.playerServerSize = serverData.maxMem;
        this.playerServerCursor = cursor;
      } else if (serverData.maxMem == this.playerServerSize && cursor > this.playerServerCursor) {
        this.playerServerCursor = cursor;
      }
    }

    this.logger.info("PlayerServerPurchaser", {
      playerServerCount: this.playerServerCount,
      playerServerSize: this.playerServerSize,
      playerServerCursor: this.playerServerCursor,
    });
    if (this.playerServerSize > config.playerServerInitMem) {
      this.emit("purchaserTrigger", this.name);
    }
  }

  public update(): boolean {
    if (this.playerServerCursor === this.playerServerMaxCount) {
      this.playerServerCursor = 0;
      if (this.playerServerSize === config.playerServerInitMem) {
        this.emit("purchaserTrigger", this.name);
      }
      this.playerServerSize = this.playerServerSize << 1;
    }
    if (this.playerServerCount < this.playerServerMaxCount) {
      this.updateServerPurchase();
    } else {
      if (this.playerServerSize > this.playerServerMaxSize) return false;
      this.updateServerUpgrade();
    }
    // if buy/upgrade price for 1/3 of servers is greater than formula, wait for formula
    if ((this.price * this.playerServerMaxCount) / 3 > FormulaPrice && !config.hasFormulaAccess) {
      this.enabled = false;
    }
    return true;
  }

  public purchase(): Promise<void> {
    if (this.playerServerCount < this.playerServerMaxCount) {
      this.purchaseNewServer();
    } else {
      this.upgradeServer();
    }
    return Promise.resolve();
  }

  public trigger(name: string): boolean {
    return name === FormulaPurchaserName;
  }

  private updateServerPurchase() {
    this.price = this.ns.getPurchasedServerCost(this.playerServerSize);
    this.score = this.price / this.playerServerSize;
  }

  private updateServerUpgrade() {
    const serverName = PlayerServerPrefix + this.playerServerCursor;
    this.price = this.ns.getPurchasedServerUpgradeCost(serverName, this.playerServerSize);
    // we upgrade in powers of 2
    const memGained = this.playerServerSize / 2;
    this.score = memGained / this.price;
  }

  private purchaseNewServer() {
    const newServerName = this.ns.purchaseServer(
      PlayerServerPrefix + this.playerServerCount,
      this.playerServerSize,
    );
    if (!newServerName) return;

    this.playerServerCount++;
    this.playerServerCursor++;
    copyScriptToServer(this.ns, newServerName);
    this.serverDataList.addServer(newServerName);

    this.logger.log("ServerPurchased", {
      server: newServerName,
      ram: this.playerServerSize,
    });
  }

  private upgradeServer() {
    const serverName = PlayerServerPrefix + this.playerServerCursor;
    // try upgrade
    if (!this.ns.upgradePurchasedServer(serverName, this.playerServerSize)) return false;
    this.playerServerCursor++;

    this.serverDataList.updateServer(serverName);

    this.logger.log("ServerUpgraded", {
      server: serverName,
      ram: this.playerServerSize,
    });
  }
}
