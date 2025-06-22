import * as THREE from 'three/webgpu';
import * as TSL from 'three/tsl';
import { drawLatitudeCircle, drawLongitudeCircle2 } from './utils.ts';

// Loaders
const manager = new THREE.LoadingManager(undefined, (item, loaded, total) => {
  // Update the progress bar in the GUI
  // gui.add({ progress: `${Math.round((loaded / total) * 100)}%` }, 'progress').name(item);
});
const textureLoader = new THREE.TextureLoader(manager);

// Textures
const dayTexture = textureLoader.load('earth/8k_earth_daymap.jpg');
dayTexture.colorSpace = THREE.SRGBColorSpace;
const nightTexture = textureLoader.load('earth/8k_earth_nightmap.jpg');
nightTexture.colorSpace = THREE.SRGBColorSpace;
// const normalTexture = textureLoader.load('earth/8k_earth_normal_map.tif');
const bumpRoughnessCloudsTexture = textureLoader.load('earth/specularClouds.jpg');

// Sun
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.setFromSphericalCoords(1, THREE.MathUtils.degToRad(66.5), 0);
const sunOrient = TSL.normalWorld.dot(TSL.normalize(sun.position)).toVar();

// uniforms
const atmosphereDayColor = TSL.uniform(TSL.color('#4db2ff'));
const atmosphereTwilightColor = TSL.uniform(TSL.color('#bc490b'));
const roughnessLow = TSL.uniform(0.25);
const roughnessHigh = TSL.uniform(0.35);
const atmosphereColor = TSL.mix(
  atmosphereTwilightColor,
  atmosphereDayColor,
  sunOrient.smoothstep(-0.25, 0.75),
);

// globe
const globeMaterial = new THREE.MeshStandardNodeMaterial();
const cloudsStrength = TSL.texture(bumpRoughnessCloudsTexture, TSL.uv()).b.smoothstep(0.2, 1);
globeMaterial.colorNode = TSL.mix(TSL.texture(dayTexture), TSL.vec3(1), cloudsStrength.mul(2));
const roughness = TSL.max(
  TSL.texture(bumpRoughnessCloudsTexture).g,
  TSL.step(0.01, cloudsStrength),
);
globeMaterial.roughnessNode = roughness.remap(0, 1, roughnessLow, roughnessHigh);

// fresnel
const viewDirection = TSL.positionWorld.sub(TSL.cameraPosition).normalize();
const fresnel = viewDirection.dot(TSL.normalWorld).abs().oneMinus().toVar();

const night = TSL.texture(nightTexture);
const dayStrength = sunOrient.smoothstep(-0.25, 0.5);
const atmosphereDayStrength = sunOrient.smoothstep(-0.5, 1);
const atmosphereMix = atmosphereDayStrength.mul(fresnel.pow(2)).clamp(0, 1);

let finalOutput = TSL.mix(night.rgb, TSL.output.rgb, dayStrength);
finalOutput = TSL.mix(finalOutput, atmosphereColor, atmosphereMix);
globeMaterial.outputNode = TSL.vec4(finalOutput, TSL.output.a);

const bumpElevation = TSL.max(TSL.texture(bumpRoughnessCloudsTexture).r, cloudsStrength);
globeMaterial.normalNode = TSL.bumpMap(bumpElevation);
// globeMaterial.normalNode = TSL.texture(normalTexture);

/**
 * Earth
 */
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
export const earth = new THREE.Mesh(earthGeometry, globeMaterial);
earth.add(sun);
earth.add(drawLatitudeCircle()); // 赤道
earth.add(drawLatitudeCircle(66.5)); // 北极圈
earth.add(drawLongitudeCircle2()); // 国际日期变更线+本初子午线
