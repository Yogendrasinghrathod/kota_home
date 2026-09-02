import api from "../axios.js";

export const getLocationByProperty = async (propertyId) => {
    const response = await api.get(
        `/properties/${propertyId}/location`
    );

    return response.data;
};