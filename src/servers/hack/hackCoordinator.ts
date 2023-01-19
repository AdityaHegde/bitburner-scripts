import type {
  ExitedPacket,
  HackResponsePacket,
  PortPacket,
  ServerStartedPacket,
} from "$src/ports/portPacket";
import { PortPacketType } from "$src/ports/portPacket";
import { HackResponsePort, PortWrapper } from "$src/ports/portWrapper";
import type { Cluster } from "$src/servers/clusters/cluster";
import type { Resource } from "$src/servers/resource";
import type { Servers } from "$src/servers/servers";
import type { NS } from "$src/types/gameTypes";
import { EventEmitter } from "$src/utils/eventEmitter";
import type { Logger } from "$src/utils/logger";

export type HackCoordinatorEvents = {};

export class HackCoordinator extends EventEmitter<HackCoordinatorEvents> {
  public readonly portMap = new Map<number, [Resource, Cluster]>();
  private readonly responsePortWrapper: PortWrapper;

  public constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly servers: Servers,
  ) {
    super();
    this.responsePortWrapper = new PortWrapper(ns, HackResponsePort);
  }

  public async run() {
    while (!this.responsePortWrapper.empty()) {
      const packet = await this.responsePortWrapper.read<PortPacket<PortPacketType, object>>(true);
      switch (packet.type) {
        case PortPacketType.ServerStarted:
          this.handleServerStartedPacket(packet as ServerStartedPacket);
          break;

        case PortPacketType.Exited:
          this.handleExitedPacket(packet as ExitedPacket);
          break;

        case PortPacketType.HackStopped:
          // nothing
          break;

        case PortPacketType.HackResponse:
          this.handleResponsePacket(packet as HackResponsePacket);
          break;
      }
    }
  }

  public addCluster(cluster: Cluster) {
    for (const resource of cluster.data.sortedResources) {
      this.portMap.set(resource.commPortWrapper.port, [resource, cluster]);
    }
  }

  public removeCluster(cluster: Cluster) {
    for (const resource of cluster.data.sortedResources) {
      this.portMap.delete(resource.commPortWrapper.port);
    }
  }

  private handleServerStartedPacket(packet: ServerStartedPacket) {
    const [resource, cluster] = this.portMap.get(packet.port);
    cluster.serverStarted(resource);
  }

  private handleExitedPacket(packet: ExitedPacket) {
    const [resource, cluster] = this.portMap.get(packet.port);
    cluster.serverStopped(resource);
  }

  private handleResponsePacket(packet: HackResponsePacket) {
    const [resource, cluster] = this.portMap.get(packet.port);
    cluster.serverReturned(resource, packet.reference);
  }
}
