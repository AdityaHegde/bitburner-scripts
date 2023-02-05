import type { ServerDataList } from "$src/servers/serverDataList";
import type { PortCoordinator } from "$src/runner/portCoordinator";
import type { Scheduler } from "$src/runner/scheduler/scheduler";
import type { OrchestratorModule } from "$src/runner/orchestratorModule";
import type { NS } from "$src/types/gameTypes";

export class Orchestrator {
  public constructor(
    private readonly ns: NS,
    private readonly serverDataList: ServerDataList,
    private readonly portCoordinator: PortCoordinator,
    private readonly scheduler: Scheduler,
    private readonly modules: Array<OrchestratorModule>,
  ) {
    for (const module of modules) {
      module.on("schedule", (scriptSchedule) => this.scheduler.addScriptSchedule(scriptSchedule));
    }
  }

  public init() {
    this.serverDataList.init();
  }

  public async start() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.serverDataList.process();
      for (const module of this.modules) {
        await module.process();
      }
      await this.scheduler.process();

      // wait for message from either logger or coordinator
      await this.portCoordinator.responsePort.nextWrite();
      this.portCoordinator.process();
    }
  }
}
