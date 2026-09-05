const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file) => {
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const resource = file.type.startsWith("video/") ? "video" : "image";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resource}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type || resource,
    type: resource === "video" ? "VIDEO" : "IMAGE",
  };
};
