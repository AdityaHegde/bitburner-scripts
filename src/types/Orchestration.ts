import { Metadata } from "./Metadata";

export enum OrchestrationActions {
  NewNPCServer = 1,
  NewPurchasedServer = 2,
  NewTargetAquired = 4,
}
export const OrchestrationThrottleCount = 5;

export function setOrchestrationActions(
  metadata: Metadata, action: OrchestrationActions,
): void {
  metadata.orchestrationActions |= action;
}

export function hasOrchestrationActions(
  metadata: Metadata, action: OrchestrationActions,
): boolean {
  return (metadata.orchestrationActions & action) === action;
}

export function unsetOrchestrationActions(
  metadata: Metadata, action: OrchestrationActions,
): void {
  metadata.orchestrationActions &= ~action;
}
