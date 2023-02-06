import type { ServerData } from "$src/servers/serverData";
import { binaryInsert } from "$src/utils/arrayUtils";
import {
  ServerActionType,
  ServerActionTypeToMemMap,
} from "$src/servers/server-actions/serverActionType";
import type { ServerActionAssignments } from "$src/servers/server-actions/serverActionSet";
import type { Logger } from "$src/utils/logger/logger";

export class ResourceList {
  public readonly resources = new Array<ServerData>();
  public availableMem = 0;

  public constructor(private readonly logger: Logger) {}

  public add(serverData: ServerData) {
    binaryInsert(this.resources, serverData, (mid, ele) => mid.maxMem - ele.maxMem);
    this.availableMem +=
      ServerActionTypeToMemMap[ServerActionType.Grow] *
      Math.floor(serverData.mem / ServerActionTypeToMemMap[ServerActionType.Grow]);
  }

  public update(serverData: ServerData) {
    const index = this.resources.indexOf(serverData);
    this.resources.splice(index, 1);
    this.availableMem -=
      ServerActionTypeToMemMap[ServerActionType.Grow] *
      Math.floor(serverData.mem / ServerActionTypeToMemMap[ServerActionType.Grow]);

    serverData.updateMemory();
    this.add(serverData);
  }

  public reserveForAction(
    target: string,
    memPerThread: number,
    threads: number,
    index = 0,
    dir = 1,
    fullReserve = false,
  ): [number, ServerActionAssignments, number] {
    const reservations: ServerActionAssignments = [];

    let i = index;
    for (; i >= 0 && i < this.resources.length && threads !== 0; i += dir) {
      const possibleThreads = this.reserve(
        target,
        this.resources[i],
        memPerThread,
        threads,
        fullReserve,
      );
      if (possibleThreads <= 0) continue;
      if (threads >= 0) threads -= possibleThreads;
      reservations.push([this.resources[i], possibleThreads]);
    }

    return [threads, reservations, i - dir];
  }

  public reserve(
    target: string,
    serverData: ServerData,
    memPerThread: number,
    threads: number,
    fullReserve: boolean,
  ): number {
    let possibleThreads = Math.floor((serverData.mem - serverData.reservedMem) / memPerThread);
    if (possibleThreads === 0 || (possibleThreads < threads && fullReserve)) return 0;
    // this.logger.log("Reserve", {
    //   target,
    //   server: serverData.name,
    //   mem: serverData.mem,
    //   reservedMem: serverData.reservedMem,
    //   possibleThreads,
    //   threads,
    // });

    // threads = -1 denotes flood assign
    if (threads >= 0) possibleThreads = Math.min(possibleThreads, threads);
    serverData.reservedMem += possibleThreads * memPerThread;
    return possibleThreads;
  }

  public unReserve(serverData: ServerData, serverAction: ServerActionType, threads: number) {
    serverData.reservedMem -= threads * ServerActionTypeToMemMap[serverAction];
  }

  public claim(serverData: ServerData, serverAction: ServerActionType, threads: number) {
    this.claimMem(serverData, threads * ServerActionTypeToMemMap[serverAction]);
  }

  public claimMem(serverData: ServerData, mem: number) {
    // move the mem from reserved to claimed
    serverData.reservedMem -= mem;
    serverData.claimedMem += mem;
    serverData.mem -= mem;
    this.availableMem -= mem;
  }

  public unClaim(serverData: ServerData, serverAction: ServerActionType, threads: number) {
    this.unClaimMem(serverData, threads * ServerActionTypeToMemMap[serverAction]);
  }

  public unClaimMem(serverData: ServerData, mem: number) {
    serverData.claimedMem -= mem;
    serverData.mem += mem;
    this.availableMem += mem;
  }
}
