import { User } from "../../models/user";
import { InMemoryStorage } from "./storage";

export class UserFacade {
  constructor(private storage: InMemoryStorage) {}

  getByApiKey(apiKey: string): User | undefined {
    return this.storage.getUserByApiKey(apiKey);
  }

  getById(id: string): User | undefined {
    return this.storage.getUserById(id);
  }

  update(user: User): void {
    this.storage.updateUser(user);
  }
}
