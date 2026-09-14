import { Lider, LiderRole, LiderStatus } from "../../../Domain/Lideres/Models/Lider";

export interface ILiderRepository {
  create(lider: Lider): Promise<Lider>;
  findAll(): Promise<Lider[]>;
  findById(id: number): Promise<Lider | null>;
  findByEmail(email: string): Promise<Lider | null>;
  findByStatus(status: LiderStatus): Promise<Lider[]>;
  updateStatus(id: number, status: LiderStatus): Promise<Lider | null>;
  updateRole(id: number, role: LiderRole): Promise<Lider | null>;
}
