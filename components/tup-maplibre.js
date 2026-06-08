import { Map as MapLibreMap, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-csp-worker.js?url";
import { getGeojsonBounds, getGeojsonCenter } from "./tup-osm-geometry.js";

setWorkerUrl(workerUrl);

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

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

export function readPlaceMapConfig(element) {
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
      "fill-color": "#ff0000",
      "fill-opacity": 0.3,
    },
  });

  map.addLayer({
    id: "building-outline",
    type: "line",
    source: "building",
    paint: {
      "line-color": "#ff0000",
      "line-width": 2,
    },
  });
}

export function createOsmMap(
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
    style: OSM_STYLE,
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

  const resizeObserver = new ResizeObserver(() => {
    resize();
  });

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
  setTimeout(resize, 50);

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
