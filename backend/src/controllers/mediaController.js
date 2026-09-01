import Media from "../models/Media.js";

export const createMedia = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { roomId, type, url, isPrimary } = req.body;

    const media = await Media.create({
      property: propertyId,
      room: roomId,
      type,
      url,
      isPrimary,
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