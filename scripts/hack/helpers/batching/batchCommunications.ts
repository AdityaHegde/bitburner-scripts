import type { NetscriptPort, NS } from "$scripts/types/gameTypes";
import { readPacketFromPort } from "$scripts/utils/portCommunication";

export type BatchPacket = [server: string, start: number, now?: number];

export async function readBatchPacket(ns: NS, portHandle: NetscriptPort): Promise<BatchPacket> {
  const [server, startStr, nowStr] = await readPacketFromPort(ns, portHandle);
  return [server, Number(startStr), nowStr ? Number(nowStr) : 0];
}
