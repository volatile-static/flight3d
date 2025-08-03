import type { Mesh } from 'three';
import { drawMarkerPoint, drawGeodesicLine, latLonToVector3, getGeodesicPoint } from './utils.ts';

const depart = latLonToVector3(31, 121); // Shanghai PVG
const arrive = latLonToVector3(33, -97); // Dallas DFW

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
