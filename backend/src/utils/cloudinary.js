import { v2 as cloudinary } from "cloudinary";

const isConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const configure = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

export const parseCloudinaryPublicId = (url) => {
  if (!url || typeof url !== "string") return null;

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("res.cloudinary.com")) return null;

    const uploadIndex = parsed.pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const parts = parsed.pathname.slice(uploadIndex + "/upload/".length).split("/");
    let start = 0;

    while (
      start < parts.length &&
      (parts[start].includes(",") || /^(c|w|h|q|f|g|e|b|ar|dpr)_/.test(parts[start]))
    ) {
      start += 1;
    }

    if (start < parts.length && /^v\d+$/.test(parts[start])) {
      start += 1;
    }

    const publicPath = parts.slice(start).join("/");
    if (!publicPath) return null;

    return publicPath.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

const resourceTypeFromUrl = (url = "") => {
  if (url.includes("/video/upload")) return "video";
  if (url.includes("/raw/upload")) return "raw";
  return "image";
};

export const destroyCloudinaryAssets = async (mediaItems = []) => {
  if (!isConfigured() || mediaItems.length === 0) {
    if (mediaItems.length > 0 && !isConfigured()) {
      console.warn(
        "Cloudinary credentials missing; skipped remote media delete. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
      );
    }
    return;
  }

  configure();

  await Promise.all(
    mediaItems.map(async (item) => {
      const publicId = item.publicId || parseCloudinaryPublicId(item.url);
      if (!publicId) return;

      const resourceType =
        item.resourceType || resourceTypeFromUrl(item.url);

      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      } catch (error) {
        console.error("Cloudinary destroy failed:", publicId, error.message);
      }
    })
  );
};
