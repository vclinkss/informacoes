import { Contato } from "../../../Domain/Contatos/Models/Contato";

export type ContatoFiltro = {
  /** Restringe aos contatos de um líder específico (usado quando quem pede é o próprio líder, ou quando o admin filtra por líder). */
  liderId?: number;
  /** Busca por nome do líder (uso do admin, ao navegar entre equipes). */
  busca?: string;
};

export type ContagemBairro = { bairro: string; total: number };
export type ContagemLocalVotacao = { localVotacao: string; total: number };

export type ContatoEdicao = {
  nome?: string;
  endereco?: string;
  enderecoLat?: number | null;
  enderecoLng?: number | null;
  bairro?: string;
  whatsapp?: string;
  localVotacao?: string;
};

export interface IContatoRepository {
  create(contato: Contato): Promise<Contato>;
  findAll(filtro?: ContatoFiltro): Promise<Contato[]>;
  /** Se liderIdRestricao for informado, só atualiza um contato que pertença a esse líder. */
  updateStatusLigacao(
    id: number,
    liguei: boolean,
    observacao: string | null,
    liderIdRestricao?: number
  ): Promise<Contato | null>;
  /** Se liderIdRestricao for informado, só edita um contato que pertença a esse líder. */
  update(id: number, dados: ContatoEdicao, liderIdRestricao?: number): Promise<Contato | null>;
  /** Se liderIdRestricao for informado, só apaga um contato que pertença a esse líder. Retorna se apagou. */
  delete(id: number, liderIdRestricao?: number): Promise<boolean>;
  contarPorBairro(liderId?: number): Promise<ContagemBairro[]>;
  contarPorLocalVotacao(liderId?: number): Promise<ContagemLocalVotacao[]>;
}
