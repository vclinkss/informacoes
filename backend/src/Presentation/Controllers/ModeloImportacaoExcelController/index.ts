import { NextFunction, Request, Response } from "express";
import ExcelJS from "exceljs";

export class ModeloImportacaoExcelController {
  async handle(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Contatos");

      sheet.columns = [
        { header: "Nome", key: "nome", width: 28 },
        { header: "WhatsApp", key: "whatsapp", width: 18 },
        { header: "Endereço", key: "endereco", width: 32 },
        { header: "Bairro", key: "bairro", width: 20 },
        { header: "Local de votação", key: "localVotacao", width: 32 },
        { header: "Zona", key: "zona", width: 10 },
        { header: "Seção", key: "secao", width: 10 },
        { header: "Observação", key: "observacao", width: 30 },
      ];

      sheet.addRow({
        nome: "Ana Silva",
        whatsapp: "96999999999",
        endereco: "Rua das Flores, 123",
        bairro: "Zerão",
        localVotacao: "Escola Estadual Exemplo",
        zona: "006",
        secao: "0106",
        observacao: "",
      });

      const headerRow = sheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F6E56" } };
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", 'attachment; filename="modelo-importacao-contatos.xlsx"');

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      next(err);
    }
  }
}
