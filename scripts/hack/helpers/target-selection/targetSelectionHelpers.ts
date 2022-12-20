import { isPlayerServer } from "$scripts/utils/isPlayerServer";
import { HackType } from "$scripts/hack/helpers/hackTypes";
import type { ServerStats } from "../../../metadata/serverStats";

export function cannotHackServer(stats: ServerStats, hackLevel: number) {
  return (
    stats.reqLevel > hackLevel || isPlayerServer(stats.server) || stats.rates[HackType.Hack] === 0
  );
}

export function getPrepType(stats: ServerStats): HackType {
  if (stats.security !== stats.minSecurity) {
    return HackType.Weaken;
  } else if (stats.money < stats.maxMoney) {
    return HackType.Grow;
  }
  return HackType.Hack;
}
