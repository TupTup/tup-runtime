import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-csp-worker.js?url";

setWorkerUrl(workerUrl);

const MAP_STYLE = {
  version: 8,
  sources: {
    tiles: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "tiles",
      type: "raster",
      source: "tiles",
    },
  ],
};

function getGeojsonCenter(geojson) {
  const bounds = getGeojsonBounds(geojson);

  if (!bounds) {
    return null;
  }

  return [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2,
  ];
}

function getGeojsonBounds(geojson) {
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

const geojsonCache = new Map();
const GEOJSON_TIMEOUT_MS = 12_000;

function parseDefaultZoom(element) {
  const raw =
    element.getAttribute("default-zoom") ?? element.getAttribute("zoom");

  if (!raw?.trim()) {
    return null;
  }

  const value = Number(raw.trim());

  return Number.isFinite(value) ? value : null;
}

export function fetchGeojson(src) {
  const normalizedSrc = src?.trim();

  if (!normalizedSrc) {
    return Promise.reject(new Error("Missing GeoJSON source"));
  }

  if (geojsonCache.has(normalizedSrc)) {
    return geojsonCache.get(normalizedSrc);
  }

  const request = fetch(normalizedSrc, {
    signal: AbortSignal.timeout(GEOJSON_TIMEOUT_MS),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`GeoJSON request failed (${response.status})`);
      }

      return response.json();
    })
    .catch((error) => {
      geojsonCache.delete(normalizedSrc);
      throw error;
    });

  geojsonCache.set(normalizedSrc, request);

  return request;
}

export function readMapConfig(element) {
  const src = element.getAttribute("src")?.trim() ?? "";
  const defaultZoom = parseDefaultZoom(element);
  const lat = element.getAttribute("lat")?.trim() ?? "";
  const lng = element.getAttribute("lng")?.trim() ?? "";

  return {
    src,
    defaultZoom,
    lat,
    lng,
    center: lat && lng ? { lat, lng } : null,
  };
}

function parseCenter(center) {
  if (!center) {
    return null;
  }

  const lng = Number(center.lng);
  const lat = Number(center.lat);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }

  return [lng, lat];
}

function zoomFromBoundsSpan(bounds, interactive) {
  const lngSpan = bounds[1][0] - bounds[0][0];
  const latSpan = bounds[1][1] - bounds[0][1];
  const maxSpan = Math.max(lngSpan, latSpan, 1e-12);
  const factor = interactive ? 3 : 2.5;
  const calculated = Math.log2(360 / (maxSpan * factor));

  return Math.min(Math.max(calculated, 14), 18);
}

function fitMapView(
  map,
  { center, zoom, interactive, geojson }
) {
  const defaultZoom = zoom ?? (interactive ? 16 : 15);

  if (geojson) {
    const bounds = getGeojsonBounds(geojson);
    const mapCenter = parseCenter(center) ?? getGeojsonCenter(geojson);

    if (bounds && mapCenter) {
      const buildingPadding = interactive ? 32 : 20;
      const maxZoom = 18;
      const padding = {
        top: buildingPadding,
        bottom: buildingPadding,
        left: buildingPadding,
        right: buildingPadding,
      };

      map.resize();

      const camera = map.cameraForBounds(bounds, { padding, maxZoom });
      const targetZoom =
        zoom ??
        (camera?.zoom != null
          ? Math.max(camera.zoom - (interactive ? 0.5 : 1), 14)
          : zoomFromBoundsSpan(bounds, interactive));

      map.jumpTo({
        center: mapCenter,
        zoom: targetZoom,
        duration: 0,
      });

      return;
    }
  }

  const mapCenter = parseCenter(center);

  if (!mapCenter) {
    return;
  }

  map.jumpTo({
    center: mapCenter,
    zoom: defaultZoom,
    duration: 0,
  });
}

function addGeojsonLayers(map, geojson) {
  if (!geojson) {
    return;
  }

  map.addSource("building", {
    type: "geojson",
    data: geojson,
  });

  map.addLayer({
    id: "building-fill",
    type: "fill",
    source: "building",
    paint: {
      "fill-color": "#3b82f6",
      "fill-opacity": 0.2,
    },
  });

  map.addLayer({
    id: "building-outline",
    type: "line",
    source: "building",
    paint: {
      "line-color": "#1d4ed8",
      "line-width": 2,
    },
  });
}

export function createMap(
  container,
  {
    interactive = false,
    center = null,
    zoom = null,
    geojson = null,
  } = {}
) {
  const map = new MapLibreMap({
    container,
    style: MAP_STYLE,
    interactive,
    attributionControl: interactive,
    dragPan: interactive,
    scrollZoom: interactive,
    boxZoom: interactive,
    dragRotate: false,
    keyboard: interactive,
    doubleClickZoom: interactive,
    touchZoomRotate: interactive,
  });

  const resize = () => {
    if (map.isStyleLoaded()) {
      map.resize();
    }
  };

  const resizeObserver = new ResizeObserver(resize);

  resizeObserver.observe(container);

  const viewOptions = {
    center,
    zoom,
    interactive,
    geojson,
  };

  const applyView = () => {
    fitMapView(map, viewOptions);
    resize();
  };

  const onReady = () => {
    addGeojsonLayers(map, geojson);
    applyView();
    map.once("idle", applyView);
  };

  map.on("load", onReady);
  map.once("idle", resize);

  requestAnimationFrame(resize);

  const refit = () => {
    if (!map.isStyleLoaded()) {
      return;
    }

    applyView();
  };

  return {
    map,
    refit,
    destroy() {
      resizeObserver.disconnect();
      map.remove();
    },
  };
}
