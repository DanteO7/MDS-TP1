import { MarketData } from "../../models/market-data";
import { InMemoryStorage } from "./storage";

export class MarketDataFacade {
  constructor(private storage: InMemoryStorage) {}

  getAll(): MarketData[] {
    return this.storage.getAllMarketData();
  }

  getBySymbol(symbol: string): MarketData | undefined {
    return this.storage.getMarketDataBySymbol(symbol);
  }

  update(data: MarketData): void {
    this.storage.updateMarketData(data);
  }
}
