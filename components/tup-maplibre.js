import { Map, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-csp-worker.js?url";
import { getGeojsonCenter } from "./tup-osm-geometry.js";

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

function fitMapView(map, { geojson, center, zoom, interactive }) {
  const mapCenter = parseCenter(center) ?? getGeojsonCenter(geojson);

  if (!mapCenter) {
    return;
  }

  map.setCenter(mapCenter);
  map.setZoom(zoom ?? (interactive ? 16 : 15));
}

export function createOsmMap(
  container,
  geojson,
  { interactive = false, center = null, zoom = null } = {}
) {
  const map = new Map({
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

  const onReady = () => {
    fitMapView(map, { geojson, center, zoom, interactive });
    resize();
  };

  map.on("load", onReady);
  map.once("idle", resize);

  requestAnimationFrame(resize);
  setTimeout(resize, 50);

  return {
    map,
    destroy() {
      resizeObserver.disconnect();
      map.remove();
    },
  };
}
