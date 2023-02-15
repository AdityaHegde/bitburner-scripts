import type { NS } from "$src/types/gameTypes";
import { Logger } from "$src/utils/logger/logger";
import { InitialCorporationSetup } from "$src/corporation/InitialCorporationSetup";
import { RoundOneCorporationSetup } from "$src/corporation/RoundOneCorporationSetup";
import { TobaccoDivisionSetup } from "$src/corporation/TobaccoDivisionSetup";
import { CorporationManager } from "$src/corporation/CorporationManager";
import {
  getAgricultureDivision,
  getTobaccoDivision,
  getTobaccoPurchaser,
  TobaccoDivisionName,
} from "$src/corporation/divisionManagerFactories";

export async function main(ns: NS) {
  let hasTobacco = false;
  try {
    ns.corporation.getDivision(TobaccoDivisionName);
    hasTobacco = true;
  } catch (err) {
    // nothing
  }

  const logger = Logger.ConsoleLogger(ns, "Corp");
  if (!hasTobacco) {
    const initCorp = new InitialCorporationSetup(ns, logger);
    initCorp.init();
    await initCorp.process();

    const roundOne = new RoundOneCorporationSetup(ns, logger);
    roundOne.init();
    await roundOne.process();

    const tobaccoSetup = new TobaccoDivisionSetup(ns, logger);
    tobaccoSetup.init();
    await tobaccoSetup.process();
  }

  const corporationManager = new CorporationManager(
    ns,
    logger,
    [getAgricultureDivision(ns, logger), getTobaccoDivision(ns, logger)],
    [getTobaccoPurchaser(ns, logger)],
  );
  corporationManager.init();
  return corporationManager.process();
}
