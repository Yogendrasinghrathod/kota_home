import api from "../axios.js";
import { cacheKeys, cachedGet, invalidateCache } from "../queryCache.js";

export const getMediaByProperty = (propertyId) =>
  cachedGet(cacheKeys.media(propertyId), async () => {
    const response = await api.get(`/properties/${propertyId}/media`);
    return response.data;
  });

export const createMedia = async (propertyId, mediaData) => {
  const response = await api.post(
    `/properties/${propertyId}/media`,
    mediaData
  );
  invalidateCache(
    cacheKeys.media(propertyId),
    cacheKeys.property(propertyId),
    cacheKeys.properties(),
    cacheKeys.feed()
  );
  return response.data;
};
