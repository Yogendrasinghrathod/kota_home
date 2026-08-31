import express from "express";

import { createProperty } from "../controllers/propertyController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createProperty);

export default router;