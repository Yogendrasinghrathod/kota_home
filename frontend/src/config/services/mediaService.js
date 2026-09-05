import api from "../axios.js";

export const getMediaByProperty = async (propertyId) => {
  const response = await api.get(
    `/properties/${propertyId}/media`
  );

  return response.data;
};

export const createMedia = async (propertyId, mediaData) => {
  const response = await api.post(
    `/properties/${propertyId}/media`,
    mediaData
  );

  return response.data;
};