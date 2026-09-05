import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProperty } from "../config/services/propertyService.js";

const AddProperty = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "PG",
    gender: "MALE",
    description: "",
    status: "ACTIVE",
  });

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const data = await createProperty(form);
      navigate(`/properties/${data.property._id}/location`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create property");
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-lg font-semibold text-gray-900">Add Property</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-500">PG name</span>
            <input
              required
              value={form.name}
              onChange={updateField("name")}
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-violet-500"
              placeholder="Sharma PG"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-500">Type</span>
              <select
                value={form.type}
                onChange={updateField("type")}
                className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
              >
                <option value="PG">PG</option>
                <option value="HOSTEL">Hostel</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-500">Gender</span>
              <select
                value={form.gender}
                onChange={updateField("gender")}
                className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="COED">Coed</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-500">Description</span>
            <textarea
              value={form.description}
              onChange={updateField("description")}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
              placeholder="Nearby coaching, food, etc."
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create property"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddProperty;
