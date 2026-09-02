import api from "../axios.js";

export const getRoomAmenities = async (roomId) => {
    const response = await api.get(
        `/rooms/${roomId}/amenities`
    );

    return response.data;
};