import type { NS } from "$src/types/gameTypes";
import type { DivisionManager } from "$src/corporation/DivisionManager";
import type { Logger } from "$src/utils/logger/logger";
import { OrchestratorModule } from "$src/runner/orchestratorModule";
import { nextCorpTick } from "$src/corporation/corpUtils";

export class CorporationManager extends OrchestratorModule {
  public isAsync = true;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly divisionManagers: Array<DivisionManager>,
    private readonly modules: Array<OrchestratorModule>,
  ) {
    super();
  }

  public init() {
    for (const divisionManager of this.divisionManagers) {
      divisionManager.init();
    }
    for (const module of this.modules) {
      module.init();
    }
  }

  public async process() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await nextCorpTick(this.ns);

      for (const divisionManager of this.divisionManagers) {
        divisionManager.process();
      }
      // Can await break things here?
      for (const module of this.modules) {
        await module.process();
      }
    }
  }
}
