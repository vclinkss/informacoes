import { NextFunction, Response } from "express";
import ExcelJS from "exceljs";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { CreateContato } from "../../../Application/Modules/Contatos/UseCases/CreateContato";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

// Cada chave possível de cabeçalho (sem acento, minúscula) aponta pro campo do contato.
const MAPA_CABECALHOS: Record<string, string> = {
  nome: "nome",
  whatsapp: "whatsapp",
  telefone: "whatsapp",
  celular: "whatsapp",
  endereco: "endereco",
  bairro: "bairro",
  "local de votacao": "localVotacao",
  "local de votação": "localVotacao",
  escola: "localVotacao",
  zona: "zona",
  secao: "secao",
  "seção": "secao",
  observacao: "observacao",
  "observação": "observacao",
  obs: "observacao",
};

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function celulaTexto(valor: ExcelJS.CellValue): string {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "object" && "text" in (valor as { text?: string })) {
    return String((valor as { text?: string }).text ?? "").trim();
  }
  if (typeof valor === "object" && "result" in (valor as { result?: unknown })) {
    return String((valor as { result?: unknown }).result ?? "").trim();
  }
  return String(valor).trim();
}

export class ImportarContatosExcelController {
  constructor(private readonly useCase: CreateContato) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const arquivo = req.file;
      if (!arquivo) throw new AppError("Envie um arquivo .xlsx", 400);

      const workbook = new ExcelJS.Workbook();
      // Cast pontual: @types/node e exceljs discordam sobre a variante exata de Buffer,
      // mas em runtime é o mesmo Buffer do multer (memoryStorage).
      await workbook.xlsx.load(arquivo.buffer as unknown as ArrayBuffer);
      const sheet = workbook.worksheets[0];
      if (!sheet) throw new AppError("Planilha vazia ou em formato inválido", 400);

      const headerRow = sheet.getRow(1);
      const colunaPorIndice: Record<number, string> = {};
      headerRow.eachCell((cell, colNumber) => {
        const chave = MAPA_CABECALHOS[normalizar(celulaTexto(cell.value))];
        if (chave) colunaPorIndice[colNumber] = chave;
      });

      if (!Object.values(colunaPorIndice).includes("nome")) {
        throw new AppError(
          'Não encontrei a coluna "Nome" na planilha. Confira se a primeira linha tem os títulos das colunas.',
          400
        );
      }

      let importados = 0;
      let ignorados = 0;
      const erros: string[] = [];

      for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
        const row = sheet.getRow(rowNumber);
        if (row.cellCount === 0) continue;

        const dados: Record<string, string> = {};
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const chave = colunaPorIndice[colNumber];
          if (chave) dados[chave] = celulaTexto(cell.value);
        });

        if (!dados.nome) {
          ignorados++;
          continue;
        }

        try {
          await this.useCase.execute({
            liderId: Number(req.userId),
            liderNome: req.userNome || "",
            nome: dados.nome,
            endereco: dados.endereco,
            bairro: dados.bairro,
            whatsapp: dados.whatsapp,
            localVotacao: dados.localVotacao,
            zona: dados.zona,
            secao: dados.secao,
          });
          importados++;
        } catch (e) {
          erros.push(`Linha ${rowNumber} (${dados.nome}): ${e instanceof Error ? e.message : "erro desconhecido"}`);
        }
      }

      res.status(200).json({ importados, ignorados, erros });
    } catch (err) {
      next(err);
    }
  }
}
