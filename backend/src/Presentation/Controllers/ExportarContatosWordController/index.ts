import { NextFunction, Response } from "express";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Packer,
  PageNumber,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { ListContatos } from "../../../Application/Modules/Contatos/UseCases/ListContatos";
import { ILiderRepository } from "../../../Application/Contracts/Repositories/ILiderRepository";
import { Contato } from "../../../Domain/Contatos/Models/Contato";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { podeVerTudoContatos } from "../../Helpers/papeis";
import { mascararContatosRestritos } from "../../Helpers/mascararContatos";

const querySchema = z.object({
  busca: z.string().trim().optional(),
  liderId: z.coerce.number().int().positive().optional(),
});

const COR_CABECALHO = "1F6E56";
const COR_LINHA_ALTERNADA = "F3F8F6";
const FONTE = "Arial";
// A4 deitado (16838 DXA) menos 0,5" de margem de cada lado.
const LARGURA_TABELA = 16838 - 2 * 720;

interface Coluna {
  titulo: string;
  peso: number; // proporção da largura da tabela
  valor: (c: Contato) => string;
  fixa?: boolean; // aparece mesmo se estiver vazia em todos os contatos
}

const borda = { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" };
const bordas = { top: borda, bottom: borda, left: borda, right: borda };

function celula(texto: string, largura: number, opcoes: { cabecalho?: boolean; fundo?: string } = {}) {
  return new TableCell({
    width: { size: largura, type: WidthType.DXA },
    borders: bordas,
    shading: opcoes.fundo ? { type: ShadingType.CLEAR, color: "auto", fill: opcoes.fundo } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: texto,
            bold: !!opcoes.cabecalho,
            color: opcoes.cabecalho ? "FFFFFF" : undefined,
            size: 18,
            font: FONTE,
          }),
        ],
      }),
    ],
  });
}

export class ExportarContatosWordController {
  constructor(
    private readonly useCase: ListContatos,
    private readonly liderRepository: ILiderRepository
  ) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const query = querySchema.parse(req.query);

      const verTudo = podeVerTudoContatos(req.userRole);
      const filtro = verTudo
        ? { busca: query.busca, liderId: query.liderId }
        : { liderId: Number(req.userId) };

      let contatos = await this.useCase.execute(filtro);

      if (req.userRole === "admin") {
        const usuario = await this.liderRepository.findById(Number(req.userId));
        if (usuario?.restrito) {
          contatos = mascararContatosRestritos(contatos, Number(req.userId));
        }
      }

      // Lista de um líder só (filtro do admin ou o próprio líder): o nome dele vai no título.
      const umLiderSo = !!filtro.liderId;
      let nomeLider = "";
      if (umLiderSo) {
        nomeLider =
          contatos[0]?.liderNome || (await this.liderRepository.findById(filtro.liderId!))?.nome || "";
      }

      const todasColunas: Coluna[] = [
        { titulo: "Nome", peso: 24, valor: (c) => c.nome || "", fixa: true },
        { titulo: "WhatsApp", peso: 12, valor: (c) => c.whatsapp || "" },
        { titulo: "Endereço", peso: 20, valor: (c) => c.endereco || "" },
        { titulo: "Bairro", peso: 12, valor: (c) => c.bairro || "" },
        { titulo: "Local de votação", peso: 20, valor: (c) => c.localVotacao || "" },
        { titulo: "Zona", peso: 6, valor: (c) => c.zona || "" },
        { titulo: "Seção", peso: 6, valor: (c) => c.secao || "" },
        ...(umLiderSo ? [] : [{ titulo: "Líder", peso: 14, valor: (c: Contato) => c.liderNome || "" }]),
        { titulo: "Já ligou", peso: 7, valor: (c) => (c.liguei ? "Sim" : "Não"), fixa: true },
        { titulo: "Carona", peso: 7, valor: (c) => (c.precisaCarona ? "Sim" : "Não"), fixa: true },
        { titulo: "Observação", peso: 16, valor: (c) => c.observacao || "" },
      ];
      // Tira colunas vazias em todos os contatos, pra sobrar espaço pras que têm dado.
      const colunas = todasColunas.filter((col) => col.fixa || contatos.some((c) => col.valor(c).trim()));

      const larguraNumero = 600;
      const somaPesos = colunas.reduce((s, col) => s + col.peso, 0);
      const larguras = colunas.map((col) =>
        Math.floor(((LARGURA_TABELA - larguraNumero) * col.peso) / somaPesos)
      );
      larguras[0] += LARGURA_TABELA - larguraNumero - larguras.reduce((s, l) => s + l, 0); // sobra do arredondamento
      const todasLarguras = [larguraNumero, ...larguras];

      const cabecalho = new TableRow({
        tableHeader: true,
        children: ["Nº", ...colunas.map((col) => col.titulo)].map((t, i) =>
          celula(t, todasLarguras[i], { cabecalho: true, fundo: COR_CABECALHO })
        ),
      });
      const linhas = contatos.map(
        (c, idx) =>
          new TableRow({
            cantSplit: true,
            children: [String(idx + 1), ...colunas.map((col) => col.valor(c))].map((t, i) =>
              celula(t, todasLarguras[i], { fundo: idx % 2 ? COR_LINHA_ALTERNADA : undefined })
            ),
          })
      );

      const agora = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Belem",
      }).format(new Date());
      const titulo = nomeLider ? `Contatos de ${nomeLider}` : "Lista de contatos";
      const qtd = `${contatos.length} ${contatos.length === 1 ? "contato" : "contatos"}`;

      const doc = new Document({
        creator: "Painel da Equipe",
        title: titulo,
        sections: [
          {
            properties: {
              page: {
                size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE },
                margin: { top: 720, bottom: 720, left: 720, right: 720 },
              },
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        children: ["Página ", PageNumber.CURRENT, " de ", PageNumber.TOTAL_PAGES],
                        size: 16,
                        color: "888888",
                        font: FONTE,
                      }),
                    ],
                  }),
                ],
              }),
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: titulo, bold: true, size: 32, color: "1F4D3F", font: FONTE })],
              }),
              new Paragraph({
                spacing: { after: 200 },
                children: [
                  new TextRun({ text: `${qtd} · Gerado em ${agora}`, size: 18, color: "666666", font: FONTE }),
                ],
              }),
              new Table({
                width: { size: LARGURA_TABELA, type: WidthType.DXA },
                columnWidths: todasLarguras,
                rows: [cabecalho, ...linhas],
              }),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      const hoje = new Date();
      const nomeArquivo = `contatos-${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(
        hoje.getDate()
      ).padStart(2, "0")}.docx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo}"`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
}
