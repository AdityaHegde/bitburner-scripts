import { ServerActionSet } from "$src/servers/server-actions/serverActionSet";
import {
  ServerActionTimeMultipliers,
  ServerActionType,
  ServerActionTypeToMemMap,
} from "$src/servers/server-actions/serverActionType";
import type { ServerData } from "$src/servers/serverData";
import type { ResourceList } from "$src/servers/resourceList";
import { HackPercent } from "$src/constants";
import type { ServerActionPorts } from "$src/servers/server-actions/serverActionPorts";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import type { ServerActionReferenceData } from "$src/ports/packets/serverActionReferenceData";
import { ShorthandNotationSchema } from "$src/utils/shorthand-notation";

export enum ServerActionBatchMode {
  Prep,
  Hack,
  BackFill,
  Stock,
}

export const MismatchedCount = 3;

export class ServerActionBatch {
  public memNeeded = 0;
  public memTaken = 0;
  public readonly hackIdx: number = -1;
  public readonly growIdx: number = -1;

  public actionSets: Array<ServerActionSet> = [];

  public score: number;
  public ratio = 1;
  public end: number;
  public percent = HackPercent;
  public enabled = true;
  public mismatched = MismatchedCount;

  public serverActionPorts: ServerActionPorts;
  public readonly largestAction: number;
  public readonly longestAction: number;
  private stopped = 0;

  public constructor(
    public readonly mode: ServerActionBatchMode,
    public readonly target: ServerData,
    public readonly actionTypes: Array<ServerActionType>,
    public readonly threads: Array<number>,
    public count: number,
    public readonly countMulti: Array<number> = new Array(actionTypes.length).fill(1),
  ) {
    this.longestAction = 0;
    for (let i = 0; i < actionTypes.length; i++) {
      this.memNeeded += threads[i] * ServerActionTypeToMemMap[actionTypes[i]];

      if (actionTypes[i] === ServerActionType.Hack) this.hackIdx = i;
      if (actionTypes[i] === ServerActionType.Grow) this.growIdx = i;
      if (ServerActionTimeMultipliers[actionTypes[i]] > this.longestAction)
        this.longestAction = ServerActionTimeMultipliers[actionTypes[i]];
      if (ServerActionTypeToMemMap[actionTypes[i]] > this.largestAction)
        this.largestAction = ServerActionTypeToMemMap[actionTypes[i]];
    }
    this.actionSets.push(new ServerActionSet(actionTypes, threads));
  }

  public reserveForSet(resourceList: ResourceList, serverAction: ServerActionSet, index = 0) {
    return serverAction.reserve(this.target.name, resourceList, index);
  }

  public unReserve(resourceList: ResourceList) {
    for (const serverActionSet of this.actionSets) {
      serverActionSet.unReserve(resourceList);
    }
  }

  public claim(resourceList: ResourceList) {
    for (const serverActionSet of this.actionSets) {
      serverActionSet.claim(resourceList);
    }
  }

  public unClaim(resourceList: ResourceList) {
    for (const serverActionSet of this.actionSets) {
      serverActionSet.unClaim(resourceList);
    }
  }

  public compressForMem(mem: number) {
    if (this.mode !== ServerActionBatchMode.Prep) return;

    let ratio = 1;

    if (mem < this.memNeeded) {
      ratio = this.memNeeded / mem;
    }

    if (ratio === 1) return;
    if (this.threads[0] / ratio < 1) {
      ratio = this.threads[0];
    }

    this.compress(ratio);
  }

