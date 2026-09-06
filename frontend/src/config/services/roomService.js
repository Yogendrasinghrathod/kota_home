import api from "../axios.js";
import { cacheKeys, cachedGet, invalidateCache, setCache } from "../queryCache.js";

export const getRoomsByProperty = (propertyId) =>
  cachedGet(cacheKeys.rooms(propertyId), async () => {
    const response = await api.get(`/properties/${propertyId}/rooms`);
    return response.data;
  });

export const getRoomById = (propertyId, roomId) =>
  cachedGet(cacheKeys.room(propertyId, roomId), async () => {
    const response = await api.get(
      `/properties/${propertyId}/rooms/${roomId}`
    );
    return response.data;
  });

export const createRoom = async (propertyId, roomData) => {
  const response = await api.post(
    `/properties/${propertyId}/rooms`,
    roomData
  );
  invalidateCache(
    cacheKeys.rooms(propertyId),
    cacheKeys.property(propertyId),
    cacheKeys.properties(),
    cacheKeys.feed()
  );
  if (response.data?.room?._id) {
    setCache(cacheKeys.room(propertyId, response.data.room._id), {
      room: response.data.room,
    });
  }
  return response.data;
};
