import { IContatoRepository } from "../../../Contracts/Repositories/IContatoRepository";

export type ContagemSecao = { zona: string; secao: string; total: number };

/** Normaliza pro formato da lista do TRE: zona com 3 dígitos ("006"), seção com 3 ("076"). */
function normalizar(valor: string | null, digitos: number): string | null {
  const so = (valor || "").replace(/\D/g, "");
  if (!so) return null;
  return String(parseInt(so, 10)).padStart(digitos, "0");
}

/**
 * Quantos contatos votam em cada zona/seção — só números, sem nome nem telefone.
 * Usado pelo mapa pra mostrar o total de pessoas nossas em cada local de votação do TRE.
 */
export class ContarPorSecao {
  constructor(private readonly contatoRepository: IContatoRepository) {}

  async execute(input: { liderId?: number } = {}): Promise<ContagemSecao[]> {
    const contatos = await this.contatoRepository.findAll({ liderId: input.liderId });
    const totais = new Map<string, ContagemSecao>();
    for (const c of contatos) {
      const zona = normalizar(c.zona, 3);
      const secao = normalizar(c.secao, 3);
      if (!zona || !secao) continue;
      const chave = zona + "/" + secao;
      const atual = totais.get(chave) || { zona, secao, total: 0 };
      atual.total += 1;
      totais.set(chave, atual);
    }
    return Array.from(totais.values());
  }
}
