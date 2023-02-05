import {
  ServerActionTimeMultipliers,
  ServerActionType,
} from "$src/servers/server-actions/serverActionType";
import { ServerActionPorts } from "$src/servers/server-actions/serverActionPorts";
import { ServerActionResponsePort } from "$src/ports/portWrapper";
import type { NetscriptPort, NS } from "$src/types/gameTypes";
import { newExitedPacket } from "$src/ports/packets/exitedPacket";
import { BatchOperationBuffer } from "$src/constants";
import { newServerActionCompleted } from "$src/ports/packets/serverActionCompletedPacket";
import { Logger } from "$src/utils/logger/logger";
import type { ServerActionReferenceData } from "$src/ports/packets/serverActionReferenceData";
import { newBatchStartedPacket } from "$src/ports/packets/batchStartedPacket";
import { asyncWait } from "$server/utils/asyncUtils";

export type ActionLogBase = {
  target: string;
  action: ServerActionType;
  actionIndex: number;
  setIndex: number;
  processIndex: number;
};

export const ActionWaitForStartLabel = "WaitForStart";
export type ActionWaitForStartLog = ActionLogBase & {
  starts: number;
  count: number;
};

export const ActionWaitForEndLabel = "WaitForEnd";
export type ActionWaitForEndLog = ActionLogBase & {
  starts: number;
  ends: number;
  count: number;
};

export const ActionLeaderInitLabel = "LeaderInit";
export type ActionLeaderInitLog = ActionLogBase & {
  hackTime: number;
  endTime: number;
};

export const ActionRunSkipLabel = "RunSkip";
export type ActionRunSkipLog = ActionLogBase & {
  startTime: number;
  startDiff: number;
};

export const ActionRunWaitLabel = "RunWait";
export type ActionRunWaitLog = ActionLogBase & {
  startTime: number;
  startDiff: number;
};

export const ActionRunStartLabel = "RunStart";
export type ActionRunStartLog = ActionLogBase & {
  actualDiff: number;
};

export const ActionRunEndLabel = "RunEnd";
export type ActionRunEndLog = ActionLogBase & {
  actualDiff: number;
  endDiff: number;
};

export const ActionBatchEndedLabel = "BatchEnded";
export type ActionBatchEndedLog = {
  target: string;
};

/**
 * Runs on the servers and does the actual action
 * TODO: add simpler version for experience and share power actions
 */
export class ServerActionRunner {
  private readonly responsePort: NetscriptPort;
  private readonly serverActionPorts: ServerActionPorts;
  private readonly isLeader: boolean;

  // for logging
  private logBase: ActionLogBase;

  constructor(
    private readonly ns: NS,
    private readonly logger: Logger,
    private readonly serverAction: ServerActionType,
    private readonly action: (server: string, stock: number) => Promise<number>,
    private readonly reference: ServerActionReferenceData,
    // unique per batch
    private readonly commandPort: number,
    // unique per batch
    syncPort: number,
    // unique per batch
    triggerPort: number,
  ) {
    this.responsePort = ns.getPortHandle(ServerActionResponsePort);
    this.serverActionPorts = new ServerActionPorts(ns, commandPort, syncPort, triggerPort);
    this.isLeader = reference.processIndex === 0;
  }

  public static fromNS(
    ns: NS,
    serverAction: ServerActionType,
    action: (server: string, stock: number) => Promise<number>,
  ) {
    const reference = JSON.parse(ns.args[0] as string);
    return new ServerActionRunner(
      ns,
      Logger.AggregatorLogger(ns, `Action-${ServerActionType[serverAction]}`),
      serverAction,
      action,
      reference,
      Number(ns.args[1] as number),
      Number(ns.args[2] as number),
      Number(ns.args[3] as number),
    );
  }

  public async start() {
    const [server] = this.serverActionPorts.getTargetInfo();
    this.logBase = {
      target: server,
      action: this.serverAction,
      actionIndex: this.reference.actionIndex,
      setIndex: this.reference.setIndex,
      processIndex: this.reference.processIndex,
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // let the other code run. this will trigger hackTime update if possible
      await this.ns.sleep(5);
      if (!(await this.waitForStarts())) break;

      await this.runAction();

      await this.waitForEnds();
    }

    if (this.reference.processIndex === 0) {
      this.logger.log<ActionBatchEndedLog>(ActionBatchEndedLabel, {
        target: this.logBase.target,
      });
    }

    this.ns.atExit(() =>
      this.responsePort.write(JSON.stringify(newExitedPacket(this.commandPort, this.reference))),
    );
  }

