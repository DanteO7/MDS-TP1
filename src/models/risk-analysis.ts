import { Risks } from "@/enums/risks";

export class RiskAnalysis {
  userId: string;
  portfolioRisk: Risks;
  diversificationScore: number;
  recommendations: string[];
  calculatedAt: Date;

  constructor(userId: string) {
    this.userId = userId;
    this.portfolioRisk = Risks.MEDIUM;
    this.diversificationScore = 0;
    this.recommendations = [];
    this.calculatedAt = new Date();
  }

  updateRisk(
    risk: Risks,
    diversificationScore: number,
    recommendations: string[]
  ): void {
    this.portfolioRisk = risk;
    this.diversificationScore = diversificationScore;
    this.recommendations = recommendations;
    this.calculatedAt = new Date();
  }
}
