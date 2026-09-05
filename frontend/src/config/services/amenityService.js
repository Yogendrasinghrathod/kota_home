import api from "../axios.js";

export const getAmenities = async () => {
  const response = await api.get("/amenities");
  return response.data;
};

export const createAmenity = async (name) => {
  const response = await api.post("/amenities", { name });
  return response.data;
};
