import { DivisionManager } from "$src/corporation/DivisionManager";
import { IndustryType } from "$src/enums";
import { ProductCreationModule } from "$src/corporation/modules/ProductCreationModule";
import type { NS } from "$src/types/gameTypes";
import type { Logger } from "$src/utils/logger/logger";
import { ResearchUpgradeBuyerModule } from "$src/corporation/modules/ResearchUpgradeBuyerModule";
import { Purchaser } from "$src/purchaser/Purchaser";
import { CorporationFundsResource } from "$src/corporation/purchaser/CorporationFundsResource";
import { OfficeUpgrader } from "$src/corporation/purchaser/OfficeUpgrader";
import { CorporationAdVertPurchaser } from "$src/corporation/purchaser/CorporationAdVertPurchaser";
import { CorporationUpgradePurchaser } from "$src/corporation/purchaser/CorporationUpgradePurchaser";
import { InvestmentRoundsModule } from "$src/corporation/modules/InvestmentRoundsModule";
import { CorporationUnlockPurchaser } from "$src/corporation/purchaser/CorporationUnlockPurchaser";
import {
  MaxOfficeSizeMulti,
  NonWilsonAnalyticsMaxLevel,
  OfficeUpgradeSizeInterval,
} from "$src/corporation/purchaser/corpPurchaserSync";
import { WilsonAnalytics } from "$src/corporation/corpUtils";

export const AgricultureDivisionName = "AGRI";

export function getAgricultureDivision(ns: NS, logger: Logger): DivisionManager {
  return new DivisionManager(
    ns,
    logger,
    AgricultureDivisionName,
    IndustryType.Agriculture,
    [
      [1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 0, 0],
    ],
    [],
  );
}

export const TobaccoDivisionName = "TBC";

export function getTobaccoDivision(ns: NS, logger: Logger): DivisionManager {
  return new DivisionManager(
    ns,
    logger,
    TobaccoDivisionName,
    IndustryType.Tobacco,
    [
      [2, 2, 1, 2, 0, 0],
      [-1, -1, -1, -1, 1, 0],
    ],
    [
      new ProductCreationModule(ns, logger, TobaccoDivisionName),
      new ResearchUpgradeBuyerModule(ns, logger, TobaccoDivisionName),
      new InvestmentRoundsModule(ns, logger, TobaccoDivisionName),
    ],
  );
}

export function getTobaccoPurchaser(ns: NS, logger: Logger): Purchaser {
  return new Purchaser(
    ns,
    logger,
    [
      new CorporationAdVertPurchaser(ns, logger, TobaccoDivisionName, -1),
      ...ns.corporation
        .getConstants()
        .upgradeNames.map(
          (upgradeName) =>
            new CorporationUpgradePurchaser(
              ns,
              logger,
              upgradeName,
              upgradeName === WilsonAnalytics ? -1 : NonWilsonAnalyticsMaxLevel,
            ),
        ),
      ...["Shady Accounting", "Government Partnership"].map(
        (unlock) => new CorporationUnlockPurchaser(ns, logger, unlock),
      ),
      new OfficeUpgrader(
        ns,
        logger,
        TobaccoDivisionName,
        15,
        MaxOfficeSizeMulti * OfficeUpgradeSizeInterval,
      ),
    ],
    new CorporationFundsResource(ns, 1.5),
  );
}
