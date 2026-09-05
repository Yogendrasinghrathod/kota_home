import express from "express";

import { loginUser, updateProfile, getCurrentUser, exchangePhoneEmailToken } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/phone-email", exchangePhoneEmailToken);
router.post("/login", authenticateUser, loginUser);
router.get("/me", authenticateUser, getCurrentUser);
router.patch("/profile", authenticateUser, updateProfile);

export default router;
