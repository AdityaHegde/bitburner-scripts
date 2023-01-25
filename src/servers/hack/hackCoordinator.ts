import type { ExitedPacket } from "$src/ports/packets/exitedPacket";
import type { HackResponsePacket } from "$src/ports/packets/hackResponsePacket";
import type { AnyPortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";
import type { ServerStartedPacket } from "$src/ports/packets/serverStartedPacket";
import { HackResponsePort, PortWrapper } from "$src/ports/portWrapper";
import type { Cluster } from "$src/servers/clusters/cluster";
import type { Resource } from "$src/servers/resource";
import type { Servers } from "$src/servers/servers";
import type { NS } from "$src/types/gameTypes";
import { EventEmitter } from "$src/utils/eventEmitter";
import type { Logger } from "$src/utils/logger/logger";

export type HackCoordinatorEvents = {};

export class HackCoordinator extends EventEmitter<HackCoordinatorEvents> {
  public readonly portMap = new Map<number, [Resource, Cluster]>();
  private readonly messages = new Map<number, Array<AnyPortPacket>>();
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
      const packet = await this.responsePortWrapper.read<AnyPortPacket>(true);
      this.handlePacket(packet);
    }
  }

  public addCluster(cluster: Cluster) {
    for (const resource of cluster.data.sortedResources) {
      this.portMap.set(resource.commPortWrapper.port, [resource, cluster]);
      if (!this.messages.get(resource.commPortWrapper.port)?.length) continue;
      for (const packet of this.messages.get(resource.commPortWrapper.port)) {
        this.handlePacket(packet);
      }
      this.messages.delete(resource.commPortWrapper.port);
    }
  }

  public removeCluster(cluster: Cluster) {
    for (const resource of cluster.data.sortedResources) {
      this.portMap.delete(resource.commPortWrapper.port);
    }
  }

  private handlePacket(packet: AnyPortPacket) {
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

  private handleServerStartedPacket(packet: ServerStartedPacket) {
    if (!this.portMap.has(packet.port)) {
      this.queueMessage(packet);
      return;
    }
    const [resource, cluster] = this.portMap.get(packet.port);
    cluster.serverStarted(resource);
  }

  private handleExitedPacket(packet: ExitedPacket) {
    if (!this.portMap.has(packet.port)) {
      this.queueMessage(packet);
      return;
    }
    const [resource, cluster] = this.portMap.get(packet.port);
    cluster.serverStopped(resource);
  }

  private handleResponsePacket(packet: HackResponsePacket) {
    if (!this.portMap.has(packet.port)) {
      this.queueMessage(packet);
      return;
    }
    const [resource, cluster] = this.portMap.get(packet.port);
    cluster.serverReturned(resource, packet.reference);
  }

  private queueMessage(packet: AnyPortPacket) {
    const port = (packet as any).port;
    if (!port) return;
    if (!this.messages.get(port)) {
      this.messages.set(port, []);
    }
    this.messages.get(port).push(packet);
  }
}
