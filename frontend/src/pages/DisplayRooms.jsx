import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getRoomsByProperty } from "../config/services/roomService.js";
import { getMediaByProperty } from "../config/services/mediaService.js";
import RoomCard from "../components/RoomCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const DisplayRooms = () => {
    const { propertyId } = useParams();
    const { user } = useAuth();
    const isOwner = user?.role === "OWNER" || user?.role === "ADMIN";

    const [rooms, setRooms] = useState([]);
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [roomsResult, mediaResult] = await Promise.allSettled([
                    getRoomsByProperty(propertyId),
                    getMediaByProperty(propertyId),
                ]);

                if (cancelled) return;

                if (roomsResult.status === "fulfilled") {
                    setRooms(roomsResult.value.rooms || []);
                } else {
                    console.error(
                        "ROOMS ERROR:",
                        roomsResult.reason?.response?.data ||
                            roomsResult.reason?.message
                    );
                }

                if (mediaResult.status === "fulfilled") {
                    setMedia(mediaResult.value.media || []);
                } else {
                    console.error(
                        "MEDIA ERROR:",
                        mediaResult.reason?.response?.data ||
                            mediaResult.reason?.message
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [propertyId]);

    const { imageByRoom, primaryImage } = useMemo(() => {
        const imageByRoom = new Map();
        let primaryImage = null;

        for (const item of media) {
            if (item.type !== "IMAGE") continue;
            if (!primaryImage && item.isPrimary) primaryImage = item;
            if (item.room) {
                const key = String(item.room);
                if (!imageByRoom.has(key)) imageByRoom.set(key, item);
            }
        }

        if (!primaryImage) {
            primaryImage = media.find((item) => item.type === "IMAGE") || null;
        }

        return { imageByRoom, primaryImage };
    }, [media]);

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

                    {isOwner && (
                        <Link
                            to={`/properties/${propertyId}/rooms/add`}
                            className="ml-auto rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                            + Add Room
                        </Link>
                    )}

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

                        {rooms.map((room) => {
                            const roomImage =
                                imageByRoom.get(String(room._id)) || primaryImage;

                            return (
                            <RoomCard
                                key={room._id}
                                room={room}
                                image={roomImage?.url}
                            />
                            );
                        })}

                    </div>
                )}

            </main>
        </div>
    );
};

export default DisplayRooms;