import api from "../axios.js";
import { cacheKeys, cachedGet } from "../queryCache.js";

export const getReviewsByProperty = (propertyId) =>
  cachedGet(cacheKeys.reviews(propertyId), async () => {
    const response = await api.get(`/properties/${propertyId}/reviews`);
    return response.data;
  });

export const getOwnerReviews = () =>
  cachedGet(cacheKeys.ownerReviews(), async () => {
    const response = await api.get("/reviews/mine");
    return response.data;
  });
