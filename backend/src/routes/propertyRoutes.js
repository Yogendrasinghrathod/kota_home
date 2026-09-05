import express from "express";

import { createProperty ,getProperties,getPropertyById, getStudentFeed, updatePropertyStatus, deleteProperty,} from "../controllers/propertyController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { verifyPropertyOwner } from "../middleware/propertyOwnerMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createProperty);
router.get("/feed", authenticateUser, getStudentFeed);
router.get("/", authenticateUser, getProperties);
router.patch(
  "/:propertyId/status",
  authenticateUser,
  verifyPropertyOwner,
  updatePropertyStatus
);
router.delete(
  "/:propertyId",
  authenticateUser,
  verifyPropertyOwner,
  deleteProperty
);
router.get("/:propertyId", authenticateUser, getPropertyById);


export default router;