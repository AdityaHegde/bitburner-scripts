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
import { asyncWait } from "$server/utils/asyncUtils";

export class Scheduler {
  private changed = false;

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
    portCoordinator.on("batchStarted", (batch, hackTime) => {
      batch.startedLog(this.logger, hackTime);
    });
    portCoordinator.on("batchStopped", (batch) => {
      batch.unClaim(this.serverDataList.resourceList);
      this.targetList.batchStopped(batch);
      this.createBatch(batch.target);
    });
  }

  public async process() {
    if (!this.changed) return;
    this.changed = false;
    this.targetList.log(this.logger, this.serverDataList);
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

  public addScriptSchedule(scriptSchedule: ScriptSchedule) {
    this.scriptScheduler.addScriptSchedule(scriptSchedule);
  }

  private createBatch(target: ServerData) {
    const batch = this.batchCreator.createBatch(target);
    this.targetList.addBatch(batch);
    this.changed = true;
    // this.logger.log("AddingBatch", {
    //   target: target.name,
    //   mode: ServerActionBatchMode[batch.mode],
    //   money: `${ShorthandNotationSchema.usd.convert(
    //     target.money,
    //   )}/${ShorthandNotationSchema.usd.convert(target.maxMoney)}`,
    //   security: `${target.security.toFixed(0)}/${target.minSecurity}`,
    //   threads: batch.threads,
    //   count: batch.count,
    //   memNeeded: batch.memNeeded,
    // });
    this.portCoordinator.targetLog(batch);
  }

  private stopRunningTargets(queue: Heap<ServerActionBatch>) {
    if (queue.empty()) return;
    while (
      !this.targetList.running.empty() &&
      ((queue.peek().score > this.targetList.running.peek().score &&
        queue.peek().memNeeded > this.serverDataList.resourceList.availableMem) ||
        this.targetList.running.peek().mode === ServerActionBatchMode.BackFill)
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

      if (
        batch.mode !== ServerActionBatchMode.BackFill &&
        !this.targetList.stopping.empty() &&
        (batch.memNeeded > this.serverDataList.resourceList.availableMem ||
          this.targetList.stopping.peek().canEndBefore(batch))
      )
        break;

      if (!batch.enabled || !this.tryReserve(batch)) break;

      this.claimBatch(batch);
      this.targetList.batchRunning(batch);
      queue.pop();
    }
  }

  private tryReserve(batch: ServerActionBatch) {
    if (batch.mode === ServerActionBatchMode.Prep)
      batch.compressForMem(this.serverDataList.resourceList.availableMem);
    const reserveResult = batch.reserveForSet(
      this.serverDataList.resourceList,
      batch.actionSets[0],
    );
    // batch.reservedLog(this.logger, this.serverDataList.resourceList);
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
    // batch.runningLog(this.logger, this.serverDataList.resourceList);
  }

  private stopBatch(batch: ServerActionBatch) {
    batch.stopBatch();
    this.targetList.stopBatch(batch);
  }
}
