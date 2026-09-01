import Property from "../models/Property.js";
import User from "../models/User.js";

export const verifyPropertyOwner = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    // Find logged-in user in MongoDB
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find property
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check ownership
    if (property.owner.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this property",
      });
    }

    // Store property for controller
    req.property = property;

    next();
  } catch (error) {
    console.error("Property ownership error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify property ownership",
    });
  }
};