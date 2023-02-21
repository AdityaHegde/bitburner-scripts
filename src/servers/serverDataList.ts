import type { Cracks } from "$src/servers/cracks";
import { ListOfCracks } from "$src/servers/cracks";
import { ServerData, SharePowerDummyServer } from "$src/servers/serverData";
import type { NS, Player } from "$src/types/gameTypes";
import { binaryInsert } from "$src/utils/arrayUtils";
import { copyScriptToServer } from "$src/utils/copyScriptsToServer";
import { EventEmitter } from "$src/utils/eventEmitter";
import { isPlayerServer } from "$src/utils/isPlayerServer";
import { ResourceList } from "$src/servers/resourceList";
import { HackLevelMulti, HackOverLevelMulti } from "$src/constants";
import type { Logger } from "$src/utils/logger/logger";

export type ServerDataListEvents = {
  newResource: (serverData: ServerData) => void;
  resourceUpdated: (serverData: ServerData) => void;
  updateTargets: () => void;
  newTarget: (serverData: ServerData) => void;
};

export class ServerDataList extends EventEmitter<ServerDataListEvents> {
  public readonly allServerData: Array<ServerData>;
  public readonly serverDataNameMap: Record<string, ServerData> = {};
  public possibleTargets = new Array<ServerData>();
  public readonly resourceList: ResourceList;

  public serversByPorts: Array<Array<ServerData>> = new Array(ListOfCracks.length + 1)
    .fill([])
    .map(() => []);
  public serversByPortCursor = new Array<number>(ListOfCracks.length + 1).fill(0);

  public maxPlayerLevel = 0;
  private lastLevel: number;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    public readonly cracks: Cracks,
    public readonly allServers: Array<string>,
  ) {
    super();

    this.resourceList = new ResourceList(logger);
    this.allServerData = new Array<ServerData>(allServers.length);
    for (let i = 0; i < allServers.length; i++) {
      const serverData = new ServerData(ns, allServers[i]);
      this.allServerData[i] = serverData;
      this.serverDataNameMap[allServers[i]] = serverData;
      if (serverData.reqLevel * HackOverLevelMulti > this.maxPlayerLevel) {
        this.maxPlayerLevel = serverData.reqLevel * HackOverLevelMulti;
      }
      if (isPlayerServer(serverData.name)) {
        this.serversByPorts[0].unshift(serverData);
      } else {
        this.serversByPorts[serverData.requiredPorts].push(serverData);
      }
    }

    for (let i = 0; i < allServers.length; i++) {
      const serverData = this.allServerData[i];
      for (const link of ns.scan(serverData.name)) {
        if (!this.serverDataNameMap[link]) continue;
        serverData.links.set(link, this.serverDataNameMap[link]);
      }
    }
  }

  public init() {
    this.emit("newTarget", new ServerData(this.ns, SharePowerDummyServer));
  }

  public process() {
    const player = this.ns.getPlayer();

    if (player.skills.hacking !== this.lastLevel) {
      this.emit("updateTargets");
      this.lastLevel = player.skills.hacking;
    }

    const crackedServers = this.nukeServers();
    for (const serverData of crackedServers) {
      this.handleNewCrackedServer(player, serverData);
    }
    if (crackedServers.length > 0) {
      this.log(player);
    }
    this.updateTargets(player);
  }

  public addServer(serverName: string) {
    const serverData = new ServerData(this.ns, serverName);
    this.allServerData.push(serverData);
    this.allServers.push(serverName);
    this.serverDataNameMap[serverName] = serverData;
    this.handleNewCrackedServer(this.ns.getPlayer(), serverData);
  }

  public updateServer(serverName: string) {
    const serverData = this.serverDataNameMap[serverName];
    this.resourceList.update(serverData);
    this.emit("resourceUpdated", serverData);
  }

  private nukeServers(): Array<ServerData> {
    this.cracks.collectCracks();

    const cracked = new Array<ServerData>();

    for (let crackIdx = 0; crackIdx <= this.cracks.cracks.length; crackIdx++) {
      for (
        let serverIdx = this.serversByPortCursor[crackIdx];
        serverIdx < this.serversByPorts[crackIdx].length;
        serverIdx++
      ) {
        const serverData = this.serversByPorts[crackIdx][serverIdx];
        if (!isPlayerServer(serverData.name) && !this.cracks.crackNPCServer(serverData)) {
          // newServers are in order of required cracks
          // so any server not cracked means successive ones are not cracked either
          break;
        }

        // copy all src
        copyScriptToServer(this.ns, serverData.name);
        cracked.push(serverData);
        this.serversByPortCursor[crackIdx]++;
      }
    }

    return cracked;
  }

  private updateTargets(player: Player) {
    let i = 0;
    // move new targets
    for (; i < this.possibleTargets.length; i++) {
      const targetServer = this.possibleTargets[i];
      if (Math.ceil(player.skills.hacking / HackLevelMulti) >= targetServer.reqLevel) {
        targetServer.updateEphemeral();
        if (targetServer.rate === 0 || targetServer.maxMoney === 0) {
          // un-hackable servers should be ignored
          continue;
        }
        this.emit("newTarget", targetServer);
      } else {
        break;
      }
    }

    if (i > 0) {
      this.possibleTargets = this.possibleTargets.splice(i);
      this.log(player);
    }
  }

  private handleNewCrackedServer(player: Player, serverData: ServerData) {
    if (serverData.maxMem > 0) {
      this.resourceList.add(serverData);
      this.emit("newResource", serverData);
    }

    // fulcrumassets has terrible stats
    if (isPlayerServer(serverData.name) || serverData.name === "fulcrumassets") {
      return;
    }
    if (Math.ceil(player.skills.hacking / HackLevelMulti) >= serverData.reqLevel) {
      if (serverData.rate > 0 && serverData.maxMoney > 0) this.emit("newTarget", serverData);
    } else {
      this.addToNewTargets(serverData);
    }
  }

  private addToNewTargets(serverData: ServerData) {
    binaryInsert(this.possibleTargets, serverData, (mid, ele) => mid.reqLevel - ele.reqLevel);
  }

  private log(player: Player) {
    this.logger.log("ServersInfo", {
      pendingCrack: this.serversByPorts
        .map(
          (serversByPorts, crackIdx) =>
            `${crackIdx}:${serversByPorts
              .slice(this.serversByPortCursor[crackIdx])
              .map((s) => s.name)
              .join(",")}`,
        )
        .join(" == "),
      pendingHack: this.possibleTargets
        .map(
          (target) => `${target.name}(${target.reqLevel * HackLevelMulti - player.skills.hacking})`,
        )
        .join(","),
    });
  }
}
