import { IContatoRepository } from "../../../Contracts/Repositories/IContatoRepository";

export type ContagemSecao = { zona: string; secao: string; total: number; carona: number };
export type ContagemSecoes = {
  secoes: ContagemSecao[];
  /** Contatos sem zona ou seção preenchida (não dá pra saber a escola deles pelo TRE). */
  semZonaSecao: number;
  semZonaSecaoCarona: number;
};

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

  async execute(input: { liderId?: number } = {}): Promise<ContagemSecoes> {
    const contatos = await this.contatoRepository.findAll({ liderId: input.liderId });
    const totais = new Map<string, ContagemSecao>();
    let semZonaSecao = 0;
    let semZonaSecaoCarona = 0;
    for (const c of contatos) {
      const zona = normalizar(c.zona, 3);
      const secao = normalizar(c.secao, 3);
      if (!zona || !secao) {
        semZonaSecao += 1;
        if (c.precisaCarona) semZonaSecaoCarona += 1;
        continue;
      }
      const chave = zona + "/" + secao;
      const atual = totais.get(chave) || { zona, secao, total: 0, carona: 0 };
      atual.total += 1;
      if (c.precisaCarona) atual.carona += 1;
      totais.set(chave, atual);
    }
    return { secoes: Array.from(totais.values()), semZonaSecao, semZonaSecaoCarona };
  }
}
