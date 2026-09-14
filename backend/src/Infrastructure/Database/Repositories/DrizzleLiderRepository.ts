import { eq } from "drizzle-orm";
import { db } from "../Drizzle/client";
import { liderTable } from "../Schemas/lideres";
import { ILiderRepository } from "../../../Application/Contracts/Repositories/ILiderRepository";
import { Lider, LiderRole, LiderStatus } from "../../../Domain/Lideres/Models/Lider";

type LiderRow = {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  role: string;
  status: string;
};

function toDomain(row: LiderRow): Lider {
  return new Lider(
    row.nome,
    row.email,
    row.senhaHash,
    row.role as LiderRole,
    row.status as LiderStatus,
    row.id
  );
}

export class DrizzleLiderRepository implements ILiderRepository {
  async create(lider: Lider): Promise<Lider> {
    const [row] = await db
      .insert(liderTable)
      .values({
        nome: lider.nome,
        email: lider.email,
        senhaHash: lider.senhaHash,
        role: lider.role,
        status: lider.status,
      })
      .returning();
    return toDomain(row);
  }

  async findAll(): Promise<Lider[]> {
    const rows = await db.select().from(liderTable).orderBy(liderTable.nome);
    return rows.map(toDomain);
  }

  async findById(id: number): Promise<Lider | null> {
    const [row] = await db.select().from(liderTable).where(eq(liderTable.id, id));
    return row ? toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Lider | null> {
    const [row] = await db.select().from(liderTable).where(eq(liderTable.email, email));
    return row ? toDomain(row) : null;
  }

  async findByStatus(status: LiderStatus): Promise<Lider[]> {
    const rows = await db.select().from(liderTable).where(eq(liderTable.status, status));
    return rows.map(toDomain);
  }

  async updateStatus(id: number, status: LiderStatus): Promise<Lider | null> {
    const [row] = await db
      .update(liderTable)
      .set({ status })
      .where(eq(liderTable.id, id))
      .returning();
    return row ? toDomain(row) : null;
  }

  async updateRole(id: number, role: LiderRole): Promise<Lider | null> {
    const [row] = await db
      .update(liderTable)
      .set({ role })
      .where(eq(liderTable.id, id))
      .returning();
    return row ? toDomain(row) : null;
  }
}