  public startBatch(ns: NS, serverActionPorts: ServerActionPorts): boolean {
    this.serverActionPorts = serverActionPorts;
    serverActionPorts.setTargetInfo(
      this.target.name,
      0,
      this.target.times[ServerActionType.Hack],
      0,
    );
    serverActionPorts.setActionInfo(0, 0, this.count, 0);

    let processIndex = 0;
    let failedServers: Array<string>;
    const processCount = this.actionSets.reduce(
      (count, actionSet) =>
        count + actionSet.assignments.reduce((count, assignments) => count + assignments.length, 0),
      0,
    );

    for (let setIndex = 0; setIndex < this.actionSets.length; setIndex++) {
      [processIndex, failedServers] = this.actionSets[setIndex].startSet(
        ns,
        setIndex,
        this.actionSets.length,
        processIndex,
        processCount,
        this.countMulti,
        serverActionPorts,
        this.longestAction,
      );
      this.memTaken += this.actionSets[setIndex].assignments.reduce(
        (mem, assignments, index) =>
          mem +
          assignments.reduce(
            (sum, [, threads]) => sum + threads * ServerActionTypeToMemMap[this.actionTypes[index]],
            0,
          ),
        0,
      );

      for (let i = 0; i < failedServers.length; i++) {
        this.updatedStopped(processCount);
      }
    }

    return this.stopped === 0;
  }

  public updateHackTime(updatePrepped: boolean) {
    let [, , , notPrepped] = this.serverActionPorts.getTargetInfo();
    if (updatePrepped) {
      notPrepped =
        this.target.money !== this.target.maxMoney ||
        this.target.security !== this.target.minSecurity
          ? 1
          : 0;
    }
    this.serverActionPorts.setTargetInfo(
      this.target.name,
      0,
      this.target.times[ServerActionType.Hack],
      notPrepped,
    );
  }

  public stopBatch() {
    const [starts, ends, , endTime] = this.serverActionPorts.getActionInfo();
    this.serverActionPorts.setActionInfo(starts, ends, 0, endTime);
  }

  public batchServerStopped(reference: ServerActionReferenceData) {
    return this.updatedStopped(reference.processCount);
  }

  public canEndBefore(batch: ServerActionBatch) {
    return this.end - batch.longestAction * batch.target.rate > 0;
  }

  public reservedLog(logger: Logger, resourceList: ResourceList) {
    logger.log("ReservingBatch", {
      target: this.target.name,
      mode: ServerActionBatchMode[this.mode],
      threads: this.threads,
      count: this.count,
      ratio: this.ratio,
      memNeeded: this.memNeeded,
      availableMem: resourceList.availableMem,
      reservations: this.actionSets.map((set) => set.reservationLog()).join(" || "),
    });
  }

  public runningLog(logger: Logger, resourceList: ResourceList) {
    logger.log("RunningBatch", {
      target: this.target.name,
      mode: ServerActionBatchMode[this.mode],
      threads: this.threads,
      count: this.count,
      ratio: this.ratio,
      availableMem: resourceList.availableMem,
      assignments: this.actionSets.map((set) => set.assignmentLog()).join(" || "),
    });
  }

  public startedLog(logger: Logger, hackTime: number) {
    logger.info("BatchStarted", {
      server: this.target.name,
      mode: ServerActionBatchMode[this.mode],
      money: `${ShorthandNotationSchema.usd.convert(
        this.target.money,
      )}/${ShorthandNotationSchema.usd.convert(this.target.maxMoney)}`,
      security: `${this.target.security.toFixed(0)}/${this.target.minSecurity}`,
      threads: this.threads,
      sets: this.actionSets.length,
      count: this.count,
      ratio: this.ratio,
      percent: this.percent,
      hackTime: ShorthandNotationSchema.time.convert(hackTime),
      endDiff: ShorthandNotationSchema.time.convert(this.end - Date.now()),
    });
  }

  private compress(ratio: number) {
    for (let i = 0; i < this.threads.length; i++) {
      if (i === 0) {
        this.threads[i] = Math.floor(this.threads[i] / ratio);
      } else {
        // anything that is a supporting operation has to be ceil
        this.threads[i] = Math.ceil(this.threads[i] / ratio);
      }
    }
    this.memNeeded = this.threads.reduce(
      (mem, threads, idx) => mem + threads * ServerActionTypeToMemMap[this.actionTypes[idx]],
      0,
    );
    // reset the 1st set
    this.actionSets[0] = new ServerActionSet(this.actionTypes, this.threads);

    if (this.count !== -1) {
      this.count = Math.ceil(this.count * ratio);
    }
    this.ratio = ratio;
  }

  private updatedStopped(processCount: number): boolean {
    this.stopped++;
    return this.stopped === processCount;
  }
}
