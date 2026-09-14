export type LiderRole = "lider" | "admin" | "agenda" | "motorista";
export type LiderStatus = "pendente" | "aprovado" | "rejeitado";

export class Lider {
  constructor(
    public readonly nome: string,
    public readonly email: string,
    public readonly senhaHash: string,
    public readonly role: LiderRole = "lider",
    public readonly status: LiderStatus = "pendente",
    public readonly id?: number
  ) {}

  static registrar(nome: string, email: string, senhaHash: string): Lider {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    if (!nomeLimpo) throw new Error("Nome é obrigatório");
    if (!emailLimpo) throw new Error("E-mail é obrigatório");
    return new Lider(nomeLimpo, emailLimpo, senhaHash, "lider", "pendente");
  }

  /** Admin sempre tem acesso; líder só depois de aprovado. */
  podeAcessar(): boolean {
    return this.role === "admin" || this.status === "aprovado";
  }
}
