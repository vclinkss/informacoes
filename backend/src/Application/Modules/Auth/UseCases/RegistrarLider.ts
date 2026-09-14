import { AppError } from "../../../Contracts/Errors/AppError";
import { IHasher } from "../../../Contracts/Criptography/IHasher";
import { ILiderRepository } from "../../../Contracts/Repositories/ILiderRepository";
import { Lider } from "../../../../Domain/Lideres/Models/Lider";

export type RegistrarLiderInput = {
  nome: string;
  email: string;
  senha: string;
};

export class RegistrarLider {
  constructor(
    private readonly liderRepository: ILiderRepository,
    private readonly hasher: IHasher
  ) {}

  async execute(input: RegistrarLiderInput): Promise<Lider> {
    const existente = await this.liderRepository.findByEmail(input.email.trim().toLowerCase());
    if (existente) throw new AppError("Já existe um cadastro com esse e-mail", 409);

    const senhaHash = await this.hasher.hash(input.senha);
    const lider = Lider.registrar(input.nome, input.email, senhaHash);
    return this.liderRepository.create(lider);
  }
}
