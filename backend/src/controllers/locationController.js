import Location from "../models/Location.js";

export const createLocation = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { address, area, latitude, longitude } = req.body;

    // Property was already verified by ownership middleware
    const property = req.property;

    // Prevent duplicate location
    const existingLocation = await Location.findOne({
      property: propertyId,
    });

    if (existingLocation) {
      existingLocation.address = address;
      existingLocation.area = area;
      existingLocation.latitude = latitude;
      existingLocation.longitude = longitude;
      await existingLocation.save();

      return res.status(200).json({
        success: true,
        message: "Location updated successfully",
        location: existingLocation,
      });
    }

    const location = await Location.create({
      property: property._id,
      address,
      area,
      latitude,
      longitude,
    });

    return res.status(201).json({
      success: true,
      message: "Location created successfully",
      location,
    });
  } catch (error) {
    console.error("Create location error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create location",
    });
  }

};

export const getLocationByProperty = async (req, res) => {
    try {
      const { propertyId } = req.params;
  
      const location = await Location.findOne({
        property: propertyId,
      });
  
      if (!location) {
        return res.status(404).json({
          success: false,
          message: "Location not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        location,
      });
    } catch (error) {
      console.error("Get location error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to fetch location",
      });
    }
  };    