import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getPropertyById, updatePropertyStatus, deleteProperty } from "../config/services/propertyService.js";
import { getRoomsByProperty } from "../config/services/roomService.js";
import { getMediaByProperty } from "../config/services/mediaService.js";
import { getRoomAmenities } from "../config/services/roomAmenityService.js";
import { getLocationByProperty } from "../config/services/locationService.js";
import { getReviewsByProperty } from "../config/services/reviewService.js";
import { useAuth } from "../context/AuthContext.jsx";
import ContactOwnerButton from "../components/ContactOwnerButton.jsx";
import PropertyMediaCarousel from "../components/PropertyMediaCarousel.jsx";

const PropertyMap = lazy(() => import("../components/PropertyMap.jsx"));

const PropertyDetails = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [media, setMedia] = useState([]);
    const [location, setLocation] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [roomAmenities, setRoomAmenities] = useState({});

    const [loading, setLoading] = useState(true);
    const [mediaLoading, setMediaLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const [locationLoading, setLocationLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setMediaLoading(true);
        setRoomsLoading(true);
        setLocationLoading(true);
        setReviewsLoading(true);
        setError("");
        setProperty((current) => (current == null ? current : null));
        setRooms((current) => (current.length === 0 ? current : []));
        setMedia((current) => (current.length === 0 ? current : []));
        setLocation((current) => (current == null ? current : null));
        setReviews((current) => (current.length === 0 ? current : []));
        setRoomAmenities((current) =>
            Object.keys(current).length === 0 ? current : {}
        );

        const load = async (request, onSuccess, onError) => {
            try {
                const data = await request();
                if (!cancelled) onSuccess(data);
            } catch (error) {
                if (!cancelled) onError(error);
            }
        };

        load(
            () => getPropertyById(id),
            (data) => {
                setProperty(data.property);
                setLoading(false);
            },
            (error) => {
                console.error("PROPERTY ERROR:", error);
                setError("Failed to load property");
                setLoading(false);
            }
        );

        load(
            () => getRoomsByProperty(id),
            (data) => {
                setRooms(data.rooms || []);
                setRoomsLoading(false);
            },
            (error) => {
                console.error(
                    "ROOM ERROR:",
                    error.response?.data || error.message
                );
                setRooms([]);
                setRoomsLoading(false);
            }
        );

        load(
            () => getMediaByProperty(id),
            (data) => {
                setMedia(data.media || []);
                setMediaLoading(false);
            },
            (error) => {
                console.error(
                    "MEDIA ERROR:",
                    error.response?.data || error.message
                );
                setMedia([]);
                setMediaLoading(false);
            }
        );

        load(
            () => getLocationByProperty(id),
            (data) => {
                setLocation(data.location);
                setLocationLoading(false);
            },
            () => {
                setLocation(null);
                setLocationLoading(false);
            }
        );

        load(
            () => getReviewsByProperty(id),
            (data) => {
                setReviews(data.reviews || []);
                setReviewsLoading(false);
            },
            (error) => {
                console.error(
                    "REVIEWS ERROR:",
                    error.response?.data || error.message
                );
                setReviews([]);
                setReviewsLoading(false);
            }
        );

        return () => {
            cancelled = true;
        };
    }, [id]);

    const roomIdsKey = useMemo(
        () => rooms.map((room) => room._id).join(","),
        [rooms]
    );

    useEffect(() => {
        if (!roomIdsKey) return undefined;

        let cancelled = false;
        const ids = roomIdsKey.split(",");

        const fetchAmenities = async () => {
            const entries = await Promise.all(
                ids.map(async (roomId) => {
                    try {
                        const data = await getRoomAmenities(roomId);
                        return [roomId, data.amenities || []];
                    } catch (error) {
                        console.error(
                            `AMENITY ERROR ${roomId}:`,
                            error.response?.data || error.message
                        );
                        return [roomId, []];
                    }
                })
            );

            if (!cancelled) {
                setRoomAmenities(Object.fromEntries(entries));
            }
        };

        fetchAmenities();

        return () => {
            cancelled = true;
        };
    }, [roomIdsKey]);

    // =========================
    // DERIVED DATA
    // =========================

    const roomTypes = useMemo(() => {
        return new Set(rooms.map((room) => room.sharing)).size;
    }, [rooms]);

    const totalRooms = useMemo(() => {
        return rooms.reduce(
            (sum, room) => sum + Number(room.availability || 0),
            0
        );
    }, [rooms]);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;

        const total = reviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
        );

        return (total / reviews.length).toFixed(1);
    }, [reviews]);

    // Collect unique amenities from rooms
    const propertyAmenities = useMemo(() => {
        const uniqueAmenities = new Map();

        Object.values(roomAmenities).forEach((amenities) => {
            amenities.forEach((amenity) => {
                if (amenity?._id) {
                    uniqueAmenities.set(amenity._id, amenity);
                }
            });
        });

        return Array.from(uniqueAmenities.values()).slice(0, 5);
    }, [roomAmenities]);

    const ownerId = property?.owner?._id || property?.owner;
    const isOwner =
        !!user &&
        (String(ownerId) === String(user._id) ||
            property?.owner?.firebaseUid === user.firebaseUid);

    const backTo = user?.role === "STUDENT" ? "/dashboard" : "/properties";

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">
                    Loading property...
                </p>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error || !property) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5">
                <p className="text-sm text-red-500">
                    {error || "Property not found"}
                </p>

                <Link
                    to={backTo}
                    className="mt-4 text-sm font-medium text-violet-600"
                >
                    {user?.role === "STUDENT" ? "Back to Home" : "Back to Properties"}
                </Link>
            </div>
        );
    }

    // =========================
    // UI
    // =========================

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ================= HEADER ================= */}

            <header className="border-b border-gray-100 bg-white">
                <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">

                    <div className="flex items-center gap-3">

                        <Link
                            to={backTo}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-800 transition hover:bg-gray-100"
                        >
                            ←
                        </Link>

                        <h1 className="text-lg font-semibold text-gray-900">
                            Property Details
                        </h1>

                    </div>

                    {isOwner ? (
                        <div className="flex items-center gap-2">
                        <Link
                            to={`/properties/${property._id}/media`}
                            className="rounded-full bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700"
                        >
                            + Media
                        </Link>
                        <button
                            type="button"
                            disabled={deleting}
                            onClick={async () => {
                                const confirmed = window.confirm(
                                    "Delete this property and all its rooms, media, and reviews?"
                                );
                                if (!confirmed) return;
                                try {
                                    setDeleting(true);
                                    await deleteProperty(property._id);
                                    navigate("/properties");
                                } catch (err) {
                                    console.error(err);
                                    window.alert(
                                        err.response?.data?.message ||
                                            "Failed to delete property"
                                    );
                                } finally {
                                    setDeleting(false);
                                }
                            }}
                            className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-60"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                        </div>
                    ) : (
                        <span className="h-9 w-9" />
                    )}

                </div>
            </header>

            {/* ================= MAIN ================= */}

            <main className="mx-auto w-full max-w-2xl px-4 pb-8 pt-4">

                {/* ================= HERO IMAGE ================= */}

                {mediaLoading ? (
                    <div className="flex h-60 items-center justify-center rounded-2xl bg-gray-200">
                        <p className="text-sm text-gray-500">
                            Loading image...
                        </p>
                    </div>
                ) : (
                    <PropertyMediaCarousel
                        media={media}
                        alt={property.name}
                    />
                )}

                {/* ================= PROPERTY INFO ================= */}

                <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">

                    <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                            <h2 className="text-xl font-bold text-gray-900">
                                {property.name}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {property.type}
                            </p>

                        </div>

                        {isOwner ? (
                            <button
                                type="button"
                                onClick={async () => {
                                    const nextStatus =
                                        property.status === "ACTIVE"
                                            ? "INACTIVE"
                                            : "ACTIVE";
                                    try {
                                        const data = await updatePropertyStatus(
                                            property._id,
                                            nextStatus
                                        );
                                        setProperty(data.property);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold ${
                                    property.status === "ACTIVE"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                                {property.status}
                            </button>
                        ) : (
                            <span
                                className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold ${
                                    property.status === "ACTIVE"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                                {property.status}
                            </span>
                        )}

                    </div>

                    {/* Location */}

                    <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">

                        <span>⌖</span>

                        <span>
                            {location?.area ||
                                property.area ||
                                "Kota"}
                        </span>

                    </p>

                    {/* Description */}

                    {property.description && (
                        <p className="mt-3 text-sm leading-5 text-gray-500">
                            {property.description}
                        </p>
                    )}

                    {user?.role === "STUDENT" && (
                        <div className="mt-4">
                            <ContactOwnerButton
                                phone={property.owner?.phone}
                                ownerName={property.owner?.name}
                                propertyName={property.name}
                                available={totalRooms > 0}
                            />
                        </div>
                    )}

                </section>

                {/* ================= OVERVIEW ================= */}

                <section className="mt-4">

                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                        Overview
                    </h3>

                    <div className="grid grid-cols-3 gap-2">

                        {/* Rooms */}

                        <div className="rounded-xl border border-gray-100 bg-white px-2 py-4 text-center shadow-sm">

                            <p className="text-lg font-bold text-gray-900">
                                {roomsLoading ? "—" : totalRooms}
                            </p>

                            <p className="mt-1 text-[10px] text-gray-500">
                                Rooms
                            </p>

                        </div>

                        {/* Room Types */}

                        <div className="rounded-xl border border-gray-100 bg-white px-2 py-4 text-center shadow-sm">

                            <p className="text-lg font-bold text-gray-900">
                                {roomsLoading ? "—" : roomTypes}
                            </p>

                            <p className="mt-1 text-[10px] text-gray-500">
                                Room Types
                            </p>

                        </div>

                        {/* Rating */}

                        <div className="rounded-xl border border-gray-100 bg-white px-2 py-4 text-center shadow-sm">

                            <div className="flex items-center justify-center gap-1">

                                <p className="text-lg font-bold text-gray-900">
                                    {reviewsLoading
                                        ? "—"
                                        : averageRating || "0.0"}
                                </p>

                                {!reviewsLoading && reviews.length > 0 && (
                                    <span className="text-sm text-yellow-500">
                                        ★
                                    </span>
                                )}

                            </div>

                            <p className="mt-1 text-[10px] text-gray-500">
                                {reviews.length}{" "}
                                {reviews.length === 1
                                    ? "Review"
                                    : "Reviews"}
                            </p>

                        </div>

                    </div>

                </section>

                {/* ================= AMENITIES ================= */}

                <section className="mt-5">

                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                        Amenities
                    </h3>

                    {propertyAmenities.length === 0 ? (
                        <p className="text-sm text-gray-400">
                            No amenities added yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-5 gap-2">

                            {propertyAmenities.map((amenity) => (
                                <div
                                    key={amenity._id}
                                    className="flex min-w-0 flex-col items-center"
                                >

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 bg-white text-lg shadow-sm">
                                        {getAmenityIcon(amenity.name)}
                                    </div>

                                    <span className="mt-1.5 w-full truncate text-center text-[9px] font-medium text-gray-600">
                                        {amenity.name}
                                    </span>

                                </div>
                            ))}

                        </div>
                    )}

                </section>

                {/* ================= LOCATION ================= */}
                <section className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Location
                    </h3>
                    {isOwner && (
                        <Link
                            to={`/properties/${property._id}/location`}
                            className="text-xs font-medium text-violet-600"
                        >
                            {location ? "Edit" : "Add location"}
                        </Link>
                    )}
                    </div>

                    {locationLoading ? (
                        <p className="text-sm text-gray-400">Loading map...</p>
                    ) : location ? (
                        <>
                            {location.address && (
                                <p className="mb-2 text-sm text-gray-500">
                                    {location.address}
                                </p>
                            )}
                            <Suspense
                                fallback={
                                    <div className="mt-4 flex h-64 items-center justify-center rounded-xl bg-gray-100">
                                        <p className="text-sm text-gray-500">
                                            Loading map...
                                        </p>
                                    </div>
                                }
                            >
                                <PropertyMap
                                    latitude={location.latitude}
                                    longitude={location.longitude}
                                    propertyName={property.name}
                                />
                            </Suspense>
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">
                            Location not added yet.
                        </p>
                    )}
                </section>

                {/* ================= REVIEWS ================= */}
                <section className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Reviews
                        </h3>
                        <span className="text-xs text-gray-500">
                            {reviewsLoading
                                ? "..."
                                : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
                        </span>
                    </div>

                    {reviewsLoading ? (
                        <p className="text-sm text-gray-400">Loading reviews...</p>
                    ) : reviews.length === 0 ? (
                        <p className="text-sm text-gray-400">
                            No reviews yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {reviews.map((review) => (
                                <div
                                    key={review._id}
                                    className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {review.user?.name || "Student"}
                                        </p>
                                        <p className="text-xs font-medium text-yellow-500">
                                            {"★".repeat(Number(review.rating) || 0)}
                                            <span className="ml-1 text-gray-400">
                                                {review.rating}
                                            </span>
                                        </p>
                                    </div>
                                    {review.comment && (
                                        <p className="mt-1.5 text-sm leading-5 text-gray-500">
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ================= ROOMS ================= */}



                {/* ================= ROOMS ================= */}
                <section className="mt-5">

                    <div className="flex items-center justify-between">

                        <h3 className="text-sm font-semibold text-gray-900">
                            Rooms
                        </h3>

                        <div className="flex items-center gap-3">

                            <span className="text-sm text-gray-500">
                                {totalRooms} rooms
                            </span>

                            {isOwner && (
                                <Link
                                    to={`/properties/${property._id}/rooms/add`}
                                    className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
                                >
                                    + Add Room
                                </Link>
                            )}

                        </div>
                    </div>

                    <Link
                        to={`/properties/${property._id}/rooms`}
                        className="mt-3 block rounded-xl bg-white p-4 text-center text-sm font-medium text-violet-600 shadow-sm transition hover:shadow-md"
                    >
                        View Available Rooms →
                    </Link>

                </section>

            </main>

        </div>
    );
};

// Simple icons for the approved UI
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

export default PropertyDetails;