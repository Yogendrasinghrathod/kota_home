import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    sharing: {
      type: Number,
      required: true,
      min: 1,
    },

    availability: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;