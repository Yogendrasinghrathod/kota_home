import api from "../axios.js";
import { cacheKeys, cachedGet, invalidateCache } from "../queryCache.js";

export const getRoomAmenities = (roomId) =>
  cachedGet(cacheKeys.roomAmenities(roomId), async () => {
    const response = await api.get(`/rooms/${roomId}/amenities`);
    return response.data;
  });

export const addAmenityToRoom = async (roomId, amenityId) => {
  const response = await api.post(`/rooms/${roomId}/amenities`, { amenityId });
  invalidateCache(cacheKeys.roomAmenities(roomId));
  return response.data;
};
