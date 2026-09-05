import express from "express";
import { getOwnerReviews } from "../controllers/reviewController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", authenticateUser, getOwnerReviews);

export default router;
