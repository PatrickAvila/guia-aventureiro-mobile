// mobile/src/services/placesService.ts
import axios from 'axios';
import env from '../config/env';

const GOOGLE_PLACES_API_KEY = env.googleMapsKey;
const AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const PHOTOS_URL = 'https://maps.googleapis.com/maps/api/place/photo';

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  name: string;
  city: string;
  country: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

class PlacesService {
  /**
   * Busca sugestões de lugares baseado no texto digitado
   */
  async searchPlaces(input: string): Promise<PlaceSuggestion[]> {
    if (!input || input.length < 3) {
      return [];
    }

    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('Google Places API key não configurada');
      // Retornar sugestões mockadas para desenvolvimento
      return this.getMockSuggestions(input);
    }

    try {
      const response = await axios.get(AUTOCOMPLETE_URL, {
        params: {
          input,
          types: '(cities)', // Apenas cidades
          language: 'pt-BR',
          key: GOOGLE_PLACES_API_KEY,
        },
      });

      if (response.data.status !== 'OK') {
        console.warn('Google Places API error:', response.data.status);
        return this.getMockSuggestions(input);
      }

      return response.data.predictions.map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
      }));
    } catch (error) {
      console.error('Erro ao buscar lugares:', error);
      return this.getMockSuggestions(input);
    }
  }

  /**
   * Obtém detalhes de um lugar específico
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!GOOGLE_PLACES_API_KEY) {
      return this.getMockPlaceDetails(placeId);
    }

    try {
      const response = await axios.get(PLACE_DETAILS_URL, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,address_components,photos',
          language: 'pt-BR',
          key: GOOGLE_PLACES_API_KEY,
        },
      });

      if (response.data.status !== 'OK') {
        console.warn('Google Place Details API error:', response.data.status);
        return null;
      }

      const result = response.data.result;
      const addressComponents = result.address_components;

      // Extrair cidade e país
      const cityComponent = addressComponents.find(
        (comp: any) =>
          comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
      );
      const countryComponent = addressComponents.find((comp: any) =>
        comp.types.includes('country')
      );

      // URL da foto (se disponível)
      let photoUrl: string | undefined;
      if (result.photos && result.photos.length > 0) {
        const photoReference = result.photos[0].photo_reference;
        photoUrl = `${PHOTOS_URL}?maxwidth=800&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
      }

      return {
        name: result.name,
        city: cityComponent?.long_name || result.name,
        country: countryComponent?.long_name || '',
        formattedAddress: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        photoUrl,
      };
    } catch (error) {
      console.error('Erro ao obter detalhes do lugar:', error);
      return null;
    }
  }

  /**
   * Sugestões mockadas para desenvolvimento (sem API key)
   */
  private getMockSuggestions(input: string): PlaceSuggestion[] {
    const mockPlaces = [
      { city: 'Paris', country: 'França' },
      { city: 'Londres', country: 'Reino Unido' },
      { city: 'Roma', country: 'Itália' },
      { city: 'Barcelona', country: 'Espanha' },
      { city: 'Amsterdã', country: 'Holanda' },
      { city: 'Tóquio', country: 'Japão' },
      { city: 'Nova York', country: 'Estados Unidos' },
      { city: 'Rio de Janeiro', country: 'Brasil' },
      { city: 'São Paulo', country: 'Brasil' },
      { city: 'Buenos Aires', country: 'Argentina' },
      { city: 'Lisboa', country: 'Portugal' },
      { city: 'Dubai', country: 'Emirados Árabes' },
      { city: 'Bangkok', country: 'Tailândia' },
      { city: 'Cancún', country: 'México' },
      { city: 'Praga', country: 'República Tcheca' },
    ];

    const filtered = mockPlaces.filter(
      (place) =>
        place.city.toLowerCase().includes(input.toLowerCase()) ||
        place.country.toLowerCase().includes(input.toLowerCase())
    );

    return filtered.map((place, index) => ({
      placeId: `mock_${index}`,
      description: `${place.city}, ${place.country}`,
      mainText: place.city,
      secondaryText: place.country,
    }));
  }

  /**
   * Detalhes mockados para desenvolvimento
   */
  private getMockPlaceDetails(placeId: string): PlaceDetails {
    const mockDetails: Record<string, PlaceDetails> = {
      mock_0: {
        name: 'Paris',
        city: 'Paris',
        country: 'França',
        formattedAddress: 'Paris, França',
        latitude: 48.8566,
        longitude: 2.3522,
      },
      mock_1: {
        name: 'Londres',
        city: 'Londres',
        country: 'Reino Unido',
        formattedAddress: 'Londres, Reino Unido',
        latitude: 51.5074,
        longitude: -0.1278,
      },
      mock_7: {
        name: 'Rio de Janeiro',
        city: 'Rio de Janeiro',
        country: 'Brasil',
        formattedAddress: 'Rio de Janeiro - RJ, Brasil',
        latitude: -22.9068,
        longitude: -43.1729,
      },
    };

    return (
      mockDetails[placeId] || {
        name: 'Destino Desconhecido',
        city: 'Cidade',
        country: 'País',
        formattedAddress: 'Endereço desconhecido',
        latitude: 0,
        longitude: 0,
      }
    );
  }
}

export const placesService = new PlacesService();
