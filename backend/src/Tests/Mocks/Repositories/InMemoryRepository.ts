import { IRepository } from "../../../Application/Contracts/Repositories/IRepository";

export class InMemoryRepository<T extends { id: string }>
  implements IRepository<T>
{
  public items: T[] = [];

  async save(entity: T): Promise<void> {
    const index = this.items.findIndex((item) => item.id === entity.id);
    if (index >= 0) {
      this.items[index] = entity;
    } else {
      this.items.push(entity);
    }
  }

  async findById(id: string): Promise<T | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
