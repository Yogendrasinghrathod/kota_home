export const searchPlaces = async (req, res) => {
  try {
    const query = (req.body.query || req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "KotaHome/1.0 (student housing app)",
        Accept: "application/json",
      },
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      results: (data || []).map((item) => ({
        address: item.display_name,
        area:
          item.address?.suburb ||
          item.address?.neighbourhood ||
          item.address?.city_district ||
          item.address?.town ||
          item.address?.city ||
          "Kota",
        latitude: Number(item.lat),
        longitude: Number(item.lon),
      })),
    });
  } catch (error) {
    console.error("Search places error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search location",
    });
  }
};

export const reverseGeocode = async (req, res) => {
  try {
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${latitude}&lon=${longitude}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "KotaHome/1.0 (student housing app)",
        Accept: "application/json",
      },
    });

    const item = await response.json();

    return res.status(200).json({
      success: true,
      location: {
        address: item.display_name || `${latitude}, ${longitude}`,
        area:
          item.address?.suburb ||
          item.address?.neighbourhood ||
          item.address?.city_district ||
          item.address?.town ||
          item.address?.city ||
          "Kota",
        latitude,
        longitude,
      },
    });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to read current location",
    });
  }
};
