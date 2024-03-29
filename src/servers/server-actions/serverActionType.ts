import { GrowTimeMulti, WeakenTimeMulti } from "$src/constants";

export enum ServerActionType {
  Weaken,
  Grow,
  Hack,
  SharePower,
  Experience,
}

export const WeakenScript = "/server-action/weaken.js";
export const GrowScript = "/server-action/grow.js";
export const HackScript = "/server-action/hack.js";
export const SharePowerScript = "/server-action/sharePower.js";
export const ExperienceScript = "/server-action/experience.js";
export const ServerActionScripts = [
  WeakenScript,
  GrowScript,
  HackScript,
  SharePowerScript,
  ExperienceScript,
];

export const ServerActionTypeToScript: {
  [type in ServerActionType]: string;
} = {
  [ServerActionType.Weaken]: WeakenScript,
  [ServerActionType.Grow]: GrowScript,
  [ServerActionType.Hack]: HackScript,
  [ServerActionType.SharePower]: SharePowerScript,
  [ServerActionType.Experience]: ExperienceScript,
};

export const ServerActionTypeToMemMap = {
  [ServerActionType.Weaken]: 1.75,
  [ServerActionType.Grow]: 1.75,
  [ServerActionType.Hack]: 1.7,
  [ServerActionType.SharePower]: 4,
  [ServerActionType.Experience]: 1.75,
};

export const ServerActionTimeMultipliers = {
  [ServerActionType.Weaken]: WeakenTimeMulti,
  [ServerActionType.Grow]: GrowTimeMulti,
  [ServerActionType.Hack]: 1,
  [ServerActionType.SharePower]: 1,
  [ServerActionType.Experience]: 1,
};

export type ServerActionsData = [number, number, number, number, number];
