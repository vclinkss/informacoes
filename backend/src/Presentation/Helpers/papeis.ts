/** Admin, agenda e motorista enxergam os contatos/rotas de todo mundo; líder comum só os próprios. */
export function podeVerTudoContatos(role?: string): boolean {
  return role === "admin" || role === "motorista";
}
