import Review from "../models/Review.js";
import Property from "../models/Property.js";
import User from "../models/User.js";

export const createReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;

    // Find MongoDB user using Firebase UID
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check property exists
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({
      user: user._id,
      property: propertyId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this property",
      });
    }

    const review = await Review.create({
      user: user._id,
      property: propertyId,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check property exists
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const reviews = await Review.find({
      property: propertyId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
        : 0;

    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Number(averageRating.toFixed(1)),
      reviews,
    });
  } catch (error) {
    console.error("Get property reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch property reviews",
    });
  }
};