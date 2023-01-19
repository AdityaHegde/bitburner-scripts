import type { ExitPacket, HackRequestPacket, StopHackPacket } from "$src/ports/portPacket";
import {
  newExitedPacket,
  newHackResponsePacket,
  newHackStoppedPacket,
  newServerStartedPacket,
  PortPacketType,
} from "$src/ports/portPacket";
import { HackResponsePort, PortWrapper } from "$src/ports/portWrapper";
import { HackType } from "$src/servers/hack/hackTypes";
import type { NS } from "$src/types/gameTypes";
import { Logger } from "$src/utils/logger";
import { ShorthandNotationSchema } from "$src/utils/shorthand-notation";

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
  start: boolean;
};

export async function wrapAction(
  ns: NS,
  hackType: HackType,
  callback: (server: string) => Promise<void>,
) {
  const port = Number(ns.args[0]);
  const requestPortWrapper = new PortWrapper(ns, port);
  const responsePortWrapper = new PortWrapper(ns, HackResponsePort);
  // const logger = Logger.FileLogger(ns, `Action-${HackType[hackType]}`, HackFile);
  const logger = Logger.ConsoleLogger(ns, `Action-${HackType[hackType]}`);

  let hackRequest: HackRequestPacket;

  // const log = (start: boolean) => {
  //   logger.log<HackEntryLog>(start ? HackBegMessage : HackEndMessage, {
  //     target: hackRequest.server,
  //     hackType,
  //     port,
  //     count: hackRequest.count,
  //     start,
  //   });
  // };
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

    // logger.start();
    // log(true);
    logger.log("Starting", {
      target: hackRequest.server,
      count: hackRequest.count,
      startDiff: ShorthandNotationSchema.time.convert(Date.now() - hackRequest.start),
    });
    // run the actual hack
    await callback(hackRequest.server);
    // log(false);
    // logger.end();

    hackRequest.count--;
    logger.log("Done", {
      target: hackRequest.server,
      count: hackRequest.count,
      endDiff: ShorthandNotationSchema.time.convert(Date.now() - hackRequest.end),
    });
    // send response that operation completed
    await responsePortWrapper.write(
      newHackResponsePacket(port, hackRequest.server, hackRequest.reference),
    );
    if (hackRequest.count === 0) hackRequest = undefined;
  }

  await responsePortWrapper.write(newExitedPacket(port));
}
