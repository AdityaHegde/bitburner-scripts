import type { ServerData } from "$src/servers/serverData";
import { SharePowerDummyServer } from "$src/servers/serverData";
import type { ServerActionBatch } from "$src/servers/server-actions/serverActionBatch";
import { ServerActionBatchMode } from "$src/servers/server-actions/serverActionBatch";
import {
  getEarlyHackWeakenGrowWeaken,
  getExperienceBatch,
  getGrowWeaken,
  getHackWeakenGrowWeaken,
  getSharePowerBatch,
  getWeaken,
} from "$src/servers/server-actions/serverActionBatchFactories";
import type { NS } from "$src/types/gameTypes";
import { config } from "$src/config";
import type { ServerDataList } from "$src/servers/serverDataList";

export class BatchCreator {
  public constructor(private readonly ns: NS, private readonly serverDataList: ServerDataList) {}

  public createBatch(target: ServerData): ServerActionBatch {
    target.updateEphemeral();
    const batch = this.getBatchForTarget(target);
    this.getScore(batch);
    return batch;
  }

  private getBatchForTarget(target: ServerData): ServerActionBatch {
    if (target.name === SharePowerDummyServer) {
      return getSharePowerBatch(target);
    }

    if (target.security > target.minSecurity) {
      return getWeaken(this.ns, target);
    } else if (target.money < target.maxMoney) {
      return getGrowWeaken(this.ns, target);
    } else {
      if (target.name === "joesguns") {
        // TODO: use math to determine best exp target
        // TODO: at some point exp is not useful. do not add if level is too high
        return getExperienceBatch(
          target,
          this.ns.getPlayer().skills.hacking < this.serverDataList.maxPlayerLevel,
        );
      } else if (config.hasFormulaAccess) {
        return getHackWeakenGrowWeaken(
          this.ns,
          target,
          this.serverDataList.resourceList.secondLargestServerMem,
        );
      } else {
        return getEarlyHackWeakenGrowWeaken(this.ns, target);
      }
    }
  }

  private getScore(batch: ServerActionBatch) {
    if (batch.score) return;

    if (!config.hasFormulaAccess) {
      batch.score =
        (batch.target.maxMoney * batch.target.growth * batch.target.rate) /
        batch.target.minSecurity;
      if (
        config.backFillExp &&
        batch.mode === ServerActionBatchMode.Prep &&
        batch.target.name === "joesguns"
      )
        batch.score += 2 ** 30;
      return;
    }

    const hackBatch = getHackWeakenGrowWeaken(
      this.ns,
      batch.target,
      this.serverDataList.resourceList.secondLargestServerMem,
    );
    batch.score = hackBatch.score;
  }
}
