import express from "express";

import { createProperty ,getProperties,getPropertyById,} from "../controllers/propertyController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createProperty);
router.get("/", authenticateUser, getProperties);
router.get("/:propertyId", authenticateUser, getPropertyById);


export default router;