import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMediaByProperty } from "../config/services/mediaService.js";

const RoomPhotos = () => {
  const { propertyId } = useParams();

  const [media, setMedia] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const data = await getMediaByProperty(propertyId);
        setMedia(data.media || []);
      } catch (error) {
        console.error(
          "ROOM PHOTOS ERROR:",
          error.response?.data || error.message
        );
        setMedia([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [propertyId]);

  const filteredMedia = useMemo(() => {
    if (activeTab === "ALL") return media;

    return media.filter((item) => item.type === activeTab);
  }, [media, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          
          <div className="flex items-center gap-3">
            <Link
              to={`/properties/${propertyId}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-700 hover:bg-gray-100"
            >
              ←
            </Link>

            <h1 className="text-sm font-semibold text-gray-900">
              Room Photos
            </h1>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-violet-600 hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto w-full max-w-2xl px-3 pb-8 pt-3">

        {/* TABS */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            ["ALL", "All"],
            ["IMAGE", "Images"],
            ["VIDEO", "Videos"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                activeTab === value
                  ? "bg-violet-100 text-violet-700"
                  : "bg-white text-gray-500 border border-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading photos...
            </p>
          </div>
        ) : filteredMedia.length === 0 ? (
          /* EMPTY */
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">📷</div>

            <p className="mt-3 text-sm text-gray-500">
              No photos available.
            </p>
          </div>
        ) : (
          /* MEDIA GRID */
          <div className="grid grid-cols-2 gap-2">
            {filteredMedia.map((item) => (
              <div
                key={item._id}
                className="relative aspect-square overflow-hidden rounded-lg bg-gray-200"
              >
                {item.type === "IMAGE" ? (
                  <img
                    src={item.url}
                    alt="Room"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                )}

                {/* VIDEO OVERLAY */}
                {item.type === "VIDEO" && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-sm text-white">
                        ▶
                      </div>
                    </div>

                    {item.duration && (
                      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {item.duration}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RoomPhotos;