import { TransactionType } from "../../../enums/TransactionType";
import { User } from "../../../models/user";
import { storage } from "../../../utils/storage";
import { BaseOrder } from "./BaseOrder";

export class SellOrder extends BaseOrder {
  protected prepareTransactionDetails(
    quantity: number,
    executionPrice: number,
    user: User,
    symbol: string
  ): {
    fees: number;
    totalCostOrNetAmount: number;
  } {
    // Verificar holdings suficientes
    const portfolio = storage.getPortfolioByUserId(user.id);
    if (!portfolio) {
      throw new Error("Portafolio no encontrado");
    }

    const holding = portfolio.holdings.find((h) => h.symbol === symbol);
    if (!holding || holding.quantity < quantity) {
      throw new Error("No tienes suficientes activos para vender");
    }

    // Calcular beneficio bruto y comisiones
    const grossAmount = quantity * executionPrice;
    const fees = this.calculateFees(grossAmount, TransactionType.SELL);
    const netAmount = grossAmount - fees;

    return {
      fees: fees,
      totalCostOrNetAmount: netAmount,
    };
  }
}
