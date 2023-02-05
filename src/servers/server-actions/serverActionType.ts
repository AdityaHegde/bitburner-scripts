import { GrowTimeMulti, WeakenTimeMulti } from "$src/constants";

export enum ServerActionType {
  Weaken,
  Grow,
  Hack,
  SharePower,
}

export const WeakenScript = "weaken.js";
export const GrowScript = "grow.js";
export const HackScript = "hack.js";
export const SharePowerScript = "sharePower.js";
export const ServerActionScripts = [WeakenScript, GrowScript, HackScript, SharePowerScript];

export const ServerActionTypeToScript: {
  [type in ServerActionType]: string;
} = {
  [ServerActionType.Weaken]: WeakenScript,
  [ServerActionType.Grow]: GrowScript,
  [ServerActionType.Hack]: HackScript,
  [ServerActionType.SharePower]: SharePowerScript,
};

export const ServerActionTypeToMemMap = {
  [ServerActionType.Weaken]: 1.75,
  [ServerActionType.Grow]: 1.75,
  [ServerActionType.Hack]: 1.7,
  [ServerActionType.SharePower]: 4,
};

export const ServerActionTimeMultipliers = {
  [ServerActionType.Weaken]: WeakenTimeMulti,
  [ServerActionType.Grow]: GrowTimeMulti,
  [ServerActionType.Hack]: 1,
  // TODO: handle differently
  [ServerActionType.SharePower]: 1,
};

export type ServerActionsData = [number, number, number, number];
