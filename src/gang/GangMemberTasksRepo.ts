import type { GangGenInfo, GangMemberInfo, GangTaskStats, NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import { config } from "$src/config";
import type { PrimarySingleStats } from "$src/gang/gangConstants";
import { CombatTasks, Stats, TaskStats } from "$src/gang/gangConstants";

export class GangMemberTasksRepo {
  public trainTasks: Record<PrimarySingleStats, GangTaskStats> = {} as any;

  public moneyTasks = new Array<GangTaskStats>();
  public respectTasks = new Array<GangTaskStats>();
  public primaryRespectTask: string;

  public wantedPenaltyTask: GangTaskStats;
  public territoryTask: GangTaskStats;

  public constructor(private readonly ns: NS, private readonly logger: Logger) {}

  public init() {
    const tasks = this.ns.gang.getTaskNames();

    for (const task of tasks) {
      const taskStats = this.ns.gang.getTaskStats(task);

      switch (task) {
        case "Vigilante Justice":
        case "Ethical Hacking":
          this.wantedPenaltyTask = taskStats;
          break;

        case "Cyberterrorism":
        case "Terrorism":
          this.respectTasks.push(taskStats);
          this.primaryRespectTask = task;
          break;

        case "Train Hacking":
          this.trainTasks.hack = taskStats;
          break;

        case "Train Combat":
          this.trainTasks.str = taskStats;
          break;

        case "Train Charisma":
          this.trainTasks.cha = taskStats;
          break;

        case "Territory Warfare":
          this.territoryTask = taskStats;
          break;

        default:
          if (!(task in CombatTasks)) break;
          this.moneyTasks.push(taskStats);
          this.respectTasks.push(taskStats);
          break;
      }
    }
  }

  public getBestMoneyTask(gang: GangGenInfo, gangMember: GangMemberInfo) {
    let highWeight = Number.MIN_SAFE_INTEGER;
    let highTaskStats: GangTaskStats;

    for (const taskStats of this.moneyTasks) {
      let weight: number;
      if (config.hasFormulaAccess) {
        weight = this.ns.formulas.gang.moneyGain(gang, gangMember, taskStats);
      } else {
        weight =
          (TaskStats.reduce(
            (weight, taskStat, index) => (taskStats[taskStat] * gangMember[Stats[index]]) / 100,
            0,
          ) -
            3.2 * taskStats.difficulty) *
          taskStats.baseMoney;
      }
      if (weight > highWeight) {
        highWeight = weight;
        highTaskStats = taskStats;
      }
    }

    return highTaskStats;
  }

  public getBestRespectTask(gang: GangGenInfo, gangMember: GangMemberInfo) {
    let highWeight = Number.MIN_SAFE_INTEGER;
    let highTaskStats: GangTaskStats;

    for (const taskStats of this.respectTasks) {
      let weight: number;
      if (config.hasFormulaAccess) {
        weight = this.ns.formulas.gang.respectGain(gang, gangMember, taskStats);
      } else {
        weight =
          (TaskStats.reduce(
            (weight, taskStat, index) =>
              weight + (taskStats[taskStat] * gangMember[Stats[index]]) / 100,
            0,
          ) -
            4 * taskStats.difficulty) *
          taskStats.baseRespect;
        if (taskStats.name === this.primaryRespectTask && weight > 0) {
          weight = Number.MAX_SAFE_INTEGER;
        }
      }
      if (weight > highWeight) {
        highWeight = weight;
        highTaskStats = taskStats;
      }
    }

    return highTaskStats;
  }
}
