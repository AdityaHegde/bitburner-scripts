import { PurchaserModule } from "$src/purchaser/PurchaserModule";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import {
  AdVertLevelInterval,
  AdVertNamePrefix,
  MaxOfficeSizeMulti,
  OfficeUpgraderNamePrefix,
} from "$src/corporation/purchaser/corpPurchaserSync";

export class CorporationAdVertPurchaser extends PurchaserModule {
  private currentLevel: number;
  private levelIntervalMulti = 0;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly divisionName: string,
    private readonly maxLevel: number,
  ) {
    super();
    this.name = `${AdVertNamePrefix}${this.divisionName}`;
  }

  public init(): void {
    this.currentLevel = this.ns.corporation.getHireAdVertCount(this.divisionName);
  }

  public update(): boolean {
    if (this.maxLevel !== -1 && this.currentLevel >= this.maxLevel) return false;
    this.price = this.ns.corporation.getHireAdVertCost(this.divisionName);
    if (!this.shouldEnable()) {
      this.enabled = false;
    }
    return true;
  }

  public purchase(): Promise<void> {
    this.ns.corporation.hireAdVert(this.divisionName);
    const prevLevel = this.currentLevel;
    this.currentLevel = this.ns.corporation.getHireAdVertCount(this.divisionName);
    if (prevLevel < this.currentLevel) {
      // this.logger.log("CorpHiredAdVert", {
      //   level: this.currentLevel,
      // });
    } else {
      this.logger.error("CorpHiredAdVertFailed", {
        level: this.currentLevel,
      });
    }
    return Promise.resolve();
  }

  public trigger(name: string): boolean {
    if (name !== `${OfficeUpgraderNamePrefix}${this.divisionName}`) return false;
    this.levelIntervalMulti++;
    if (this.levelIntervalMulti === MaxOfficeSizeMulti) this.levelIntervalMulti = -1;
    return this.shouldEnable();
  }

  private shouldEnable() {
    return (
      this.levelIntervalMulti === -1 ||
      this.levelIntervalMulti * AdVertLevelInterval > this.currentLevel
    );
  }
}
