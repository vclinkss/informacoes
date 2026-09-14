export type AgendamentoProps = {
  id?: number;
  liderId: number;
  liderNome?: string;
  nome: string;
  whatsapp: string;
  dataHora: Date;
  local: string;
  observacao?: string | null;
  criadoEm?: Date;
};

export class Agendamento {
  readonly id?: number;
  readonly liderId: number;
  readonly liderNome?: string;
  readonly nome: string;
  readonly whatsapp: string;
  readonly dataHora: Date;
  readonly local: string;
  readonly observacao: string | null;
  readonly criadoEm?: Date;

  constructor(props: AgendamentoProps) {
    this.id = props.id;
    this.liderId = props.liderId;
    this.liderNome = props.liderNome;
    this.nome = props.nome;
    this.whatsapp = props.whatsapp;
    this.dataHora = props.dataHora;
    this.local = props.local;
    this.observacao = props.observacao ?? null;
    this.criadoEm = props.criadoEm;
  }

  linkWhatsapp(): string {
    const digits = this.whatsapp.replace(/\D/g, "");
    const comDDI = digits.startsWith("55") ? digits : `55${digits}`;
    return `https://wa.me/${comDDI}`;
  }
}
