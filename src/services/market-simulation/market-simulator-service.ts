// Servicio de simulación de mercado
import { config } from "@/config/config";
import { MarketEventType } from "@/enums/market-event-type";
import { IMarketObserver } from "./observer/market-observer";
import { MarketPricesUpdater } from "./observer/market-prices-updater";
import { PortfoliosUpdater } from "./observer/portfolios-updater";

export class MarketSimulationService {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private observers: IMarketObserver[] = [
    new MarketPricesUpdater(),
    new PortfoliosUpdater(),
  ];

  private updateMarketSimulation(impactFactor?: number): void {
    for (const s of this.observers) {
      s.update(impactFactor);
    }
  }

  // Iniciar simulación de mercado
  startMarketSimulation(): void {
    if (this.isRunning) {
      console.log("La simulación de mercado ya está ejecutándose");
      return;
    }

    this.isRunning = true;
    console.log("Iniciando simulación de mercado...");

    this.intervalId = setInterval(() => {
      this.updateMarketSimulation();
    }, config.market.updateIntervalMs);
  }

  // Detener simulación de mercado
  stopMarketSimulation(): void {
    if (!this.isRunning) {
      console.log("La simulación de mercado no está ejecutándose");
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log("Simulación de mercado detenida");
  }

  // Obtener estado de simulación
  getSimulationStatus(): { isRunning: boolean; lastUpdate: Date | null } {
    return {
      isRunning: this.isRunning,
      lastUpdate: this.isRunning ? new Date() : null,
    };
  }

  // Simular evento de mercado específico
  simulateMarketEvent(eventType: MarketEventType): void {
    console.log(`Simulando evento de mercado: ${eventType}`);

    let impactFactor: number = 0;

    switch (eventType) {
      case MarketEventType.BULL:
        impactFactor = 0.05 + Math.random() * 0.1; // +5% a +15%
        break;
      case MarketEventType.BEAR:
        impactFactor = -(0.05 + Math.random() * 0.1); // -5% a -15%
        break;
      case MarketEventType.CRASH:
        impactFactor = -(0.15 + Math.random() * 0.2); // -15% a -35%
        break;
      case MarketEventType.RECOVERY:
        impactFactor = 0.1 + Math.random() * 0.15; // +10% a +25%
        break;
    }

    // Actualizar observers
    this.updateMarketSimulation(impactFactor);
  }
}
