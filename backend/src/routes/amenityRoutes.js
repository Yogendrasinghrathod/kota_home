import express from "express";

import { createAmenity, getAmenities } from "../controllers/amenityController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createAmenity);
router.get("/", authenticateUser, getAmenities);

export default router;