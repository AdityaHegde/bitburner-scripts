import type { NS } from "$src/types/gameTypes";
import { GangMemberManager } from "$src/gang/GangMemberManager";
import { GangMemberTasksRepo } from "$src/gang/GangMemberTasksRepo";
import type { Logger } from "$src/utils/logger/logger";
import { Second } from "$src/constants";
import { GangMemberRole, MaxMembers, MemberPrefix } from "$src/gang/gangConstants";
import { GangMemberEquipmentsRepo } from "$src/gang/GangMemberEquipmentsRepo";
import { GangWarfare } from "$src/gang/GangWarfare";

export class GangManager {
  private members = new Array<GangMemberManager>();
  private readonly tasksRepo: GangMemberTasksRepo;
  private readonly equipmentsRepo: GangMemberEquipmentsRepo;
  private readonly warfare: GangWarfare;
  private readonly names = new Set<string>();

  public constructor(private readonly ns: NS, private readonly logger: Logger) {
    this.tasksRepo = new GangMemberTasksRepo(ns, logger);
    this.equipmentsRepo = new GangMemberEquipmentsRepo(ns, logger);

    this.warfare = new GangWarfare(ns, logger);
    this.warfare.on("startWar", () => this.setModeToTerritory());
    this.warfare.on("endWar", () => this.setModeToMoney());
    this.warfare.on("died", (memberNames) => {
      memberNames.forEach((memberName) => this.names.add(memberName));
      this.logger.error("MembersDied", {
        memberNames,
      });
      this.members = this.members.filter((member) => !this.names.has(member.name));
    });

    for (let i = 0; i < MaxMembers; i++) {
      this.names.add(`${MemberPrefix}${i}`);
    }
  }

  public async init() {
    while (!this.ns.gang.inGang()) {
      await this.ns.asleep(5 * Second);
      // TODO: auto create gang
    }

    this.tasksRepo.init();

    const memberNames = this.ns.gang.getMemberNames();
    for (let i = 0; i < memberNames.length; i++) {
      const member = this.createGangMemberManager(memberNames[i], memberNames.length);
      member.init();
      this.members.push(member);
      this.names.delete(memberNames[i]);
    }

    if (this.members.length === MaxMembers) {
      this.warfare.init();
      this.setModeToMoney();
    }
  }

  public async process() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.members.length < MaxMembers && this.ns.gang.canRecruitMember()) {
        this.recruitMember();
      }
      this.equipmentsRepo.process();

      const gang = this.ns.gang.getGangInformation();
      this.warfare.process(gang);
      if (!gang.territoryWarfareEngaged) {
        // stop other processes during warfare
        for (const member of this.members) {
          member.process(gang);
        }
      }

      await this.ns.asleep(Second / 2);
    }
  }

  private recruitMember() {
    const name = this.names.values().next().value;
    this.names.delete(name);

    if (!this.ns.gang.recruitMember(name)) {
      this.logger.error("Failed to recruit member", {
        name,
      });
      return;
    }
    const member = this.createGangMemberManager(name);
    member.init();
    this.members.push(member);

    if (this.members.length === MaxMembers) {
      this.warfare.init();
      this.setModeToMoney();
    }
  }

  private createGangMemberManager(name: string, newSize = this.members.length + 1) {
    return new GangMemberManager(
      this.ns,
      this.logger,
      name,
      "str",
      newSize === MaxMembers ? GangMemberRole.Money : GangMemberRole.Respect,
      this.tasksRepo,
      this.equipmentsRepo,
    );
  }

  private setModeToMoney() {
    const gang = this.ns.gang.getGangInformation();
    for (let i = 0; i < this.members.length; i++) {
      this.members[i].updateRole(
        (i + 2) % 4 === 0 && gang.territory < 1
          ? GangMemberRole.Territory
          : (i + 2) % 4 === 1
          ? GangMemberRole.Respect
          : GangMemberRole.Money,
      );
    }
    this.ns.gang.getEquipmentNames();
  }

  private setModeToTerritory() {
    for (const member of this.members) {
      member.updateRole(GangMemberRole.Territory);
      this.ns.gang.setMemberTask(member.name, this.tasksRepo.territoryTask.name);
    }
  }
}
