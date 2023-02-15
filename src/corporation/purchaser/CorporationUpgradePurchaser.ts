import { PurchaserModule } from "$src/purchaser/PurchaserModule";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import {
  CorpUpgradeInterval,
  MaxOfficeSizeMulti,
  OfficeUpgraderNamePrefix,
} from "$src/corporation/purchaser/corpPurchaserSync";

export class CorporationUpgradePurchaser extends PurchaserModule {
  private currentLevel: number;
  private levelIntervalMulti = 0;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly upgradeName: string,
    private readonly maxLevel: number,
  ) {
    super();
    this.name = this.upgradeName;
  }

  public init(): void {
    this.currentLevel = this.ns.corporation.getUpgradeLevel(this.upgradeName);
  }

  public update(): boolean {
    if (this.maxLevel !== -1 && this.currentLevel >= this.maxLevel) return false;
    this.price = this.ns.corporation.getUpgradeLevelCost(this.upgradeName);
    if (!this.shouldEnable()) {
      this.enabled = false;
    }
    return true;
  }

  public purchase(): Promise<void> {
    this.ns.corporation.levelUpgrade(this.upgradeName);
    const prevLevel = this.currentLevel;
    this.currentLevel = this.ns.corporation.getUpgradeLevel(this.upgradeName);
    if (prevLevel < this.currentLevel) {
      this.logger.log("CorpUpgrade", {
        upgradeName: this.upgradeName,
        level: this.currentLevel,
      });
    } else {
      this.logger.error("CorpUpgradeFailed", {
        upgradeName: this.upgradeName,
        level: this.currentLevel,
      });
    }
    return Promise.resolve();
  }

  public trigger(name: string): boolean {
    if (!name.startsWith(OfficeUpgraderNamePrefix) || this.levelIntervalMulti === -1) return false;
    this.levelIntervalMulti++;
    if (this.levelIntervalMulti === MaxOfficeSizeMulti) this.levelIntervalMulti = -1;
    return this.shouldEnable();
  }

  private shouldEnable() {
    return (
      this.levelIntervalMulti === -1 ||
      this.levelIntervalMulti * CorpUpgradeInterval > this.currentLevel
    );
  }
}
