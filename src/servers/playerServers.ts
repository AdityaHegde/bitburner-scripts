import { MaxServerSize, PlayerServerPrefix } from "$src/constants";
import type { RunnerModule } from "$src/runner/runner";
import type { Servers } from "$src/servers/servers";
import type { NS } from "$src/types/gameTypes";
import { copyScriptToServer } from "$src/utils/copyScriptsToServer";
import type { Logger } from "$src/utils/logger/logger";

export class PlayerServers implements RunnerModule {
  private playerServerCount = 0;
  private readonly playerServerMaxCount: number;
  private playerServerCursor = 0;
  private playerServerSize = 8;

  private initialised = false;
  private lastRun = 0;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly servers: Servers,
    private readonly playerServerMaxSize: number,
  ) {
    this.playerServerMaxCount = ns.getPurchasedServerLimit();
    this.playerServerMaxSize = Math.min(playerServerMaxSize, MaxServerSize);
  }

  public async run() {
    const now = Date.now();
    // only run this every ~5sec
    if (now - this.lastRun < 5000) return;

    if (!this.initialised) this.init();

    if (this.playerServerCount < this.playerServerMaxCount) {
      while (this.purchaseServer()) {
        // no-op
      }
    } else {
      while (this.upgradeServers()) {
        // no-op
      }
    }

    this.lastRun = now;
  }

  private init() {
    this.initialised = true;

    for (const resource of this.servers.resources) {
      if (!resource.server.startsWith(PlayerServerPrefix)) continue;
      const num = Number(resource.server.replace(PlayerServerPrefix, "")) + 1;
      if (num > this.playerServerCount) {
        this.playerServerCount = num;
      }
      if (resource.maxMem > this.playerServerSize) {
        this.playerServerSize = resource.maxMem;
      }
    }
    this.logger.log("PlayerServers", {
      playerServerCount: this.playerServerCount,
      playerServerSize: this.playerServerSize,
    });
  }

  private purchaseServer(): boolean {
    const money = this.ns.getServerMoneyAvailable("home");
    const purchaseCost = this.ns.getPurchasedServerCost(this.playerServerSize);

    if (money < purchaseCost) return false;

    // purchase
    const newServerName = this.ns.purchaseServer(
      PlayerServerPrefix + this.playerServerCount,
      this.playerServerSize,
    );
    if (!newServerName) return false;
    this.playerServerCount++;
    copyScriptToServer(this.ns, newServerName);
    this.servers.newCrackedServers([newServerName]);

    this.logger.log("Purchased", {
      server: newServerName,
      ram: this.playerServerSize,
    });
    return true;
  }

  private upgradeServers(): boolean {
    if (this.playerServerCursor === this.playerServerMaxCount) {
      this.playerServerCursor = 0;
      this.playerServerSize = this.playerServerSize << 1;
    }
    if (this.playerServerSize > this.playerServerMaxSize) return false;

    const money = this.ns.getServerMoneyAvailable("home");
    const serverName = PlayerServerPrefix + this.playerServerCursor;

    if (this.servers.resourcesMap[serverName].maxMem === this.playerServerSize) {
      // starting the script from middle.
      // TODO: do this in init
      this.playerServerCursor++;
      return true;
    }

    const upgradeCost = this.ns.getPurchasedServerUpgradeCost(serverName, this.playerServerSize);

    if (money < upgradeCost) return false;

    // try upgrade
    if (!this.ns.upgradePurchasedServer(serverName, this.playerServerSize)) return false;
    this.playerServerCursor++;
    this.servers.updateResources([serverName]);

    this.logger.log("Upgraded", {
      server: serverName,
      ram: this.playerServerSize,
    });
    return true;
  }
}
