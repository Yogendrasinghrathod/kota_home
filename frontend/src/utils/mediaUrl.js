export function optimizeCloudinaryUrl(url, { width = 400 } = {}) {
  if (!url || typeof url !== "string") return url;

  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;

  const after = url.slice(index + marker.length);
  if (/^(f_auto|q_auto|w_\d+|c_)/.test(after)) return url;

  return `${url.slice(0, index + marker.length)}f_auto,q_auto,c_fill,w_${width}/${after}`;
}
