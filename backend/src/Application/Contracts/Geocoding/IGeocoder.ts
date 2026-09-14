export type PontoGeografico = { lat: number; lng: number };
export type SugestaoBusca = PontoGeografico & { nome: string };

export interface IGeocoder {
  geocodificar(endereco: string): Promise<PontoGeografico | null>;
  /** Busca "como você digita", retornando várias opções pra pessoa escolher a certa. */
  buscar(texto: string): Promise<SugestaoBusca[]>;
}
