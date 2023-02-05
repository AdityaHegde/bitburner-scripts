export enum PortPacketType {
  BatchStarted,
  ServerActionCompleted,
  Exited,
  ScriptStopped,
}

export type PortPacket<Type extends PortPacketType, Rec> = {
  type: Type;
} & Rec;

export type AnyPortPacket = PortPacket<PortPacketType, object>;
