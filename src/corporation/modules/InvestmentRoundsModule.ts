import { DivisionManagerModule } from "$src/corporation/modules/DivisionManagerModule";

export const RoundOneInvestment = 200e9;
export const RoundThreeInvestment = 800e12;
export const RoundFourInvestment = 500e15;

export class InvestmentRoundsModule extends DivisionManagerModule {
  public init() {
    const investment = this.ns.corporation.getInvestmentOffer();
    this.logger.log("InvestmentRound", investment);
  }

  public async process() {
    const corp = this.ns.corporation.getCorporation();
    const investment = this.ns.corporation.getInvestmentOffer();
    switch (investment.round) {
      case 3:
        if (investment.funds < RoundThreeInvestment) return;
        this.ns.corporation.acceptInvestmentOffer();
        this.logger.info("AcceptedInvestment", investment);
        break;

      case 4:
        if (investment.funds < RoundFourInvestment) return;
        this.ns.corporation.acceptInvestmentOffer();
        this.logger.info("AcceptedInvestment", investment);
        break;

      case 5:
        if (corp.public) return;
        this.ns.corporation.goPublic(0);
        this.ns.corporation.issueDividends(0.05);
        this.logger.info("WentPublic", investment);
        break;
    }
  }
}
