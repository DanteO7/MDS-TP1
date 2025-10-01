import { config } from "../../../config/config";
import { AssetStorage, MarketDataStorage } from "../../../utils/facade/storage";
import { IMarketObserver } from "./IMarketObserver";

export class MarketPricesUpdater implements IMarketObserver {
  update(impactFactor = 1): void {
    this.updateMarketPrices(impactFactor);
  }

  // Actualizar precios de mercado
  private updateMarketPrices(impactFactor: number): void {
    const allMarketData = MarketDataStorage.getAll();

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

      MarketDataStorage.update(marketData);

      // Actualizar asset correspondiente
      const asset = AssetStorage.getBySymbol(marketData.symbol);
      if (asset) {
        asset.currentPrice = newPrice;
        asset.lastUpdated = new Date();
        AssetStorage.update(asset);
      }
    });
  }
}
