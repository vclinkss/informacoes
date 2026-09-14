import os
from collections import Counter

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from db import buscar_contatos

PASTA = os.path.dirname(os.path.abspath(__file__))
cores = ["#1F6E56", "#5DCAA5", "#0F6E56", "#9FE1CB", "#04342C", "#7F77DD", "#D85A30", "#534AB7"]


def gerar_donut(valores_labels, caminho):
    labels = list(valores_labels.keys())
    valores = [valores_labels[l] for l in labels]
    total = sum(valores)

    fig, ax = plt.subplots(figsize=(6, 4.5), dpi=150)

    def format_label(pct):
        return f"{round(pct / 100 * total)}"

    wedges, texts, autotexts = ax.pie(
        valores,
        labels=labels,
        autopct=format_label,
        pctdistance=0.78,
        startangle=90,
        colors=cores[:len(labels)],
        wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2),
        textprops={"fontsize": 11, "color": "#2C2C2A"},
    )
    for at in autotexts:
        at.set_color("white")
        at.set_fontsize(12)
        at.set_fontweight("bold")

    ax.axis("equal")
    fig.tight_layout(pad=1.5)
    fig.savefig(caminho, transparent=True, bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    contatos = buscar_contatos()
    bairros = Counter(row["bairro"] for row in contatos)
    escolas = Counter(row["local_votacao"] for row in contatos)

    gerar_donut(bairros, os.path.join(PASTA, "grafico_bairro.png"))
    gerar_donut(escolas, os.path.join(PASTA, "grafico_escola.png"))
    print("ok")
