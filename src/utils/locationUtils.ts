import * as geofireCommon from 'geofire-common';
import { Location } from '../types/post';

export const calculateGeohash = (latitude: number, longitude: number): string => {
  return geofireCommon.geohashForLocation([latitude, longitude]);
};

export const calculateDistance = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number => {
  return geofireCommon.distanceBetween(
    [from.latitude, from.longitude],
    [to.latitude, to.longitude]
  );
};

export const createGeopoint = (latitude: number, longitude: number) => {
  const geohash = calculateGeohash(latitude, longitude);
  return {
    geohash,
    geopoint: { latitude, longitude }
  };
};

export const isValidLocation = (location: Location): boolean => {
  return !!(
    location?.coordinates?.latitude &&
    location?.coordinates?.longitude &&
    !isNaN(location.coordinates.latitude) &&
    !isNaN(location.coordinates.longitude)
  );
};
