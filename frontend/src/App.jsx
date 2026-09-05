import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Properties from "./pages/Properties.jsx";
import PropertyDetails from "./pages/PropertyDetails.jsx";
import DisplayRooms from "./pages/DisplayRooms.jsx";
import RoomDetails from "./pages/RoomDetails.jsx";
import RoomPhotos from "./pages/RoomPhotos.jsx";
import StartPage from "./pages/StartPage.jsx";
import Profile from "./pages/Profile.jsx";
import AddProperty from "./pages/AddProperty.jsx";
import AddPropertyMedia from "./pages/AddPropertyMedia.jsx";
import AddPropertyLocation from "./pages/AddPropertyLocation.jsx";
import AddRoom from "./pages/AddRoom.jsx";
import OwnerReviews from "./pages/OwnerReviews.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<StartPage/>} />

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
        {/* All rooms of a property */}
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
    </BrowserRouter>
  );
}

export default App;