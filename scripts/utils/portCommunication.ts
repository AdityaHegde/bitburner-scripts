import type { NetscriptPort, NS } from "$scripts/types/gameTypes";

export const PortDataWait = 50;
export const PortDataSeparator = "\x01";

export async function writePacketToPort(ns: NS, portHandle: NetscriptPort, packet: Array<any>) {
  while (portHandle.full()) {
    await ns.asleep(PortDataWait);
  }

  portHandle.write(packet.join(PortDataSeparator));
}

export async function readPacketFromPort(
  ns: NS,
  portHandle: NetscriptPort,
  failOnNoData = false,
): Promise<Array<string>> {
  if (portHandle.empty() && failOnNoData) {
    return [];
  }
  while (portHandle.empty()) {
    await ns.asleep(PortDataWait);
  }

  const data = portHandle.read() as string;
  return data.split(PortDataSeparator);
}
