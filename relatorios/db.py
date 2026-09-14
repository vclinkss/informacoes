import os

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    db_url = os.environ.get("SUPABASE_DB_URL")
    if not db_url:
        raise RuntimeError(
            "Defina SUPABASE_DB_URL em relatorios/.env com a connection string do Supabase "
            "(Project Settings > Database > Connection string > URI)."
        )
    return psycopg2.connect(db_url, cursor_factory=psycopg2.extras.RealDictCursor)


def buscar_contatos():
    """Retorna todos os contatos, com o nome do líder, na mesma estrutura usada pelos relatórios."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                select l.nome as lider, c.nome, c.endereco, c.bairro, c.whatsapp,
                       c.local_votacao, c.liguei, c.observacao
                from contato c
                join lider l on l.id = c.lider_id
                order by l.nome, c.nome
                """
            )
            return cur.fetchall()
    finally:
        conn.close()
