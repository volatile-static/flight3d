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

// 直角坐标转经度（度）
export function vector3ToLon(vec: THREE.Vector3): number {
  const spherical = new THREE.Spherical().setFromVector3(vec);
  const lon = THREE.MathUtils.radToDeg(spherical.theta) - 90; // 转换为经度
  return lon < -180 ? lon + 360 : lon; // 确保经度在[-180, 180]范围内
}

// 经度转时区
export function lonToTimeZone(lon: number): string {
  if (lon < -180 || lon > 180)
    throw new Error('Longitude must be in the range [-180, 180], got: ' + lon);
  const timeZone = Math.round(lon / 15);
  const paddedTimeZone = Math.abs(timeZone).toString().padStart(2, '0');
  return (timeZone < 0 ? '-' : '+') + paddedTimeZone;
}

// 计算指定时刻的太阳直射点经度
export function getSunLongitudeAtTime(timestamp: number): number {
  // 地球自转：每小时15度，从本初子午线(0°)开始
  // 世界时(UTC)12:00时，太阳直射点在经度0°左右
  const utc = new Date(timestamp);
  const utcHours = utc.getUTCHours() + utc.getUTCMinutes() / 60;
  // 计算太阳直射点经度（15度/小时，UTC12点对应0°）
  return (12 - utcHours) * 15;
}

// 计算指定日期的太阳直射点纬度
export function getSunLatitudeOnDate(timestamp: number): number {
  const date = new Date(timestamp);
  const dayOfYear = Math.floor(
    (timestamp - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
  );

  // 简化的太阳直射点纬度计算，假设夏至在6月21日（172天），冬至在12月21日（355天）
  const declination = -23.44 * Math.cos(((dayOfYear + 10) / 365) * (2 * Math.PI));

  return declination;
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
      emissive: color,
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
  // 生成测地线上的所有点
  const arcPoints = Array.from({ length: segments + 1 }, (_, i) =>
    getGeodesicPoint(vStart, vEnd, i / segments, radius),
  );
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPoints),
    new THREE.LineBasicMaterial({ color }),
  );
}

/**
 * 根据参数方程计算测地线上的点
 * @param vStart 起点
 * @param vEnd 终点
 * @param t 参数∈[0, 1]，表示起点到终点的比例
 * @param radius 半径
 * @return 直角坐标
 */
export function getGeodesicPoint(
  vStart: THREE.Vector3,
  vEnd: THREE.Vector3,
  t: number,
  radius: number = 1,
): THREE.Vector3 {
  const [start, end] = [vStart, vEnd].map(v => v.clone().normalize());
  const axis = new THREE.Vector3().crossVectors(start, end).normalize(); // 计算旋转轴
  const angle = start.angleTo(end); // 球面角度
  const q = new THREE.Quaternion().setFromAxisAngle(axis, angle * t); // 用四元数插值
  return start.clone().applyQuaternion(q).normalize().multiplyScalar(radius);
}
