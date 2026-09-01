import express from "express";

import { createAmenity } from "../controllers/amenityController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  createAmenity
);

export default router;