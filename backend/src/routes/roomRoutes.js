import express from "express";

import { authenticateUser } from "../middleware/authMiddleware.js";
import {
    createRoom,
    getRoomsByProperty,
    getRoomById,
  } from "../controllers/roomController.js";
import { verifyPropertyOwner } from "../middleware/propertyOwnerMiddleware.js";
const router = express.Router();

router.post(
    "/:propertyId/rooms",
    authenticateUser,
    verifyPropertyOwner,
    createRoom
);
router.get(
    "/:propertyId/rooms/:roomId",
    authenticateUser,
    getRoomById
  );
router.get("/:propertyId/rooms", authenticateUser, getRoomsByProperty);
export default router;