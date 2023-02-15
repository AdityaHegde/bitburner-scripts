import { describe, expect, it } from "vitest";
import { getMockedMetadata, getNSMock } from "../../test/mocks/mockFactory";
import { ServerDataList } from "$src/servers/serverDataList";
import { Logger } from "$src/utils/logger/logger";
import { Purchaser } from "$src/purchaser/Purchaser";
import { PlayerServerPurchaser } from "$src/purchaser/PlayerServerPurchaser";
import { NSMock, PurchaseServerCostPerRam } from "../../test/mocks/NSMock";
import { PlayerServerPrefix } from "$src/constants";
import { CracksPurchaser } from "$src/purchaser/CracksPurchaser";
import { SingularityTORAutomation } from "$src/automation/singularity/SingularityTORAutomation";
import { Cracks, ListOfCracks } from "$src/servers/cracks";
import { FormulaPurchaser } from "$src/purchaser/FormulaPurchaser";

function getTestInstances(nsSetup?: (ns: NSMock) => void) {
  const ns = getNSMock();
  nsSetup?.(ns);
  const logger = Logger.ConsoleLogger(ns, "Test");
  const serverDataList = new ServerDataList(ns, logger, new Cracks(ns), [
    ...getMockedMetadata().newServers,
    ...ns.getPurchasedServers(),
  ]);

  const serverPurchaser = new PlayerServerPurchaser(ns, logger, serverDataList);
  const torAutomation = new SingularityTORAutomation(ns);
  const cracksPurchaser = new CracksPurchaser(ns, logger, serverDataList, torAutomation);
  const purchaser = new Purchaser(ns, logger, [
    serverPurchaser,
    cracksPurchaser,
    new FormulaPurchaser(ns, logger, torAutomation),
  ]);
  purchaser.init();
  return { ns, purchaser, serverPurchaser, cracksPurchaser };
}

// TODO: add crack purchase price to the tests
describe("Purchaser", () => {
  describe("PlayerServerPurchaser", () => {
    it("Start from beginning", async () => {
      const { ns, purchaser, serverPurchaser, cracksPurchaser } = getTestInstances();

      await purchaser.process();
      expect(serverPurchaser.price).toBe(8 * PurchaseServerCostPerRam);
      expect(ns.getPurchasedServers()).toEqual([]);

      // enough money to buy 3
      ns.player.money += 3 * 8 * PurchaseServerCostPerRam;
      await purchaser.process();
      expect(ns.getPurchasedServers()).toEqual(["ps-0", "ps-1", "ps-2"]);
      expect(cracksPurchaser.enabled).toBe(false);

      // enough money to buy 2 and upgrade 2
      ns.player.money += 4 * 8 * PurchaseServerCostPerRam;
      await purchaser.process();
      expect(ns.getPurchasedServers()).toEqual(["ps-0", "ps-1", "ps-2", "ps-3", "ps-4"]);
      expect(cracksPurchaser.enabled).toBe(true);
      expect(ns.hasFiles[ListOfCracks[0]]).toBe(true);
    });

    it("Start from the middle, 2 purchased", async () => {
      const { ns, purchaser, serverPurchaser } = getTestInstances((ns) => {
        ns.player.money += 2 * 8 * PurchaseServerCostPerRam;
        ns.purchaseServer(`${PlayerServerPrefix}0`, 8);
        ns.purchaseServer(`${PlayerServerPrefix}1`, 8);
      });

      await purchaser.process();
      expect(serverPurchaser.price).toBe(8 * PurchaseServerCostPerRam);
      expect(ns.getPurchasedServers()).toEqual(["ps-0", "ps-1"]);

      // enough money to buy 3 and upgrade 2
      ns.player.money += 5 * 8 * PurchaseServerCostPerRam;
      await purchaser.process();
      expect(ns.getPurchasedServers()).toEqual(["ps-0", "ps-1", "ps-2", "ps-3", "ps-4"]);
      expect(ns.hasFiles[ListOfCracks[0]]).toBe(true);
    });

    it("Start from the middle, 5 purchased, 2 upgraded", async () => {
      const { ns, purchaser, serverPurchaser, cracksPurchaser } = getTestInstances((ns) => {
        ns.player.money += 2 * 8 * PurchaseServerCostPerRam;
        for (let i = 0; i < 5; i++) {
          ns.purchaseServer(`${PlayerServerPrefix}${i}`, 8);
        }
        ns.upgradePurchasedServer(`${PlayerServerPrefix}0`, 16);
        ns.upgradePurchasedServer(`${PlayerServerPrefix}1`, 16);
      });
      expect(cracksPurchaser.enabled).toBe(true);

      await purchaser.process();
      expect(serverPurchaser.price).toBe(8 * PurchaseServerCostPerRam);
      expect(ns.getPurchasedServers()).toEqual(["ps-0", "ps-1", "ps-2", "ps-3", "ps-4"]);

      // enough money to upgrade 3 to 16, 2 to 32
      ns.player.money += 7 * 16 * PurchaseServerCostPerRam;
      await purchaser.process();
      expect(serverPurchaser.price).toBe(16 * PurchaseServerCostPerRam);
      expect(ns.hasFiles[ListOfCracks[0]]).toBe(true);
      expect(ns.hasFiles[ListOfCracks[1]]).toBe(true);
    });
  });
});
