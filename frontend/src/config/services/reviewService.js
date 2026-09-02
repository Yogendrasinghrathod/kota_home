import api from "../axios.js";

export const getReviewsByProperty = async (propertyId) => {
    const response = await api.get(
        `/properties/${propertyId}/reviews`
    );

    return response.data;
};