import api from "../axios.js";

export const getLocationByProperty = async (propertyId) => {
    const response = await api.get(
        `/properties/${propertyId}/location`
    );

    return response.data;
};

export const saveLocation = async (propertyId, locationData) => {
    const response = await api.post(
        `/properties/${propertyId}/location`,
        locationData
    );

    return response.data;
};

export const searchPlaces = async (query) => {
    const response = await api.post("/geocode/search", { query });
    return response.data;
};

export const reverseGeocode = async (latitude, longitude) => {
    const response = await api.post("/geocode/reverse", {
        latitude,
        longitude,
    });
    return response.data;
};