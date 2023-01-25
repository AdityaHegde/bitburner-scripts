import { Scheduler } from "$src/runner/scheduler/scheduler";

export class BatchScheduler extends Scheduler {
  public async runClusters() {
    if (this.hackQueue.empty() && this.prepQueue.empty()) return;

    // TODO: check if a better target can be expanded

    this.unwindQueue(this.hackQueue);
    this.unwindQueue(this.prepQueue);
  }
}
