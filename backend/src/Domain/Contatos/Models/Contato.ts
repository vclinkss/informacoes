export type ContatoProps = {
  id?: number;
  liderId: number;
  liderNome?: string;
  nome: string;
  endereco: string;
  enderecoLat?: number | null;
  enderecoLng?: number | null;
  bairro: string;
  whatsapp: string;
  localVotacao: string;
  liguei?: boolean;
  observacao?: string | null;
  precisaCarona?: boolean;
  dataCadastro?: Date;
};

export class Contato {
  readonly id?: number;
  readonly liderId: number;
  readonly liderNome?: string;
  readonly nome: string;
  readonly endereco: string;
  readonly enderecoLat: number | null;
  readonly enderecoLng: number | null;
  readonly bairro: string;
  readonly whatsapp: string;
  readonly localVotacao: string;
  readonly liguei: boolean;
  readonly observacao: string | null;
  readonly precisaCarona: boolean;
  readonly dataCadastro?: Date;

  constructor(props: ContatoProps) {
    this.id = props.id;
    this.liderId = props.liderId;
    this.liderNome = props.liderNome;
    this.nome = props.nome;
    this.endereco = props.endereco;
    this.enderecoLat = props.enderecoLat ?? null;
    this.enderecoLng = props.enderecoLng ?? null;
    this.bairro = props.bairro;
    this.whatsapp = props.whatsapp;
    this.localVotacao = props.localVotacao;
    this.liguei = props.liguei ?? false;
    this.observacao = props.observacao ?? null;
    this.precisaCarona = props.precisaCarona ?? true;
    this.dataCadastro = props.dataCadastro;
  }

  /** Link direto para conversa no WhatsApp (wa.me), garantindo o DDI 55. */
  linkWhatsapp(): string {
    const digits = this.whatsapp.replace(/\D/g, "");
    const comDDI = digits.startsWith("55") ? digits : `55${digits}`;
    return `https://wa.me/${comDDI}`;
  }
}
