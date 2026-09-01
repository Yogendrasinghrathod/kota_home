import mongoose from "mongoose";

const roomAmenitySchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    amenity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenity",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

roomAmenitySchema.index(
  { room: 1, amenity: 1 },
  { unique: true }
);

const RoomAmenity = mongoose.model(
  "RoomAmenity",
  roomAmenitySchema
);

export default RoomAmenity;