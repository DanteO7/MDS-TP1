import { TransactionType } from "@/enums/transaction-type";
import { Transaction } from "@/models/transaction";
import { BuyOrder } from "../template/buy-order";
import { SellOrder } from "../template/sell-order";

export interface IExecutable {
  execute(
    userId: string,
    symbol: string,
    type: TransactionType,
    quantity: number
  ): Transaction;
}

export abstract class OrderFactory {
  protected abstract create(): IExecutable;

  execute(
    userId: string,
    symbol: string,
    type: TransactionType,
    quantity: number
  ): Transaction {
    const order = this.create();

    return order.execute(userId, symbol, type, quantity);
  }
}

export class BuyOrderFactory extends OrderFactory {
  create(): IExecutable {
    return new BuyOrder();
  }
}

export class SellOrderFactory extends OrderFactory {
  create(): IExecutable {
    return new SellOrder();
  }
}
