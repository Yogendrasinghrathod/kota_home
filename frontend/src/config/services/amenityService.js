import api from "../axios.js";
import { cacheKeys, cachedGet, invalidateCache } from "../queryCache.js";

export const getAmenities = () =>
  cachedGet(cacheKeys.amenities(), async () => {
    const response = await api.get("/amenities");
    return response.data;
  });

export const createAmenity = async (name) => {
  const response = await api.post("/amenities", { name });
  invalidateCache(cacheKeys.amenities());
  return response.data;
};
