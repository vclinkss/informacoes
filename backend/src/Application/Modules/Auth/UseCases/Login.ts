import { AppError } from "../../../Contracts/Errors/AppError";
import { IHasher } from "../../../Contracts/Criptography/IHasher";
import { IEncrypter } from "../../../Contracts/Criptography/IEncrypter";
import { ILiderRepository } from "../../../Contracts/Repositories/ILiderRepository";

export type LoginInput = { email: string; senha: string };
export type LoginOutput = {
  token: string;
  usuario: { id: number; nome: string; email: string; role: string; status: string };
};

export class Login {
  constructor(
    private readonly liderRepository: ILiderRepository,
    private readonly hasher: IHasher,
    private readonly encrypter: IEncrypter
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const credenciaisInvalidas = () => new AppError("E-mail ou senha inválidos", 401);

    const lider = await this.liderRepository.findByEmail(input.email.trim().toLowerCase());
    if (!lider || !lider.id) throw credenciaisInvalidas();

    const senhaOk = await this.hasher.compare(input.senha, lider.senhaHash);
    if (!senhaOk) throw credenciaisInvalidas();

    if (!lider.podeAcessar()) {
      throw new AppError(
        lider.status === "rejeitado"
          ? "Seu cadastro não foi aprovado. Fale com o administrador."
          : "Seu cadastro ainda está aguardando aprovação do administrador.",
        403
      );
    }

    const token = await this.encrypter.encrypt({
      sub: String(lider.id),
      role: lider.role,
      nome: lider.nome,
    });

    return {
      token,
      usuario: {
        id: lider.id,
        nome: lider.nome,
        email: lider.email,
        role: lider.role,
        status: lider.status,
      },
    };
  }
}
