import { DivisionManagerModule } from "$src/corporation/modules/DivisionManagerModule";

export const ProductCapacityResearch1 = "uPgrade: Capacity.I";
export const ProductCapacityResearch2 = "uPgrade: Capacity.II";
export const ResearchOrder = [
  "Hi-Tech R&D Laboratory",
  "uPgrade: Fulcrum",
  ProductCapacityResearch1,
  ProductCapacityResearch2,
  "JoyWire",
  "Automatic Drug Administration",
  "Go-Juice",
  "Overclock",
  "Sti.mu",
  "AutoBrew",
  "AutoPartyManager",
  "CPH4 Injections",
  "Drones",
  "Drones - Assembly",
  "Drones - Transport",
  "Self-Correcting Assemblers",
];

export class ResearchUpgradeBuyerModule extends DivisionManagerModule {
  private researchCursor = 0;

  public init(): void {
    this.moveToNextResearch();
    this.logger.log("ResearchUpgrade", {
      upgrades: ResearchOrder.slice(0, this.researchCursor),
      pending: ResearchOrder.slice(this.researchCursor),
    });
  }

  public process(): void {
    // TODO: dynamically remove modules
    if (this.researchCursor === ResearchOrder.length) return;

    const division = this.ns.corporation.getDivision(this.divisionName);
    const research = ResearchOrder[this.researchCursor];
    const cost = this.ns.corporation.getResearchCost(this.divisionName, research);
    if (division.research < cost * 2) return;

    this.ns.corporation.research(this.divisionName, research);
    if (!this.ns.corporation.hasResearched(this.divisionName, research)) {
      this.logger.error("FailedToResearch", {
        divisionName: this.divisionName,
        research,
      });
      return;
    }

    this.moveToNextResearch();
    this.logger.info("Researched", {
      divisionName: this.divisionName,
      research,
    });
    this.emit("researched", research);
  }

  private moveToNextResearch() {
    for (; this.researchCursor < ResearchOrder.length; this.researchCursor++) {
      if (
        !this.ns.corporation.hasResearched(this.divisionName, ResearchOrder[this.researchCursor])
      ) {
        break;
      }
    }
  }
}
