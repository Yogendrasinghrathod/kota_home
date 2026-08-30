import express from "express";

import { loginUser } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", authenticateUser, loginUser);

export default router;
