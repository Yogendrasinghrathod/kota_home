import api from "../axios.js";
import {
  cacheKeys,
  cachedGet,
  invalidateCache,
  invalidateProperty,
  setCache,
} from "../queryCache.js";

export const getProperties = () =>
  cachedGet(cacheKeys.properties(), async () => {
    const response = await api.get("/properties");
    return response.data;
  });

export const getStudentFeed = () =>
  cachedGet(cacheKeys.feed(), async () => {
    const response = await api.get("/properties/feed");
    return response.data;
  });

export const getPropertyById = (propertyId) =>
  cachedGet(cacheKeys.property(propertyId), async () => {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data;
  });

export const createProperty = async (propertyData) => {
  const response = await api.post("/properties", propertyData);
  invalidateCache(cacheKeys.properties(), cacheKeys.feed());
  if (response.data?.property?._id) {
    setCache(cacheKeys.property(response.data.property._id), {
      property: response.data.property,
    });
  }
  return response.data;
};

export const updatePropertyStatus = async (propertyId, status) => {
  const response = await api.patch(`/properties/${propertyId}/status`, {
    status,
  });
  if (response.data?.property) {
    setCache(cacheKeys.property(propertyId), {
      property: response.data.property,
    });
  }
  invalidateCache(cacheKeys.properties(), cacheKeys.feed());
  return response.data;
};

export const deleteProperty = async (propertyId) => {
  const response = await api.delete(`/properties/${propertyId}`);
  invalidateProperty(propertyId);
  return response.data;
};
