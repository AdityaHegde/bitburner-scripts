import type { NS, ProcessInfo } from "../../types/gameTypes";
import { HackScriptToType, HackTypeToScript } from "./hackTypes";
import { RepeatActionMode } from "$scripts/hack/helpers/wrapAction";
import type { ServerState } from "$scripts/metadata/serverStats";
import type { Metadata } from "$scripts/metadata/metadata";
import { BatchActionMode } from "$scripts/hack/helpers/batching/batchScriptAction";
import {
  BatchHackTypeMap,
  BatchHackTypeReverseMap,
  BatchHackTypeToPort,
  writeRemoteBatchMetadata,
} from "$scripts/hack/helpers/batching/batchMetadata";
import { BatchCoordinatorScript } from "$scripts/constants";
import type { Logger } from "$scripts/utils/logger";
import { newServerState } from "$scripts/metadata/serverStats";

export function getResourceState(ns: NS, metadata: Metadata): Record<string, ServerState> {
  const resourceState: Record<string, ServerState> = {};

  for (const targetAssignment of metadata.hackTargetMetadata.targetAssignments) {
    for (const assignedServer in targetAssignment.assignments) {
      resourceState[assignedServer] ??= newServerState();
      resourceState[assignedServer].batchTarget = targetAssignment.assignments[assignedServer];
    }

    for (const assignedServer in targetAssignment.prepAssignments) {
      resourceState[assignedServer] ??= newServerState();
      resourceState[assignedServer].prepTarget[targetAssignment.server] ??= {};
      resourceState[assignedServer].prepTarget[targetAssignment.server][
        targetAssignment.prepAssignments[assignedServer].type
      ] = targetAssignment.prepAssignments[assignedServer].threads;
    }
  }

  return resourceState;
}

export function reconcileHackScripts(
  ns: NS,
  logger: Logger,
  metadata: Metadata,
  server: string,
  state: ServerState,
) {
  logger.log("Running Script", {
    server,
    state,
  });

  let hasBatchCoordinator = false;

  for (const processInfo of ns.ps(server)) {
    if (processInfo.filename === BatchCoordinatorScript) {
      hasBatchCoordinator = true;
      return;
    }
    if (!(processInfo.filename in HackScriptToType)) return;

    switch (processInfo.args[0]) {
      case RepeatActionMode:
        handleExistingPrepScript(ns, logger, state, processInfo);
        break;

      case BatchActionMode:
        handleExistingBatchScript(ns, logger, state, processInfo);
        break;
    }
  }

  handleMissingPrepScripts(ns, logger, server, state);

  if (state.batchTarget) {
    handleMissingBatchScripts(ns, logger, metadata, server, state, hasBatchCoordinator);
  }
}

function handleExistingPrepScript(
  ns: NS,
  logger: Logger,
  state: ServerState,
  processInfo: ProcessInfo,
) {
  const type = HackScriptToType[processInfo.filename];
  const serverArg = processInfo.args[1] as string;
  if (
    serverArg in state.prepTarget &&
    type in state.prepTarget[serverArg] &&
    state.prepTarget[serverArg][type] === processInfo.threads
  ) {
    delete state.prepTarget[serverArg][type];
  } else {
    ns.kill(processInfo.pid);
  }
}

function handleExistingBatchScript(
  ns: NS,
  logger: Logger,
  state: ServerState,
  processInfo: ProcessInfo,
) {
  if (!state.batchTarget) return;
  const type = HackScriptToType[processInfo.filename];
  // TODO: support multiple weaken
  const idx = state.batchTarget.operations.indexOf(BatchHackTypeReverseMap[type]);
  if (idx >= 0) {
    state.batchTarget.threads[idx] = -1;
  }
}

function handleMissingPrepScripts(ns: NS, logger: Logger, server: string, state: ServerState) {
  for (const targetServer in state.prepTarget) {
    for (const type in state.prepTarget[targetServer]) {
      ns.exec(
        HackTypeToScript[type],
        server,
        state.prepTarget[targetServer][type],
        RepeatActionMode,
        targetServer,
      );
    }
  }
}

function handleMissingBatchScripts(
  ns: NS,
  logger: Logger,
  metadata: Metadata,
  server: string,
  state: ServerState,
  hasBatchCoordinator: boolean,
) {
  writeRemoteBatchMetadata(ns, server, {
    target: {
      server: state.batchTarget.server,
      timings: metadata.serverStats[state.batchTarget.server].times,
      operations: state.batchTarget.operations,
    },
  });

  state.batchTarget.threads.forEach((threads, index) => {
    if (threads === -1) return;
    const operation = state.batchTarget.operations[index];
    ns.exec(
      HackTypeToScript[BatchHackTypeMap[operation]],
      server,
      threads,
      BatchActionMode,
      BatchHackTypeToPort[operation].read,
      BatchHackTypeToPort[operation].write,
    );
  });

  if (!hasBatchCoordinator) {
    ns.exec(BatchCoordinatorScript, server);
  }
}
