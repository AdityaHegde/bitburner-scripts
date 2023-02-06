import type { Cracks } from "$src/servers/cracks";
import { ServerData, SharePowerDummyServer } from "$src/servers/serverData";
import type { NS, Player } from "$src/types/gameTypes";
import { binaryInsert } from "$src/utils/arrayUtils";
import { copyScriptToServer } from "$src/utils/copyScriptsToServer";
import { EventEmitter } from "$src/utils/eventEmitter";
import { isPlayerServer } from "$src/utils/isPlayerServer";
import { ResourceList } from "$src/servers/resourceList";
import { HackLevelMulti } from "$src/constants";
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

  private lastLevel: number;
  private serverIndex = 0;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly cracks: Cracks,
    public readonly allServers: Array<string>,
  ) {
    super();

    this.resourceList = new ResourceList(logger);
    this.allServerData = new Array<ServerData>(allServers.length);
    for (let i = 0; i < allServers.length; i++) {
      const serverData = new ServerData(ns, allServers[i]);
      this.allServerData[i] = serverData;
      this.serverDataNameMap[allServers[i]] = serverData;
    }

    for (let i = 0; i < allServers.length; i++) {
      const serverData = this.allServerData[i];
      for (const link of ns.scan(serverData.name)) {
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
      this.logger.log("ServersInfo", {
        pendingCrack: this.allServers.slice(this.serverIndex).join(","),
        pendingHack: this.possibleTargets
          .map(
            (target) =>
              `${target.name}(${target.reqLevel * HackLevelMulti - player.skills.hacking})`,
          )
          .join(","),
      });
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
    let i = this.serverIndex;
    for (; i < this.allServerData.length; i++) {
      const serverData = this.allServerData[i];
      if (!isPlayerServer(serverData.name) && !this.cracks.crackNPCServer(serverData)) {
        // newServers are in order of required cracks
        // so any server not cracked means successive ones are not cracked either
        break;
      }

      // copy all src
      copyScriptToServer(this.ns, serverData.name);
      cracked.push(serverData);
    }
    if (i > this.serverIndex) {
      this.serverIndex = i;
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
      this.logger.log("ServersInfo", {
        pendingCrack: this.allServers.slice(i).join(","),
        pendingHack: this.possibleTargets
          .map((target) => `${target.name}(${target.reqLevel})`)
          .join(","),
      });
    }
  }

  private handleNewCrackedServer(player: Player, serverData: ServerData) {
    if (serverData.maxMem > 0) {
      this.resourceList.add(serverData);
      this.emit("newResource", serverData);
    }

    if (isPlayerServer(serverData.name)) {
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
}
