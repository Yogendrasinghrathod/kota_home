import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getStudentFeed } from "../config/services/propertyService.js";

const FAVORITES_KEY = "kota-home-favorites";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("ALL");
  const [sort, setSort] = useState("default");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await getStudentFeed();
        setListings(data.listings || []);
        setAreas(data.areas || []);
      } catch (error) {
        console.error("Failed to load student feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const filteredListings = useMemo(() => {
    const query = search.toLowerCase().trim();

    const next = listings.filter((item) => {
      const matchesArea =
        selectedArea === "ALL" || item.area === selectedArea;

      const matchesSearch =
        !query ||
        item.name?.toLowerCase().includes(query) ||
        item.area?.toLowerCase().includes(query) ||
        item.address?.toLowerCase().includes(query);

      return matchesArea && matchesSearch;
    });

    if (sort === "price-asc") {
      next.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    } else if (sort === "price-desc") {
      next.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    }

    return next;
  }, [listings, search, selectedArea, sort]);

  const avatarLetter = (user?.name || "S").trim().charAt(0).toUpperCase();

  const toggleFavorite = (propertyId) => {
    setFavorites((current) =>
      current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : [...current, propertyId]
    );
  };

  const cycleSort = () => {
    setSort((current) => {
      if (current === "default") return "price-asc";
      if (current === "price-asc") return "price-desc";
      return "default";
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex justify-center">
      <div className="relative min-h-screen w-full max-w-[375px] overflow-hidden bg-white shadow-xl">
        <main className="px-5 pb-24 pt-5">
          <header className="flex items-start justify-between">
            <div>
              <h1 className="text-[22px] font-bold leading-none text-[#7c5cfc]">
                Kota Home
              </h1>
              <p className="mt-1.5 text-[11px] text-gray-400">
                Find your perfect PG
              </p>
            </div>

            <Link to="/profile" className="flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                {avatarLetter}
              </div>
              <span className="mt-1 text-[10px] text-gray-500">Student</span>
            </Link>
          </header>

          <div className="relative mt-5">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by area, PG name or landmark"
              className="h-11 w-full rounded-full border-0 bg-gray-100 pl-11 pr-4 text-[12px] text-gray-700 placeholder:text-gray-400 outline-none"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setSelectedArea("ALL")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[11px] font-medium ${
                selectedArea === "ALL"
                  ? "bg-[#7c5cfc] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              All
            </button>
            {areas.map((item) => (
              <button
                type="button"
                key={item.area}
                onClick={() => setSelectedArea(item.area)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[11px] font-medium ${
                  selectedArea === item.area
                    ? "bg-[#7c5cfc] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.area}
              </button>
            ))}
          </div>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-gray-900">
                Popular Areas
              </h2>
              <button
                type="button"
                onClick={() => setSelectedArea("ALL")}
                className="text-[12px] font-medium text-[#7c5cfc]"
              >
                See All
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {areas.length === 0 ? (
                <p className="text-xs text-gray-400">No areas yet</p>
              ) : (
                areas.map((item) => (
                  <button
                    type="button"
                    key={item.area}
                    onClick={() => setSelectedArea(item.area)}
                    className="w-[118px] shrink-0 text-left"
                  >
                    <div className="h-[78px] w-full overflow-hidden rounded-xl bg-gray-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.area}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-violet-100 text-2xl">
                          🏘️
                        </div>
                      )}
                    </div>
                    <p className="mt-1.5 truncate text-[12px] font-semibold text-gray-900">
                      {item.area}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {item.count}+ PGs
                    </p>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-gray-900">
                Available Rooms
              </h2>
              <button
                type="button"
                onClick={cycleSort}
                className="flex items-center gap-1 text-[12px] text-gray-500"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M8 16V4M8 4L5 7M8 4L11 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 8V20M16 20L13 17M16 20L19 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sort
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">Loading rooms...</p>
            ) : filteredListings.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 text-center">
                <p className="text-sm text-gray-500">No rooms found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredListings.map((listing) => {
                  const isFavorite = favorites.includes(listing.propertyId);

                  return (
                    <Link
                      key={listing.propertyId}
                      to={`/properties/${listing.propertyId}`}
                      className="relative flex gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm"
                    >
                      <div className="h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-violet-50 text-2xl">
                            🏠
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pr-6">
                        <h3 className="truncate text-[13px] font-semibold text-gray-900">
                          {listing.name}
                        </h3>

                        <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M12 21s7-5.4 7-11a7 7 0 10-14 0c0 5.6 7 11 7 11z" stroke="currentColor" strokeWidth="1.8" />
                            <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                          </svg>
                          {listing.area
                            ? `${listing.area}, Kota`
                            : listing.address || "Kota"}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {listing.sharing && (
                            <span className="rounded-full bg-[#7c5cfc] px-2 py-0.5 text-[9px] font-medium text-white">
                              {listing.sharing}
                            </span>
                          )}
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-medium text-gray-600">
                            {listing.acLabel}
                          </span>
                        </div>

                        <div className="mt-2 flex items-end justify-between">
                          <p className="text-[13px] font-bold text-gray-900">
                            {listing.price != null
                              ? `₹${Number(listing.price).toLocaleString("en-IN")}`
                              : "—"}
                            <span className="ml-1 text-[11px] font-medium text-gray-400">
                              / month
                            </span>
                          </p>
                        </div>

                        <p className="mt-0.5 text-[11px] font-medium text-emerald-500">
                          {listing.roomsAvailable} rooms available
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label="Save listing"
                        onClick={(event) => {
                          event.preventDefault();
                          toggleFavorite(listing.propertyId);
                        }}
                        className="absolute right-3 top-3 text-gray-300"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill={isFavorite ? "#7c5cfc" : "none"}
                          stroke={isFavorite ? "#7c5cfc" : "currentColor"}
                          strokeWidth="1.8"
                        >
                          <path d="M12 20s-7-4.4-9.5-8.2C.4 8.8 2.2 5 6 5c2 0 3.4 1 4 2 .6-1 2-2 4-2 3.8 0 5.6 3.8 3.5 6.8C19 15.6 12 20 12 20z" />
                        </svg>
                      </button>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <nav className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
          <div className="grid grid-cols-2 px-2">
            <Link
              to="/dashboard"
              className="flex flex-col items-center py-2.5 text-[#7c5cfc]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 10.5L12 4l8 6.5V20H4V10.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
              <span className="mt-1 text-[10px] font-medium">Home</span>
            </Link>

            <Link
              to="/profile"
              className="flex flex-col items-center py-2.5 text-gray-400"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5 19c1.2-3 3.5-4.5 7-4.5S17.8 16 19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="mt-1 text-[10px]">Profile</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default StudentDashboard;
