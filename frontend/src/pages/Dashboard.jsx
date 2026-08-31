import { useAuth } from "../context/AuthContext.jsx";
import { logoutUser } from "../config/services/authService";
import { auth } from "../config/firebase.js";

const Dashboard = () => {
    const { user } = useAuth();

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // const testCreateProperty = async () => {
    //     try {
    //         const firebaseUser = auth.currentUser;

    //         if (!firebaseUser) {
    //             throw new Error("No Firebase user logged in");
    //         }

    //         // Get Firebase ID token
    //         const idToken = await firebaseUser.getIdToken();

    //         // Call backend
    //         const response = await fetch(
    //             "http://localhost:3000/api/properties",
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${idToken}`,
    //                 },
    //                 body: JSON.stringify({
    //                     name: "Sharma Boys PG",
    //                     type: "PG",
    //                     gender: "MALE",
    //                     description: "Student-friendly PG near Allen",
    //                 }),
    //             }
    //         );

    //         const data = await response.json();

    //         console.log("Property API response:", data);

    //         if (!response.ok) {
    //             throw new Error(data.message || "Failed to create property");
    //         }

    //         alert("Property created successfully!");
    //     } catch (error) {
    //         console.error("Property creation error:", error);
    //         alert(error.message);
    //     }
    // };

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

                    {/* <br />

                    <button onClick={testCreateProperty}>
                        Test Create Property
                    </button>

                    <br /> */}
                    <br />

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </>
            )}
        </div>
    );
};

export default Dashboard;