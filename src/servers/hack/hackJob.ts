import {
  BatchOperationBuffer,
  BatchOperationStartBuffer,
  HackGroupSize,
  HackPercent,
} from "$src/constants";
import { HackType, HackTypeToMemMap } from "$src/servers/hack/hackTypes";
import type { Resource } from "$src/servers/resource";
import type { NS } from "$src/types/gameTypes";
import { findInArray } from "$src/utils/arrayUtils";

export type HackJobGetter = (ns: NS, resource: Resource) => HackJob;
export type HackJobLog = {
  operations: Array<HackType>;
  minThreads: Array<number>;
  maxRuns: number;
  memNeeded: number;
};

export enum HackJobState {
  New,
  Assigned,
  Started,
  Ended,
}

export class HackJob {
  public state: HackJobState;
  public memNeeded = 0;
  public readonly totalThreads = 0;

  public readonly hackIdx: number = -1;
  public readonly growIdx: number = -1;
  public readonly maxMem: number = 0;

  public synced: boolean;
  public ratio: number;
  public end: number;
  public period: number;
  public percent = HackPercent;
  public scoreOverride: number;

  public constructor(
    public readonly operations: Array<HackType>,
    public readonly threads: Array<number>,
    public runs: number,
    public readonly countMulti: Array<number> = new Array(operations.length).fill(1),
    public readonly searchFromEnd = false,
  ) {
    for (let i = 0; i < operations.length; i++) {
      this.memNeeded += Number((HackTypeToMemMap[operations[i]] * threads[i]).toFixed(2));
      this.totalThreads += this.threads[i];

      if (operations[i] === HackType.Hack) this.hackIdx = i;
      if (operations[i] === HackType.Grow) this.growIdx = i;

      if (HackTypeToMemMap[operations[i]] > this.maxMem) {
        this.maxMem = HackTypeToMemMap[operations[i]];
      }
    }
    this.synced = this.operations.length > 1;
  }

  public getScore(resource: Resource): number {
    return (
      this.scoreOverride ??
      (resource.maxMoney * this.threads[this.hackIdx] * resource.rate) /
        (this.memNeeded * resource.times[HackType.Grow])
    );
  }

  public setPeriod(resource: Resource) {
    const longestType = findInArray(
      this.operations,
      (a, b) => resource.times[a] > resource.times[b],
    );
    this.period =
      resource.times[longestType] + BatchOperationBuffer * (this.operations.length + HackGroupSize);
  }

  public setEnd(endOffsets: Array<number>, groupSize: number) {
    this.end =
      Date.now() + BatchOperationStartBuffer + groupSize * endOffsets[endOffsets.length - 1];
  }

  public canRun(end: number): boolean {
    // if a run can be fit before end + 25% of period
    return end + this.period * 0.25 <= Date.now() + this.period;
  }

  public compressForMem(mem: number): number {
    let ratio = 1;

    if (mem < this.memNeeded) {
      ratio = this.memNeeded / mem;
    }

    if (ratio === 1) return 1;
    if (this.threads[0] / ratio < 1) {
      ratio = this.threads[0];
    }

    for (let i = 0; i < this.threads.length; i++) {
      if (i === 0) {
        this.threads[i] = Math.floor(this.threads[i] / ratio);
      } else {
        // anything that is a supporting operation has to be ceil
        this.threads[i] = Math.ceil(this.threads[i] / ratio);
      }
    }
    this.memNeeded = this.threads.reduce(
      (mem, threads, idx) => mem + threads * HackTypeToMemMap[this.operations[idx]],
      0,
    );

    if (this.runs !== -1) {
      this.runs = Math.ceil(this.runs * ratio);
    }
    return ratio;
  }

  public getPeriodAndOffsets(
    resource: Resource,
  ): [period: number, startOffsets: Array<number>, endOffsets: Array<number>] {
    const longestType = findInArray(
      this.operations,
      (a, b) => resource.times[a] > resource.times[b],
    );
    const period =
      resource.times[longestType] + BatchOperationBuffer * (this.operations.length + HackGroupSize);
    const startOffsets = new Array<number>(this.operations.length);
    const endOffsets = new Array<number>(this.operations.length);
    for (let i = 0; i < this.operations.length; i++) {
      startOffsets[i] =
        period -
        resource.times[this.operations[i]] * this.countMulti[i] -
        (this.operations.length - i + 1) * BatchOperationBuffer;
      endOffsets[i] = startOffsets[i] + resource.times[this.operations[i]] * this.countMulti[i];
    }
    return [period, startOffsets, endOffsets];
  }

  public getLog(): HackJobLog {
    return {
      operations: this.operations,
      minThreads: this.threads,
      maxRuns: this.runs,
      memNeeded: this.memNeeded,
    };
  }
}
