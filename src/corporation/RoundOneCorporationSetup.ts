import { InitialCorporationSetup } from "$src/corporation/InitialCorporationSetup";
import { nextCorpTick } from "$src/corporation/corpUtils";
import type { EmployeesData } from "$src/corporation/DivisionCityManager";
import { AgricultureDivisionName } from "$src/corporation/divisionManagerFactories";

export const RNDEmployeeDistribution: EmployeesData = [1, 1, 1, 1, 5, 0];
export const FinalEmployeeDistribution: EmployeesData = [3, 2, 2, 2, 0, 0];

export const RoundOneWarehouseLevel = 10;

export const AgriResearch = 50;

export const RoundOneUpgrades = ["Smart Factories", "Smart Storage"];
export const RoundOneLevel = 10;

export const RoundTwoInvestment = 4.8e12;
export const RoundTwoWarehouseLevel = 19;

export class RoundOneCorporationSetup extends InitialCorporationSetup {
  public async process(): Promise<void> {
    await this.updateOffices(RNDEmployeeDistribution);

    this.buyUpgrades(RoundOneUpgrades, RoundOneLevel);
    this.upgradeWarehouses(RoundOneWarehouseLevel);

    let division = this.ns.corporation.getDivision(AgricultureDivisionName);
    while (division.research < AgriResearch) {
      this.logger.log("WaitingForResearch", {
        research: `${division.research}/${AgriResearch}`,
      });
      await nextCorpTick(this.ns);
      this.agriDivisionManager.process();
      division = this.ns.corporation.getDivision(AgricultureDivisionName);
    }

    await this.buyMaterials(1);
    await this.updateOffices(FinalEmployeeDistribution);
    await this.acceptInvestment(2, RoundTwoInvestment);

    await this.upgradeWarehouses(RoundTwoWarehouseLevel);
    await this.buyMaterials(2);
  }

  private async updateOffices(distribution: EmployeesData) {
    for (const cityManager of this.agriDivisionManager.cityManagers) {
      cityManager.forceSetEmployees(distribution);
    }
    await nextCorpTick(this.ns);
    this.agriDivisionManager.process();
  }
}
