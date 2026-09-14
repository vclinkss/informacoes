import bcrypt from "bcryptjs";
import { IHasher } from "../../Application/Contracts/Criptography/IHasher";

export class BcryptHasher implements IHasher {
  constructor(private readonly saltRounds: number = 10) {}

  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, this.saltRounds);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
