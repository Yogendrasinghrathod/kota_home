import Room from "../models/Room.js";
import Property from "../models/Property.js";

export const createRoom = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { price, sharing, availability } = req.body;

    // Check whether the property exists
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Create room
    const room = await Room.create({
      property: propertyId,
      price,
      sharing,
      availability,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create room",
    });
  }
};

export const getRoomsByProperty = async (req, res) => {
    try {
      const { propertyId } = req.params;
  
      // Check whether property exists
      const property = await Property.findById(propertyId);
  
      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }
  
      // Find all rooms belonging to this property
      const rooms = await Room.find({
        property: propertyId,
      });
  
      return res.status(200).json({
        success: true,
        count: rooms.length,
        rooms,
      });
    } catch (error) {
      console.error("Get rooms error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to fetch rooms",
      });
    }
  };