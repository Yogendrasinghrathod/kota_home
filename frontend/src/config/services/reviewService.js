import api from "../axios.js";

export const getReviewsByProperty = async (propertyId) => {
    const response = await api.get(
        `/properties/${propertyId}/reviews`
    );

    return response.data;
};

export const getOwnerReviews = async () => {
    const response = await api.get("/reviews/mine");
    return response.data;
};