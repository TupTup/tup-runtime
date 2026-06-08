export function getGeojsonCenter(geojson) {
  const bounds = getGeojsonBounds(geojson);

  if (!bounds) {
    return null;
  }

  return [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2,
  ];
}

export function getGeojsonBounds(geojson) {
  const bounds = {
    minLng: Infinity,
    minLat: Infinity,
    maxLng: -Infinity,
    maxLat: -Infinity,
  };

  const extend = (lng, lat) => {
    bounds.minLng = Math.min(bounds.minLng, lng);
    bounds.minLat = Math.min(bounds.minLat, lat);
    bounds.maxLat = Math.max(bounds.maxLat, lat);
    bounds.maxLng = Math.max(bounds.maxLng, lng);
  };

  const walkCoords = (coords) => {
    if (typeof coords[0] === "number") {
      extend(coords[0], coords[1]);
      return;
    }

    for (const part of coords) {
      walkCoords(part);
    }
  };

  const features =
    geojson?.type === "Feature"
      ? [geojson]
      : geojson?.features ?? [];

  for (const feature of features) {
    if (feature.geometry?.coordinates) {
      walkCoords(feature.geometry.coordinates);
    }
  }

  if (!Number.isFinite(bounds.minLng)) {
    return null;
  }

  return [
    [bounds.minLng, bounds.minLat],
    [bounds.maxLng, bounds.maxLat],
  ];
}
