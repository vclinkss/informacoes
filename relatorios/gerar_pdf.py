import os
import re
from collections import Counter
from datetime import datetime

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from db import buscar_contatos
from gerar_grafico import gerar_donut

PASTA = os.path.dirname(os.path.abspath(__file__))


def wa_link(numero):
    digits = re.sub(r"\D", "", numero)
    if not digits.startswith("55"):
        digits = "55" + digits
    return f"https://wa.me/{digits}"


def main():
    contatos = buscar_contatos()

    caminho_bairro = os.path.join(PASTA, "grafico_bairro.png")
    caminho_escola = os.path.join(PASTA, "grafico_escola.png")
    gerar_donut(Counter(row["bairro"] for row in contatos), caminho_bairro)
    gerar_donut(Counter(row["local_votacao"] for row in contatos), caminho_escola)

    destino = os.path.join(PASTA, "relatorio_contatos.pdf")
    doc = SimpleDocTemplate(
        destino,
        pagesize=letter,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleCustom", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=18, spaceAfter=4)
    sub_style = ParagraphStyle("SubCustom", parent=styles["Normal"], fontName="Helvetica-Oblique", fontSize=9, textColor=colors.HexColor("#666666"), spaceAfter=2)
    cell_style = ParagraphStyle("Cell", parent=styles["Normal"], fontName="Helvetica", fontSize=7.5, leading=9)
    link_style = ParagraphStyle("LinkCell", parent=cell_style, textColor=colors.HexColor("#1155CC"))
    liguei_sim = ParagraphStyle("LigueiSim", parent=cell_style, textColor=colors.HexColor("#1F6E56"), fontName="Helvetica-Bold")
    liguei_nao = ParagraphStyle("LigueiNao", parent=cell_style, textColor=colors.HexColor("#993C1D"), fontName="Helvetica-Bold")

    story = []
    story.append(Paragraph("Relatório de contatos", title_style))
    story.append(Paragraph("Elaborado por Lucas Vinicius", sub_style))
    story.append(Paragraph(f"Gerado em {datetime.now().strftime('%d/%m/%Y %H:%M')}", sub_style))
    story.append(Spacer(1, 14))

    data = [["Líder", "Nome", "Endereço", "Bairro", "WhatsApp", "Local de votação", "Liguei", "Observação"]]
    for row in contatos:
        liguei = row["liguei"]
        link_cell = Paragraph(f'<link href="{wa_link(row["whatsapp"])}"><u>{row["whatsapp"]}</u></link>', link_style)
        liguei_cell = Paragraph("Sim" if liguei else "Não", liguei_sim if liguei else liguei_nao)
        data.append([
            Paragraph(row["lider"], cell_style), Paragraph(row["nome"], cell_style), Paragraph(row["endereco"], cell_style),
            Paragraph(row["bairro"], cell_style), link_cell, Paragraph(row["local_votacao"], cell_style),
            liguei_cell, Paragraph(row["observacao"] or "-", cell_style),
        ])

    col_widths = [2.6*cm, 2.4*cm, 3.0*cm, 1.9*cm, 2.6*cm, 3.0*cm, 1.6*cm, 2.9*cm]
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F6E56")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F2F2F2")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D9D9D9")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))

    story.append(table)
    story.append(Spacer(1, 20))
    story.append(Paragraph("Contatos por bairro e por local de votação", ParagraphStyle("H2", parent=styles["Heading2"], fontSize=13)))
    story.append(Spacer(1, 6))

    img_bairro = Image(caminho_bairro, width=9*cm, height=6.75*cm)
    img_escola = Image(caminho_escola, width=9*cm, height=6.75*cm)
    charts_table = Table([[img_bairro, img_escola]], colWidths=[9.5*cm, 9.5*cm])
    charts_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    story.append(charts_table)

    doc.build(story)
    print("ok:", destino)


if __name__ == "__main__":
    main()
