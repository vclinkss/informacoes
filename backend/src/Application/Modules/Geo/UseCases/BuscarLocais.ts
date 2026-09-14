import { IGeocoder, SugestaoBusca } from "../../../Contracts/Geocoding/IGeocoder";

export class BuscarLocais {
  constructor(private readonly geocoder: IGeocoder) {}

  async execute(texto: string): Promise<SugestaoBusca[]> {
    const termo = texto.trim();
    if (termo.length < 3) return [];
    return this.geocoder.buscar(termo);
  }
}
