import { GrowTimeMulti, HackBatchPercents, SharePowerTime, WeakenTimeMulti } from "$src/constants";
import type { ServerActionsData } from "$src/servers/server-actions/serverActionType";
import type { NS, Player, Server } from "$src/types/gameTypes";

export const SharePowerDummyServer = "share_power";

export class ServerData {
  public readonly reqLevel: number;
  public readonly maxMoney: number = 0;
  public readonly organization: string;

  public security = 0;
  public readonly minSecurity: number = 0;
  public readonly baseSecurity: number = 0;

  public readonly requiredPorts: number;
  public maxMem: number;
  public mem: number;
  public cores = 1;
  public reservedMem = 0;
  public claimedMem = 0;

  public money = 0;
  public rate: number;
  public growth: number;
  public times: ServerActionsData = [0, 0, 0, 0];
  public growThreads: Array<number>;

  public links = new Map<string, ServerData>();

  public constructor(private readonly ns: NS, public readonly name: string) {
    if (name === SharePowerDummyServer) return;

    const serverObject = ns.getServer(name);

    this.reqLevel = serverObject.requiredHackingSkill;
    this.maxMoney = serverObject.moneyMax;
    this.minSecurity = serverObject.minDifficulty;
    this.baseSecurity = serverObject.baseDifficulty;
    this.requiredPorts = serverObject.numOpenPortsRequired;
    this.organization = serverObject.organizationName;

    this.updateMemory();
    this.updateEphemeral();
  }

  public updateMemory() {
    const serverObject = this.ns.getServer(this.name);
    this.maxMem = serverObject.maxRam;
    this.mem = this.maxMem - this.claimedMem;
    this.cores = serverObject.cpuCores;
  }

  public updateEphemeral() {
    if (this.name === SharePowerDummyServer) return;

    const serverObject = this.ns.getServer(this.name);

    if (this.maxMoney > 0) {
      this.security = serverObject.hackDifficulty;
      this.money = serverObject.moneyAvailable;

      const hackTime = this.ns.getHackTime(this.name);
      this.times = [hackTime * WeakenTimeMulti, hackTime * GrowTimeMulti, hackTime, SharePowerTime];
      this.rate = this.ns.hackAnalyze(this.name);
      this.growth = serverObject.serverGrowth;
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
