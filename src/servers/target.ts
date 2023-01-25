import { NoodlesScoreCutoff, NoodlesScoreOffset } from "$src/constants";
import { HackJobFactory } from "$src/servers/hack/hackJobFactory";
import { HackType } from "$src/servers/hack/hackTypes";
import type { NS } from "../types/gameTypes";
import type { Logger } from "../utils/logger/logger";
import type { HackJob, HackJobLog } from "./hack/hackJob";
import { Resource } from "./resource";

export enum TargetState {
  New,
  Weakening,
  Growing,
  Hacking,
  SharingPower,
}

export enum TargetType {
  Money,
  Experience,
  Sharing,
  Stock,
}

export const TargetLogMessage = "Target";
export type TargetLog = {
  server: string;
  state: TargetState;
  score: number;
  ratios: [number, number, number];
  hackJob: HackJobLog;
};

export class Target {
  public state = TargetState.New;
  public type: TargetType = TargetType.Money;
  public score: number;
  public ratios: [number, number, number];

  public hackJob: HackJob;

  public constructor(
    public readonly ns: NS,
    private readonly logger: Logger,
    public readonly resource: Resource,
    private readonly dummy = false,
  ) {}

  public static getSharePowerTarget(ns: NS, logger: Logger) {
    const resource = new Resource(ns, logger, "SharePower", 0, true);
    const target = new Target(ns, logger, resource, true);
    target.type = TargetType.Sharing;
    target.state = TargetState.SharingPower;
    return target;
  }

  public fill() {
    if (this.dummy) {
      this.score = this.hackJob?.scoreOverride ?? 0;
      return;
    }

    const hackTypeSet = HackJobFactory.HackGrowWeaken(this.ns, this.resource);
    this.ratios = [
      hackTypeSet.threads[HackType.Hack],
      hackTypeSet.threads[HackType.Grow],
      hackTypeSet.threads[HackType.Weaken],
    ];
    const scoreOffset =
      this.ns.getHackingLevel() < NoodlesScoreCutoff && this.resource.server === "n00dles"
        ? NoodlesScoreOffset
        : 1;
    this.score = hackTypeSet.getScore(this.resource) * 100 + scoreOffset;
  }

  public log() {
    this.logger.info<TargetLog>(TargetLogMessage, {
      server: this.resource.server,
      state: this.state,
      score: this.score,
      ratios: this.ratios,
      hackJob: this.hackJob?.getLog(),
    });
  }
}
