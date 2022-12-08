export enum HackType {
  Grow,
  Weaken,
  Hack,
}

export const GrowScript = "grow.js";
export const WeakenScript = "weaken.js";
export const HackScript = "hack.js";
export const HackScripts = [GrowScript, WeakenScript, HackScript];

export const HackTypeToScript: {
  [type in HackType]: string;
} = {
  [HackType.Grow]: GrowScript,
  [HackType.Weaken]: WeakenScript,
  [HackType.Hack]: HackScript,
};

export const ScriptToMemMap = {
  [GrowScript]: 1.75,
  [WeakenScript]: 1.75,
  [HackScript]: 1.7,
};
