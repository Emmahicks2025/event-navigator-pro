import { useQuery } from '@tanstack/react-query';

interface UserLocation {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

// City coordinates for distance calculation (major US cities)
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Philadelphia': { lat: 39.9526, lng: -75.1652 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Atlanta': { lat: 33.7490, lng: -84.3880 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Las Vegas': { lat: 36.1699, lng: -115.1398 },
  'Nashville': { lat: 36.1627, lng: -86.7816 },
  'Detroit': { lat: 42.3314, lng: -83.0458 },
  'Minneapolis': { lat: 44.9778, lng: -93.2650 },
  'Orlando': { lat: 28.5383, lng: -81.3792 },
  'Cleveland': { lat: 41.4993, lng: -81.6944 },
  'Tampa': { lat: 27.9506, lng: -82.4572 },
  'St. Louis': { lat: 38.6270, lng: -90.1994 },
  'Pittsburgh': { lat: 40.4406, lng: -79.9959 },
  'Charlotte': { lat: 35.2271, lng: -80.8431 },
  'Indianapolis': { lat: 39.7684, lng: -86.1581 },
  'Kansas City': { lat: 39.0997, lng: -94.5786 },
  'Columbus': { lat: 39.9612, lng: -82.9988 },
  'Cincinnati': { lat: 39.1031, lng: -84.5120 },
  'Milwaukee': { lat: 43.0389, lng: -87.9065 },
  'New Orleans': { lat: 29.9511, lng: -90.0715 },
  'Baltimore': { lat: 39.2904, lng: -76.6122 },
  'Portland': { lat: 45.5152, lng: -122.6784 },
  'Sacramento': { lat: 38.5816, lng: -121.4944 },
  'Arlington': { lat: 32.7357, lng: -97.1081 },
  'Inglewood': { lat: 33.9617, lng: -118.3531 },
  'East Rutherford': { lat: 40.8128, lng: -74.0742 },
  'Glendale': { lat: 33.5387, lng: -112.1860 },
  'Paradise': { lat: 36.0970, lng: -115.1468 },
  'Landover': { lat: 38.9339, lng: -76.8916 },
  'Foxborough': { lat: 42.0654, lng: -71.2478 },
  'Santa Clara': { lat: 37.3541, lng: -121.9552 },
  'Lincoln': { lat: 40.8258, lng: -96.6852 },
};

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get distance from user to a city
export function getDistanceToCity(
  userLat: number,
  userLng: number,
  cityName: string
): number {
  const cityCoords = CITY_COORDINATES[cityName];
  if (!cityCoords) {
    // Return a large distance for unknown cities
    return 10000;
  }
  return calculateDistance(userLat, userLng, cityCoords.lat, cityCoords.lng);
}

// Fetch user location from IP using multiple fallback services
async function fetchUserLocation(): Promise<UserLocation | null> {
  // Try ipapi.co first (HTTPS, no key needed for limited use)
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      if (!data.error) {
        return {
          city: data.city || '',
          region: data.region || '',
          country: data.country_name || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
        };
      }
    }
  } catch (e) {
    console.warn('ipapi.co failed:', e);
  }

  // Fallback to ipinfo.io (free tier)
  try {
    const response = await fetch('https://ipinfo.io/json?token=');
    if (response.ok) {
      const data = await response.json();
      const [lat, lng] = (data.loc || '0,0').split(',').map(Number);
      return {
        city: data.city || '',
        region: data.region || '',
        country: data.country || '',
        latitude: lat,
        longitude: lng,
      };
    }
  } catch (e) {
    console.warn('ipinfo.io failed:', e);
  }

  return null;
}

export function useUserLocation() {
  return useQuery({
    queryKey: ['user-location'],
    queryFn: fetchUserLocation,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export { CITY_COORDINATES };
