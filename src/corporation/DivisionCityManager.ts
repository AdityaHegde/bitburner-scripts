import type { CityName, NS, Office } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import { EmployeePositions } from "$src/enums";

export const EmployeesStatsThreshold = 0.95;
export const EmployeesPartyFund = 500e3;
export const ProductInvestment = 1e6;

export type EmployeesData = [number, number, number, number, number, number];

export class DivisionCityManager {
  private readonly baseTotal: number;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly divisionName: string,
    public readonly cityName: CityName,
    private readonly employeesRatio: EmployeesData,
  ) {
    this.baseTotal = employeesRatio.reduce((sum, ratio) => sum + (ratio <= 0 ? 0 : ratio), 0);
  }

  public init() {
    if (this.ns.corporation.getDivision(this.divisionName).cities.indexOf(this.cityName) === -1) {
      this.ns.corporation.expandCity(this.divisionName, this.cityName);
    }
    if (!this.ns.corporation.hasWarehouse(this.divisionName, this.cityName)) {
      this.ns.corporation.purchaseWarehouse(this.divisionName, this.cityName);
    }
  }

  public process() {
    const office = this.ns.corporation.getOffice(this.divisionName, this.cityName);
    if (office.avgEne < office.maxEne * EmployeesStatsThreshold) {
      this.ns.corporation.buyCoffee(this.divisionName, this.cityName);
    }

    if (
      office.avgMor < office.maxMor * EmployeesStatsThreshold ||
      office.avgMor < office.maxMor * EmployeesStatsThreshold
    ) {
      this.ns.corporation.throwParty(this.divisionName, this.cityName, EmployeesPartyFund);
    }

    if (office.employees < office.size) {
      this.distributeEmployees(office);
    }
  }

  public upgradeWarehouse(toLevel: number) {
    const warehouse = this.ns.corporation.getWarehouse(this.divisionName, this.cityName);
    for (let i = warehouse.level; i < toLevel; i++) {
      this.ns.corporation.upgradeWarehouse(this.divisionName, this.cityName);
    }
  }

  public forceSetEmployees(distribution: EmployeesData) {
    const total = distribution.reduce((t, c) => t + c, 0);
    const office = this.ns.corporation.getOffice(this.divisionName, this.cityName);
    if (total > office.size) {
      this.ns.corporation.upgradeOfficeSize(this.divisionName, this.cityName, total - office.size);
      for (let i = office.size; i < total; i++) {
        this.ns.corporation.hireEmployee(this.divisionName, this.cityName);
      }
    }
    for (let positionIdx = 0; positionIdx < distribution.length; positionIdx++) {
      this.ns.corporation.setAutoJobAssignment(
        this.divisionName,
        this.cityName,
        EmployeePositions[positionIdx],
        0,
      );
    }
    for (let positionIdx = 0; positionIdx < distribution.length; positionIdx++) {
      this.ns.corporation.setAutoJobAssignment(
        this.divisionName,
        this.cityName,
        EmployeePositions[positionIdx],
        distribution[positionIdx],
      );
    }
  }

  private distributeEmployees(office: Office) {
    for (
      let positionIdx = 0;
      positionIdx < this.employeesRatio.length && office.employees < office.size;
      office = this.ns.corporation.getOffice(this.divisionName, this.cityName)
    ) {
      const actualEmployees = office.employeeJobs[EmployeePositions[positionIdx]];
      const employeesRatio = this.employeesRatio[positionIdx];
      if (employeesRatio === 0) {
        positionIdx++;
        continue;
      }

      const expectedEmployees = (office.size * this.employeesRatio[positionIdx]) / this.baseTotal;
      // ratio = -1 means maintain at most 1 and nothing else
      if (expectedEmployees > actualEmployees || (expectedEmployees < 0 && actualEmployees === 0)) {
        this.ns.corporation.hireEmployee(
          this.divisionName,
          this.cityName,
          // TODO: add better typing
          EmployeePositions[positionIdx] as any,
        );
      } else {
        positionIdx++;
      }
    }
  }
}
