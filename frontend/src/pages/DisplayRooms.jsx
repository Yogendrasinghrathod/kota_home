import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getRoomsByProperty } from "../config/services/roomService.js";
import { getMediaByProperty } from "../config/services/mediaService.js";
import RoomCard from "../components/RoomCard.jsx";

const DisplayRooms = () => {
    const { propertyId } = useParams();

    const [rooms, setRooms] = useState([]);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRoomsByProperty(propertyId);
                setRooms(data.rooms || []);
            } catch (error) {
                console.error(
                    "ROOMS ERROR:",
                    error.response?.data || error.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [propertyId]);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const data = await getMediaByProperty(propertyId);
                setMedia(data.media || []);
            } catch (error) {
                console.error(
                    "MEDIA ERROR:",
                    error.response?.data || error.message
                );
            }
        };

        fetchMedia();
    }, [propertyId]);

    const primaryImage =
        media.find(
            (item) => item.isPrimary && item.type === "IMAGE"
        ) ||
        media.find((item) => item.type === "IMAGE");

    return (
        <div className="min-h-screen bg-gray-50">

            {/* HEADER */}
            <header className="border-b border-gray-100 bg-white">
                <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">

                    <Link
                        to={`/properties/${propertyId}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-700 hover:bg-gray-100"
                    >
                        ←
                    </Link>

                    <h1 className="text-sm font-semibold text-gray-900">
                        Available Rooms
                    </h1>

                </div>
            </header>

            {/* ROOMS */}
            <main className="mx-auto w-full max-w-2xl px-4 py-4">

                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">
                        Rooms
                    </h2>

                    <span className="text-xs text-gray-500">
                        {rooms.length} rooms
                    </span>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500">
                        Loading rooms...
                    </p>
                ) : rooms.length === 0 ? (
                    <div className="rounded-xl bg-white p-5 text-center shadow-sm">
                        <p className="text-sm text-gray-500">
                            No rooms available.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">

                        {rooms.map((room) => (
                            <RoomCard
                                key={room._id}
                                room={room}
                                image={primaryImage?.url}
                            />
                        ))}

                    </div>
                )}

            </main>
        </div>
    );
};

export default DisplayRooms;