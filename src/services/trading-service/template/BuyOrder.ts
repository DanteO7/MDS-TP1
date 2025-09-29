import { TransactionType } from "../../../enums/TransactionType";
import { User } from "../../../models/user";
import { BaseOrder } from "./BaseOrder";

export class BuyOrder extends BaseOrder {
  protected prepareTransactionDetails(
    quantity: number,
    executionPrice: number,
    user: User
  ): {
    fees: number;
    totalCostOrNetAmount: number;
  } {
    // Calcular costo total incluyendo comisiones
    const grossAmount = quantity * executionPrice;
    const fees = this.calculateFees(grossAmount, TransactionType.BUY);
    const totalCost = grossAmount + fees;

    // Verificar fondos suficientes
    if (!user.canAfford(totalCost)) {
      throw new Error("Fondos insuficientes");
    }

    return {
      fees: fees,
      totalCostOrNetAmount: totalCost,
    };
  }
}
