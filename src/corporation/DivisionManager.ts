import type { NS } from "$src/types/gameTypes";
import { CityNames, IndustryType } from "$src/enums";
import type { EmployeesData } from "$src/corporation/DivisionCityManager";
import { DivisionCityManager } from "$src/corporation/DivisionCityManager";
import type { Logger } from "$src/utils/logger/logger";
import type { DivisionManagerModule } from "$src/corporation/modules/DivisionManagerModule";

export class DivisionManager {
  public readonly cityManagers = new Array<DivisionCityManager>();

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    public readonly divisionName: string,
    public readonly type: IndustryType,
    private readonly ratios: [EmployeesData, EmployeesData],
    private readonly modules: Array<DivisionManagerModule>,
  ) {}

  public init() {
    try {
      this.ns.corporation.expandIndustry(this.type as any, this.divisionName);
    } catch (err) {
      // no-op
    }

    for (let i = 0; i < CityNames.length; i++) {
      const cityManager = new DivisionCityManager(
        this.ns,
        this.logger,
        this.divisionName,
        CityNames[i],
        i === 0 ? this.ratios[0] : this.ratios[1],
      );
      cityManager.init();
      this.cityManagers.push(cityManager);
    }

    for (const module of this.modules) {
      module.init();
      module.on("researched", (name) => {
        for (const module of this.modules) {
          module.researched(name);
        }
      });
    }
  }

  public process() {
    for (const cityManager of this.cityManagers) {
      cityManager.process();
    }

    for (const module of this.modules) {
      module.process();
    }
  }

  public upgradeWarehouse(toLevel: number) {
    for (const cityManager of this.cityManagers) {
      cityManager.upgradeWarehouse(toLevel);
    }
  }
}
