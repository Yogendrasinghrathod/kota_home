import Media from "../models/Media.js";

export const createMedia = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { roomId, type, url, isPrimary, publicId, resourceType } = req.body;

    if (!url || !type) {
      return res.status(400).json({
        success: false,
        message: "url and type are required",
      });
    }

    let primary = Boolean(isPrimary);

    if (type === "IMAGE" && !primary) {
      const existingPrimary = await Media.findOne({
        property: propertyId,
        type: "IMAGE",
        isPrimary: true,
      });
      primary = !existingPrimary;
    }

    const media = await Media.create({
      property: propertyId,
      room: roomId || undefined,
      type,
      url,
      publicId: publicId || undefined,
      resourceType: resourceType || undefined,
      isPrimary: primary,
    });

    return res.status(201).json({
      success: true,
      message: "Media added successfully",
      media,
    });
  } catch (error) {
    console.error("Create media error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add media",
    });
  }
};

export const getPropertyMedia = async (req, res) => {
    try {
      const { propertyId } = req.params;
  
      const media = await Media.find({
        property: propertyId,
      }).sort({ isPrimary: -1, createdAt: 1 });
  
      return res.status(200).json({
        success: true,
        count: media.length,
        media,
      });
    } catch (error) {
      console.error("Get property media error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to fetch property media",
      });
    }
  };