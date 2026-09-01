import Room from "../models/Room.js";
import Amenity from "../models/Amenity.js";
import RoomAmenity from "../models/RoomAmenity.js";

export const addAmenityToRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { amenityId } = req.body;

    // Check room
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check amenity
    const amenity = await Amenity.findById(amenityId);

    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: "Amenity not found",
      });
    }

    // Check duplicate relationship
    const existing = await RoomAmenity.findOne({
      room: roomId,
      amenity: amenityId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Amenity already assigned to this room",
      });
    }

    const roomAmenity = await RoomAmenity.create({
      room: roomId,
      amenity: amenityId,
    });

    return res.status(201).json({
      success: true,
      message: "Amenity added to room successfully",
      roomAmenity,
    });
  } catch (error) {
    console.error("Add room amenity error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add amenity to room",
    });
  }
};

export const getRoomAmenities = async (req, res) => {
    try {
      const { roomId } = req.params;
  
      const room = await Room.findById(roomId);
  
      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }
  
      const roomAmenities = await RoomAmenity.find({
        room: roomId,
      }).populate("amenity", "name");
  
      return res.status(200).json({
        success: true,
        count: roomAmenities.length,
        amenities: roomAmenities.map((item) => item.amenity),
      });
    } catch (error) {
      console.error("Get room amenities error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to fetch room amenities",
      });
    }
  };