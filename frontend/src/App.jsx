import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StartPage from "./pages/StartPage.jsx";

const Login = lazy(() => import("./pages/Login.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Properties = lazy(() => import("./pages/Properties.jsx"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails.jsx"));
const DisplayRooms = lazy(() => import("./pages/DisplayRooms.jsx"));
const RoomDetails = lazy(() => import("./pages/RoomDetails.jsx"));
const RoomPhotos = lazy(() => import("./pages/RoomPhotos.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const AddProperty = lazy(() => import("./pages/AddProperty.jsx"));
const AddPropertyMedia = lazy(() => import("./pages/AddPropertyMedia.jsx"));
const AddPropertyLocation = lazy(() => import("./pages/AddPropertyLocation.jsx"));
const AddRoom = lazy(() => import("./pages/AddRoom.jsx"));
const OwnerReviews = lazy(() => import("./pages/OwnerReviews.jsx"));

const PageFallback = () => (
  <div className="flex min-h-dvh items-center justify-center bg-gray-50">
    <p className="text-sm text-gray-500">Loading...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<StartPage />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                <OwnerReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties"
            element={
              <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                <Properties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/add"
            element={
              <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                <AddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:id/location"
            element={
              <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                <AddPropertyLocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:id/media"
            element={
              <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                <AddPropertyMedia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:id"
            element={
              <ProtectedRoute>
                <PropertyDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:propertyId/rooms"
            element={
              <ProtectedRoute>
                <DisplayRooms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:propertyId/rooms/add"
            element={
              <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                <AddRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:propertyId/rooms/photos"
            element={
              <ProtectedRoute>
                <RoomPhotos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:propertyId/rooms/:roomId"
            element={
              <ProtectedRoute>
                <RoomDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
