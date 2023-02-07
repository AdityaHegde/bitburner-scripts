import type { ServerData } from "$src/servers/serverData";
import { Heap } from "$src/utils/heap";
import type { ServerActionBatch } from "$src/servers/server-actions/serverActionBatch";
import {
  MismatchedCount,
  ServerActionBatchMode,
} from "$src/servers/server-actions/serverActionBatch";
import type { Logger } from "$src/utils/logger/logger";
import type { ServerDataList } from "$src/servers/serverDataList";

function queueHeap() {
  return new Heap<ServerActionBatch>(
    (a, b) => {
      if (a.enabled && b.enabled) return a.score - b.score;
      if (a.enabled) return 1;
      return -1;
    },
    (a) => a.target.name,
  );
}

function runningHeap() {
  return new Heap<ServerActionBatch>(
    (a, b) => b.score - a.score,
    (a) => a.target.name,
  );
}

export class TargetList {
  public readonly targets = new Array<ServerData>();

  public readonly prepQueue: Heap<ServerActionBatch>;
  public readonly hackQueue: Heap<ServerActionBatch>;
  public readonly backFillQueue: Heap<ServerActionBatch>;

  public readonly running: Heap<ServerActionBatch>;
  public readonly stopping: Heap<ServerActionBatch>;
  public prepping = 0;

  public constructor() {
    this.prepQueue = queueHeap();
    this.hackQueue = queueHeap();
    this.backFillQueue = queueHeap();

    this.running = runningHeap();
    this.stopping = runningHeap();
  }

  public addTarget(target: ServerData) {
    this.targets.push(target);
  }

  public addBatch(batch: ServerActionBatch) {
    switch (batch.mode) {
      case ServerActionBatchMode.Prep:
        this.prepQueue.push(batch);
        break;

      case ServerActionBatchMode.Hack:
        this.hackQueue.push(batch);
        break;

      case ServerActionBatchMode.BackFill:
        this.backFillQueue.push(batch);
        break;
    }
  }

  public batchRunning(batch: ServerActionBatch) {
    this.running.push(batch);
    if (batch.mode === ServerActionBatchMode.Prep) this.prepping++;
  }

  public stopBatch(batch: ServerActionBatch) {
    this.running.delete(batch);
    if (this.running.has(batch.target.name) && batch.mode === ServerActionBatchMode.Prep)
      this.prepping--;
    this.stopping.push(batch);
  }

  public batchStopped(batch: ServerActionBatch) {
    this.running.delete(batch);
    if (this.running.has(batch.target.name) && batch.mode === ServerActionBatchMode.Prep)
      this.prepping--;
    this.stopping.delete(batch);
  }

  public shouldStop(serverDataList: ServerDataList, queue: Heap<ServerActionBatch>) {
    return (
      (queue.peek().score > this.running.peek().score &&
        queue.peek().memNeeded > serverDataList.resourceList.availableMem) ||
      this.running.peek().mode === ServerActionBatchMode.BackFill
    );
  }

  public shouldStart(serverDataList: ServerDataList, batch: ServerActionBatch) {
    return (
      batch.mode !== ServerActionBatchMode.BackFill &&
      !this.stopping.empty() &&
      (batch.memNeeded > serverDataList.resourceList.availableMem ||
        this.stopping.peek().canEndBefore(batch))
    );
  }

  public shouldRestart(batch: ServerActionBatch): boolean {
    if (batch.mode !== ServerActionBatchMode.Hack) return false;
    if (
      batch.target.money === batch.target.maxMoney &&
      batch.target.security === batch.target.minSecurity
    ) {
      batch.mismatched = MismatchedCount;
      return false;
    }
    batch.mismatched--;
    return batch.mismatched <= 0;
  }

  public log(logger: Logger, serverDataList: ServerDataList) {
    logger.log("TargetsQueue", {
      availableMem: serverDataList.resourceList.availableMem,
      hackQueue: this.hackQueue
        .getArray()
        .map((batch) => `${batch.target.name}(${batch.score.toFixed(2)})`)
        .join(", "),
      prepQueue: this.prepQueue
        .getArray()
        .map((batch) => `${batch.target.name}(${batch.score.toFixed(2)})`)
        .join(", "),
      backFillQueue: this.backFillQueue
        .getArray()
        .map((batch) => `${batch.target.name}(${batch.score.toFixed(2)})`)
        .join(", "),
    });
    logger.log("TargetsRunning", {
      running: this.running
        .getArray()
        .map((batch) => `${batch.target.name}(${batch.score.toFixed(2)})`)
        .join(", "),
      stopping: this.stopping
        .getArray()
        .map((batch) => `${batch.target.name}(${batch.score.toFixed(2)})`)
        .join(", "),
    });
  }
}
