import express from "express";

import {
    addAmenityToRoom,
    getRoomAmenities,
  } from "../controllers/roomAmenityController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { verifyRoomOwner } from "../middleware/roomOwnerMiddleware.js";

const router = express.Router();

router.post(
  "/:roomId/amenities",
  authenticateUser,
  verifyRoomOwner,
  addAmenityToRoom
);
router.get(
    "/:roomId/amenities",
    authenticateUser,
    getRoomAmenities
  );

export default router;