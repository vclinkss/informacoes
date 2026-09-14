import jwt from "jsonwebtoken";
import { IEncrypter } from "../../Application/Contracts/Criptography/IEncrypter";
import { env } from "../../Shared/Env";

export class JwtEncrypter implements IEncrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  async decrypt(token: string): Promise<Record<string, unknown>> {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded as Record<string, unknown>;
  }
}
