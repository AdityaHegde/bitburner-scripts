import { PurchaserModule } from "$src/purchaser/PurchaserModule";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import { CityNames, ProductionCity } from "$src/enums";
import { ShorthandNotationSchema } from "$src/utils/shorthand-notation";
import {
  OfficeUpgraderNamePrefix,
  OfficeUpgradeSizeInterval,
} from "$src/corporation/purchaser/corpPurchaserSync";

export class OfficeUpgrader extends PurchaserModule {
  private currentSize: number;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly divisionName: string,
    private readonly expansionFactor: number,
    private readonly maxSize: number,
  ) {
    super();
    this.name = `${OfficeUpgraderNamePrefix}${this.divisionName}`;
  }

  public init(): void {
    this.currentSize = this.ns.corporation.getOffice(this.divisionName, ProductionCity).size;
    this.logger.log("OfficeUpgrader", {
      divisionName: this.divisionName,
      currentSize: this.currentSize,
      maxSize: this.maxSize,
    });
    for (let i = OfficeUpgradeSizeInterval; i < this.currentSize; i += OfficeUpgradeSizeInterval) {
      this.emit("purchaserTrigger", this.name);
    }
  }

  public update(): boolean {
    if (this.currentSize >= this.maxSize) return false;
    this.price = 0;
    for (const cityName of CityNames) {
      const factor = cityName === ProductionCity ? this.expansionFactor : this.expansionFactor / 3;
      this.price += this.ns.corporation.getOfficeSizeUpgradeCost(
        this.divisionName,
        cityName,
        factor,
      );
    }
    return true;
  }

  public purchase(): Promise<void> {
    for (const cityName of CityNames) {
      const factor = cityName === ProductionCity ? this.expansionFactor : this.expansionFactor / 3;
      this.ns.corporation.upgradeOfficeSize(this.divisionName, cityName, factor);
    }
    const prevSize = this.currentSize;
    this.currentSize = this.ns.corporation.getOffice(this.divisionName, ProductionCity).size;
    if (
      Math.floor(prevSize / OfficeUpgradeSizeInterval) <
      Math.floor(this.currentSize / OfficeUpgradeSizeInterval)
    ) {
      this.emit("purchaserTrigger", this.name);
    }

    this.logger.log("ExpandedOffices", {
      divisionName: this.divisionName,
      size: this.currentSize,
      price: ShorthandNotationSchema.usd.convert(this.price),
    });
    return Promise.resolve();
  }
}
