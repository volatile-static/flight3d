import * as THREE from 'three/webgpu';

// 纬度，精度，半径
export function latLonToSpherical(lat: number, lon: number, radius: number = 1) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 90);
  return new THREE.Spherical(radius, phi, theta);
}

// 纬度，精度，半径
export function latLonToVector3(lat: number, lon: number, radius: number = 1): THREE.Vector3 {
  return new THREE.Vector3().setFromSpherical(latLonToSpherical(lat, lon, radius));
}

// 画一条纬线，默认赤道
export function drawLatitudeCircle(
  lat: number = 0,
  radius: number = 1,
  color: THREE.ColorRepresentation = 0x0000ff,
) {
  const segments = 256;
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const r = radius * Math.sin(phi);
  const y = radius * Math.cos(phi);
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    positions.push(x, y, z);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
  return new THREE.Line(geometry, material);
}

// 画一对经线（完整大圆）
export function drawLongitudeCircle2(
  lon: number = 0,
  radius: number = 1,
  color: THREE.ColorRepresentation = 0x0000ff,
) {
  const circle = drawLatitudeCircle(0, radius, color);
  circle.rotation.set(Math.PI / 2, 0, THREE.MathUtils.degToRad(lon));
  return circle;
}

/*
 * 绘制坐标点
 */
export function drawMarkerPoint(pos: THREE.Vector3, color: THREE.ColorRepresentation = 'red') {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 16, 16),
    new THREE.MeshStandardMaterial({
      color,
      emissive: 0xff0000,
      emissiveIntensity: 2.5,
      metalness: 0.8,
      roughness: 0.3,
    }),
  );
  marker.position.copy(pos);
  return marker;
}

/*
 * 绘制测地线，radius是大圆半径
 */
export function drawGeodesicLine(
  vStart: THREE.Vector3,
  vEnd: THREE.Vector3,
  radius: number,
  color: THREE.ColorRepresentation = 'red',
): THREE.Line {
  const segments = 256;
  const arcPoints: THREE.Vector3[] = Array.from({ length: segments + 1 }, (_, i) => {
    const axis = new THREE.Vector3().crossVectors(vStart, vEnd).normalize();
    const angle = vStart.angleTo(vEnd); // 球面角度
    // 用四元数插值
    const q = new THREE.Quaternion().setFromAxisAngle(axis, (angle * i) / segments);
    const p = vStart.clone().applyQuaternion(q).normalize().multiplyScalar(radius);
    return p;
  });
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPoints),
    new THREE.LineBasicMaterial({ color }),
  );
}
