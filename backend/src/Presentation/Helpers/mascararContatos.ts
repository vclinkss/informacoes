/**
 * Esconde nome/whatsapp de contatos que não são do próprio usuário, pra um admin
 * marcado como "restrito" (só o e-mail master consegue ligar essa restrição).
 * Mantém bairro/local de votação/zona/seção/líder visíveis (útil pra logística),
 * só oculta quem é a pessoa.
 */
export function mascararContatosRestritos<
  T extends { liderId: number; nome: string; whatsapp?: string }
>(itens: T[], liderIdAtual: number): T[] {
  return itens.map((item) => {
    if (item.liderId === liderIdAtual) return item;
    const mascarado: T = { ...item, nome: "(nome oculto)" };
    if (item.whatsapp !== undefined) mascarado.whatsapp = "";
    return mascarado;
  });
}
