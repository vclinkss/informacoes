import { IGeocoder, PontoGeografico, SugestaoBusca } from "../../Application/Contracts/Geocoding/IGeocoder";

// Nominatim (OpenStreetMap) exige no máximo 1 requisição por segundo e um
// User-Agent identificando a aplicação. Serializamos as chamadas aqui pra
// respeitar isso, já que o cache de banco evita repetir a mesma busca.
let ultimaChamada = 0;
async function aguardarLimiteDeTaxa(): Promise<void> {
  const agora = Date.now();
  const espera = Math.max(0, 1100 - (agora - ultimaChamada));
  if (espera > 0) await new Promise((resolve) => setTimeout(resolve, espera));
  ultimaChamada = Date.now();
}

const USER_AGENT = "ContatosSandraAlcantara/1.0 (contato: lucassousarbr@gmail.com)";
// Caixa delimitadora larga cobrindo Macapá + Santana (AP), pra priorizar resultados da região
// sem excluir totalmente o resto do país (bounded=0 = preferência, não filtro rígido).
const VIEWBOX = "-51.30,0.25,-50.85,-0.35";

export class NominatimGeocoder implements IGeocoder {
  async geocodificar(endereco: string): Promise<PontoGeografico | null> {
    const resultados = await this.buscarBruto(endereco, 1);
    return resultados[0] || null;
  }

  async buscar(texto: string): Promise<SugestaoBusca[]> {
    const resultados = await this.buscarBruto(texto, 5);
    return resultados.map((r) => ({ nome: r.nome, lat: r.lat, lng: r.lng }));
  }

  private async buscarBruto(
    texto: string,
    limite: number
  ): Promise<Array<{ nome: string; lat: number; lng: number }>> {
    await aguardarLimiteDeTaxa();

    const url =
      "https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&countrycodes=br" +
      "&viewbox=" + VIEWBOX + "&bounded=0" +
      "&limit=" + limite +
      "&q=" + encodeURIComponent(texto);

    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, "Accept-Language": "pt-BR" },
      });
      if (!resp.ok) return [];

      const dados = (await resp.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      return dados.map((r) => ({
        nome: r.display_name,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
      }));
    } catch {
      return [];
    }
  }
}
