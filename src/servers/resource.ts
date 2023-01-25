import { GrowTimeMulti, HackBatchPercents, SharePowerTime, WeakenTimeMulti } from "$src/constants";
import { newExitPacket } from "$src/ports/packets/exitPacket";
import { newHackRequestPacket } from "$src/ports/packets/hackRequestPacket";
import { PortPool } from "$src/ports/portPool";
import { PortWrapper } from "$src/ports/portWrapper";
import type { NS, Player, Server } from "../types/gameTypes";
import type { Logger } from "../utils/logger/logger";
import type { HackTypesData } from "./hack/hackTypes";
import { HackType, HackTypeToMemMap, HackTypeToScript } from "./hack/hackTypes";

export const ResourceLogMessage = "Resource";
export type ResourceLog = {
  server: string;
  mem: number;
  maxMoney: number;
  money: number;
  minSecurity: number;
  security: number;
  rate: number;
  growth: number;
  times: HackTypesData;
  commPort: number;
};

export enum ResourceState {
  New,
  Started,
  Returned,
  Stopped,
}

export class Resource {
  public readonly reqLevel: number;
  public readonly minSecurity: number = 0;
  public readonly maxMoney: number = 0;

  public threads: HackTypesData;
  public maxMem = 0;
  public mem: number;
  public cores: number;

  public security = 0;
  public money = 0;
  public rate: number;
  public growth: number;
  public times: HackTypesData = [0, 0, 0, 0];
  public growThreads: Array<number>;

  public restarting = true;
  public hackType: HackType;

  public reserved: boolean;
  public reservedMem = 0;
  public claimed: boolean;

  public commPortWrapper: PortWrapper;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    public readonly server: string,
    public memOffset: number,
    public readonly dummy = false,
  ) {
    if (dummy) {
      return;
    }

    this.reqLevel = ns.getServerRequiredHackingLevel(server);
    this.minSecurity = ns.getServerMinSecurityLevel(server);
    this.maxMoney = ns.getServerMaxMoney(server);
    // cores should be updated adhoc
    this.cores = 1;

    this.updateMemory();

    this.fillEphemeral();
    this.commPortWrapper = new PortWrapper(ns, PortPool.acquire());
  }

  public updateMemory() {
    this.maxMem = this.ns.getServerMaxRam(this.server);
    this.mem = this.maxMem - this.memOffset;
    this.threads = [
      this.normalizeMemory(Math.floor(this.mem / HackTypeToMemMap[HackType.Weaken])),
      this.normalizeMemory(Math.floor(this.mem / HackTypeToMemMap[HackType.Grow])),
      this.normalizeMemory(Math.floor(this.mem / HackTypeToMemMap[HackType.Hack])),
      this.normalizeMemory(Math.floor(this.mem / HackTypeToMemMap[HackType.SharePower])),
    ];
  }

  public fillEphemeral() {
    const server = this.server;

    if (this.maxMoney > 0) {
      this.security = this.ns.getServerSecurityLevel(server);
      this.money = this.ns.getServerMoneyAvailable(server);

      const hackTime = this.ns.getHackTime(server);
      this.times = [hackTime * WeakenTimeMulti, hackTime * GrowTimeMulti, hackTime, SharePowerTime];
      this.rate = this.ns.hackAnalyze(server);
      this.growth = this.ns.getServerGrowth(server);
    } else {
      this.times = [0, 0, 0, SharePowerTime];
      this.rate = 0;
      this.growth = 0;
    }
  }

  public fillGrowThreads(server: Server, player: Player) {
    this.growThreads = new Array<number>(HackBatchPercents.length);
    let lastThreads = 0;
    for (let i = HackBatchPercents.length - 1; i >= 0; i--) {
      this.growThreads[i] = searchGrowthThreads(
        this.ns,
        server,
        player,
        HackBatchPercents[i],
        lastThreads,
      );
      lastThreads = this.growThreads[i];
    }
  }

  public isFree() {
    return !this.claimed;
  }

  public reserve(threads: number, hackType: HackType) {
    this.reserved = true;
    this.reservedMem += HackTypeToMemMap[hackType] * threads;
  }

  public freeUp(threads: number, hackType: HackType) {
    this.reserved = false;
    this.reservedMem -= HackTypeToMemMap[hackType] * threads;
  }

  public claim(hackType: HackType) {
    this.hackType = hackType;
    this.reserved = false;
    this.reservedMem = 0;
    this.claimed = true;
  }

  public release() {
    this.claimed = false;
    this.reserved = false;
    this.reservedMem = 0;
  }

  public startScripts() {
    if (!this.restarting) return -1;
    this.restarting = false;
    return this.ns.exec(
      HackTypeToScript[this.hackType],
      this.server,
      this.threads[this.hackType],
      this.commPortWrapper.port,
    );
  }

  public async stopScripts() {
    if (this.restarting) return;
    this.restarting = true;
    return this.commPortWrapper.write(newExitPacket(this.server));
  }

  public async startAssignment(
    target: string,
    count: number,
    start: number,
    end: number,
    period: number,
    operationIndex: number,
    groupIndex: number,
  ) {
    return this.commPortWrapper.write(
      newHackRequestPacket(target, start, end, period, count, {
        operationIndex,
        groupIndex,
      }),
    );
  }

  public split(threads: number, hackType: HackType): Resource {
    const mem = threads * HackTypeToMemMap[hackType];
    const newResource = new Resource(this.ns, this.logger, this.server, this.maxMem - mem, false);
    newResource.fillEphemeral();

    this.memOffset += mem;
    this.updateMemory();

    return newResource;
  }

  public merge(resource: Resource) {
    this.mem += resource.mem;
    this.memOffset -= resource.mem;
    this.updateMemory();
    PortPool.release(resource.commPortWrapper.port);
  }

  public log() {
    this.logger.info<ResourceLog>(ResourceLogMessage, {
      server: this.server,
      mem: this.mem,
      maxMoney: this.maxMoney,
      money: this.money,
      minSecurity: this.minSecurity,
      security: this.security,
      rate: this.rate,
      growth: this.growth,
      times: this.times,
      commPort: this.commPortWrapper.port,
    });
  }

  private normalizeMemory(mem: number): number {
    return Number(mem.toFixed(2));
  }
}

// TODO: add binary search
// TODO: cores
function searchGrowthThreads(ns: NS, server: Server, player: Player, percent: number, threads = 1) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const newMoney = getGrowth(ns, server, player, threads, percent);
    if (newMoney >= server.moneyMax) break;
    threads++;
  }

  return threads;
}

function getGrowth(ns: NS, server: Server, player: Player, threads: number, percent: number) {
  const serverGrowth = ns.formulas.hacking.growPercent(server, threads, player);
  return ((1 - percent) * server.moneyMax + 1 + threads) * serverGrowth;
}
