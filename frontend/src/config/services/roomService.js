import api from "../axios.js";

export const getRoomsByProperty = async (propertyId) => {
  const response = await api.get(
    `/properties/${propertyId}/rooms`
  );

  return response.data;
};
export const getRoomById = async (propertyId, roomId) => {
  const response = await api.get(
    `/properties/${propertyId}/rooms/${roomId}`
  );

  return response.data;
};

export const createRoom = async (propertyId, roomData) => {
  const response = await api.post(
    `/properties/${propertyId}/rooms`,
    roomData
  );

  return response.data;
};