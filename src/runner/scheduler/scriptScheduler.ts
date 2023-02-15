import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import type { ServerDataList } from "$src/servers/serverDataList";
import type { PortCoordinator } from "$src/runner/portCoordinator";
import { Heap } from "$src/utils/heap";
import type { ScriptSchedule } from "$src/runner/scheduler/scriptSchedule";
import type { ServerData } from "$src/servers/serverData";

export class ScriptScheduler {
  private scheduledScripts: Heap<ScriptSchedule>;
  private runningScripts = new Map<string, [ServerData, ScriptSchedule]>();

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly serverDataList: ServerDataList,
    private readonly portCoordinator: PortCoordinator,
  ) {
    this.scheduledScripts = new Heap<ScriptSchedule>(
      (a, b) => b.mem - a.mem,
      (a) => a.script,
    );
    portCoordinator.on("scriptStopped", (script) => this.scriptStopped(script));
  }

  public addScriptSchedule(scriptSchedule: ScriptSchedule) {
    if (this.scheduledScripts.has(scriptSchedule.script)) {
      this.scheduledScripts.get(scriptSchedule.script).args = scriptSchedule.args;
    } else {
      this.scheduledScripts.push(scriptSchedule);
    }
  }

  public process() {
    while (!this.scheduledScripts.empty()) {
      const schedule = this.scheduledScripts.peek();
      if (!this.reserveForSchedule(schedule)) break;
      this.scheduledScripts.pop();
    }
  }

  private scriptStopped(script: string) {
    if (!this.runningScripts.has(script)) return;
    const [serverData, schedule] = this.runningScripts.get(script);
    this.logger.log("ScriptEnded", {
      server: serverData.name,
      script: schedule.script,
      mem: schedule.mem,
      args: schedule.args,
    });
    this.serverDataList.resourceList.unClaimMem(serverData, schedule.mem);
    this.runningScripts.delete(script);
    if (schedule.chain) this.reserveForSchedule(schedule.chain);
  }

  private reserveForSchedule(schedule: ScriptSchedule) {
    const [threads, reservations] = this.serverDataList.resourceList.reserveForAction(
      schedule.script,
      schedule.mem,
      1,
      0,
      1,
      true,
    );
    if (threads === 1) return false;

    const serverData = reservations[0][0];
    this.logger.log("ScriptStarted", {
      server: serverData.name,
      script: schedule.script,
      mem: schedule.mem,
      args: schedule.args,
    });
    this.serverDataList.resourceList.claimMem(serverData, schedule.mem);
    if (!this.ns.exec(schedule.script, serverData.name, 1, ...schedule.args)) {
      this.logger.error("FailedToStartScript", {
        server: serverData.name,
        script: schedule.script,
        mem: schedule.mem,
        args: schedule.args,
      });
    }
    this.runningScripts.set(schedule.script, [serverData, schedule]);
    return true;
  }
}
