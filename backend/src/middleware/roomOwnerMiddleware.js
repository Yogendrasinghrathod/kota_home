import Room from "../models/Room.js";
import Property from "../models/Property.js";
import User from "../models/User.js";

export const verifyRoomOwner = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Find logged-in MongoDB user
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find room
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Find the property containing this room
    const property = await Property.findById(room.property);

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
        message: "You are not authorized to modify this room",
      });
    }

    // Make these available to the controller
    req.room = room;
    req.property = property;

    next();
  } catch (error) {
    console.error("Room ownership error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify room ownership",
    });
  }
};