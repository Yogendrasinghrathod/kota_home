import Property from "../models/Property.js";
import User from "../models/User.js";

export const createProperty = async (req, res) => {
  try {
    const { name, type, gender, description,status } = req.body;

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
      status

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

export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find();

    return res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Get properties error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId)
    .populate("owner", "firebaseUid name");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    return res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Get property error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
};