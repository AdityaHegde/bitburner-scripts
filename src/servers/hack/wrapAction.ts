import { BatchOperationBuffer } from "$src/constants";
import { newExitedPacket } from "$src/ports/packets/exitedPacket";
import type { ExitPacket } from "$src/ports/packets/exitPacket";
import type { HackRequestPacket, ReferenceHackData } from "$src/ports/packets/hackRequestPacket";
import { newHackResponsePacket } from "$src/ports/packets/hackResponsePacket";
import { newHackStoppedPacket } from "$src/ports/packets/hackStoppedPacket";
import { PortPacketType } from "$src/ports/packets/portPacket";
import { newServerStartedPacket } from "$src/ports/packets/serverStartedPacket";
import type { StopHackPacket } from "$src/ports/packets/stopHackPacket";
import { HackResponsePort, PortWrapper } from "$src/ports/portWrapper";
import type { HackType } from "$src/servers/hack/hackTypes";
import type { NS } from "$src/types/gameTypes";
import { Logger } from "$src/utils/logger/logger";

export type HackPackets = HackRequestPacket | StopHackPacket | ExitPacket;

export const HackBegMessage = "HackBeg";
export const HackEndMessage = "HackEnd";
export type HackEntryLog = {
  // filled in server
  time?: number;
  server?: string;
  target: string;
  hackType: HackType;
  port: number;
  count: number;
  start: number;
  end: number;
  period: number;
  reference: ReferenceHackData;
};

export async function wrapAction(
  ns: NS,
  hackType: HackType,
  callback: (server: string) => Promise<void>,
) {
  const port = Number(ns.args[0]);
  const requestPortWrapper = new PortWrapper(ns, port);
  const responsePortWrapper = new PortWrapper(ns, HackResponsePort);
  const logger = Logger.ConsoleLogger(ns, "Action");

  let hackRequest: HackRequestPacket;

  const log = (start: number, end: number) => {
    logger.log<HackEntryLog>(start ? HackBegMessage : HackEndMessage, {
      target: hackRequest.server,
      hackType,
      port,
      count: hackRequest.count,
      start,
      end,
      period: hackRequest.period,
      reference: hackRequest.reference,
    });
  };
  await responsePortWrapper.write(newServerStartedPacket(port));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // block only if there is no hack request
    const packet = await requestPortWrapper.read<HackPackets>(!!hackRequest);
    // end if explicitly got a request to end
    if (packet?.type === PortPacketType.Exit) break;
    if (packet?.type === PortPacketType.StopHack) {
      // stop hack and wait for next request
      hackRequest = undefined;
      await responsePortWrapper.write(newHackStoppedPacket(port));
      continue;
    } else if (packet?.type === PortPacketType.HackRequest) {
      // if there is a new packet, retarget it
      hackRequest = packet;
      await ns.sleep(hackRequest.start - Date.now());
    }

    const start = Date.now();
    const startDiff = start - hackRequest.start;
    // run only if count was greater than 0 and start diff is less than the buffer
    if (hackRequest.count > 0 && startDiff < BatchOperationBuffer) {
      // run the actual hack
      await callback(hackRequest.server);
    }
    hackRequest.count--;
    log(start, Date.now());

    // send response that operation completed
    await responsePortWrapper.write(
      newHackResponsePacket(port, hackRequest.server, hackRequest.reference),
    );
    if (hackRequest.count === 0) hackRequest = undefined;
  }

  await responsePortWrapper.write(newExitedPacket(port));
}
