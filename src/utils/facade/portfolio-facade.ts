import { Portfolio } from "@/models/portfolio";
import { InMemoryStorage } from "./storage";

export class PortafolioFacade {
  constructor(private storage: InMemoryStorage) {}

  getByUserId(userId: string): Portfolio | undefined {
    return this.storage.getPortfolioByUserId(userId);
  }

  update(portfolio: Portfolio): void {
    this.storage.updatePortfolio(portfolio);
  }
}
