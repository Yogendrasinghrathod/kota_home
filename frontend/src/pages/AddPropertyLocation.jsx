import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getLocationByProperty,
  reverseGeocode,
  saveLocation,
  searchPlaces,
} from "../config/services/locationService.js";
import { getPropertyById } from "../config/services/propertyService.js";

const AddPropertyLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const propertyData = await getPropertyById(id);
        setProperty(propertyData.property);
        try {
          const locationData = await getLocationByProperty(id);
          if (locationData.location) {
            setSelected(locationData.location);
            setQuery(locationData.location.address);
          }
        } catch {
          // no location yet
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load property");
      }
    };

    load();
  }, [id]);

  const handleSearch = async () => {
    const text = query.trim();
    if (!text) return;

    try {
      setSearching(true);
      setError("");
      const data = await searchPlaces(text);
      setSuggestions(data.results || []);
      if ((data.results || []).length === 0) {
        setError("No matching place found. Try a more specific address.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported in this browser");
      return;
    }

    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          setSelected(data.location);
          setQuery(data.location.address);
          setSuggestions([]);
        } catch (err) {
          setError(err.response?.data?.message || "Could not read current location");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError("Please allow location access, or type the address instead.");
      }
    );
  };

  const handleSave = async () => {
    if (!selected) {
      setError("Pick a search result or use current location first");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await saveLocation(id, {
        address: selected.address,
        area: selected.area,
        latitude: selected.latitude,
        longitude: selected.longitude,
      });
      navigate(`/properties/${id}/media`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save location");
    } finally {
      setSaving(false);
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
            <h1 className="text-lg font-semibold text-gray-900">Add location</h1>
            <p className="text-xs text-gray-500">{property?.name}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-5">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="h-11 w-full rounded-xl border border-violet-200 bg-violet-50 text-sm font-semibold text-violet-700 disabled:opacity-60"
        >
          {locating ? "Detecting..." : "Use current location"}
        </button>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Or type an address</p>
          <div className="mt-2 flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Talwandi, Kota"
              className="h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="rounded-xl bg-gray-900 px-4 text-xs font-semibold text-white"
            >
              {searching ? "..." : "Find"}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-100">
              {suggestions.map((item) => (
                <button
                  key={`${item.latitude}-${item.longitude}-${item.address}`}
                  type="button"
                  onClick={() => {
                    setSelected(item);
                    setQuery(item.address);
                    setSuggestions([]);
                  }}
                  className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-violet-50"
                >
                  {item.address}
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Address to show students</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{selected.address}</p>
            <p className="mt-2 text-xs text-gray-500">Area: {selected.area}</p>
            <p className="text-xs text-gray-400">
              {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !selected}
          className="h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save location"}
        </button>

        <button
          type="button"
          onClick={() => navigate(`/properties/${id}/media`)}
          className="w-full text-sm text-gray-500"
        >
          Skip for now
        </button>
      </main>
    </div>
  );
};

export default AddPropertyLocation;
