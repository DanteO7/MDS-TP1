// Servicios de trading

import { storage } from "../../utils/storage";
import { Transaction } from "../../models/transaction";
import { BuyOrder } from "./template/BuyOrder";
import { TransactionType } from "../../enums/TransactionType";
import { SellOrder } from "./template/SellOrder";
export class TradingService {
  // Ejecutar orden de compra al precio de mercado
  async executeBuyOrder(
    userId: string,
    symbol: string,
    quantity: number
  ): Promise<Transaction> {
    const buyOrder = new BuyOrder();
    const transaction = buyOrder.execute(
      userId,
      symbol,
      TransactionType.BUY,
      quantity
    );
    return transaction;
  }

  // Ejecutar orden de venta al precio de mercado
  async executeSellOrder(
    userId: string,
    symbol: string,
    quantity: number
  ): Promise<Transaction> {
    const sellOrder = new SellOrder();
    const transaction = sellOrder.execute(
      userId,
      symbol,
      TransactionType.SELL,
      quantity
    );
    return transaction;
  }

  // Obtener historial de transacciones
  getTransactionHistory(userId: string): Transaction[] {
    return storage.getTransactionsByUserId(userId);
  }
}
