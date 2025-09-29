import { TransactionStatus } from "../enums/TransactionStatus";
import { TransactionType } from "../enums/TransactionType";

export class Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  symbol: string;
  quantity: number;
  price: number;
  timestamp: Date;
  fees: number;
  status: TransactionStatus;

  constructor(
    id: string,
    userId: string,
    type: TransactionType,
    symbol: string,
    quantity: number,
    price: number,
    fees: number
  ) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.symbol = symbol;
    this.quantity = quantity;
    this.price = price;
    this.fees = fees;
    this.timestamp = new Date();
    this.status = TransactionStatus.PENDING;
  }

  complete(): void {
    this.status = TransactionStatus.COMPLETED;
  }

  fail(): void {
    this.status = TransactionStatus.FAILED;
  }

  getTotalAmount(): number {
    return this.quantity * this.price;
  }
}
