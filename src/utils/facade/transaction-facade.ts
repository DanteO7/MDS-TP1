import { Transaction } from "@/models/transaction";
import { InMemoryStorage } from "./storage";

export class TransactionFacade {
  constructor(private storage: InMemoryStorage) {}

  add(transaction: Transaction): void {
    this.storage.addTransaction(transaction);
  }

  getByUserId(userId: string): Transaction[] {
    return this.storage.getTransactionsByUserId(userId);
  }

  getAll(): Transaction[] {
    return this.storage.getAllTransactions();
  }
}
