import { NextFunction, Response } from "express";
import ExcelJS from "exceljs";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { ListContatos } from "../../../Application/Modules/Contatos/UseCases/ListContatos";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { podeVerTudoContatos } from "../../Helpers/papeis";

const querySchema = z.object({
  busca: z.string().trim().optional(),
  liderId: z.coerce.number().int().positive().optional(),
});

function formatarData(data?: Date | null): string {
  if (!data) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Belem",
  }).format(data);
}

const COR_CABECALHO = "FF1F6E56";

export class ExportarContatosExcelController {
  constructor(private readonly useCase: ListContatos) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const query = querySchema.parse(req.query);

      const filtro = podeVerTudoContatos(req.userRole)
        ? { busca: query.busca, liderId: query.liderId }
        : { liderId: Number(req.userId) };

      const contatos = await this.useCase.execute(filtro);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Painel da Equipe";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Contatos", {
        views: [{ state: "frozen", ySplit: 1 }],
      });

      sheet.columns = [
        { header: "Nome", key: "nome", width: 28 },
        { header: "WhatsApp", key: "whatsapp", width: 18 },
        { header: "Endereço", key: "endereco", width: 32 },
        { header: "Bairro", key: "bairro", width: 20 },
        { header: "Local de votação", key: "votacao", width: 32 },
        { header: "Líder", key: "lider", width: 22 },
        { header: "Já ligou", key: "liguei", width: 12 },
        { header: "Precisa carona", key: "precisaCarona", width: 15 },
        { header: "Observação", key: "observacao", width: 30 },
        { header: "Cadastrado em", key: "cadastradoEm", width: 20 },
      ];

      contatos.forEach((c) => {
        sheet.addRow({
          nome: c.nome || "",
          whatsapp: c.whatsapp || "",
          endereco: c.endereco || "",
          bairro: c.bairro || "",
          votacao: c.localVotacao || "",
          lider: c.liderNome || "",
          liguei: c.liguei ? "Sim" : "Não",
          precisaCarona: c.precisaCarona ? "Sim" : "Não",
          observacao: c.observacao || "",
          cadastradoEm: formatarData(c.dataCadastro),
        });
      });

      const headerRow = sheet.getRow(1);
      headerRow.height = 22;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR_CABECALHO } };
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.border = {
          top: { style: "thin", color: { argb: "FF0F3D30" } },
          bottom: { style: "thin", color: { argb: "FF0F3D30" } },
        };
      });

      sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + sheet.columns.length)}1` };

      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return;
        row.eachCell((cell) => {
          cell.border = {
            bottom: { style: "thin", color: { argb: "FFE2E2E2" } },
          };
          cell.alignment = { vertical: "middle" };
        });
        if (rowNumber % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F8F6" } };
          });
        }
      });

      const hoje = new Date();
      const nomeArquivo = `contatos-${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(
        hoje.getDate()
      ).padStart(2, "0")}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo}"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      next(err);
    }
  }
}
