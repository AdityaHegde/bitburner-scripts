import { OrchestratorModule } from "$src/runner/orchestratorModule";
import type { NS } from "$src/types/gameTypes";
import type { DivisionManager } from "$src/corporation/DivisionManager";
import {
  AgricultureDivisionName,
  getAgricultureDivision,
} from "$src/corporation/divisionManagerFactories";
import type { Logger } from "$src/utils/logger/logger";
import { nextCorpTick } from "$src/corporation/corpUtils";
import { CityNames, LastCity } from "$src/enums";
import { ShorthandNotationSchema } from "$src/utils/shorthand-notation";
import { RoundOneInvestment } from "$src/corporation/modules/InvestmentRoundsModule";

export const CorpName = "Corp";
export const SmartSupply = "Smart Supply";
export const InitialWarehouseLevel = 3;
export const InitialUpgrades = [
  "FocusWires",
  "Neural Accelerators",
  "Speech Processor Implants",
  "Nuoptimal Nootropic Injector Implants",
  "Smart Factories",
];
export const InitialUpgradeLevel = 2;

export const AgriMaterials = ["Hardware", "Robots", "AI Cores", "Real Estate"];
export const AgriMaterialPhases = [
  [125, 0, 75, 25000],
  [2675, 96, 2445, 119400],
  [6500, 630, 3750, 86000],
];

export class InitialCorporationSetup extends OrchestratorModule {
  protected agriDivisionManager: DivisionManager;

  public constructor(protected readonly ns: NS, protected readonly logger: Logger) {
    super();
  }

  public init() {
    if (!this.ns.corporation.hasCorporation()) {
      this.ns.corporation.createCorporation(CorpName, false);
    }
    this.agriDivisionManager = getAgricultureDivision(this.ns, this.logger);
    this.agriDivisionManager.init();
  }

  public async process(): Promise<void> {
    this.smartSupply();
    this.agriDivisionManager.process();
    this.upgradeWarehouses(InitialWarehouseLevel);
    this.initialAdVert();
    this.sellProduce();
    this.buyUpgrades(InitialUpgrades, InitialUpgradeLevel);

    await this.buyMaterials(0);

    await this.acceptInvestment(1, RoundOneInvestment);
  }

  protected upgradeWarehouses(level: number) {
    const warehouse = this.ns.corporation.getWarehouse(AgricultureDivisionName, LastCity);
    if (warehouse.level === level) return;
    this.agriDivisionManager.upgradeWarehouse(level);
    this.logger.log("Upgraded warehouse", {
      level,
    });
  }

  protected buyUpgrades(upgrades: Array<string>, level: number) {
    const lastUpgradeLevel = this.ns.corporation.getUpgradeLevel(upgrades[upgrades.length - 1]);
    if (lastUpgradeLevel === level) return;

    for (const upgrade of upgrades) {
      for (let i = this.ns.corporation.getUpgradeLevel(upgrade); i < level; i++) {
        this.ns.corporation.levelUpgrade(upgrade);
      }
    }
    this.logger.log("Bought upgrades", {
      upgrades,
      level,
    });
  }

  protected async buyMaterials(phase: number) {
    for (const cityName of CityNames) {
      for (let i = 0; i < AgriMaterials.length; i++) {
        const materialName = AgriMaterials[i];
        // TODO: running from the middle
        this.ns.corporation.buyMaterial(
          AgricultureDivisionName,
          cityName,
          materialName,
          AgriMaterialPhases[phase][i] / 10,
        );
      }
    }

    await nextCorpTick(this.ns);
    this.agriDivisionManager.process();
    for (const cityName of CityNames) {
      for (let i = 0; i < AgriMaterials.length; i++) {
        this.ns.corporation.buyMaterial(AgricultureDivisionName, cityName, AgriMaterials[i], 0);
      }
    }

    this.logger.log("Bought materials", {
      materials: AgriMaterials.map((mat, i) => `${mat}(${AgriMaterialPhases[phase][i]})`).join(","),
    });
    await nextCorpTick(this.ns);
    this.agriDivisionManager.process();
  }

  protected async acceptInvestment(
    round: number,
    funds: number,
    process: () => Promise<void> = async () => this.agriDivisionManager.process(),
  ) {
    let investment = this.ns.corporation.getInvestmentOffer();
    if (investment.round > round) return;
    while (investment.funds < funds) {
      await nextCorpTick(this.ns);
      await process();
      investment = this.ns.corporation.getInvestmentOffer();
      this.logger.log("Waiting for investment", {
        round,
        offer: `${ShorthandNotationSchema.usd.convert(
          investment.funds,
        )}/${ShorthandNotationSchema.usd.convert(funds)}`,
      });
    }
    this.ns.corporation.acceptInvestmentOffer();
    this.logger.log("Accepted investment", {
      round,
      offer: ShorthandNotationSchema.usd.convert(investment.funds),
    });
  }

  private smartSupply() {
    if (this.ns.corporation.hasUnlockUpgrade(SmartSupply)) return;
    // unlock smart supply
    this.ns.corporation.unlockUpgrade(SmartSupply);
    for (const cityName of CityNames) {
      this.ns.corporation.setSmartSupply(AgricultureDivisionName, cityName, true);
    }
    this.logger.log("Bought smart supply");
  }

  private initialAdVert() {
    const adVertCount = this.ns.corporation.getHireAdVertCount(AgricultureDivisionName);
    if (adVertCount === 1) return;
    this.ns.corporation.hireAdVert(AgricultureDivisionName);
    this.logger.log("Bought 1 AdVert");
  }

  private sellProduce() {
    for (const cityName of CityNames) {
      this.ns.corporation.sellMaterial(AgricultureDivisionName, cityName, "Food", "MAX", "MP");
      this.ns.corporation.sellMaterial(AgricultureDivisionName, cityName, "Plants", "MAX", "MP");
    }
  }
}
