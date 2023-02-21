import type { GangGenInfo, GangMemberInfo, GangTaskStats, NS } from "$src/types/gameTypes";
import type { GangMemberTasksRepo } from "$src/gang/GangMemberTasksRepo";
import type { Logger } from "$src/utils/logger/logger";
import { Minute } from "$src/constants";
import type { PrimarySingleStats } from "$src/gang/gangConstants";
import {
  GangMemberAscensionThreshold,
  GangMemberMode,
  GangMemberRole,
  GangMemberTrainLevel,
  GangRespectThreshold,
  PrimaryStats,
  WantedLevelAbsoluteLowerThreshold,
  WantedLevelAbsoluteUpperThreshold,
  WantedLevelGangMemberThreshold,
  WantedLevelLowerThreshold,
  WantedLevelUpperThreshold,
} from "$src/gang/gangConstants";
import { GangMemberPurchaser } from "$src/gang/GangMemberPurchaser";
import type { GangMemberEquipmentsRepo } from "$src/gang/GangMemberEquipmentsRepo";
import { findInArray } from "$src/utils/arrayUtils";

export class GangMemberManager {
  private mode: GangMemberMode;
  private taskStats: GangTaskStats;
  private readonly purchaser: GangMemberPurchaser;
  private ascendCheck = 0;
  private activeCheck = 0;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    public readonly name: string,
    private readonly primaryStat: PrimarySingleStats,
    private role: GangMemberRole,
    private readonly tasksRepo: GangMemberTasksRepo,
    private readonly equipmentsRepo: GangMemberEquipmentsRepo,
  ) {
    this.purchaser = new GangMemberPurchaser(ns, logger, name, primaryStat, equipmentsRepo);
  }

  public init() {
    const gangMember = this.ns.gang.getMemberInformation(this.name);
    if (gangMember[this.primaryStat] < GangMemberTrainLevel) {
      this.setTrainingTask();
    } else if (this.ns.gang.getMemberNames().length > WantedLevelGangMemberThreshold) {
      this.setWantedTask();
    } else {
      this.setActiveTask(this.ns.gang.getGangInformation(), gangMember);
    }
    this.purchaser.init(gangMember);
    this.log();
  }

  public process(gang: GangGenInfo) {
    const gangMember = this.ns.gang.getMemberInformation(this.name);
    this.purchaser.process();
    if (this.processAscension()) {
      return;
    }

    switch (this.mode) {
      case GangMemberMode.Train:
        this.updateTrainTask(gangMember);
        break;

      case GangMemberMode.WantedLevel:
        this.updateWantedTask(gang, gangMember);
        break;

      case GangMemberMode.Active:
        this.updateActiveTask(gang, gangMember);
        break;
    }

    if (gangMember.task !== this.taskStats.name) {
      this.ns.gang.setMemberTask(gangMember.name, this.taskStats.name);
    }
  }

  public updateRole(role: GangMemberRole) {
    const gangMember = this.ns.gang.getMemberInformation(this.name);
    this.role = role;
    if (gangMember[this.primaryStat] < GangMemberTrainLevel) {
      this.setTrainingTask();
      return;
    }

    this.setActiveTask(this.ns.gang.getGangInformation(), gangMember);
  }

  private processAscension() {
    if (Date.now() - this.ascendCheck < Minute / 2) return false;
    this.ascendCheck = Date.now();

    const ascension = this.ns.gang.getAscensionResult(this.name);
    if (
      !ascension ||
      !PrimaryStats[this.primaryStat].some((s) => ascension[s] > GangMemberAscensionThreshold)
    )
      return false;

    this.ns.gang.ascendMember(this.name);
    this.setTrainingTask();

    const gangMember = this.ns.gang.getMemberInformation(this.name);
    this.logger.log("Ascended", gangMember);
    const [, minStat] = findInArray(
      PrimaryStats[this.primaryStat],
      (a, b) => gangMember[`${a}_asc_mult`] < gangMember[`${b}_asc_mult`],
    );
    this.purchaser.ascended(gangMember[`${minStat}_asc_mult`]);
    return true;
  }

  private updateTrainTask(gangMember: GangMemberInfo) {
    if (gangMember[this.primaryStat] < GangMemberTrainLevel) return;
    this.setWantedTask();
    // this.log();
  }

  private updateWantedTask(gang: GangGenInfo, gangMember: GangMemberInfo) {
    const penalty = gang.wantedLevel / gang.respect;

    if (
      penalty < WantedLevelLowerThreshold ||
      gang.wantedLevel <= WantedLevelAbsoluteLowerThreshold
    ) {
      this.setActiveTask(gang, gangMember);
    }
  }

  private updateActiveTask(gang: GangGenInfo, gangMember: GangMemberInfo) {
    const penalty = gang.wantedLevel / gang.respect;

    // TODO: if the biggest respect gainer is available then do not participate in lowering wanted level
    if (
      penalty > WantedLevelUpperThreshold &&
      gang.wantedLevel > WantedLevelAbsoluteUpperThreshold &&
      this.ns.gang.getMemberNames().length > WantedLevelGangMemberThreshold
    ) {
      this.setWantedTask();
      // this.log();
      return;
    }

    if (Date.now() - this.activeCheck < Minute / 2) return;
    this.activeCheck = Date.now();
    this.setActiveTask(gang, gangMember);
  }

  private setTrainingTask() {
    this.mode = GangMemberMode.Train;
    this.taskStats = this.tasksRepo.trainTasks[this.primaryStat];
    this.ns.gang.setMemberTask(this.name, this.taskStats.name);
  }

  private setWantedTask() {
    this.mode = GangMemberMode.WantedLevel;
    this.taskStats = this.tasksRepo.wantedPenaltyTask;
  }

  private setActiveTask(gang: GangGenInfo, gangMember: GangMemberInfo) {
    this.mode = GangMemberMode.Active;

    switch (this.role) {
      case GangMemberRole.Money:
        this.taskStats = this.tasksRepo.getBestMoneyTask(gang, gangMember);
        break;

      case GangMemberRole.Respect:
        if (gang.respect < GangRespectThreshold) {
          this.taskStats = this.tasksRepo.getBestRespectTask(gang, gangMember);
        } else {
          this.taskStats = this.tasksRepo.getBestMoneyTask(gang, gangMember);
        }
        break;

      case GangMemberRole.Territory:
        this.taskStats = this.tasksRepo.territoryTask;
        break;
    }

    // this.log();
  }

  private log() {
    this.logger.log("GangMember", {
      name: this.name,
      role: GangMemberRole[this.role],
      task: this.taskStats?.name,
      mode: GangMemberMode[this.mode],
    });
  }
}
