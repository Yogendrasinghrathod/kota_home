import Property from "../models/Property.js";
import User from "../models/User.js";

export const createProperty = async (req, res) => {
  try {
    const { name, type, gender, description } = req.body;

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const property = await Property.create({
      owner: user._id,
      name,
      type,
      gender,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create property",
    });
  }
};