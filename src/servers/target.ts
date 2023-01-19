import { NoodlesScoreCutoff, NoodlesScoreOffset } from "$src/constants";
import { HackJobFactory } from "$src/servers/hack/hackJobFactory";
import { HackType } from "$src/servers/hack/hackTypes";
import type { NS } from "../types/gameTypes";
import type { Logger } from "../utils/logger";
import type { HackJob, HackJobLog } from "./hack/hackJob";
import type { Resource } from "./resource";

export enum TargetState {
  New,
  Weakening,
  Growing,
  Hacking,
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
  ) {}

  public fill() {
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

  public calculateHackTypeSet() {
    if (this.hackJob?.runs === -1 || this.hackJob?.runs > 0) return;
    this.hackJob = undefined;

    if (this.resource.security > this.resource.minSecurity) {
      this.hackJob = HackJobFactory.Weaken(this.ns, this.resource);
      this.state = TargetState.Weakening;
    } else if (this.resource.money < this.resource.maxMoney) {
      this.hackJob = HackJobFactory.GrowWeaken(this.ns, this.resource);
      this.state = TargetState.Growing;
    } else {
      this.hackJob = HackJobFactory.EarlyHackGrowWeaken(this.ns, this.resource);
      this.state = TargetState.Hacking;
    }
    this.hackJob.setPeriod(this.resource);
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
