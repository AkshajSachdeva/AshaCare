const positionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 5 * 60 * 1000
};

export const getDevicePosition = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('locationUnsupported'));
    return;
  }
  navigator.geolocation.getCurrentPosition(resolve, reject, positionOptions);
});

export async function getCurrentLocationName() {
  const position = await getDevicePosition();
  const { latitude, longitude } = position.coords;
  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: 'en'
  });
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${query}`);
    if (!response.ok) throw new Error('Reverse geocoding failed');
    const result = await response.json();
    const locality = result.locality || result.city || result.localityInfo?.administrative?.[2]?.name;
    const region = result.principalSubdivision;
    const country = result.countryName;
    const parts = [...new Set([locality, region, country].filter(Boolean))];
    if (parts.length) return parts.join(', ');
  } catch {
    throw new Error('locationLookupFailed');
  }
  throw new Error('locationLookupFailed');
}
