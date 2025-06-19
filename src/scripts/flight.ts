import { earth } from './earth.ts';
import { drawMarkerPoint, drawGeodesicLine, latLonToVector3 } from './utils.ts';

const depart = latLonToVector3(31, 121); // Shanghai PVG
const arrive = latLonToVector3(33, -97); // Dallas DFW

export function drawFlight() {
  earth.add(drawMarkerPoint(depart));
  earth.add(drawMarkerPoint(arrive));
  earth.add(drawGeodesicLine(depart, arrive, 1.02));
}
