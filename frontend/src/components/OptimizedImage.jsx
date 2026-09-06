import { optimizeCloudinaryUrl } from "../utils/mediaUrl.js";

const OptimizedImage = ({
  src,
  alt = "",
  width = 400,
  className = "",
  eager = false,
}) => {
  if (!src) return null;

  return (
    <img
      src={optimizeCloudinaryUrl(src, { width })}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "low"}
      draggable={false}
    />
  );
};

export default OptimizedImage;
