import { useAuth } from "../context/AuthContext.jsx";
import { logoutUser } from "../config/services/authService";
const Dashboard = () => {
  const { user } = useAuth();
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard 🔐</h1>

      {user && (
        <>
          <p>
            <strong>MongoDB ID:</strong> {user._id}
          </p>

          <p>
            <strong>Firebase UID:</strong> {user.firebaseUid}
          </p>

          <p>
            <strong>Phone:</strong> {user.phone}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <button onClick={handleLogout}>
  Logout
</button>
        </>
      )}
    </div>
  );
};

export default Dashboard;