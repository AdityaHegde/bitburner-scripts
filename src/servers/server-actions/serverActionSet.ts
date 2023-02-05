import type { ServerData } from "$src/servers/serverData";
import {
  ServerActionType,
  ServerActionTypeToMemMap,
  ServerActionTypeToScript,
} from "$src/servers/server-actions/serverActionType";
import type { ResourceList } from "$src/servers/resourceList";
import type { ServerActionPorts } from "$src/servers/server-actions/serverActionPorts";
import type { NS } from "$src/types/gameTypes";
import type { ServerActionReferenceData } from "$src/ports/packets/serverActionReferenceData";

export type ServerActionAssignment = [serverData: ServerData, threads: number];
export type ServerActionAssignments = Array<ServerActionAssignment>;

export class ServerActionSet {
  public reservations: Array<ServerActionAssignments>;
  public assignments: Array<ServerActionAssignments>;
  public readonly threads: Array<number>;

  public constructor(
    private readonly actionTypes: Array<ServerActionType>,
    threads: Array<number>,
  ) {
    this.reservations = new Array(threads.length);
    this.assignments = new Array(threads.length);
    this.threads = new Array(threads.length);
    for (let i = 0; i < threads.length; i++) {
      this.reservations[i] = [];
      this.assignments[i] = [];
      this.threads[i] = threads[i];
    }
  }

  public reserve(target: string, resourceList: ResourceList, index = 0) {
    let hasReservations = false;
    for (let actionIdx = 0; actionIdx < this.actionTypes.length; actionIdx++) {
      [this.threads[actionIdx], this.reservations[actionIdx], index] =
        resourceList.reserveForAction(
          target,
          ServerActionTypeToMemMap[this.actionTypes[actionIdx]],
          this.threads[actionIdx],
          index,
        );
      if (this.reservations[actionIdx].length > 0) hasReservations = true;
    }
    return this.threads.every((thread) => thread <= 0) && hasReservations;
  }

  public unReserve(resourceList: ResourceList) {
    for (let actionIdx = 0; actionIdx < this.actionTypes.length; actionIdx++) {
      for (const [serverData, threads] of this.reservations[actionIdx]) {
        resourceList.unReserve(serverData, this.actionTypes[actionIdx], threads);
      }
    }
  }

  public claim(resourceList: ResourceList) {
    for (let actionIdx = 0; actionIdx < this.actionTypes.length; actionIdx++) {
      for (const [serverData, threads] of this.reservations[actionIdx]) {
        resourceList.claim(serverData, this.actionTypes[actionIdx], threads);
        this.assignments[actionIdx].push([serverData, threads]);
      }
    }
  }

  public unClaim(resourceList: ResourceList) {
    for (let actionIdx = 0; actionIdx < this.actionTypes.length; actionIdx++) {
      for (const [serverData, threads] of this.assignments[actionIdx]) {
        resourceList.unClaim(serverData, this.actionTypes[actionIdx], threads);
      }
    }
  }

  public startSet(
    ns: NS,
    setIndex: number,
    setCount: number,
    processIndex: number,
    processCount: number,
    countMulti: Array<number>,
    serverActionPorts: ServerActionPorts,
    longestAction: number,
  ): [number, Array<string>] {
    const failedServers = new Array<string>();

    for (let actionIndex = 0; actionIndex < this.assignments.length; actionIndex++) {
      for (const [serverData, threads] of this.assignments[actionIndex]) {
        const reference: ServerActionReferenceData = {
          actionIndex,
          actionCount: this.actionTypes.length,
          setIndex,
          setCount,
          processIndex,
          processCount,
          countMulti: countMulti[actionIndex],
          longestAction,
        };
        processIndex++;

        const pid = ns.exec(
          ServerActionTypeToScript[this.actionTypes[actionIndex]],
          serverData.name,
          threads,
          JSON.stringify(reference),
          serverActionPorts.commandPort,
          serverActionPorts.syncPort,
          serverActionPorts.triggerPort,
        );
        if (pid > 0) continue;

        failedServers.push(serverData.name);
      }
    }

    return [processIndex, failedServers];
  }

  public reservationLog() {
    return this.reservations
      .map(
        (assignments, index) =>
          `${ServerActionType[this.actionTypes[index]]}:${assignments
            .map(([serverData, threads]) => `${serverData.name}(${threads})`)
            .join(",")}(${this.threads[index]})`,
      )
      .join("==");
  }

  public assignmentLog() {
    return this.assignments
      .map(
        (assignments, index) =>
          `${ServerActionType[this.actionTypes[index]]}:${assignments
            .map(([serverData, threads]) => `${serverData.name}(${threads})`)
            .join(",")}`,
      )
      .join("==");
  }
}
