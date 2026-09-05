import Room from "../models/Room.js";

export const verifyRoomBelongsToProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { roomId } = req.body;

    if (!roomId) {
      return next();
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.property.toString() !== propertyId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Room does not belong to this property",
      });
    }

    req.room = room;

    next();
  } catch (error) {
    console.error("Room-property validation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify room-property relationship",
    });
  }
};