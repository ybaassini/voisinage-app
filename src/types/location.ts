/**
 * Interface pour les coordonnées géographiques
 * @interface Coordinates
 */
export interface Coordinates {
  /** Latitude en degrés décimaux */
  latitude: number;
  
  /** Longitude en degrés décimaux */
  longitude: number;
}

/**
 * Interface pour les données Geofire
 * @interface GeofireData
 */
export interface GeofireData {
  /** Hash géographique pour l'indexation */
  geohash: string;
  
  /** Point géographique avec latitude et longitude */
  geopoint: Coordinates;
}

/**
 * Interface complète pour la localisation
 * @interface Location
 */
export interface Location {
  /** Adresse textuelle */
  address: string;
  
  /** Coordonnées géographiques (optionnel) */
  coordinates?: Coordinates | null;
  
  /** Hash géographique simple (optionnel) */
  geohash?: string;
  
  /** Données Geofire complètes (optionnel) */
  g?: GeofireData;
}

/**
 * Type pour les options de recherche par localisation
 * @interface LocationSearchOptions
 */
export interface LocationSearchOptions {
  /** Localisation de référence pour la recherche */
  location: Location;
  
  /** Rayon de recherche en kilomètres */
  radiusInKm: number;
  
  /** Nombre maximum de résultats (optionnel) */
  limit?: number;
}
