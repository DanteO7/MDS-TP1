import {
  AssetStorage,
  PortafolioStorage,
  UserStorage,
} from "../../../utils/facade/storage";
import { IMarketObserver } from "./IMarketObserver";

export class PortfoliosUpdater implements IMarketObserver {
  update(): void {
    this.updateAllPortfolioValues();
  }

  // Actualizar todos los portafolios
  private updateAllPortfolioValues(): void {
    // Obtener todos los usuarios y actualizar sus portafolios
    const allUsers = [
      UserStorage.getById("demo_user"),
      UserStorage.getById("admin_user"),
      UserStorage.getById("trader_user"),
    ].filter((user) => user !== undefined);

    allUsers.forEach((user) => {
      if (user) {
        const portfolio = PortafolioStorage.getByUserId(user.id);
        if (portfolio && portfolio.holdings.length > 0) {
          this.recalculatePortfolioValues(portfolio);
          PortafolioStorage.update(portfolio);
        }
      }
    });
  }

  // Recalcular valores del portafolio
  private recalculatePortfolioValues(portfolio: any): void {
    let totalValue = 0;
    let totalInvested = 0;

    portfolio.holdings.forEach((holding: any) => {
      const asset = AssetStorage.getBySymbol(holding.symbol);
      if (asset) {
        holding.currentValue = holding.quantity * asset.currentPrice;
        const invested = holding.quantity * holding.averagePrice;
        holding.totalReturn = holding.currentValue - invested;
        holding.percentageReturn =
          invested > 0 ? (holding.totalReturn / invested) * 100 : 0;

        totalValue += holding.currentValue;
        totalInvested += invested;
      }
    });

    portfolio.totalValue = totalValue;
    portfolio.totalInvested = totalInvested;
    portfolio.totalReturn = totalValue - totalInvested;
    portfolio.percentageReturn =
      totalInvested > 0 ? (portfolio.totalReturn / totalInvested) * 100 : 0;
    portfolio.lastUpdated = new Date();
  }
}
