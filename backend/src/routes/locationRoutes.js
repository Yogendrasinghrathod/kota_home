import express from "express";

import {
    createLocation,
    getLocationByProperty,
  } from "../controllers/locationController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { verifyPropertyOwner } from "../middleware/propertyOwnerMiddleware.js";

const router = express.Router();

router.post(
  "/:propertyId/location",
  authenticateUser,
  verifyPropertyOwner,
  createLocation
);
router.get(
    "/:propertyId/location",
    authenticateUser,
    getLocationByProperty
  );

export default router;