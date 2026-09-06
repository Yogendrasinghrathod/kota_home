import api from "../axios.js";
import { cacheKeys, cachedGet, invalidateCache, setCache } from "../queryCache.js";

export const getLocationByProperty = (propertyId) =>
  cachedGet(cacheKeys.location(propertyId), async () => {
    try {
      const response = await api.get(`/properties/${propertyId}/location`);
      return response.data;
    } catch {
      return { location: null };
    }
  });

export const saveLocation = async (propertyId, locationData) => {
  const response = await api.post(
    `/properties/${propertyId}/location`,
    locationData
  );
  setCache(cacheKeys.location(propertyId), {
    location: response.data.location || locationData,
  });
  invalidateCache(
    cacheKeys.property(propertyId),
    cacheKeys.properties(),
    cacheKeys.feed()
  );
  return response.data;
};

export const searchPlaces = async (query) => {
  const response = await api.post("/geocode/search", { query });
  return response.data;
};

export const reverseGeocode = async (latitude, longitude) => {
  const response = await api.post("/geocode/reverse", {
    latitude,
    longitude,
  });
  return response.data;
};
