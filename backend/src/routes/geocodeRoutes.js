import express from "express";
import { searchPlaces, reverseGeocode } from "../controllers/geocodeController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/search", authenticateUser, searchPlaces);
router.post("/reverse", authenticateUser, reverseGeocode);

export default router;
