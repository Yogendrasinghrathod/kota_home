import api from "../axios.js";

export const getRoomAmenities = async (roomId) => {
    const response = await api.get(
        `/rooms/${roomId}/amenities`
    );

    return response.data;
};

export const addAmenityToRoom = async (roomId, amenityId) => {
    const response = await api.post(
        `/rooms/${roomId}/amenities`,
        { amenityId }
    );

    return response.data;
};