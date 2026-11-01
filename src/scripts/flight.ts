import type { Mesh } from 'three';
import { drawMarkerPoint, drawGeodesicLine, latLonToVector3, getGeodesicPoint } from './utils.ts';

const depart = latLonToVector3(37.6, -122.4); // San Francisco SFO
const arrive = latLonToVector3(25.1, 121.2); // Taipei Taoyuan TPE

export function drawFlight(earth: Mesh) {
  earth.add(drawMarkerPoint(depart));
  earth.add(drawMarkerPoint(arrive));
  earth.add(drawGeodesicLine(depart, arrive, 1.02));
}

let flightMarker: Mesh | undefined;
export function updateFlightPosition(earth: Mesh, progress: number) {
  const flightPos = getGeodesicPoint(depart, arrive, progress, 1.01);
  if (flightMarker) earth.remove(flightMarker);
  flightMarker = drawMarkerPoint(flightPos, 'green');
  earth.add(flightMarker);
  return flightPos;
}
