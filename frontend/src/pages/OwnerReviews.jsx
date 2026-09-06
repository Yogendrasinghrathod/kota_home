import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getOwnerReviews } from "../config/services/reviewService.js";

const OwnerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [properties, setProperties] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchReviews = async () => {
      try {
        const data = await getOwnerReviews();
        if (cancelled) return;
        setReviews(data.reviews || []);
        setProperties(data.properties || []);
        setAverageRating(data.averageRating || 0);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load reviews");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    if (selectedProperty === "ALL") return reviews;
    return reviews.filter(
      (review) => String(review.property?._id) === selectedProperty
    );
  }, [reviews, selectedProperty]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link
            to="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-800 hover:bg-gray-100"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Reviews</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-5">
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-gray-900">
              {averageRating || "0.0"}
              <span className="ml-1 text-sm text-yellow-500">★</span>
            </p>
            <p className="mt-1 text-[10px] text-gray-500">Average rating</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-gray-900">{reviews.length}</p>
            <p className="mt-1 text-[10px] text-gray-500">Total reviews</p>
          </div>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setSelectedProperty("ALL")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              selectedProperty === "ALL"
                ? "bg-violet-600 text-white"
                : "bg-white text-gray-600 shadow-sm"
            }`}
          >
            All properties
          </button>
          {properties.map((property) => (
            <button
              key={property._id}
              type="button"
              onClick={() => setSelectedProperty(property._id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                selectedProperty === property._id
                  ? "bg-violet-600 text-white"
                  : "bg-white text-gray-600 shadow-sm"
              }`}
            >
              {property.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading reviews...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">No reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((review) => (
              <Link
                key={review._id}
                to={`/properties/${review.property?._id}`}
                className="block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {review.user?.name || "Student"}
                    </p>
                    <p className="mt-0.5 text-xs text-violet-600">
                      {review.property?.name || "Property"}
                    </p>
                  </div>
                  <p className="text-xs font-medium text-yellow-500">
                    {"★".repeat(Number(review.rating) || 0)}
                    <span className="ml-1 text-gray-400">{review.rating}</span>
                  </p>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm leading-5 text-gray-500">
                    {review.comment}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
        <div className="mx-auto grid max-w-2xl grid-cols-5">
          <Link to="/dashboard" className="flex flex-col items-center py-2 text-gray-400">
            <span className="text-sm">⌂</span>
            <span className="mt-0.5 text-[8px]">Home</span>
          </Link>
          <Link to="/properties" className="flex flex-col items-center py-2 text-gray-400">
            <span className="text-sm">▣</span>
            <span className="mt-0.5 text-[8px]">Properties</span>
          </Link>
          <Link to="/properties/add" className="flex flex-col items-center py-2 text-gray-400">
            <span className="text-sm">＋</span>
            <span className="mt-0.5 text-[8px]">Add</span>
          </Link>
          <Link to="/reviews" className="flex flex-col items-center py-2 text-violet-600">
            <span className="text-sm">☆</span>
            <span className="mt-0.5 text-[8px] font-medium">Reviews</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center py-2 text-gray-400">
            <span className="text-sm">♙</span>
            <span className="mt-0.5 text-[8px]">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default OwnerReviews;
