import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import { firebaseAuth } from "./src/config/firebaseAdmin.js";
import authRoutes from "./src/routes/authRoutes.js";
import propertyRoutes from "./src/routes/propertyRoutes.js";
import roomRoutes from "./src/routes/roomRoutes.js";
import locationRoutes from "./src/routes/locationRoutes.js";
import amenityRoutes from "./src/routes/amenityRoutes.js";
import roomAmenityRoutes from "./src/routes/roomAmenityRoutes.js";
import mediaRoutes from "./src/routes/mediaRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
const app = express();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use("/api/properties", propertyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/properties", roomRoutes);
app.use("/api/properties", locationRoutes);
app.use("/api/amenities", amenityRoutes);
app.use("/api/rooms", roomAmenityRoutes);
app.use("/api/properties", mediaRoutes);
app.use("/api/properties", reviewRoutes);

async function startServer() {
  try {
    await connectDB();
    console.log("Firebase Admin initialized:", !!firebaseAuth);
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();  