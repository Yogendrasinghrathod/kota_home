import mongoose from "mongoose";
import Property from "../models/Property.js";
import User from "../models/User.js";
import Location from "../models/Location.js";
import Room from "../models/Room.js";
import Media from "../models/Media.js";
import Review from "../models/Review.js";
import RoomAmenity from "../models/RoomAmenity.js";
import { destroyCloudinaryAssets } from "../utils/cloudinary.js";

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
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const properties = await Property.find({
      owner: user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    const propertyIds = properties.map((property) => property._id);

    const [locations, rooms, media] = await Promise.all([
      Location.find({ property: { $in: propertyIds } }).lean(),
      Room.find({ property: { $in: propertyIds } }).lean(),
      Media.find({
        property: { $in: propertyIds },
        type: "IMAGE",
      }).lean(),
    ]);

    const locationByProperty = new Map(
      locations.map((item) => [String(item.property), item])
    );

    const roomsByProperty = new Map();
    rooms.forEach((room) => {
      const key = String(room.property);
      const list = roomsByProperty.get(key) || [];
      list.push(room);
      roomsByProperty.set(key, list);
    });

    const imageByProperty = new Map();
    media.forEach((item) => {
      const key = String(item.property);
      const current = imageByProperty.get(key);
      if (!current || (item.isPrimary && !current.isPrimary)) {
        imageByProperty.set(key, item);
      }
    });

    const enriched = properties.map((property) => {
      const propertyId = String(property._id);
      const propertyRooms = roomsByProperty.get(propertyId) || [];
      const roomCount = propertyRooms.reduce(
        (sum, room) => sum + Number(room.availability || 0),
        0
      );

      return {
        ...property,
        area: locationByProperty.get(propertyId)?.area || "",
        address: locationByProperty.get(propertyId)?.address || "",
        image: imageByProperty.get(propertyId)?.url || null,
        roomCount,
        roomTypes: propertyRooms.length,
      };
    });

    return res.status(200).json({
      success: true,
      count: enriched.length,
      properties: enriched,
    });
  } catch (error) {
    console.error("Get properties error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
};

const sharingLabel = (sharing) => {
  if (sharing === 1) return "Single Sharing";
  if (sharing === 2) return "Double Sharing";
  if (sharing === 3) return "Triple Sharing";
  return `${sharing} Sharing`;
};

export const getStudentFeed = async (req, res) => {
  try {
    const properties = await Property.find({ status: "ACTIVE" }).lean();
    const propertyIds = properties.map((property) => property._id);

    const [locations, rooms, media] = await Promise.all([
      Location.find({ property: { $in: propertyIds } }).lean(),
      Room.find({ property: { $in: propertyIds } }).lean(),
      Media.find({
        property: { $in: propertyIds },
        type: "IMAGE",
      }).lean(),
    ]);

    const roomIds = rooms.map((room) => room._id);
    const roomAmenities = await RoomAmenity.find({
      room: { $in: roomIds },
    })
      .populate("amenity", "name")
      .lean();

    const amenitiesByRoom = new Map();
    roomAmenities.forEach((item) => {
      const names = amenitiesByRoom.get(String(item.room)) || [];
      if (item.amenity?.name) names.push(item.amenity.name);
      amenitiesByRoom.set(String(item.room), names);
    });

    const locationByProperty = new Map(
      locations.map((item) => [String(item.property), item])
    );

    const roomsByProperty = new Map();
    rooms.forEach((room) => {
      const key = String(room.property);
      const list = roomsByProperty.get(key) || [];
      list.push(room);
      roomsByProperty.set(key, list);
    });

    const imageByProperty = new Map();
    media.forEach((item) => {
      const key = String(item.property);
      const current = imageByProperty.get(key);
      if (!current || (item.isPrimary && !current.isPrimary)) {
        imageByProperty.set(key, item);
      }
    });

    const listings = properties.map((property) => {
      const propertyId = String(property._id);
      const location = locationByProperty.get(propertyId);
      const propertyRooms = roomsByProperty.get(propertyId) || [];

      const featuredRoom = [...propertyRooms].sort((a, b) => {
        const aOpen = a.availability > 0 ? 0 : 1;
        const bOpen = b.availability > 0 ? 0 : 1;
        if (aOpen !== bOpen) return aOpen - bOpen;
        return a.price - b.price;
      })[0];

      const amenityNames = featuredRoom
        ? amenitiesByRoom.get(String(featuredRoom._id)) || []
        : [];
      const hasAc = amenityNames.some((name) => {
        const normalized = name.toLowerCase();
        return normalized.includes("ac") && !normalized.includes("non");
      });

      const roomsAvailable = propertyRooms.reduce(
        (sum, room) => sum + (room.availability || 0),
        0
      );

      return {
        propertyId: property._id,
        roomId: featuredRoom?._id || null,
        name: property.name,
        image: imageByProperty.get(propertyId)?.url || null,
        area: location?.area || "",
        address: location?.address || "",
        sharing: featuredRoom ? sharingLabel(featuredRoom.sharing) : null,
        acLabel: hasAc ? "AC" : "Non-AC",
        price: featuredRoom?.price ?? null,
        roomsAvailable,
      };
    });

    const areaMap = new Map();
    listings.forEach((listing) => {
      if (!listing.area) return;
      const current = areaMap.get(listing.area) || {
        area: listing.area,
        count: 0,
        image: listing.image,
      };
      current.count += 1;
      if (!current.image && listing.image) current.image = listing.image;
      areaMap.set(listing.area, current);
    });

    const areas = [...areaMap.values()].sort((a, b) => b.count - a.count);

    return res.status(200).json({
      success: true,
      listings,
      areas,
    });
  } catch (error) {
    console.error("Get student feed error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch listings",
    });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property id",
      });
    }

    const property = await Property.findById(propertyId)
    .populate("owner", "firebaseUid name phone");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.status === "INACTIVE") {
      const viewer = await User.findOne({ firebaseUid: req.user.uid });
      const isOwner =
        viewer && property.owner?._id?.toString() === viewer._id.toString();

      if (!isOwner) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }
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

export const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or INACTIVE",
      });
    }

    req.property.status = status;
    await req.property.save();

    return res.status(200).json({
      success: true,
      message: `Property marked ${status.toLowerCase()}`,
      property: req.property,
    });
  } catch (error) {
    console.error("Update property status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update property status",
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.property._id;

    const rooms = await Room.find({ property: propertyId }).select("_id");
    const roomIds = rooms.map((room) => room._id);
    const media = await Media.find({ property: propertyId }).lean();

    await destroyCloudinaryAssets(media);

    await Promise.all([
      RoomAmenity.deleteMany({ room: { $in: roomIds } }),
      Media.deleteMany({ property: propertyId }),
      Room.deleteMany({ property: propertyId }),
      Location.deleteMany({ property: propertyId }),
      Review.deleteMany({ property: propertyId }),
      Property.deleteOne({ _id: propertyId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete property",
    });
  }
};