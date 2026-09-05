import Amenity from "../models/Amenity.js";

export const createAmenity = async (req, res) => {
  try {
    const { name } = req.body;

    const existingAmenity = await Amenity.findOne({
      name: name.trim(),
    });

    if (existingAmenity) {
      return res.status(409).json({
        success: false,
        message: "Amenity already exists",
      });
    }

    const amenity = await Amenity.create({
      name: name.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Amenity created successfully",
      amenity,
    });
  } catch (error) {
    console.error("Create amenity error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create amenity",
    });
  }
};

export const getAmenities = async (req, res) => {
  try {
    const amenities = await Amenity.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: amenities.length,
      amenities,
    });
  } catch (error) {
    console.error("Get amenities error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch amenities",
    });
  }
};