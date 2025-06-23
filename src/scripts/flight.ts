import type { Mesh } from 'three';
import { drawMarkerPoint, drawGeodesicLine, latLonToVector3 } from './utils.ts';

const depart = latLonToVector3(31, 121); // Shanghai PVG
const arrive = latLonToVector3(33, -97); // Dallas DFW

export function drawFlight(earth: Mesh) {
  earth.add(drawMarkerPoint(depart));
  earth.add(drawMarkerPoint(arrive));
  earth.add(drawGeodesicLine(depart, arrive, 1.02));
}
