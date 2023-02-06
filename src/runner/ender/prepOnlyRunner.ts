import type { RunnerEnder } from "$src/runner/ender/perpetualRunner";
import type { TargetList } from "$src/servers/targetList";
import { ServerActionBatchMode } from "$src/servers/server-actions/serverActionBatch";

export class PrepOnlyRunner implements RunnerEnder {
  public constructor(private readonly targetList: TargetList) {}

  public shouldEnd(): boolean {
    const runningArray = this.targetList.running.getArray();
    const onlyBackFillRunning =
      runningArray.length > 0 &&
      runningArray.every((b) => b.mode === ServerActionBatchMode.BackFill);

    return (
      onlyBackFillRunning && this.targetList.stopping.empty() && this.targetList.prepQueue.empty()
    );
  }
}
