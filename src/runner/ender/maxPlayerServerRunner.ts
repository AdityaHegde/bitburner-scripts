import type { RunnerEnder } from "$src/runner/ender/perpetualRunner";
import type { NS } from "$src/types/gameTypes";
import type { ServerDataList } from "$src/servers/serverDataList";
import { PlayerServerPrefix } from "$src/constants";

export class MaxPlayerServerRunner implements RunnerEnder {
  private readonly maxServerSize: number;

  public constructor(private readonly ns: NS, private readonly serverDataList: ServerDataList) {
    this.maxServerSize = ns.getPurchasedServerMaxRam();
  }

  public shouldEnd(): boolean {
    const finalServer = this.serverDataList.serverDataNameMap[`${PlayerServerPrefix}-24`];
    return finalServer && finalServer.maxMem === this.maxServerSize;
  }
}
