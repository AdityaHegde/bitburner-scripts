import { DivisionManagerModule } from "$src/corporation/modules/DivisionManagerModule";
import { ProductManager } from "$src/corporation/ProductManager";
import { ProductionCity } from "$src/enums";
import { findInArray } from "$src/utils/arrayUtils";
import { ProductInvestment } from "$src/corporation/DivisionCityManager";
import {
  ProductCapacityResearch1,
  ProductCapacityResearch2,
} from "$src/corporation/modules/ResearchUpgradeBuyerModule";

export class ProductCreationModule extends DivisionManagerModule {
  private readonly productManagers = new Array<ProductManager>();
  private productId = 0;
  private lastProductionResearch = 0;

  private productLimit = 3;

  public init(): void {
    const division = this.ns.corporation.getDivision(this.divisionName);
    for (const productName of division.products) {
      const productManager = new ProductManager(
        this.ns,
        this.logger,
        this.divisionName,
        ProductionCity,
        productName,
      );
      if (productManager.hasCompleted()) {
        this.productManagers.unshift(productManager);
      } else {
        this.productManagers.push(productManager);
      }
      const id = parseInt(productName.replace(`${this.divisionName}-`, ""));
      if (id > this.productId) {
        this.productId = id;
      }
    }
    this.logger.info("DivisionProducts", {
      divisionName: this.divisionName,
      products: this.productManagers.map((product) => product.productName),
    });

    this.productLimit =
      3 +
      (this.ns.corporation.hasResearched(this.divisionName, ProductCapacityResearch1) ? 1 : 0) +
      (this.ns.corporation.hasResearched(this.divisionName, ProductCapacityResearch2) ? 1 : 0);

    for (const productManager of this.productManagers) {
      productManager.init();
    }
  }

  public process(): void {
    for (const productManager of this.productManagers) {
      productManager.process();
    }

    const lastProduct = this.productManagers[this.productManagers.length - 1];
    // TODO: do not produce new one if we see that it will have lower quality
    if (this.productManagers.length < this.productLimit || lastProduct?.hasCompleted()) {
      this.makeProduct();
    }
  }

  public researched(name: string) {
    let changed = false;
    if (name === ProductCapacityResearch1) {
      this.productLimit++;
      changed = true;
    } else if (name === ProductCapacityResearch2) {
      this.productLimit++;
      changed = true;
    }

    if (changed) {
      this.ns.corporation.upgradeWarehouse(this.divisionName, ProductionCity);
    }
  }

  private makeProduct() {
    if (this.productManagers.length === this.productLimit) {
      const [idx, cheapestProduct] = findInArray(
        this.productManagers,
        (a, b) => a.product.rat < b.product.rat,
      );
      this.ns.corporation.discontinueProduct(this.divisionName, cheapestProduct.productName);
      this.productManagers.splice(idx, 1);
      this.logger.log("DiscontinuingOldProduct", {
        previousProductName: cheapestProduct.productName,
        previousProductQuality: cheapestProduct.product.properties.qlt,
      });
    }

    this.productId++;
    const newProductName = `${this.divisionName}-${this.productId}`;
    this.ns.corporation.makeProduct(
      this.divisionName,
      ProductionCity,
      newProductName,
      ProductInvestment,
      ProductInvestment,
    );

    this.logger.log("MakingNewProduct", {
      newProductName,
    });
    this.lastProductionResearch = this.ns.corporation.getDivision(this.divisionName).research;
    this.productManagers.push(
      new ProductManager(this.ns, this.logger, this.divisionName, ProductionCity, newProductName),
    );
  }
}
