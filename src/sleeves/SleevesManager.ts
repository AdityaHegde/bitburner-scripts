import type { NS } from "$src/types/gameTypes";
import { SleeveManager } from "$src/sleeves/SleeveManager";
import { OrchestratorModule } from "$src/runner/orchestratorModule";
import { CriminalSleeveRole } from "$src/sleeves/roles/CriminalSleeveRole";
import type { Logger } from "$src/utils/logger/logger";
import { Second } from "$src/constants";

export class SleevesManager extends OrchestratorModule {
  private sleeveManagers = new Array<SleeveManager>();

  public constructor(private readonly ns: NS, private readonly logger: Logger) {
    super();
  }

  public init() {
    // nothing
  }

  public async process(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.processIteration();
      await this.ns.sleep(Second / 2);
    }
  }

  private processIteration() {
    while (this.ns.sleeve.getNumSleeves() > this.sleeveManagers.length) {
      const sleeveManager = new SleeveManager(
        this.ns,
        this.logger,
        this.sleeveManagers.length,
        new CriminalSleeveRole(this.ns, this.logger, this.sleeveManagers.length),
      );
      sleeveManager.init();
      this.logger.log("Sleeve", {
        index: this.sleeveManagers.length,
        role: "Criminal",
      });
      this.sleeveManagers.push(sleeveManager);
    }

    for (const sleeveManager of this.sleeveManagers) {
      sleeveManager.process();
    }
  }
}
