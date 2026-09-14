import { IGeocoder, PontoGeografico, SugestaoBusca } from "../../Application/Contracts/Geocoding/IGeocoder";

type RespostaGoogle = {
  status: string;
  results: Array<{ formatted_address: string; geometry: { location: { lat: number; lng: number } } }>;
};

export class GoogleGeocoder implements IGeocoder {
  constructor(private readonly apiKey: string) {}

  async geocodificar(endereco: string): Promise<PontoGeografico | null> {
    const dados = await this.buscarBruto(endereco);
    if (!dados.length) return null;
    const { lat, lng } = dados[0].geometry.location;
    return { lat, lng };
  }

  async buscar(texto: string): Promise<SugestaoBusca[]> {
    const dados = await this.buscarBruto(texto);
    return dados.slice(0, 5).map((r) => ({
      nome: r.formatted_address,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
    }));
  }

  private async buscarBruto(endereco: string): Promise<RespostaGoogle["results"]> {
    const url =
      "https://maps.googleapis.com/maps/api/geocode/json?region=br&components=country:BR&address=" +
      encodeURIComponent(endereco) +
      "&key=" +
      this.apiKey;

    try {
      const resp = await fetch(url);
      if (!resp.ok) return [];

      const dados = (await resp.json()) as RespostaGoogle;
      if (dados.status !== "OK") return [];
      return dados.results;
    } catch {
      return [];
    }
  }
}
