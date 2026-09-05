import api from "../axios.js";

export const getProperties = async () => {
  const response = await api.get("/properties");

  return response.data;
};

export const getStudentFeed = async () => {
  const response = await api.get("/properties/feed");

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

export const updatePropertyStatus = async (propertyId, status) => {
  const response = await api.patch(`/properties/${propertyId}/status`, {
    status,
  });

  return response.data;
};

export const deleteProperty = async (propertyId) => {
  const response = await api.delete(`/properties/${propertyId}`);
  return response.data;
};