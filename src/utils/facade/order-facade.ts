import { Order } from "../../models/order";
import { InMemoryStorage } from "./storage";

export class OrderFacade {
  constructor(private storage: InMemoryStorage) {}

  add(order: Order): void {
    this.storage.addOrder(order);
  }

  getByUserId(userId: string): Order[] {
    return this.storage.getOrdersByUserId(userId);
  }

  update(order: Order): void {
    this.storage.updateOrder(order);
  }
}
