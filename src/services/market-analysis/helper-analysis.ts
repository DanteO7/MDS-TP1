import { Portfolio } from "@/models/portfolio";
import { AssetStorage, MarketDataStorage } from "@/utils/facade/storage";

export class HelperAnalysis {
  // Calcular score de diversificación - Algoritmo simplificado
  static calculateDiversificationScore(portfolio: Portfolio): number {
    if (portfolio.holdings.length === 0) return 0;

    // Contar sectores únicos
    const sectors = new Set<string>();
    portfolio.holdings.forEach((holding) => {
      const asset = AssetStorage.getBySymbol(holding.symbol);
      if (asset) {
        sectors.add(asset.sector);
      }
    });

    // Score basado en número de sectores y distribución
    const sectorCount = sectors.size;
    const maxSectors = 5; // Número máximo de sectores considerados
    const sectorScore = Math.min(sectorCount / maxSectors, 1) * 50;

    // Score basado en distribución de pesos
    const totalValue = portfolio.totalValue;
    let concentrationPenalty = 0;

    portfolio.holdings.forEach((holding) => {
      const weight = holding.currentValue / totalValue;
      if (weight > 0.3) {
        // Penalizar concentraciones > 30%
        concentrationPenalty += (weight - 0.3) * 100;
      }
    });

    const distributionScore = Math.max(50 - concentrationPenalty, 0);

    return Math.min(sectorScore + distributionScore, 100);
  }

  // Calcular score de volatilidad - Algoritmo básico
  static calculateVolatilityScore(portfolio: Portfolio): number {
    if (portfolio.holdings.length === 0) return 0;

    let weightedVolatility = 0;
    const totalValue = portfolio.totalValue;

    portfolio.holdings.forEach((holding) => {
      const weight = holding.currentValue / totalValue;
      const assetVolatility = this.getAssetVolatility(holding.symbol);
      weightedVolatility += weight * assetVolatility;
    });

    return Math.min(weightedVolatility, 100);
  }

  // Obtener volatilidad de un activo - Datos simulados
  static getAssetVolatility(symbol: string): number {
    // Simulación básica de volatilidad por sector
    const asset = AssetStorage.getBySymbol(symbol);
    if (!asset) return 50; // Volatilidad por defecto

    const volatilityBySector: { [key: string]: number } = {
      Technology: 65,
      Healthcare: 45,
      Financial: 55,
      Automotive: 70,
      "E-commerce": 60,
    };

    return volatilityBySector[asset.sector] || 50;
  }

  // Generar recomendaciones
  static generateRiskRecommendations(
    diversificationScore: number,
    volatilityScore: number,
    riskLevel: string
  ): string[] {
    const recommendations: string[] = [];

    if (diversificationScore < 40) {
      recommendations.push(
        "Considera diversificar tu portafolio invirtiendo en diferentes sectores"
      );
    }

    if (volatilityScore > 70) {
      recommendations.push(
        "Tu portafolio tiene alta volatilidad, considera añadir activos más estables"
      );
    }

    if (riskLevel === "high") {
      recommendations.push(
        "Nivel de riesgo alto detectado, revisa tu estrategia de inversión"
      );
    }

    if (diversificationScore > 80 && volatilityScore < 30) {
      recommendations.push(
        "Excelente diversificación y bajo riesgo, mantén esta estrategia"
      );
    }

    // Recomendaciones genéricas si no hay específicas
    if (recommendations.length === 0) {
      recommendations.push(
        "Tu portafolio se ve balanceado, continúa monitoreando regularmente"
      );
    }

    return recommendations;
  }

  // Calcular SMA - Simulación básica
  static calculateSimpleMovingAverage(symbol: string, periods: number): number {
    const marketData = MarketDataStorage.getBySymbol(symbol);
    if (!marketData) return 0;

    // Simulación: SMA = precio actual +/- variación aleatoria
    const randomVariation = (Math.random() - 0.5) * 0.1; // +/- 5%
    return marketData.price * (1 + randomVariation);
  }

  // Calcular RSI - Simulación básica
  static calculateRSI(symbol: string): number {
    // Simulación: RSI aleatorio entre 20 y 80
    return 20 + Math.random() * 60;
  }
}
