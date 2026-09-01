import express from "express";
import {
    createMedia,
    getPropertyMedia,
  } from "../controllers/mediaController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { verifyPropertyOwner } from "../middleware/propertyOwnerMiddleware.js";
import { verifyRoomBelongsToProperty } from "../middleware/roomPropertyMiddleware.js";

const router = express.Router();

router.post(
  "/:propertyId/media",
  authenticateUser,
  verifyPropertyOwner,
  verifyRoomBelongsToProperty,
  createMedia
);

router.get(
    "/:propertyId/media",
    authenticateUser,
    getPropertyMedia
  );
export default router;