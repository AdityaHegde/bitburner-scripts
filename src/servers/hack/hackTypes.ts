export enum HackType {
  Weaken,
  Grow,
  Hack,
  SharePower,
}

export const WeakenScript = "weaken.js";
export const GrowScript = "grow.js";
export const HackScript = "hack.js";
export const SharePowerScript = "sharePower.js";
export const HackScripts = [WeakenScript, GrowScript, HackScript, SharePowerScript];

export const HackTypeToScript: {
  [type in HackType]: string;
} = {
  [HackType.Weaken]: WeakenScript,
  [HackType.Grow]: GrowScript,
  [HackType.Hack]: HackScript,
  [HackType.SharePower]: SharePowerScript,
};

export const HackTypeToMemMap = {
  [HackType.Weaken]: 1.75,
  [HackType.Grow]: 1.75,
  [HackType.Hack]: 1.7,
  [HackType.SharePower]: 4,
};

export type HackTypesData = [number, number, number, number];
