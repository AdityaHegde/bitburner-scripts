export enum HackState {
  Grow = 0,
  Weaken = 0,
  Hack = 0,
}

export const GrowScript = "grow.js";
export const WeakenScript = "weaken.js";
export const HackScript = "hack.js";
export const HackScripts = [GrowScript, WeakenScript, HackScript];

export const HackStateToScript: {
  [state in HackState]: string
} = {
  [HackState.Grow]: GrowScript,
  [HackState.Weaken]: WeakenScript,
  [HackState.Hack]: HackScript,
};
