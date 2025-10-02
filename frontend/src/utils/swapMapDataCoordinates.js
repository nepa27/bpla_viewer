const swapCoordinates = (geometry) => {
  if (!geometry) return geometry;

  const swapCoords = (coords) => {
    if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number') {
      // [lng, lat] -> [lat, lng]
      return [coords[1], coords[0]];
    } else if (Array.isArray(coords)) {
      return coords.map(swapCoords);
    }
    return coords;
  };

  const newGeometry = { ...geometry };

  if (geometry.coordinates) {
    newGeometry.coordinates = swapCoords(geometry.coordinates);
  }

  return newGeometry;
};

export const swapMapDataCoordinates = (mapData) => {
  if (!mapData) return mapData;

  if (mapData.type === 'FeatureCollection') {
    return {
      ...mapData,
      features: mapData.features.map((feature) => ({
        ...feature,
        geometry: swapCoordinates(feature.geometry),
      })),
    };
  } else if (mapData.type === 'Feature') {
    return {
      ...mapData,
      geometry: swapCoordinates(mapData.geometry),
    };
  }

  return mapData;
};
