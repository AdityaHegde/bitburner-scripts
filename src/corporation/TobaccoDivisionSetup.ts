import { InitialCorporationSetup, InitialUpgrades } from "$src/corporation/InitialCorporationSetup";
import type { DivisionManager } from "$src/corporation/DivisionManager";
import { getTobaccoDivision, TobaccoDivisionName } from "$src/corporation/divisionManagerFactories";
import { Purchaser } from "$src/purchaser/Purchaser";
import { OfficeUpgrader } from "$src/corporation/purchaser/OfficeUpgrader";
import { CorporationAdVertPurchaser } from "$src/corporation/purchaser/CorporationAdVertPurchaser";
import { CorporationFundsResource } from "$src/corporation/purchaser/CorporationFundsResource";
import { CorporationUpgradePurchaser } from "$src/corporation/purchaser/CorporationUpgradePurchaser";
import { ProductionCity } from "$src/enums";
import { nextCorpTick, WilsonAnalytics } from "$src/corporation/corpUtils";
import { OfficeUpgradeSizeInterval } from "$src/corporation/purchaser/corpPurchaserSync";

export class TobaccoDivisionSetup extends InitialCorporationSetup {
  private tobaccoDivisionManager: DivisionManager;
  private purchaser: Purchaser;

  public init() {
    super.init();
    this.tobaccoDivisionManager = getTobaccoDivision(this.ns, this.logger);
    this.tobaccoDivisionManager.init();
    this.purchaser = new Purchaser(
      this.ns,
      this.logger,
      [
        new OfficeUpgrader(
          this.ns,
          this.logger,
          TobaccoDivisionName,
          15,
          OfficeUpgradeSizeInterval,
        ),
        new CorporationAdVertPurchaser(this.ns, this.logger, TobaccoDivisionName, 10),
        new CorporationUpgradePurchaser(this.ns, this.logger, WilsonAnalytics, 10),
      ],
      new CorporationFundsResource(this.ns, 1.5),
    );
    this.purchaser.init();
  }

  public async process(): Promise<void> {
    await this.upgradeOffices(27, 6);

    this.buyUpgrades(InitialUpgrades, 20);
    this.buyUpgrades(["Project Insight", "DreamSense"], 10);
    this.agriDivisionManager.process();
    this.tobaccoDivisionManager.process();
    await nextCorpTick(this.ns);

    await this.upgradeOffices(15, 6);
    await this.upgradeOffices(15, 0);
  }

  private upgradeOffices(main: number, others: number) {
    for (const cityManager of this.tobaccoDivisionManager.cityManagers) {
      this.ns.corporation.upgradeOfficeSize(
        TobaccoDivisionName,
        cityManager.cityName,
        cityManager.cityName === ProductionCity ? main : others,
      );
    }
    this.agriDivisionManager.process();
    this.tobaccoDivisionManager.process();
    return nextCorpTick(this.ns);
  }
}
