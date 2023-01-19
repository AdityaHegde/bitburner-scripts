import type { HackType } from "$src/servers/hack/hackTypes";

export enum HackAssignmentState {
  New,
  Initiated,
  Started,
  Returned,
  Terminating,
  Terminated,
}

export type HackAssignment = {
  server: string;
  target: string;
  type: HackType;
  threads: number;
  count: number;
  state: HackAssignmentState;
};

export function newHackAssignment(
  server: string,
  target: string,
  type: HackType,
  threads: number,
  count: number,
): HackAssignment {
  return {
    server,
    target,
    type,
    threads,
    count,
    state: HackAssignmentState.New,
  };
}
