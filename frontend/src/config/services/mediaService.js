import api from "../axios.js";

export const getMediaByProperty = async (propertyId) => {
  const response = await api.get(
    `/properties/${propertyId}/media`
  );

  return response.data;
};