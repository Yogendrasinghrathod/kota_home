import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getRoomById } from "../config/services/roomService.js";
import { getRoomAmenities } from "../config/services/roomAmenityService.js";
import { getMediaByProperty } from "../config/services/mediaService.js";

const RoomDetails = () => {
    const { propertyId, roomId } = useParams();

    const [room, setRoom] = useState(null);
    const [amenities, setAmenities] = useState([]);
    const [image, setImage] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                // Room
                const roomData = await getRoomById(propertyId, roomId);
                setRoom(roomData.room);

                // Room Amenities
                try {
                    const amenityData = await getRoomAmenities(roomId);
                    setAmenities(amenityData.amenities || []);
                } catch (error) {
                    console.error(
                        "ROOM AMENITIES ERROR:",
                        error.response?.data || error.message
                    );
                    setAmenities([]);
                }

                // Property Media
                try {
                    const mediaData = await getMediaByProperty(propertyId);

                    const primaryImage =
                        mediaData.media?.find(
                            (item) =>
                                item.isPrimary && item.type === "IMAGE"
                        ) ||
                        mediaData.media?.find(
                            (item) => item.type === "IMAGE"
                        );

                    setImage(primaryImage?.url || null);
                } catch (error) {
                    console.error(
                        "ROOM IMAGE ERROR:",
                        error.response?.data || error.message
                    );
                }
            } catch (error) {
                console.error(
                    "ROOM DETAILS ERROR:",
                    error.response?.data || error.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRoomDetails();
    }, [propertyId, roomId]);

    const getRoomTitle = (sharing) => {
        if (sharing === 1) return "Single Sharing Room";
        if (sharing === 2) return "Double Sharing Room";
        if (sharing === 3) return "Triple Sharing Room";

        return `${sharing} Sharing Room`;
    };

    const getAmenityIcon = (name = "") => {
        const value = name.toLowerCase();

        if (value.includes("wifi")) return "⌁";
        if (value.includes("ac") || value.includes("air")) return "❄";
        if (value.includes("laundry")) return "♨";
        if (value.includes("parking")) return "P";
        if (value.includes("power")) return "⚡";
        if (value.includes("bed")) return "🛏";
        if (value.includes("food")) return "🍽";
        if (value.includes("water")) return "💧";

        return "✓";
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">
                    Loading room...
                </p>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
                <p className="text-sm text-red-500">
                    Room not found
                </p>

                <Link
                    to={`/properties/${propertyId}/rooms`}
                    className="mt-3 text-sm font-medium text-violet-600"
                >
                    Back to Rooms
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* HEADER */}
            <header className="bg-white border-b border-gray-100">
                <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">

                    <Link
                        to={`/properties/${propertyId}/rooms/`}
                        className="flex h-9 w-9 items-center  justify-center rounded-full text-xl text-gray-700 hover:bg-gray-100"
                    >
                        ←
                    </Link>

                    <h1 className="text-sm font-semibold text-gray-900">
                        Room Details
                    </h1>

                </div>
            </header>

            <main className="mx-auto w-full max-w-2xl pb-8">

                {/* ROOM IMAGE */}
                <div className="relative h-64 w-full overflow-hidden bg-gray-200">

                    {image ? (
                        <img
                            src={image}
                            alt={getRoomTitle(room.sharing)}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <span className="text-6xl">
                                🛏️
                            </span>
                        </div>
                    )}

                    <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                        1/1
                    </span>
                  

                </div>

                {/* ROOM NAME + PRICE */}
                <section className="rounded-b-2xl bg-white px-5 py-4">

                    <h2 className="text-xl font-bold text-gray-900">
                        {getRoomTitle(room.sharing)}
                    </h2>

                    <p className="mt-1 text-lg font-bold text-violet-600">
                        ₹{Number(room.price).toLocaleString("en-IN")}
                        <span className="text-sm font-medium">
                            {" "} / month
                        </span>
                    </p>
                    <Link
                        to={`/properties/${propertyId}/rooms/photos`}
                        className="text-sm font-medium text-violet-600"
                    >
                        View Photos
                    </Link>

                </section>

                {/* OVERVIEW */}
                <section className="mt-4 px-4">

                    <div className="grid grid-cols-3 gap-2">

                        {/* Sharing */}
                        <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">

                            <p className="text-[10px] text-gray-500">
                                Sharing Type
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {room.sharing} Sharing
                            </p>

                        </div>

                        {/* Total Rooms */}
                        <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">

                            <p className="text-[10px] text-gray-500">
                                Total Rooms
                            </p>

                            <p className="mt-1 text-lg font-bold text-gray-900">
                                {room.availability}
                            </p>

                        </div>

                        {/* Available */}
                        <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">

                            <p className="text-[10px] text-gray-500">
                                Available
                            </p>

                            <p className="mt-1 text-lg font-bold text-green-600">
                                {room.availability}
                            </p>

                        </div>

                    </div>

                </section>

                {/* AMENITIES */}
                <section className="mt-5 px-5">

                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                        Amenities
                    </h3>

                    {amenities.length === 0 ? (
                        <p className="text-sm text-gray-400">
                            No amenities added yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-4 gap-4">

                            {amenities.map((amenity) => (
                                <div
                                    key={amenity._id}
                                    className="flex flex-col items-center"
                                >

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 bg-white text-lg shadow-sm">
                                        {getAmenityIcon(amenity.name)}
                                    </div>

                                    <span className="mt-1.5 text-center text-[10px] font-medium text-gray-600">
                                        {amenity.name}
                                    </span>

                                </div>
                            ))}

                        </div>
                    )}

                </section>

                {/* DESCRIPTION */}
                <section className="mt-5 px-5">

                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                        Description
                    </h3>

                    <p className="text-sm leading-5 text-gray-500">
                        Spacious {room.sharing}-sharing rooms with all
                        facilities. Great environment for study.
                    </p>

                </section>

            </main>
        </div>
    );
};

export default RoomDetails;