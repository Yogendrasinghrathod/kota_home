import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { logoutUser, updateProfile } from "../config/services/authService.js";

const formatPhone = (phone = "") => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone || "—";
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const next = user?.name || "";
    setName((current) => (current === next ? current : next));
  }, [user?.name]);

  const isStudent = user?.role === "STUDENT";
  const avatarLetter = (user?.name || user?.phone || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const data = await updateProfile(name);
      setUser(data.user);
      setMessage("Profile updated");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex justify-center">
      <div className="relative min-h-screen w-full max-w-[375px] overflow-x-hidden bg-white shadow-xl">
        <header className="flex items-center gap-3 px-4 py-4">
          <Link
            to="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-800 hover:bg-gray-100"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
        </header>

        <main className="px-5 pb-24">
          <div className="flex flex-col items-center pt-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-2xl font-bold text-violet-700">
              {avatarLetter}
            </div>
            <p className="mt-3 text-base font-semibold text-gray-900">
              {user?.name || "Add your name"}
            </p>
            <span className="mt-1 rounded-full bg-violet-50 px-3 py-0.5 text-[11px] font-medium text-[#7c5cfc]">
              {isStudent ? "Student" : user?.role === "OWNER" ? "Owner" : user?.role}
            </span>
          </div>

          <form onSubmit={handleSave} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium text-gray-500">
                Full name
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                placeholder="Your name"
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-800 outline-none focus:border-violet-500"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium text-gray-500">
                Phone
              </span>
              <input
                type="text"
                value={formatPhone(user?.phone)}
                disabled
                className="h-11 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm text-gray-500"
              />
            </label>

            {message && (
              <p className="text-xs font-medium text-emerald-600">{message}</p>
            )}
            {error && (
              <p className="text-xs font-medium text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="h-11 w-full rounded-xl bg-[#7c5cfc] text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 h-11 w-full rounded-xl border border-red-100 bg-red-50 text-sm font-semibold text-red-500"
          >
            Log out
          </button>
        </main>

        {isStudent ? (
          <nav className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
            <div className="grid grid-cols-2 px-2">
              <Link
                to="/dashboard"
                className="flex flex-col items-center py-2.5 text-gray-400"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 10.5L12 4l8 6.5V20H4V10.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
                <span className="mt-1 text-[10px]">Home</span>
              </Link>
              <Link
                to="/profile"
                className="flex flex-col items-center py-2.5 text-[#7c5cfc]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5 19c1.2-3 3.5-4.5 7-4.5S17.8 16 19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="mt-1 text-[10px] font-medium">Profile</span>
              </Link>
            </div>
          </nav>
        ) : (
          <nav className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
            <div className="grid grid-cols-5">
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
              <Link to="/reviews" className="flex flex-col items-center py-2 text-gray-400">
                <span className="text-sm">☆</span>
                <span className="mt-0.5 text-[8px]">Reviews</span>
              </Link>
              <Link to="/profile" className="flex flex-col items-center py-2 text-violet-600">
                <span className="text-sm">♙</span>
                <span className="mt-0.5 text-[8px] font-medium">Profile</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Profile;
