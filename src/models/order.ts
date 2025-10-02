import { OrderStatus } from "@/enums/order-status";
import { TransactionType } from "@/enums/transaction-type";

export class Order {
  id: string;
  userId: string;
  type: "market";
  action: TransactionType;
  symbol: string;
  quantity: number;
  price?: number;
  status: OrderStatus;
  createdAt: Date;
  executedAt?: Date;

  constructor(
    id: string,
    userId: string,
    type: "market",
    action: TransactionType,
    symbol: string,
    quantity: number,
    price?: number
  ) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.action = action;
    this.symbol = symbol;
    this.quantity = quantity;
    this.price = price;
    this.status = OrderStatus.PENDING;
    this.createdAt = new Date();
  }

  execute(): void {
    this.status = OrderStatus.EXECUTED;
    this.executedAt = new Date();
  }

  cancel(): void {
    this.status = OrderStatus.CANCELLED;
  }
}
