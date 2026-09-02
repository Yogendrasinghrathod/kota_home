import api from "../axios.js";

export const getProperties = async () => {
  const response = await api.get("/properties");

  return response.data;
};

export const getPropertyById = async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}`);

  return response.data;
};

export const createProperty = async (propertyData) => {
  const response = await api.post("/properties", propertyData);

  return response.data;
};