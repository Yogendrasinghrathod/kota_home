import express from "express";

import {
    createReview,
    getPropertyReviews,
  } from "../controllers/reviewController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:propertyId/reviews",
  authenticateUser,
  createReview
);
router.get(
    "/:propertyId/reviews",
    authenticateUser,
    getPropertyReviews
  );

export default router;