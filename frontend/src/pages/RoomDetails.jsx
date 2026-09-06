import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getRoomById } from "../config/services/roomService.js";
import { getRoomAmenities, addAmenityToRoom } from "../config/services/roomAmenityService.js";
import { getAmenities, createAmenity } from "../config/services/amenityService.js";
import { createMedia, getMediaByProperty } from "../config/services/mediaService.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { getPropertyById } from "../config/services/propertyService.js";
import { cacheKeys, peekCache } from "../config/queryCache.js";
import { useAuth } from "../context/AuthContext.jsx";
import ContactOwnerButton from "../components/ContactOwnerButton.jsx";
import OptimizedImage from "../components/OptimizedImage.jsx";

const RoomDetails = () => {
    const { user } = useAuth();
    const { propertyId, roomId } = useParams();

    const [room, setRoom] = useState(
        () => peekCache(cacheKeys.room(propertyId, roomId))?.room ?? null
    );
    const [property, setProperty] = useState(
        () => peekCache(cacheKeys.property(propertyId))?.property ?? null
    );
    const [amenities, setAmenities] = useState(
        () => peekCache(cacheKeys.roomAmenities(roomId))?.amenities || []
    );
    const [allAmenities, setAllAmenities] = useState(
        () => peekCache(cacheKeys.amenities())?.amenities || []
    );
    const [newAmenity, setNewAmenity] = useState("");
    const [roomMedia, setRoomMedia] = useState([]);
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [ownerError, setOwnerError] = useState("");

    const [loading, setLoading] = useState(
        () => !peekCache(cacheKeys.room(propertyId, roomId))?.room
    );

    useEffect(() => {
        let cancelled = false;
        const cachedRoom = peekCache(cacheKeys.room(propertyId, roomId));
        const cachedProperty = peekCache(cacheKeys.property(propertyId));
        const cachedAmenities = peekCache(cacheKeys.roomAmenities(roomId));
        const cachedCatalog = peekCache(cacheKeys.amenities());
        const cachedMedia = peekCache(cacheKeys.media(propertyId));

        if (cachedRoom?.room) {
            setRoom(cachedRoom.room);
            setLoading(false);
        } else {
            setLoading(true);
        }
        if (cachedProperty?.property) setProperty(cachedProperty.property);
        if (cachedAmenities?.amenities) setAmenities(cachedAmenities.amenities);
        if (cachedCatalog?.amenities) setAllAmenities(cachedCatalog.amenities);
        if (cachedMedia?.media) {
            const items = cachedMedia.media;
            const forRoom = items.filter(
                (item) => String(item.room) === String(roomId)
            );
            setRoomMedia(forRoom);
            const roomImage =
                forRoom.find((item) => item.type === "IMAGE") ||
                items.find((item) => item.isPrimary && item.type === "IMAGE") ||
                items.find((item) => item.type === "IMAGE");
            setImage(roomImage?.url || null);
        }

        const fetchRoomDetails = async () => {
            try {
                const extrasPromise = Promise.allSettled([
                    getPropertyById(propertyId),
                    getRoomAmenities(roomId),
                    getMediaByProperty(propertyId),
                    getAmenities(),
                ]);

                const roomData = await getRoomById(propertyId, roomId);
                if (cancelled) return;
                setRoom(roomData.room);
                setLoading(false);

                const [propertyResult, amenityResult, mediaResult, catalogResult] =
                    await extrasPromise;

                if (cancelled) return;

                if (propertyResult.status === "fulfilled") {
                    setProperty(propertyResult.value.property);
                } else {
                    console.error(
                        "PROPERTY ERROR:",
                        propertyResult.reason?.response?.data ||
                            propertyResult.reason?.message
                    );
                }

                if (amenityResult.status === "fulfilled") {
                    setAmenities(amenityResult.value.amenities || []);
                } else {
                    console.error(
                        "ROOM AMENITIES ERROR:",
                        amenityResult.reason?.response?.data ||
                            amenityResult.reason?.message
                    );
                    setAmenities([]);
                }

                if (mediaResult.status === "fulfilled") {
                    const items = mediaResult.value.media || [];
                    const forRoom = items.filter(
                        (item) => String(item.room) === String(roomId)
                    );
                    setRoomMedia(forRoom);

                    const roomImage =
                        forRoom.find((item) => item.type === "IMAGE") ||
                        items.find(
                            (item) =>
                                item.isPrimary && item.type === "IMAGE"
                        ) ||
                        items.find((item) => item.type === "IMAGE");

                    setImage(roomImage?.url || null);
                } else {
                    console.error(
                        "ROOM IMAGE ERROR:",
                        mediaResult.reason?.response?.data ||
                            mediaResult.reason?.message
                    );
                }

                if (catalogResult.status === "fulfilled") {
                    setAllAmenities(catalogResult.value.amenities || []);
                } else {
                    setAllAmenities([]);
                }
            } catch (error) {
                console.error(
                    "ROOM DETAILS ERROR:",
                    error.response?.data || error.message
                );
                if (!cancelled) setLoading(false);
            }
        };

        fetchRoomDetails();

        return () => {
            cancelled = true;
        };
    }, [propertyId, roomId]);

    const getRoomTitle = (sharing) => {
        if (sharing === 1) return "Single Sharing Room";
        if (sharing === 2) return "Double Sharing Room";
        if (sharing === 3) return "Triple Sharing Room";

        return `${sharing} Sharing Room`;
    };

    const isOwner =
        user?.role === "OWNER" &&
        (property?.owner?.firebaseUid === user?.firebaseUid ||
            property?.owner?.firebaseUid === user?.uid);

    const assignedIds = new Set(amenities.map((item) => item._id));

    const refreshRoomExtras = async () => {
        const [amenityData, mediaData] = await Promise.all([
            getRoomAmenities(roomId),
            getMediaByProperty(propertyId),
        ]);
        setAmenities(amenityData.amenities || []);
        const items = mediaData.media || [];
        const forRoom = items.filter(
            (item) => String(item.room) === String(roomId)
        );
        setRoomMedia(forRoom);
        const roomImage =
            forRoom.find((item) => item.type === "IMAGE") ||
            items.find((item) => item.type === "IMAGE");
        setImage(roomImage?.url || null);
    };

    const handleAddAmenity = async (amenityId) => {
        try {
            setOwnerError("");
            await addAmenityToRoom(roomId, amenityId);
            await refreshRoomExtras();
        } catch (err) {
            setOwnerError(err.response?.data?.message || "Failed to add amenity");
        }
    };

    const handleCreateAmenity = async () => {
        const name = newAmenity.trim();
        if (!name) return;
        try {
            setOwnerError("");
            const data = await createAmenity(name);
            setAllAmenities((current) => [...current, data.amenity]);
            await addAmenityToRoom(roomId, data.amenity._id);
            setNewAmenity("");
            await refreshRoomExtras();
        } catch (err) {
            setOwnerError(err.response?.data?.message || "Failed to create amenity");
        }
    };

    const handleFiles = async (event) => {
        const files = [...(event.target.files || [])];
        event.target.value = "";
        if (files.length === 0) return;
        try {
            setUploading(true);
            setOwnerError("");
            for (const file of files) {
                const uploaded = await uploadToCloudinary(file);
                await createMedia(propertyId, {
                    roomId,
                    type: uploaded.type,
                    url: uploaded.url,
                    publicId: uploaded.publicId,
                    resourceType: uploaded.resourceType,
                });
            }
            await refreshRoomExtras();
        } catch (err) {
            setOwnerError(err.response?.data?.message || err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
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

            <main className="mx-auto w-full max-w-2xl pb-28">

                {/* ROOM IMAGE */}
                <div className="relative h-64 w-full overflow-hidden bg-gray-200">

                    {image ? (
                        <OptimizedImage
                            src={image}
                            alt={getRoomTitle(room.sharing)}
                            width={900}
                            eager
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

                {isOwner && (
                    <section className="mt-5 px-5">
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">
                            Manage room
                        </h3>
                        <p className="text-xs text-gray-500">Tap to add amenities</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {allAmenities.map((amenity) => {
                                const assigned = assignedIds.has(amenity._id);
                                return (
                                    <button
                                        key={amenity._id}
                                        type="button"
                                        disabled={assigned}
                                        onClick={() => handleAddAmenity(amenity._id)}
                                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                            assigned
                                                ? "bg-violet-600 text-white"
                                                : "bg-white text-gray-700 shadow-sm"
                                        }`}
                                    >
                                        {amenity.name}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-3 flex gap-2">
                            <input
                                value={newAmenity}
                                onChange={(event) => setNewAmenity(event.target.value)}
                                placeholder="Custom amenity"
                                className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleCreateAmenity}
                                className="rounded-xl bg-gray-900 px-3 text-xs font-semibold text-white"
                            >
                                Add
                            </button>
                        </div>

                        <label className="mt-4 flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-violet-200 bg-violet-50">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                                onChange={handleFiles}
                                disabled={uploading}
                            />
                            <p className="text-xs font-medium text-violet-700">
                                {uploading ? "Uploading..." : "Upload room photos / videos"}
                            </p>
                        </label>
                        {roomMedia.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {roomMedia.map((item) => (
                                    <div key={item._id} className="overflow-hidden rounded-lg bg-gray-100">
                                        {item.type === "VIDEO" ? (
                                            <video src={item.url} preload="none" className="h-20 w-full object-cover" />
                                        ) : (
                                            <OptimizedImage
                                                src={item.url}
                                                alt=""
                                                width={240}
                                                className="h-20 w-full object-cover"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {ownerError && (
                            <p className="mt-2 text-xs text-red-500">{ownerError}</p>
                        )}
                    </section>
                )}

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

            {user?.role === "STUDENT" && (
                <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-4 py-3">
                    <div className="mx-auto w-full max-w-2xl">
                        <ContactOwnerButton
                            phone={property?.owner?.phone}
                            ownerName={property?.owner?.name}
                            propertyName={property?.name}
                            roomLabel={getRoomTitle(room.sharing)}
                            available={Number(room.availability) > 0}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomDetails;