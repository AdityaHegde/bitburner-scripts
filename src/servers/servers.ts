import { EarlyGameRunner } from "$src/constants";
import { EventEmitter } from "$src/utils/eventEmitter";
import type { NS } from "../types/gameTypes";
import { binaryInsert } from "../utils/arrayUtils";
import { copyScriptToServer } from "../utils/copyScriptsToServer";
import { isPlayerServer } from "../utils/isPlayerServer";
import { Logger } from "../utils/logger";
import type { Cracks } from "./cracks";
import { ListOfCracks } from "./cracks";
import { Resource } from "./resource";
import { Target } from "./target";

export type ServersEvents = {
  newResource: (resource: Resource) => void;
  resourceUpdated: (resource: Resource) => void;
  newTarget: (target: Target) => void;
};

export class Servers extends EventEmitter<ServersEvents> {
  public resources = new Array<Resource>();
  public resourcesMap: Record<string, Resource> = {};

  public newTargets = new Array<string>();
  public targets = new Array<string>();
  public targetsMap: Record<string, Target> = {};
  public readonly logger: Logger;

  private lastLevel: number;

  public constructor(
    private readonly ns: NS,
    private readonly cracks: Cracks,
    private readonly runnerServer: string,
    public newServers: Array<string>,
  ) {
    super();
    this.logger = Logger.ConsoleLogger(ns, "Servers");
  }

  public run() {
    const level = this.ns.getHackingLevel();
    if (level !== this.lastLevel) {
      for (const resource of this.resources) {
        resource.fillEphemeral();
      }
      this.lastLevel = level;
    }

    this.newCrackedServers(this.nukeServers());
    this.updateTargets();
  }

  public newCrackedServers(newServers: Array<string>) {
    if (newServers.length > 0) {
      this.logger.info("NewServers", {
        cracks: this.cracks.cracks.map((crack) => ListOfCracks[crack]),
        newServers,
      });
    }
    for (const crackedServer of newServers) {
      let offset = 0;
      // add memory offsets
      if (crackedServer === this.runnerServer) {
        offset = this.ns.getScriptRam(EarlyGameRunner);
      }
      this.newResource(crackedServer, offset);
    }
  }

  public updateResources(updatedServers: Array<string>) {
    for (const updatedServer of updatedServers) {
      const oldIndex = this.resources.findIndex((res) => res.server === updatedServer);
      this.resources.splice(oldIndex, 1);

      const resource = this.resourcesMap[updatedServer];

      this.addToResources(resource);
      this.emit("resourceUpdated", resource);
    }
  }

  public log() {
    for (const resource of this.resources) {
      resource.log();
    }
    for (const targetServer of this.targets) {
      this.targetsMap[targetServer].log();
    }
  }

  private newResource(serverName: string, memOffset: number) {
    const resource = new Resource(this.ns, this.logger, serverName, memOffset);
    this.resourcesMap[serverName] = resource;
    this.addToResources(resource);
    this.emit("newResource", resource);

    if (isPlayerServer(serverName)) {
      return;
    }
    if (this.ns.getHackingLevel() >= this.resourcesMap[serverName].reqLevel) {
      this.addServerToTargets(serverName);
    } else {
      this.addToNewTargets(serverName);
    }
  }

  private nukeServers(): Array<string> {
    this.cracks.collectCracks();

    const cracked = [];
    let i = 0;
    for (; i < this.newServers.length; i++) {
      const server = this.newServers[i];
      if (!isPlayerServer(server) && !this.cracks.crackNPCServer(server)) {
        // newServers are in order of required cracks
        // so any server not cracked means successive ones are not cracked either
        break;
      }

      // copy all src
      copyScriptToServer(this.ns, server);
      cracked.push(server);
    }
    if (i > 0) {
      this.newServers = this.newServers.splice(i);
    }

    return cracked;
  }

  private updateTargets() {
    let i = 0;
    // move new targets
    for (; i < this.newTargets.length; i++) {
      const targetServer = this.newTargets[i];
      const targetResource = this.resourcesMap[targetServer];
      if (!targetResource) break;
      if (this.ns.getHackingLevel() >= targetResource.reqLevel) {
        if (targetResource.rate === 0) {
          // un-hackable servers should be ignored
          continue;
        }
        this.addServerToTargets(targetServer);
      } else {
        break;
      }
    }

    if (i > 0) {
      this.newTargets = this.newTargets.splice(i);
    }
  }

  private addServerToTargets(serverName: string) {
    // non hackable servers
    if (this.resourcesMap[serverName].maxMoney === 0) return undefined;
    const target = new Target(this.ns, this.logger, this.resourcesMap[serverName]);
    this.targetsMap[serverName] = target;
    target.fill();
    binaryInsert(
      this.targets,
      serverName,
      (mid, ele) => this.targetsMap[ele].score - this.targetsMap[mid].score,
    );
    this.emit("newTarget", target);
  }

  private addToResources(resource: Resource) {
    binaryInsert(this.resources, resource, (mid, ele) => mid.mem - ele.mem);
  }

  private addToNewTargets(addedServer: string) {
    binaryInsert(
      this.newTargets,
      addedServer,
      (mid, ele) => this.resourcesMap[mid].reqLevel - this.resourcesMap[ele].reqLevel,
    );
  }
}
