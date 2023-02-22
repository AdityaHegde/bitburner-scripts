import { GrowTimeMulti, HackBatchPercents, SharePowerTime, WeakenTimeMulti } from "$src/constants";
import type { ServerActionsData } from "$src/servers/server-actions/serverActionType";
import type { NS, Player, Server } from "$src/types/gameTypes";
import { config } from "$src/config";
import { Heap } from "$src/utils/heap";

export const SharePowerDummyServer = "share_power";

type ServerSearchNode = {
  server: ServerData;
  distance: number;
  from: ServerSearchNode;
};

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
  public times: ServerActionsData = [0, 0, 0, 0, 0];
  public growThreads: Array<number>;

  public expScore = 0;

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
    const playerObject = this.ns.getPlayer();

    if (this.maxMoney > 0) {
      this.security = serverObject.hackDifficulty;
      this.money = serverObject.moneyAvailable;

      const hackTime = config.hasFormulaAccess
        ? this.ns.formulas.hacking.hackTime(serverObject, playerObject)
        : this.ns.getHackTime(this.name);
      this.times = [
        hackTime * WeakenTimeMulti,
        hackTime * GrowTimeMulti,
        hackTime,
        SharePowerTime,
        hackTime * GrowTimeMulti,
      ];
      this.rate = config.hasFormulaAccess
        ? this.ns.formulas.hacking.hackPercent(serverObject, playerObject)
        : this.ns.hackAnalyze(this.name);
      this.growth = serverObject.serverGrowth;

      this.expScore = serverObject.baseDifficulty / hackTime;
    } else {
      this.times = [0, 0, SharePowerTime, SharePowerTime, 0];
      this.rate = 0;
      this.growth = 0;
    }
  }

  public fillGrowThreads(server: Server, player: Player) {
    this.growThreads = new Array<number>(HackBatchPercents.length);
    let lastThreads = 1;
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

  public getPathTo(to: string): Array<ServerData> {
    const visited = new Set<string>();
    const queue = new Heap<ServerSearchNode>(
      (a, b) => a.distance - b.distance,
      (a) => a.server.name,
    );
    queue.push({
      server: this,
      distance: 0,
      from: undefined,
    });

    while (!queue.empty()) {
      let visitServer = queue.pop();
      if (visitServer.server.name === to) {
        const path = new Array<ServerData>();
        while (visitServer) {
          path.unshift(visitServer.server);
          visitServer = visitServer.from;
        }
        return path;
      }

      visited.add(visitServer.server.name);
      for (const link of visitServer.server.links.values()) {
        const distance = visitServer.distance + 1;

        if (visited.has(link.name)) {
          if (!queue.has(link.name)) continue;
          const existing = queue.get(link.name);
          if (existing.distance < distance) {
            existing.distance = distance;
            existing.from = visitServer;
            queue.updateItem(existing);
          }
          continue;
        }

        queue.push({
          server: link,
          distance,
          from: visitServer,
        });
      }
    }

    return [];
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
  return ((1 - percent) * server.moneyMax + threads) * serverGrowth;
}
