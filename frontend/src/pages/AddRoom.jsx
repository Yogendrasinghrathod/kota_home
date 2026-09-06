import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createRoom } from "../config/services/roomService.js";
import { getAmenities, createAmenity } from "../config/services/amenityService.js";
import { addAmenityToRoom, getRoomAmenities } from "../config/services/roomAmenityService.js";
import { createMedia, getMediaByProperty } from "../config/services/mediaService.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { cacheKeys, peekCache } from "../config/queryCache.js";
import OptimizedImage from "../components/OptimizedImage.jsx";

const AddRoom = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    sharing: "2",
    price: "",
    availability: "1",
  });
  const [roomId, setRoomId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [allAmenities, setAllAmenities] = useState(
    () => peekCache(cacheKeys.amenities())?.amenities || []
  );
  const [roomAmenities, setRoomAmenities] = useState([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAmenities = async () => {
      try {
        const data = await getAmenities();
        if (!cancelled) setAllAmenities(data.amenities || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadAmenities();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadRoomExtras = async (id) => {
    const [amenityData, mediaData] = await Promise.all([
      getRoomAmenities(id),
      getMediaByProperty(propertyId),
    ]);

    setRoomAmenities(amenityData.amenities || []);
    setMedia(
      (mediaData.media || []).filter(
        (item) => String(item.room) === String(id)
      )
    );
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const data = await createRoom(propertyId, {
        sharing: Number(form.sharing),
        price: Number(form.price),
        availability: Number(form.availability),
      });
      setRoomId(data.room._id);
      await loadRoomExtras(data.room._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
    } finally {
      setSaving(false);
    }
  };

  const assignedIds = new Set(roomAmenities.map((item) => item._id));

  const handleAddAmenity = async (amenityId) => {
    try {
      setError("");
      await addAmenityToRoom(roomId, amenityId);
      await loadRoomExtras(roomId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add amenity");
    }
  };

  const handleCreateAmenity = async () => {
    const name = newAmenity.trim();
    if (!name) return;

    try {
      setError("");
      const data = await createAmenity(name);
      setAllAmenities((current) => [...current, data.amenity]);
      await addAmenityToRoom(roomId, data.amenity._id);
      setNewAmenity("");
      await loadRoomExtras(roomId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create amenity");
    }
  };

  const handleFiles = async (event) => {
    const files = [...(event.target.files || [])];
    event.target.value = "";
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError("");

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

      await loadRoomExtras(roomId);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link
            to={`/properties/${propertyId}/rooms`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-800 hover:bg-gray-100"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Add Room</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-5">
        <form
          onSubmit={handleCreateRoom}
          className="space-y-4 rounded-2xl bg-white p-5 shadow-sm"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-500">
              Sharing
            </span>
            <select
              value={form.sharing}
              disabled={!!roomId}
              onChange={(event) =>
                setForm((current) => ({ ...current, sharing: event.target.value }))
              }
              className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none disabled:bg-gray-50"
            >
              <option value="1">Single Sharing</option>
              <option value="2">Double Sharing</option>
              <option value="3">Triple Sharing</option>
              <option value="4">4 Sharing</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-500">
              Price / month
            </span>
            <input
              required
              type="number"
              min="0"
              disabled={!!roomId}
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: event.target.value }))
              }
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none disabled:bg-gray-50"
              placeholder="8000"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-500">
              Available rooms
            </span>
            <input
              required
              type="number"
              min="0"
              disabled={!!roomId}
              value={form.availability}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  availability: event.target.value,
                }))
              }
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none disabled:bg-gray-50"
            />
          </label>

          {!roomId && (
            <button
              type="submit"
              disabled={saving}
              className="h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create room"}
            </button>
          )}
        </form>

        {roomId && (
          <>
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
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
                          : "bg-gray-100 text-gray-700"
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
                  placeholder="Add custom amenity"
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
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">Room media</h2>
              <label className="mt-3 flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-violet-200 bg-violet-50">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                  disabled={uploading}
                />
                <p className="text-sm font-medium text-violet-700">
                  {uploading ? "Uploading..." : "Upload photos or videos"}
                </p>
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {media.map((item) => (
                  <div key={item._id} className="overflow-hidden rounded-xl bg-gray-100">
                    {item.type === "VIDEO" ? (
                      <video src={item.url} className="h-28 w-full object-cover" controls preload="metadata" />
                    ) : (
                      <OptimizedImage src={item.url} alt="" width={360} className="h-28 w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={() =>
                navigate(`/properties/${propertyId}/rooms/${roomId}`)
              }
              className="h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white"
            >
              Done
            </button>
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </main>
    </div>
  );
};

export default AddRoom;
