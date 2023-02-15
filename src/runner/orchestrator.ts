import type { ServerDataList } from "$src/servers/serverDataList";
import type { PortCoordinator } from "$src/runner/portCoordinator";
import type { Scheduler } from "$src/runner/scheduler/scheduler";
import type { OrchestratorModule } from "$src/runner/orchestratorModule";
import type { NS } from "$src/types/gameTypes";
import { initConfig } from "$src/config";
import type { RunnerEnder } from "$src/runner/ender/perpetualRunner";
import { PerpetualRunner } from "$src/runner/ender/perpetualRunner";

export class Orchestrator {
  public constructor(
    private readonly ns: NS,
    private readonly serverDataList: ServerDataList,
    private readonly portCoordinator: PortCoordinator,
    private readonly scheduler: Scheduler,
    private readonly modules: Array<OrchestratorModule>,
    private readonly ender: RunnerEnder = new PerpetualRunner(),
  ) {
    for (const module of modules) {
      module.on("schedule", (scriptSchedule) => this.scheduler.addScriptSchedule(scriptSchedule));
    }
    initConfig(ns);
  }

  public init() {
    this.serverDataList.init();
    for (const module of this.modules) {
      module.init();
    }
  }

  public async start() {
    for (const module of this.modules) {
      if (!module.isAsync) continue;
      module.process();
    }

    while (!this.ender.shouldEnd()) {
      this.serverDataList.process();
      for (const module of this.modules) {
        if (module.isAsync) continue;
        await module.process();
      }
      await this.scheduler.process();

      // wait for message from either logger or coordinator
      await this.portCoordinator.responsePort.nextWrite();
      this.portCoordinator.process();
    }

    return this.scheduler.end();
  }
}
