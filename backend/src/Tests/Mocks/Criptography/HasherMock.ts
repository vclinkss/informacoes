import { IHasher } from "../../../Application/Contracts/Criptography/IHasher";

export class HasherMock implements IHasher {
  async hash(value: string): Promise<string> {
    return `hashed:${value}`;
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return hash === `hashed:${value}`;
  }
}
