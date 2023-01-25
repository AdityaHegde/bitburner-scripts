import type { Cracks } from "$src/servers/cracks";
import { ServerData } from "$src/servers/serverData";
import type { NS, Player } from "$src/types/gameTypes";
import { binaryInsert } from "$src/utils/arrayUtils";
import { copyScriptToServer } from "$src/utils/copyScriptsToServer";
import { EventEmitter } from "$src/utils/eventEmitter";
import { isPlayerServer } from "$src/utils/isPlayerServer";

export type ServerDataListEvents = {
  newResource: (serverData: ServerData) => void;
  resourceUpdated: (serverData: ServerData) => void;
  newTarget: (serverData: ServerData) => void;
};

export class ServerDataList extends EventEmitter<ServerDataListEvents> {
  public readonly allServerData: Array<ServerData>;
  public readonly serverDataNameMap: Record<string, ServerData> = {};
  public possibleTargets = new Array<ServerData>();
  public readonly resources = new Array<ServerData>();
  public readonly targets = new Array<ServerData>();

  private lastLevel: number;
  private serverIndex = 0;

  public constructor(
    private readonly ns: NS,
    private readonly cracks: Cracks,
    public readonly allServers: Array<string>,
  ) {
    super();

    this.allServerData = new Array<ServerData>(allServers.length);
    for (let i = 0; i < allServers.length; i++) {
      const serverData = new ServerData(ns, allServers[i]);
      this.allServerData[i] = serverData;
      this.serverDataNameMap[allServers[i]] = serverData;
    }
  }

  public process() {
    const player = this.ns.getPlayer();

    if (player.skills.hacking !== this.lastLevel) {
      for (const serverData of this.targets) {
        serverData.updateEphemeral();
      }
      this.lastLevel = player.skills.hacking;
    }

    for (const serverData of this.nukeServers()) {
      this.handleNewCrackedServer(player, serverData);
    }
    this.updateTargets();
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

  private updateTargets() {
    let i = 0;
    // move new targets
    for (; i < this.possibleTargets.length; i++) {
      const targetServer = this.possibleTargets[i];
      if (this.ns.getHackingLevel() >= targetServer.reqLevel) {
        if (targetServer.rate === 0) {
          // un-hackable servers should be ignored
          continue;
        }
        this.addToTargets(targetServer);
      } else {
        break;
      }
    }

    if (i > 0) {
      this.possibleTargets = this.possibleTargets.splice(i);
    }
  }

  private handleNewCrackedServer(player: Player, serverData: ServerData) {
    if (serverData.maxMem > 0) {
      this.resources.push(serverData);
      this.emit("newResource", serverData);
    }

    if (isPlayerServer(serverData.name)) {
      return;
    }
    if (player.skills.hacking >= serverData.reqLevel) {
      this.addToTargets(serverData);
    } else {
      this.addToNewTargets(serverData);
    }
  }

  private addToTargets(serverData: ServerData) {
    this.targets.push(serverData);
    this.emit("newTarget", serverData);
  }

  private addToNewTargets(serverData: ServerData) {
    binaryInsert(this.possibleTargets, serverData, (mid, ele) => mid.reqLevel - ele.reqLevel);
  }
}
