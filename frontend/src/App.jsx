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
          path="/properties"
          element={
            <ProtectedRoute>
              <Properties />
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
          path="/properties/:propertyId/rooms/:roomId"
          element={
            <ProtectedRoute>
              <RoomDetails />
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



      </Routes>
    </BrowserRouter>
  );
}

export default App;