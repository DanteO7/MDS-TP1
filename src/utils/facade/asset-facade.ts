import { Asset } from "../../models/asset";
import { InMemoryStorage } from "./storage";

export class AssetFacade {
  constructor(private storage: InMemoryStorage) {}

  getAll(): Asset[] {
    return this.storage.getAllAssets();
  }

  getBySymbol(symbol: string): Asset | undefined {
    return this.storage.getAssetBySymbol(symbol);
  }

  update(asset: Asset): void {
    this.storage.updateAsset(asset);
  }
}
