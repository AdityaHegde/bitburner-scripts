import type { NS } from "$src/types/gameTypes";
import type { ServerDataList } from "$src/servers/serverDataList";
import type { TargetList } from "$src/servers/targetList";
import type { Heap } from "$src/utils/heap";
import type { PortCoordinator } from "$src/runner/portCoordinator";
import type { ServerActionBatch } from "$src/servers/server-actions/serverActionBatch";
import { ServerActionBatchMode } from "$src/servers/server-actions/serverActionBatch";
import type { BatchCreator } from "$src/runner/batchCreator";
import type { ServerData } from "$src/servers/serverData";
import type { Logger } from "$src/utils/logger/logger";
import {
  ServerActionType,
  ServerActionTypeToMemMap,
} from "$src/servers/server-actions/serverActionType";
import type { ScriptSchedule } from "$src/runner/scheduler/scriptSchedule";
import type { ScriptScheduler } from "$src/runner/scheduler/scriptScheduler";
import { asyncWait, waitUntil } from "$server/utils/asyncUtils";
import { SimpleBatchReserve } from "$src/servers/server-actions/batch-reserve/SimpleBatchReserve";
import { MultipleBatchReserve } from "$src/servers/server-actions/batch-reserve/MultipleBatchReserve";
import { config } from "$src/config";

export class Scheduler {
  private changed = false;

  private simpleReserve = new SimpleBatchReserve();
  private multiReserve = new MultipleBatchReserve();

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly serverDataList: ServerDataList,
    private readonly targetList: TargetList,
    private readonly portCoordinator: PortCoordinator,
    private readonly batchCreator: BatchCreator,
    private readonly scriptScheduler: ScriptScheduler,
  ) {
    serverDataList.on("newTarget", (target) => {
      this.targetList.addTarget(target);
      this.createBatch(target);
    });
    serverDataList.on("newResource", () => (this.changed = true));
    serverDataList.on("resourceUpdated", () => (this.changed = true));
    portCoordinator.on("batchStarted", (batch) => {
      if (this.targetList.shouldRestart(batch)) {
        this.stopBatch(batch);
      }
    });
    portCoordinator.on("batchStopped", (batch) => {
      batch.unClaim(this.serverDataList.resourceList);
      this.targetList.batchStopped(batch);
      this.createBatch(batch.target);
      this.logger.log("BatchStopped", {
        target: batch.target.name,
        mode: ServerActionBatchMode[batch.mode],
      });
    });
  }

  public async process() {
    if (!this.changed) return;
    this.changed = false;
    this.logger.log("TargetList", {
      availableMem: Math.floor(this.serverDataList.resourceList.availableMem),
      hackSize: this.targetList.hackQueue.size(),
      prepSize: this.targetList.prepQueue.size(),
      running: this.targetList.running.size(),
      stopping: this.targetList.stopping.size(),
    });
    // this is to make sure script is killed after we got a response
    await asyncWait(1);

    this.scriptScheduler.process();

    // stopBatch running clusters that have a lower score that the one at the top of the hack queue
    this.stopRunningTargets(this.targetList.hackQueue);

    // if there are free resources and any of the running clusters can be expanded then stop it
    this.expandRunningTargets();

    this.unwindQueue(this.targetList.hackQueue);
    this.unwindQueue(this.targetList.prepQueue);
    if (
      this.targetList.stopping.empty() ||
      this.targetList.stopping.peek().mode !== ServerActionBatchMode.BackFill
    )
      this.unwindQueue(this.targetList.backFillQueue);
  }

  public async end() {
    while (!this.targetList.running.empty()) {
      this.stopBatch(this.targetList.running.pop());
    }
    this.logger.info("StoppingScript", {
      stopping: this.targetList.stopping.size(),
      prepSize: this.targetList.prepQueue.size(),
      hackSize: this.targetList.hackQueue.size(),
    });

    return waitUntil(() => this.targetList.stopping.empty(), -1);
  }

  public addScriptSchedule(scriptSchedule: ScriptSchedule) {
    this.scriptScheduler.addScriptSchedule(scriptSchedule);
  }

  private createBatch(target: ServerData) {
    const batch = this.batchCreator.createBatch(target);
    this.targetList.addBatch(batch);
    this.changed = true;
    this.portCoordinator.targetLog(batch);
  }

  private stopRunningTargets(queue: Heap<ServerActionBatch>) {
    if (queue.empty()) return;
    while (
      !this.targetList.running.empty() &&
      this.targetList.shouldStop(this.serverDataList, queue)
    ) {
      this.stopBatch(this.targetList.running.peek());
    }
  }

  private expandRunningTargets() {
    if (
      this.serverDataList.resourceList.availableMem <
      ServerActionTypeToMemMap[ServerActionType.Grow]
    )
      return;

    for (const running of this.targetList.running.getArray()) {
      // TODO: expand hacking batch with hack percent < 1
      if (
        running.mode === ServerActionBatchMode.BackFill ||
        running.ratio === 1 ||
        running.count < 2
      )
        continue;
      this.stopBatch(running);
      break;
    }
  }

  private unwindQueue(queue: Heap<ServerActionBatch>) {
    while (!queue.empty()) {
      const batch = queue.peek();

      if (this.targetList.shouldStart(this.serverDataList, batch)) break;

      if (!batch.enabled || !this.tryReserve(batch)) break;

      this.claimBatch(batch);
      this.targetList.batchRunning(batch);
      batch.startedLog(this.logger, batch.target.times[ServerActionType.Hack]);
      queue.pop();
    }
  }

  private tryReserve(batch: ServerActionBatch) {
    batch.compressForMem(this.serverDataList.resourceList.availableMem - 4);
    const reserveInstance =
      batch.mode === ServerActionBatchMode.Hack && config.hasFormulaAccess
        ? this.multiReserve
        : this.simpleReserve;
    const reserveResult = reserveInstance.reserve(batch, this.serverDataList.resourceList);
    if (reserveResult) return true;

    batch.unReserve(this.serverDataList.resourceList);
    return false;
  }

  private claimBatch(batch: ServerActionBatch) {
    batch.claim(this.serverDataList.resourceList);
    if (!this.portCoordinator.startBatch(batch)) {
      // TODO: stop the batch
      this.logger.error("FailedToStart", {
        server: batch.target.name,
      });
    }
  }

  private stopBatch(batch: ServerActionBatch) {
    batch.stopBatch();
    this.targetList.stopBatch(batch);
  }
}
