import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getProperties, updatePropertyStatus } from "../config/services/propertyService.js";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const location = useLocation();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProperties();

        setProperties(data.properties || []);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        setError("Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [location.key]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        property.name?.toLowerCase().includes(searchText) ||
        property.description?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        property.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [properties, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-xl text-gray-800"
            >
              ←
            </Link>

            <h1 className="text-lg font-semibold text-gray-900">
              My Properties
            </h1>
          </div>

          <Link
            to="/properties/add"
            className="text-2xl font-light text-violet-600"
          >
            +
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-2xl px-4 py-5">

        {/* Search */}
        <div className="relative mb-4">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search properties..."
            className="
              w-full
              rounded-xl
              border border-gray-200
              bg-white
              py-3
              pl-11
              pr-4
              text-sm
              text-gray-900
              outline-none
              placeholder:text-gray-400
              focus:border-violet-400
              focus:ring-2
              focus:ring-violet-100
            "
          />
        </div>

        {/* Status Filters */}
        <div className="mb-5 flex gap-2">

          {["ALL", "ACTIVE", "INACTIVE"].map((status) => {
            const isSelected = statusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  rounded-full
                  px-5
                  py-2
                  text-sm
                  font-medium
                  transition
                  ${
                    isSelected
                      ? "bg-violet-100 text-violet-700"
                      : "border border-gray-100 bg-white text-gray-600"
                  }
                `}
              >
                {status === "ALL"
                  ? "All"
                  : status === "ACTIVE"
                  ? "Active"
                  : "Inactive"}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {filteredProperties.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">

            <p className="text-gray-500">
              No properties found.
            </p>

            {(search || statusFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="mt-3 text-sm font-medium text-violet-600"
              >
                Clear filters
              </button>
            )}

          </div>
        ) : (
          <div className="space-y-3">

            {filteredProperties.map((property) => (
              <Link
                key={property._id}
                to={`/properties/${property._id}`}
                className="
                  block
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-3
                  shadow-sm
                  transition
                  hover:shadow-md
                "
              >
                <div className="flex gap-3">

                  {/* Property Image */}
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                    {property.image ? (
                      <img
                        src={property.image}
                        alt={property.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        🏠
                      </div>
                    )}

                  </div>

                  {/* Property Info */}
                  <div className="min-w-0 flex-1 py-1">

                    <div className="flex items-start justify-between gap-2">

                      <h2 className="truncate text-base font-semibold text-gray-900">
                        {property.name}
                      </h2>

                      <button
                        type="button"
                        onClick={async (event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          const nextStatus =
                            property.status === "ACTIVE"
                              ? "INACTIVE"
                              : "ACTIVE";
                          try {
                            const data = await updatePropertyStatus(
                              property._id,
                              nextStatus
                            );
                            setProperties((current) =>
                              current.map((item) =>
                                item._id === property._id
                                  ? { ...item, status: data.property.status }
                                  : item
                              )
                            );
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className={`
                          shrink-0
                          rounded-md
                          px-2
                          py-1
                          text-[10px]
                          font-semibold
                          ${
                            property.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        `}
                      >
                        {property.status}
                      </button>

                    </div>

                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      📍 {property.area || property.address || "Location not added"}
                    </p>

                    <div className="mt-3 flex items-center justify-between">

                      <p className="text-xs text-gray-500">
                        {property.roomCount || 0} Rooms
                      </p>

                      <span className="text-lg text-gray-400">
                        ›
                      </span>

                    </div>

                  </div>
                </div>
              </Link>
            ))}

          </div>
        )}

      </main>
    </div>
  );
};

export default Properties;