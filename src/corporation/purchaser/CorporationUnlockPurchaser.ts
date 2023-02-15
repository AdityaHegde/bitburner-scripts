import { PurchaserModule } from "$src/purchaser/PurchaserModule";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";

export class CorporationUnlockPurchaser extends PurchaserModule {
  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly unlockName: string,
  ) {
    super();
    this.name = this.unlockName;
  }

  public init(): void {
    // nothing
  }

  public update(): boolean {
    if (this.ns.corporation.hasUnlockUpgrade(this.unlockName)) return false;
    this.price = this.ns.corporation.getUnlockUpgradeCost(this.unlockName);
    return true;
  }

  public purchase(): Promise<void> {
    this.ns.corporation.unlockUpgrade(this.unlockName);
    this.logger.log("CorpUnlockPurchased", {
      unlockName: this.unlockName,
    });
    return Promise.resolve();
  }
}
