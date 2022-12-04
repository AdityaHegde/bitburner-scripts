import { NS } from "../../types/gameTypes";
import { Logger } from "../../utils/logger";
import { Heap } from "../../utils/heap";

const logger = new Logger("HackNet");

enum UpgradeTypes {
  Purchase,
  Level,
  Ram,
  Core,
}
const LevelStep = 5;
const RamStep = 1;
const CoreStep = 1;

type UpgradeEntry = {
  type: UpgradeTypes;
  node: number;
  count: number;
  price: number;
};

export async function main(ns: NS) {
  await logger.started(ns);

  const heap = new Heap<UpgradeEntry>(
    (a, b) => b.price - a.price,
    (a) => `${a.type}-${a.node}`
  );
  const hacknet = ns.hacknet;

  function addNode(nodeIdx: number) {
    heap.push({
      type: UpgradeTypes.Level,
      node: nodeIdx,
      count: LevelStep,
      price: hacknet.getLevelUpgradeCost(nodeIdx, LevelStep),
    });
    heap.push({
      type: UpgradeTypes.Ram,
      node: nodeIdx,
      count: RamStep,
      price: hacknet.getRamUpgradeCost(nodeIdx, RamStep),
    });
    heap.push({
      type: UpgradeTypes.Core,
      node: nodeIdx,
      count: CoreStep,
      price: hacknet.getCoreUpgradeCost(nodeIdx, CoreStep),
    });
  }

  // TODO: multipliers

  let nodeCount = hacknet.numNodes();
  const maxNodeCount = hacknet.maxNumNodes();
  // init heap
  if (nodeCount < maxNodeCount) {
    heap.push({
      type: UpgradeTypes.Purchase,
      node: 0,
      count: 1,
      price: hacknet.getPurchaseNodeCost(),
    });
  }
  for (let i = 0; i < nodeCount; i++) {
    addNode(i);
  }

  while (!heap.empty()) {
    await ns.sleep(1000);
    if (ns.getPlayer().money < heap.peek().price) {
      continue;
    }

    const upgrade = heap.pop();
    switch (upgrade.type) {
      case UpgradeTypes.Purchase:
        addNode(hacknet.purchaseNode());
        nodeCount++;
        await logger.log(ns, `Purchased hacknet node: ${nodeCount}`);
        if (nodeCount < maxNodeCount) {
          upgrade.price = hacknet.getPurchaseNodeCost();
          heap.push(upgrade);
        }
        break;

      case UpgradeTypes.Level:
        hacknet.upgradeLevel(upgrade.node, upgrade.count);
        await logger.log(ns, `Upgraded node level: ${upgrade.node}`);
        upgrade.price = hacknet.getLevelUpgradeCost(
          upgrade.node,
          upgrade.count
        );
        heap.push(upgrade);
        break;

      case UpgradeTypes.Ram:
        hacknet.upgradeRam(upgrade.node, upgrade.count);
        await logger.log(ns, `Upgraded node ram: ${upgrade.node}`);
        upgrade.price = hacknet.getRamUpgradeCost(upgrade.node, upgrade.count);
        heap.push(upgrade);
        break;

      case UpgradeTypes.Core:
        hacknet.upgradeCore(upgrade.node, upgrade.count);
        await logger.log(ns, `Upgraded node core: ${upgrade.node}`);
        upgrade.price = hacknet.getCoreUpgradeCost(upgrade.node, upgrade.count);
        heap.push(upgrade);
        break;
    }
  }
}
