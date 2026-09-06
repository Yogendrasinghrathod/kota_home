import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { createMedia, getMediaByProperty } from "../config/services/mediaService.js";
import { getPropertyById } from "../config/services/propertyService.js";
import { cacheKeys, peekCache } from "../config/queryCache.js";
import OptimizedImage from "../components/OptimizedImage.jsx";

const AddPropertyMedia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(
    () => peekCache(cacheKeys.property(id))?.property ?? null
  );
  const [media, setMedia] = useState(
    () => peekCache(cacheKeys.media(id))?.media || []
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadMedia = async () => {
    const data = await getMediaByProperty(id);
    setMedia(data.media || []);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [propertyResult, mediaResult] = await Promise.allSettled([
          getPropertyById(id),
          getMediaByProperty(id),
        ]);

        if (cancelled) return;

        if (propertyResult.status === "fulfilled") {
          setProperty(propertyResult.value.property);
        } else {
          setError(
            propertyResult.reason?.response?.data?.message ||
              "Failed to load property"
          );
        }

        if (mediaResult.status === "fulfilled") {
          setMedia(mediaResult.value.media || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load property");
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleFiles = async (event) => {
    const files = [...(event.target.files || [])];
    event.target.value = "";
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError("");

      for (const file of files) {
        const uploaded = await uploadToCloudinary(file);
        await createMedia(id, {
          type: uploaded.type,
          url: uploaded.url,
          publicId: uploaded.publicId,
          resourceType: uploaded.resourceType,
        });
      }

      await loadMedia();
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
            to={`/properties/${id}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-800 hover:bg-gray-100"
          >
            ←
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Add photos & videos</h1>
            <p className="text-xs text-gray-500">{property?.name}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5">
        <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-violet-50 text-center">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFiles}
            disabled={uploading}
          />
          <p className="text-sm font-semibold text-violet-700">
            {uploading ? "Uploading..." : "Upload images or videos"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Files go to Cloudinary, then the URL is saved on this property
          </p>
        </label>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-5 grid grid-cols-2 gap-3">
          {media.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-xl bg-white shadow-sm">
              {item.type === "VIDEO" ? (
                <video src={item.url} className="h-32 w-full object-cover" controls preload="metadata" />
              ) : (
                <OptimizedImage src={item.url} alt="" width={360} className="h-32 w-full object-cover" />
              )}
              <p className="px-2 py-1.5 text-[10px] font-medium text-gray-500">
                {item.type}
                {item.isPrimary ? " • Primary" : ""}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate(`/properties/${id}`)}
          className="mt-6 h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white"
        >
          Done
        </button>
      </main>
    </div>
  );
};

export default AddPropertyMedia;
