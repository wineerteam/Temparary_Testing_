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

  // Normalize local IPs
  if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("::ffff:127.0.0.1") || ip === "::") {
    return {
      ip,
      city: "Localhost",
      region: "Local",
      country: "Local",
      formatted: "Localhost (Development)"
    };
  }

  // If IP contains multiple values (from proxy x-forwarded-for: "client, proxy1, proxy2"), take the client IP
  const cleanIp = ip.split(",")[0].trim();

  try {
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,regionName,city`);
    const data = await res.json();

    if (data && data.status === "success") {
      const parts = [data.city, data.regionName, data.country].filter(Boolean);
      return {
        ip: cleanIp,
        city: data.city,
        region: data.regionName,
        country: data.country,
        formatted: parts.join(", ")
      };
    }
    
    return {
      ip: cleanIp,
      formatted: "Unknown Location"
    };
  } catch (error) {
    console.error("IP Geolocation failed:", error.message);
    return {
      ip: cleanIp,
      formatted: "Lookup Error"
    };
  }
};
