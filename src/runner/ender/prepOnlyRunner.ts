import type { RunnerEnder } from "$src/runner/ender/perpetualRunner";
import type { TargetList } from "$src/servers/targetList";
import { ServerActionBatchMode } from "$src/servers/server-actions/serverActionBatch";
import type { NS } from "$src/types/gameTypes";
import type { ServerDataList } from "$src/servers/serverDataList";

export class PrepOnlyRunner implements RunnerEnder {
  public constructor(
    private readonly ns: NS,
    private readonly serverDataList: ServerDataList,
    private readonly targetList: TargetList,
  ) {}

  public shouldEnd(): boolean {
    const runningArray = this.targetList.running.getArray();
    const onlyBackFillRunning =
      runningArray.length > 0 &&
      runningArray.every((b) => b.mode === ServerActionBatchMode.BackFill);

    const player = this.ns.getPlayer();
    const hasEnoughHackingLevel = player.skills.hacking > this.serverDataList.maxPlayerLevel;

    return (
      onlyBackFillRunning &&
      this.targetList.stopping.empty() &&
      this.targetList.prepQueue.empty() &&
      hasEnoughHackingLevel
    );
  }
}
