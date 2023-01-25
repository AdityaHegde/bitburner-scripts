export enum ServerAction {
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

export const ServerActionToScript: {
  [type in ServerAction]: string;
} = {
  [ServerAction.Weaken]: WeakenScript,
  [ServerAction.Grow]: GrowScript,
  [ServerAction.Hack]: HackScript,
  [ServerAction.SharePower]: SharePowerScript,
};

export const ServerActionToMemMap = {
  [ServerAction.Weaken]: 1.75,
  [ServerAction.Grow]: 1.75,
  [ServerAction.Hack]: 1.7,
  [ServerAction.SharePower]: 4,
};

export type ServerActionsData = [number, number, number, number];
