import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import StudentDashboard from "./StudentDashboard.jsx";
import { getProperties } from "../config/services/propertyService.js";
import { getOwnerReviews } from "../config/services/reviewService.js";
import { cacheKeys, peekCache, subscribeCache } from "../config/queryCache.js";
import OptimizedImage from "../components/OptimizedImage.jsx";

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === "STUDENT") {
    return <StudentDashboard />;
  }

  return <OwnerDashboard />;
};

const OwnerDashboard = () => {
  const { user } = useAuth();
  const cachedProperties = peekCache(cacheKeys.properties());
  const cachedReviews = peekCache(cacheKeys.ownerReviews());
  const [properties, setProperties] = useState(cachedProperties?.properties || []);
  const [reviewCount, setReviewCount] = useState(cachedReviews?.count || 0);
  const [loading, setLoading] = useState(!cachedProperties);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [propertyData, reviewData] = await Promise.all([
          getProperties(),
          getOwnerReviews(),
        ]);
        if (cancelled) return;
        setProperties(propertyData.properties || []);
        setReviewCount(reviewData.count || 0);
      } catch (error) {
        console.error("Failed to load owner dashboard:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const unsubProperties = subscribeCache(cacheKeys.properties(), load);
    const unsubReviews = subscribeCache(cacheKeys.ownerReviews(), load);

    return () => {
      cancelled = true;
      unsubProperties();
      unsubReviews();
    };
  }, []);

  const totalRooms = useMemo(
    () =>
      properties.reduce(
        (sum, property) => sum + Number(property.roomCount || 0),
        0
      ),
    [properties]
  );

  const recentProperties = properties.slice(0, 3);
  const displayName = (user?.name || "Owner").split(" ")[0];

  return (
    <div className="min-h-screen w-full bg-slate-100 flex justify-center">
      <div className="relative min-h-screen w-full max-w-[375px] overflow-hidden bg-white shadow-xl">

        {/* HEADER */}
        <header className="border-b border-gray-100 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <button className="text-lg text-gray-700">
              ☰
            </button>

            <h1 className="text-sm font-bold text-gray-900">
              Kota Home
            </h1>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                ♧
              </span>

              <Link
                to="/profile"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700"
              >
                {(user?.name || "O").trim().charAt(0).toUpperCase()}
              </Link>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="px-4 pb-20 pt-4">

          {/* GREETING */}
          <section>
            <p className="text-xs text-gray-500">
              Hi, {displayName} 👋
            </p>

            <h2 className="mt-1 text-base font-bold text-gray-900">
              Welcome back!
            </h2>
          </section>

          {/* POST PROPERTY CARD */}
          <section className="mt-4 rounded-xl bg-violet-50 p-3">
            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-xs font-semibold text-violet-800">
                  Post Your Property
                </h3>

                <p className="mt-1 max-w-[175px] text-[9px] leading-3 text-gray-500">
                  List your PG / Property and
                  get more tenants
                </p>

                <Link
                  to="/properties/add"
                  className="mt-2 inline-block rounded-md bg-violet-600 px-3 py-1.5 text-[9px] font-semibold text-white"
                >
                  + Add Property
                </Link>
              </div>

              {/* PROPERTY ILLUSTRATION */}
              <div className="flex h-16 w-20 items-center justify-center">
                <svg
                  viewBox="0 0 100 70"
                  className="h-full w-full"
                >
                  <rect
                    x="25"
                    y="25"
                    width="50"
                    height="40"
                    rx="2"
                    fill="#8b7ce0"
                  />

                  <polygon
                    points="20,27 50,8 80,27"
                    fill="#6752c7"
                  />

                  <rect
                    x="43"
                    y="43"
                    width="14"
                    height="22"
                    fill="#eeeaff"
                  />

                  <rect
                    x="31"
                    y="34"
                    width="8"
                    height="8"
                    fill="#eeeaff"
                  />

                  <rect
                    x="61"
                    y="34"
                    width="8"
                    height="8"
                    fill="#eeeaff"
                  />

                  <circle
                    cx="80"
                    cy="20"
                    r="7"
                    fill="#a99beb"
                  />

                  <path
                    d="M80 15v10M75 20h10"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

            </div>
          </section>

          {/* OVERVIEW */}
          <section className="mt-5">
            <h3 className="mb-2 text-xs font-semibold text-gray-900">
              Overview
            </h3>

            <div className="grid grid-cols-3 gap-2">

              <div className="rounded-lg border border-gray-100 bg-white p-2.5 text-center shadow-sm">
                <p className="text-[9px] text-gray-500">
                  My Properties
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {loading ? "—" : properties.length}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-2.5 text-center shadow-sm">
                <p className="text-[9px] text-gray-500">
                  Total Rooms
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {loading ? "—" : totalRooms}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white p-2.5 text-center shadow-sm">
                <p className="text-[9px] text-gray-500">
                  Total Reviews
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {loading ? "—" : reviewCount}
                </p>
              </div>

            </div>
          </section>

          {/* RECENT PROPERTIES */}
          <section className="mt-5">

            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-900">
                Recent Properties
              </h3>

              <Link
                to="/properties"
                className="text-[9px] font-medium text-violet-600"
              >
                View All
              </Link>
            </div>

            {loading ? (
              <p className="text-[10px] text-gray-400">Loading properties...</p>
            ) : recentProperties.length === 0 ? (
              <p className="rounded-xl border border-gray-100 bg-white p-3 text-[10px] text-gray-400">
                No properties yet. Add your first PG.
              </p>
            ) : (
              <div className="space-y-2">
                {recentProperties.map((property) => (
                  <Link
                    key={property._id}
                    to={`/properties/${property._id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-sm"
                  >
                    <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {property.image ? (
                        <OptimizedImage
                          src={property.image}
                          alt={property.name}
                          width={200}
                          eager
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-violet-100 text-2xl">
                          🏠
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="truncate text-[10px] font-semibold text-gray-900">
                          {property.name}
                        </h4>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[7px] font-semibold ${
                            property.status === "ACTIVE"
                              ? "bg-green-50 text-green-600"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {property.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[9px] text-gray-500">
                        {property.area || property.address || "Location not added"}
                      </p>
                      <p className="mt-1 text-[9px] text-gray-500">
                        {property.roomTypes || 0} Rooms • {property.roomCount || 0} Available
                      </p>
                    </div>
                    <span className="text-sm text-gray-400">›</span>
                  </Link>
                ))}
              </div>
            )}

          </section>

        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
          <div className="grid grid-cols-5">

            <Link
              to="/dashboard"
              className="flex flex-col items-center py-2 text-violet-600"
            >
              <span className="text-sm">⌂</span>
              <span className="mt-0.5 text-[8px] font-medium">
                Home
              </span>
            </Link>

            <Link
              to="/properties"
              className="flex flex-col items-center py-2 text-gray-400"
            >
              <span className="text-sm">▣</span>
              <span className="mt-0.5 text-[8px]">
                Properties
              </span>
            </Link>

            <Link
              to="/properties/add"
              className="flex flex-col items-center py-2 text-gray-400"
            >
              <span className="text-sm">＋</span>
              <span className="mt-0.5 text-[8px]">
                Add
              </span>
            </Link>

            <Link
              to="/reviews"
              className="flex flex-col items-center py-2 text-gray-400"
            >
              <span className="text-sm">☆</span>
              <span className="mt-0.5 text-[8px]">
                Reviews
              </span>
            </Link>

            <Link
              to="/profile"
              className="flex flex-col items-center py-2 text-gray-400"
            >
              <span className="text-sm">♙</span>
              <span className="mt-0.5 text-[8px]">
                Profile
              </span>
            </Link>

          </div>
        </nav>

      </div>
    </div>
  );
};

export default Dashboard;