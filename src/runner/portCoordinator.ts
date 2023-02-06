import type { NetscriptPort, NS } from "$src/types/gameTypes";
import type { ServerDataList } from "$src/servers/serverDataList";
import { ServerActionPorts } from "$src/servers/server-actions/serverActionPorts";
import type { ServerActionBatch } from "$src/servers/server-actions/serverActionBatch";
import { PortPool } from "$src/ports/portPool";
import { ServerActionResponsePort } from "$src/ports/portWrapper";
import type { AnyPortPacket } from "$src/ports/packets/portPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";
import { EventEmitter } from "$src/utils/eventEmitter";
import type { ExitedPacket } from "$src/ports/packets/exitedPacket";
import type { ServerActionReferenceData } from "$src/ports/packets/serverActionReferenceData";
import type { ScriptStoppedPacket } from "$src/ports/packets/scriptStopped";
import type { BatchStartedPacket } from "$src/ports/packets/batchStartedPacket";
import { Logger } from "$src/utils/logger/logger";
import { ServerActionType } from "$src/servers/server-actions/serverActionType";

export type PortCoordinatorEvents = {
  batchStarted: (batch: ServerActionBatch, hackTime: number) => void;
  batchStopped: (batch: ServerActionBatch) => void;
  scriptStopped: (script: string) => void;
};

export type TargetLog = {
  server: string;
  score: number;
  money: number;
  maxMoney: number;
  security: number;
  minSecurity: number;
  rate: number;
  hackTime: number;
  threads: Array<number>;
  mem: number;
  sets: number;
  percent: number;
};

export class PortCoordinator extends EventEmitter<PortCoordinatorEvents> {
  public readonly portToBatchMap = new Map<number, ServerActionBatch>();
  public readonly responsePort: NetscriptPort;
  private readonly logger: Logger;

  public constructor(private readonly ns: NS, private readonly serverDataList: ServerDataList) {
    super();
    this.responsePort = ns.getPortHandle(ServerActionResponsePort);
    this.responsePort.clear();
    this.serverDataList.on("updateTargets", () => this.updateTargets());
    this.logger = Logger.AggregatorLogger(ns, "GameData");
  }

  public process() {
    while (!this.responsePort.empty()) {
      this.handlePacket(JSON.parse(this.responsePort.read() as string));
    }
  }

  public startBatch(batch: ServerActionBatch) {
    const commandPort = PortPool.acquire();
    this.ns.getPortHandle(commandPort).clear();
    const syncPort = PortPool.acquire();
    this.ns.getPortHandle(syncPort).clear();
    const triggerPort = PortPool.acquire();
    this.ns.getPortHandle(triggerPort).clear();
    const serverActionPorts = new ServerActionPorts(this.ns, commandPort, syncPort, triggerPort);
    this.portToBatchMap.set(commandPort, batch);
    return batch.startBatch(this.ns, serverActionPorts);
  }

  public targetLog(batch: ServerActionBatch) {
    this.logger.log<TargetLog>("Target", {
      server: batch.target.name,
      score: batch.score,
      money: batch.target.money,
      maxMoney: batch.target.maxMoney,
      security: batch.target.security,
      minSecurity: batch.target.minSecurity,
      rate: batch.target.rate,
      hackTime: batch.target.times[ServerActionType.Hack],
      threads: batch.threads,
      mem: batch.memTaken,
      sets: batch.actionSets.length,
      percent: batch.percent,
    });
  }

  private batchServerStopped(batch: ServerActionBatch, reference: ServerActionReferenceData) {
    if (!batch.batchServerStopped(reference)) return false;
    this.portToBatchMap.delete(batch.serverActionPorts.commandPort);
    PortPool.release(batch.serverActionPorts.commandPort);
    PortPool.release(batch.serverActionPorts.syncPort);
    PortPool.release(batch.serverActionPorts.triggerPort);
    return true;
  }

  private updateTargets() {
    for (const batch of this.portToBatchMap.values()) {
      batch.target.updateEphemeral();
      batch.updateHackTime(false);
    }
  }

  private handlePacket(packet: AnyPortPacket) {
    switch (packet.type) {
      case PortPacketType.BatchStarted:
        this.handleBatchStartedPacket(packet as BatchStartedPacket);
        break;

      case PortPacketType.ServerActionCompleted:
        break;

      case PortPacketType.Exited:
        this.handleExitedPacket(packet as ExitedPacket);
        break;

      case PortPacketType.ScriptStopped:
        this.handleScriptStoppedPacket(packet as ScriptStoppedPacket);
        break;
    }
  }

  private handleBatchStartedPacket(batchStartedPacket: BatchStartedPacket) {
    const batch = this.portToBatchMap.get(batchStartedPacket.port);
    if (!batch) return; // TODO: error

    batch.target.updateEphemeral();
    batch.updateHackTime(true);
    batch.end = batchStartedPacket.endTime;
    this.targetLog(batch);
    this.emit("batchStarted", batch, batchStartedPacket.hackTime);
  }

  private handleExitedPacket(exitedPacket: ExitedPacket) {
    const batch = this.portToBatchMap.get(exitedPacket.port);
    if (!batch) return; // TODO: error
    if (!this.batchServerStopped(batch, exitedPacket.reference)) return;
    this.emit("batchStopped", batch);
  }

  private handleScriptStoppedPacket(scriptStoppedPacket: ScriptStoppedPacket) {
    this.emit("scriptStopped", scriptStoppedPacket.script);
  }
}
