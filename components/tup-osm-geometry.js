import osmtogeojson from "osmtogeojson";

const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
];

const OSM_API_BASE = "https://www.openstreetmap.org/api/0.6";
const NOMINATIM_LOOKUP = "https://nominatim.openstreetmap.org/lookup";
const REQUEST_TIMEOUT_MS = 12_000;
const VALID_TYPES = ["way", "relation", "node"];
const geometryCache = new Map();
const resolvedTypeCache = new Map();

function cacheKey(osmType, osmId) {
  return `${osmType}:${osmId}`;
}

function buildOverpassQuery(osmType, osmId) {
  return `[out:json][timeout:15];${osmType}(${osmId});out geom;`;
}

async function resolveOsmType(osmId) {
  if (resolvedTypeCache.has(osmId)) {
    return resolvedTypeCache.get(osmId);
  }

  const lookupIds = ["W", "R", "N"]
    .map((prefix) => `${prefix}${osmId}`)
    .join(",");

  const request = fetch(
    `${NOMINATIM_LOOKUP}?osm_ids=${encodeURIComponent(lookupIds)}&format=json`,
    { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
  )
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      const results = await response.json();
      const match = results?.[0];
      const resolvedType = match?.osm_type?.toLowerCase();

      if (!VALID_TYPES.includes(resolvedType)) {
        return null;
      }

      return resolvedType;
    })
    .catch(() => null);

  resolvedTypeCache.set(osmId, request);

  return request;
}

function buildTypeOrder(requestedType, resolvedType) {
  const order = [];

  for (const type of [resolvedType, requestedType, ...VALID_TYPES]) {
    if (type && VALID_TYPES.includes(type) && !order.includes(type)) {
      order.push(type);
    }
  }

  return order;
}

async function requestOverpass(endpoint, osmType, osmId) {
  const query = buildOverpassQuery(osmType, osmId);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Overpass request failed (${response.status})`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("json")) {
    throw new Error("Invalid response from Overpass API");
  }

  return response.json();
}

async function fetchOverpassJson(osmType, osmId) {
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      return await requestOverpass(endpoint, osmType, osmId);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("All Overpass endpoints failed");
}

async function fetchOsmApiGeojson(osmType, osmId) {
  const response = await fetch(`${OSM_API_BASE}/${osmType}/${osmId}/full`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`OSM API request failed (${response.status})`);
  }

  const xml = await response.text();
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const parseError = doc.querySelector("parsererror");

  if (parseError) {
    throw new Error("Invalid response from OSM API");
  }

  return osmtogeojson(doc);
}

async function fetchGeojsonForType(osmType, osmId) {
  let lastError = null;

  try {
    const osmGeojson = await fetchOsmApiGeojson(osmType, osmId);

    if (osmGeojson?.features?.length) {
      return osmGeojson;
    }
  } catch (error) {
    lastError = error;
  }

  try {
    const overpassData = await fetchOverpassJson(osmType, osmId);
    const overpassGeojson = osmtogeojson(overpassData);

    if (overpassGeojson?.features?.length) {
      return overpassGeojson;
    }
  } catch (error) {
    lastError = error;
  }

  throw lastError ?? new Error("No geometry found for OSM object");
}

async function fetchGeojson(osmType, osmId) {
  const resolvedType = await resolveOsmType(osmId);
  const typeOrder = buildTypeOrder(osmType, resolvedType);
  let lastError = null;

  for (const type of typeOrder) {
    try {
      return await fetchGeojsonForType(type, osmId);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("No geometry found for OSM object");
}

export function fetchOsmGeometry(osmType, osmId) {
  const normalizedType = osmType?.trim().toLowerCase();
  const normalizedId = osmId?.trim();

  if (!VALID_TYPES.includes(normalizedType) || !normalizedId) {
    return Promise.reject(new Error("Invalid OSM type or id"));
  }

  const key = cacheKey(normalizedType, normalizedId);

  if (geometryCache.has(key)) {
    return geometryCache.get(key);
  }

  const request = fetchGeojson(normalizedType, normalizedId);

  geometryCache.set(key, request);

  request.catch(() => {
    geometryCache.delete(key);
  });

  return request;
}

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
