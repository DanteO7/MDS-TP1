import { config } from "../../../config/config";
import { storage } from "../../../utils/storage";

export interface IMarketObserver {
  update(impactFactor?: number): void;
}

export class MarketPricesUpdater implements IMarketObserver {
  update(impactFactor = 1): void {
    this.updateMarketPrices(impactFactor);
  }

  // Actualizar precios de mercado
  private updateMarketPrices(impactFactor: number): void {
    const allMarketData = storage.getAllMarketData();

    allMarketData.forEach((marketData) => {
      // Generar cambio aleatorio de precio
      const randomChange = (Math.random() - 0.5) * 2; // -1 a +1
      const volatilityFactor = config.market.volatilityFactor;
      const priceChange = marketData.price * randomChange * volatilityFactor;

      const priceChangeWithFactor = priceChange * impactFactor; // Multiplicar por el factor impacto, si no hay multiplica por 1

      const newPrice = Math.max(marketData.price + priceChangeWithFactor, 0.01); // Evitar precios negativos
      const change = newPrice - marketData.price;
      const changePercent = (change / marketData.price) * 100;

      // Actualizar datos de mercado
      marketData.price = newPrice;
      marketData.change = change;
      marketData.changePercent = changePercent;
      marketData.volume += Math.floor(Math.random() * 10000); // Simular volumen
      marketData.timestamp = new Date();

      storage.updateMarketData(marketData);

      // Actualizar asset correspondiente
      const asset = storage.getAssetBySymbol(marketData.symbol);
      if (asset) {
        asset.currentPrice = newPrice;
        asset.lastUpdated = new Date();
        storage.updateAsset(asset);
      }
    });
  }
}

export class PortfoliosUpdater implements IMarketObserver {
  update(): void {
    this.updateAllPortfolioValues();
  }

  // Actualizar todos los portafolios
  private updateAllPortfolioValues(): void {
    // Obtener todos los usuarios y actualizar sus portafolios
    const allUsers = [
      storage.getUserById("demo_user"),
      storage.getUserById("admin_user"),
      storage.getUserById("trader_user"),
    ].filter((user) => user !== undefined);

    allUsers.forEach((user) => {
      if (user) {
        const portfolio = storage.getPortfolioByUserId(user.id);
        if (portfolio && portfolio.holdings.length > 0) {
          this.recalculatePortfolioValues(portfolio);
          storage.updatePortfolio(portfolio);
        }
      }
    });
  }

  // Recalcular valores del portafolio
  private recalculatePortfolioValues(portfolio: any): void {
    let totalValue = 0;
    let totalInvested = 0;

    portfolio.holdings.forEach((holding: any) => {
      const asset = storage.getAssetBySymbol(holding.symbol);
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
