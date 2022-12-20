import type { NS } from "../../types/gameTypes";
import { Logger } from "../../utils/logger";
import { Heap } from "../../utils/heap";

enum UpgradeTypes {
  Purchase,
  Level,
  Ram,
  Core,
}

const LevelStep = 20;
const RamStep = 5;
const CoreStep = 1;

type UpgradeEntry = {
  type: UpgradeTypes;
  node: number;
  count: number;
  price: number;
};

export async function main(ns: NS) {
  const logger = new Logger(ns, "HackNet");

  const heap = new Heap<UpgradeEntry>(
    (a, b) => b.price - a.price,
    (a) => `${a.type}-${a.node}`,
  );
  const hacknet = ns.hacknet;

  function addNode(nodeIdx: number) {
    const nodeStats = hacknet.getNodeStats(nodeIdx);
    heap.push({
      type: UpgradeTypes.Level,
      node: nodeIdx,
      count: LevelStep - (nodeStats.level % LevelStep),
      price: hacknet.getLevelUpgradeCost(nodeIdx, LevelStep - (nodeStats.level % LevelStep)),
    });
    heap.push({
      type: UpgradeTypes.Ram,
      node: nodeIdx,
      count: RamStep - (nodeStats.ram % RamStep),
      price: hacknet.getRamUpgradeCost(nodeIdx, RamStep - (nodeStats.ram % RamStep)),
    });
    heap.push({
      type: UpgradeTypes.Core,
      node: nodeIdx,
      count: CoreStep - (nodeStats.cores % RamStep),
      price: hacknet.getCoreUpgradeCost(nodeIdx, CoreStep - (nodeStats.cores % RamStep)),
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
    if (ns.getPlayer().money < heap.peek().price) {
      await ns.sleep(1000);
      continue;
    }

    const upgrade = heap.pop();
    switch (upgrade.type) {
      case UpgradeTypes.Purchase:
        addNode(hacknet.purchaseNode());
        nodeCount++;
        logger.log("Purchased", {
          node: nodeCount,
        });
        if (nodeCount < maxNodeCount) {
          upgrade.price = hacknet.getPurchaseNodeCost();
          heap.push(upgrade);
        }
        break;

      case UpgradeTypes.Level:
        hacknet.upgradeLevel(upgrade.node, upgrade.count);
        logger.log("UpgradedLevel", {
          node: upgrade.node,
          level: hacknet.getNodeStats(upgrade.node).level,
        });
        if (upgrade.count != LevelStep) {
          upgrade.count = LevelStep;
        }
        upgrade.price = hacknet.getLevelUpgradeCost(upgrade.node, upgrade.count);
        heap.push(upgrade);
        break;

      case UpgradeTypes.Ram:
        hacknet.upgradeRam(upgrade.node, upgrade.count);
        logger.log("UpgradedRam", {
          node: upgrade.node,
          ram: hacknet.getNodeStats(upgrade.node).ram,
        });
        if (upgrade.count != RamStep) {
          upgrade.count = RamStep;
        }
        upgrade.price = hacknet.getRamUpgradeCost(upgrade.node, upgrade.count);
        heap.push(upgrade);
        break;

      case UpgradeTypes.Core:
        hacknet.upgradeCore(upgrade.node, upgrade.count);
        logger.log("UpgradedCore", {
          node: upgrade.node,
          cores: hacknet.getNodeStats(upgrade.node).cores,
        });
        if (upgrade.count != CoreStep) {
          upgrade.count = CoreStep;
        }
        upgrade.price = hacknet.getCoreUpgradeCost(upgrade.node, upgrade.count);
        heap.push(upgrade);
        break;
    }

    await ns.sleep(1000);
  }
}
