import { GeoPoint } from 'firebase/firestore';

interface GeocodingResult {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  formattedAddress: string;
}

class GeocodingService {
  private readonly apiKey = 'AIzaSyAPfhW_pu0x_5XcOPb1FkvswBLkSfKjRWQ';
  private readonly geocodingUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  async validateAndGeocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      
      if (!address || address.trim().length === 0) {
        throw new Error('L\'adresse ne peut pas être vide');
      }

      const url = `${this.geocodingUrl}?address=${encodeURIComponent(address)}&key=${this.apiKey}&region=fr`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('❌ Erreur de géocodage:', data.status, data.error_message);
        throw new Error('Impossible de valider l\'adresse. Veuillez vérifier et réessayer.');
      }

      if (!data.results || data.results.length === 0) {
        throw new Error('Aucun résultat trouvé pour cette adresse');
      }

      const result = data.results[0];
      const { lat, lng } = result.geometry.location;
      
      return {
        coordinates: {
          latitude: lat,
          longitude: lng
        },
        formattedAddress: result.formatted_address
      };
    } catch (error) {
      console.error('❌ Erreur lors de la validation de l\'adresse:', error);
      throw error;
    }
  }

  toGeoPoint(coordinates: { latitude: number; longitude: number }): GeoPoint {
    return new GeoPoint(coordinates.latitude, coordinates.longitude);
  }
}

export const geocodingService = new GeocodingService();
