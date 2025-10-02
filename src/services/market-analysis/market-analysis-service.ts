// Servicio de análisis de mercado
import { Risks } from "@/enums/risks";
import { HelperAnalysis } from "./helper-analysis";
import { RiskAnalysis } from "@/models/risk-analysis";
import { TransactionType } from "@/enums/transaction-type";
import {
  AssetStorage,
  MarketDataStorage,
  PortafolioStorage,
  UserStorage,
} from "@/utils/facade/storage";

export class MarketAnalysisService {
  // Análisis de riesgo del portafolio
  analyzePortfolioRisk(userId: string): RiskAnalysis {
    const portfolio = PortafolioStorage.getByUserId(userId);
    if (!portfolio) {
      throw new Error("Portafolio no encontrado");
    }

    // Cálculo básico de diversificación
    const diversificationScore =
      HelperAnalysis.calculateDiversificationScore(portfolio);

    // Cálculo básico de volatilidad
    const volatilityScore = HelperAnalysis.calculateVolatilityScore(portfolio);

    // Determinar nivel de riesgo general
    let portfolioRisk: Risks;
    if (volatilityScore < 30 && diversificationScore > 70) {
      portfolioRisk = Risks.LOW;
    } else if (volatilityScore < 60 && diversificationScore > 40) {
      portfolioRisk = Risks.MEDIUM;
    } else {
      portfolioRisk = Risks.HIGH;
    }

    // Generar recomendaciones básicas
    const recommendations = HelperAnalysis.generateRiskRecommendations(
      diversificationScore,
      volatilityScore,
      portfolioRisk
    );

    const riskAnalysis = new RiskAnalysis(userId);
    riskAnalysis.updateRisk(
      portfolioRisk,
      diversificationScore,
      recommendations
    );

    return riskAnalysis;
  }
  // Análisis técnico básico
  performTechnicalAnalysis(symbol: string): any {
    const marketData = MarketDataStorage.getBySymbol(symbol);
    if (!marketData) {
      throw new Error("Datos de mercado no encontrados");
    }

    // Simulación de indicadores técnicos básicos
    const sma20 = HelperAnalysis.calculateSimpleMovingAverage(symbol, 20);
    const sma50 = HelperAnalysis.calculateSimpleMovingAverage(symbol, 50);
    const rsi = HelperAnalysis.calculateRSI(symbol);

    let signal: TransactionType = TransactionType.HOLD;

    // Lógica simple de señales
    if (marketData.price > sma20 && sma20 > sma50 && rsi < 70) {
      signal = TransactionType.BUY;
    } else if (marketData.price < sma20 && sma20 < sma50 && rsi > 30) {
      signal = TransactionType.SELL;
    }

    return {
      symbol: symbol,
      currentPrice: marketData.price,
      sma20: sma20,
      sma50: sma50,
      rsi: rsi,
      signal: signal,
      timestamp: new Date(),
    };
  }
  // Generar recomendaciones de inversión - Lógica básica
  generateInvestmentRecommendations(userId: string): any[] {
    const user = UserStorage.getById(userId);
    const portfolio = PortafolioStorage.getByUserId(userId);

    if (!user || !portfolio) {
      throw new Error("Usuario o portafolio no encontrado");
    }

    const recommendations: any[] = [];

    // Recomendaciones basadas en tolerancia al riesgo
    const allAssets = AssetStorage.getAll();

    allAssets.forEach((asset) => {
      const hasHolding = portfolio.holdings.some(
        (h) => h.symbol === asset.symbol
      );

      if (!hasHolding) {
        let recommendation = "";
        let priority = 0;

        if (
          user.riskTolerance === Risks.LOW &&
          HelperAnalysis.getAssetVolatility(asset.symbol) < 50
        ) {
          recommendation =
            "Activo de bajo riesgo recomendado para tu perfil conservador";
          priority = 1;
        } else if (
          user.riskTolerance === Risks.HIGH &&
          HelperAnalysis.getAssetVolatility(asset.symbol) > 60
        ) {
          recommendation =
            "Activo de alto crecimiento potencial para tu perfil agresivo";
          priority = 2;
        } else if (user.riskTolerance === Risks.MEDIUM) {
          recommendation = "Activo balanceado adecuado para tu perfil moderado";
          priority = 1;
        }

        if (recommendation) {
          recommendations.push({
            symbol: asset.symbol,
            name: asset.name,
            currentPrice: asset.currentPrice,
            recommendation: recommendation,
            priority: priority,
            riskLevel:
              HelperAnalysis.getAssetVolatility(asset.symbol) > 60
                ? Risks.HIGH
                : Risks.MEDIUM,
          });
        }
      }
    });

    // Ordenar por prioridad
    return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }
}
