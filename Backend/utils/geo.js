/**
 * Gets location details from a public IP address using the free ip-api.com service.
 * Does not require any API keys.
 * @param {string} ip - The IP address to lookup
 * @returns {Promise<Object>} Geolocation info object
 */
export const getLocationFromIP = async (ip) => {
  if (!ip) {
    return { ip: "Unknown", formatted: "Unknown Location" };
  }

  // Normalize local IPs to a real test IP for localhost development testing
  let cleanIp = ip.split(",")[0].trim();
  if (cleanIp === "::1" || cleanIp === "127.0.0.1" || cleanIp.startsWith("::ffff:127.0.0.1") || cleanIp === "::") {
    cleanIp = "103.88.236.4"; // Real Indian IP (Meerut, UP) for local testing
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,regionName,city,isp,lat,lon,proxy,hosting`);
    const data = await res.json();

    if (data && data.status === "success") {
      const parts = [data.city, data.regionName, data.country].filter(Boolean);
      return {
        ip: cleanIp,
        city: data.city,
        region: data.regionName,
        country: data.country,
        formatted: parts.join(", "),
        isp: data.isp || "Unknown ISP",
        latitude: data.lat || null,
        longitude: data.lon || null,
        isProxyOrVpn: data.proxy || data.hosting || false
      };
    }
    
    return {
      ip: cleanIp,
      formatted: "Unknown Location",
      isp: "Unknown ISP",
      latitude: null,
      longitude: null,
      isProxyOrVpn: false
    };
  } catch (error) {
    console.error("IP Geolocation failed:", error.message);
    return {
      ip: cleanIp,
      formatted: "Lookup Error",
      isp: "Unknown ISP",
      latitude: null,
      longitude: null,
      isProxyOrVpn: false
    };
  }
};

/**
 * Gets location details from exact GPS coordinates (latitude, longitude) using OpenStreetMap's Nominatim reverse geocoding.
 * Useful when the user is on a VPN or when precise village-level location is required.
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object|null>} Geolocation info object or null
 */
export const getLocationFromCoords = async (latitude, longitude) => {
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    return null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    // OpenStreetMap Nominatim requires a valid and descriptive User-Agent
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SkyGPT/2.0 (LocationTracker; contact: admin@skygpt.com)"
      }
    });

    if (!res.ok) {
      throw new Error(`OSM Nominatim API returned status: ${res.status}`);
    }

    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      
      // Prioritize village name, town, hamlet, or suburb for accurate local naming
      const localArea = addr.village || addr.town || addr.hamlet || addr.suburb || addr.neighbourhood || addr.city_district || addr.road || "";
      const city = addr.city || addr.municipality || addr.county || "";
      const state = addr.state || addr.region || "";
      const country = addr.country || "";

      const parts = [];
      if (localArea) parts.push(localArea);
      if (city && city !== localArea) parts.push(city);
      if (state) parts.push(state);
      if (country) parts.push(country);

      return {
        formatted: parts.filter(Boolean).join(", "),
        village: addr.village || addr.town || addr.hamlet || "",
        city: addr.city || "",
        region: addr.state || "",
        country: addr.country || ""
      };
    }
    return null;
  } catch (error) {
    console.error("GPS Reverse Geocoding failed:", error.message);
    return null;
  }
};