  private async runAction() {
    for (let c = 0; c < this.reference.countMulti; c++) {
      const [server, stock, , endTime] = this.serverActionPorts.getTargetInfo();

      if (!(await this.waitToStart(c))) {
        continue;
      }
      const actualDiff = endTime - Date.now();
      this.logger.log<ActionRunStartLog>(ActionRunStartLabel, {
        ...this.logBase,
        actualDiff,
      });
      await this.action(server, stock);
      await asyncWait(1);
      this.logger.log<ActionRunEndLog>(ActionRunEndLabel, {
        ...this.logBase,
        actualDiff,
        endDiff: endTime - Date.now(),
      });
      // used to update hackTime if security decreases or hackTime changes
      await this.responsePort.write(JSON.stringify(newServerActionCompleted(this.commandPort)));
    }
  }

  private async waitToStart(c: number): Promise<boolean> {
    const [, , hackTime, notPrepped] = this.serverActionPorts.getTargetInfo();
    const [, ends, , endTime] = this.serverActionPorts.getActionInfo();
    const skipHack = this.serverAction === ServerActionType.Hack && notPrepped === 1 && c === 0;

    const startTime = this.getStartTime(hackTime, c, endTime);

    const startDiff = startTime - Date.now();
    // if some action ended before this could start, it was skipped. skip this as well
    // if the start is greater than BatchOperationBuffer there could be conflicts in the batch
    if (skipHack || ends > 0 || (startDiff < 0 && -startDiff > BatchOperationBuffer / 4)) {
      this.logger.log<ActionRunSkipLog>(ActionRunSkipLabel, {
        ...this.logBase,
        startTime,
        startDiff,
      });
      return false;
    }

    this.logger.log<ActionRunWaitLog>(ActionRunWaitLabel, {
      ...this.logBase,
      startTime,
      startDiff,
    });
    if (startDiff > BatchOperationBuffer / 4) {
      await this.ns.sleep(startDiff);
      // check again to make sure timing is correct after waiting
      return this.waitToStart(c);
    }
    return true;
  }

  private getStartTime(hackTime: number, c: number, endTime: number) {
    const runTimeOffset =
      hackTime * ServerActionTimeMultipliers[this.serverAction] * (this.reference.countMulti - c);
    const interSetOffset =
      (this.reference.setCount - this.reference.setIndex - 1) *
      this.reference.actionCount *
      BatchOperationBuffer;
    const intraSetOffset =
      (this.reference.actionCount - this.reference.actionIndex - 1) * BatchOperationBuffer;
    return endTime - runTimeOffset - interSetOffset - intraSetOffset;
  }

  private async waitForStarts(): Promise<boolean> {
    let [starts, , count] = this.serverActionPorts.getActionInfo();
    // we need the additional starts check to make sure count wasn't set to 0 while processes were starting.
    if (count === 0 && starts === 0) return false;

    this.updateStarts();
    [starts, , count] = this.serverActionPorts.getActionInfo();
    this.logger.log<ActionWaitForStartLog>(ActionWaitForStartLabel, {
      ...this.logBase,
      starts,
      count,
    });

    const hasStarted = starts === this.reference.processCount;
    if (!hasStarted) {
      await this.serverActionPorts.waitForTrigger();
      return true;
    }

    const [server, stock, hackTime] = this.serverActionPorts.getTargetInfo();
    const totalBatchOffset =
      (this.reference.actionCount + 1) * BatchOperationBuffer +
      (this.reference.setCount + 1) * BatchOperationBuffer;
    const endTime = Date.now() + totalBatchOffset + hackTime * this.reference.longestAction;
    this.serverActionPorts.setTargetInfo(server, stock, hackTime, endTime);
    await this.responsePort.write(
      JSON.stringify(newBatchStartedPacket(this.commandPort, hackTime, endTime)),
    );
    this.logger.log<ActionLeaderInitLog>(ActionLeaderInitLabel, {
      ...this.logBase,
      hackTime,
      endTime,
    });

    [, , count] = this.serverActionPorts.getActionInfo();
    this.serverActionPorts.setActionInfo(0, 0, count, endTime);
    this.serverActionPorts.trigger();
    return true;
  }

  private updateStarts() {
    const [starts, ends, count, endTime] = this.serverActionPorts.getActionInfo();
    this.serverActionPorts.setActionInfo(starts + 1, ends, count, endTime);
  }

  private async waitForEnds() {
    this.updateEnds();
    let [starts, ends, count, endTime] = this.serverActionPorts.getActionInfo();
    this.logger.log<ActionWaitForEndLog>(ActionWaitForEndLabel, {
      ...this.logBase,
      starts,
      ends,
      count,
    });
    const hasEnded = ends === this.reference.processCount;
    if (!hasEnded) {
      return this.serverActionPorts.waitForTrigger();
    }

    // get the latest values
    [starts, ends, count, endTime] = this.serverActionPorts.getActionInfo();
    this.serverActionPorts.setActionInfo(starts, ends, count > 0 ? count - 1 : count, endTime);
    this.serverActionPorts.trigger();
  }

  private updateEnds() {
    const [starts, ends, count, endTime] = this.serverActionPorts.getActionInfo();
    this.serverActionPorts.setActionInfo(starts, ends + 1, count, endTime);
  }
}
