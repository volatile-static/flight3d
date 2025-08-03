import * as THREE from 'three/webgpu';
import * as TSL from 'three/tsl';
import { drawLatitudeCircle, drawLongitudeCircle2 } from './utils.ts';

export class Earth {
  public readonly earth: THREE.Mesh;
  private sun: THREE.DirectionalLight;
  private manager: THREE.LoadingManager;
  private textureLoader: THREE.TextureLoader;
  private globeMaterial: THREE.MeshStandardNodeMaterial;
  private sunDirectionUniform: THREE.UniformNode<THREE.Vector3>;

  constructor(rotationAngle: number = 0, sunLatitude: number = 66.5, sunLongitude: number = 0) {
    // Loaders
    this.manager = new THREE.LoadingManager(undefined, (item, loaded, total) => {
      // Update the progress bar in the GUI
      // gui.add({ progress: `${Math.round((loaded / total) * 100)}%` }, 'progress').name(item);
    });
    this.textureLoader = new THREE.TextureLoader(this.manager);

    // Textures
    const dayTexture = this.textureLoader.load('earth/8k_earth_daymap.jpg');
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    const nightTexture = this.textureLoader.load('earth/8k_earth_nightmap.jpg');
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    const bumpRoughnessCloudsTexture = this.textureLoader.load('earth/specularClouds.jpg');

    // Sun
    this.sun = new THREE.DirectionalLight(0xffffff, 2);
    this.sun.position.setFromSphericalCoords(
      1,
      THREE.MathUtils.degToRad(sunLatitude),
      THREE.MathUtils.degToRad(sunLongitude),
    );

    // uniforms
    const atmosphereDayColor = TSL.uniform(TSL.color('#4db2ff'));
    const atmosphereTwilightColor = TSL.uniform(TSL.color('#bc490b'));
    const roughnessLow = TSL.uniform(0.25);
    const roughnessHigh = TSL.uniform(0.35);
    // 创建太阳方向uniform
    this.sunDirectionUniform = TSL.uniform(this.sun.position.clone().normalize());
    // 用uniform变量计算太阳方向
    const sunOrient = TSL.normalWorld.dot(this.sunDirectionUniform).toVar();

    const atmosphereColor = TSL.mix(
      atmosphereTwilightColor,
      atmosphereDayColor,
      sunOrient.smoothstep(-0.25, 0.75),
    );

    // globe
    this.globeMaterial = new THREE.MeshStandardNodeMaterial();
    const cloudsStrength = TSL.texture(bumpRoughnessCloudsTexture, TSL.uv()).b.smoothstep(0.2, 1);
    this.globeMaterial.colorNode = TSL.mix(
      TSL.texture(dayTexture),
      TSL.vec3(1),
      cloudsStrength.mul(2),
    );
    const roughness = TSL.max(
      TSL.texture(bumpRoughnessCloudsTexture).g,
      TSL.step(0.01, cloudsStrength),
    );
    this.globeMaterial.roughnessNode = roughness.remap(0, 1, roughnessLow, roughnessHigh);

    // fresnel
    const viewDirection = TSL.positionWorld.sub(TSL.cameraPosition).normalize();
    const fresnel = viewDirection.dot(TSL.normalWorld).abs().oneMinus().toVar();

    const night = TSL.texture(nightTexture);
    const dayStrength = sunOrient.smoothstep(-0.25, 0.5);
    const atmosphereDayStrength = sunOrient.smoothstep(-0.5, 1);
    const atmosphereMix = atmosphereDayStrength.mul(fresnel.pow(2)).clamp(0, 1);

    let finalOutput = TSL.mix(night.rgb, TSL.output.rgb, dayStrength);
    finalOutput = TSL.mix(finalOutput, atmosphereColor, atmosphereMix);
    this.globeMaterial.outputNode = TSL.vec4(finalOutput, TSL.output.a);

    const bumpElevation = TSL.max(TSL.texture(bumpRoughnessCloudsTexture).r, cloudsStrength);
    this.globeMaterial.normalNode = TSL.bumpMap(bumpElevation);

    /**
     * Earth
     */
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    this.earth = new THREE.Mesh(earthGeometry, this.globeMaterial);
    this.earth.add(this.sun);
    this.earth.add(drawLatitudeCircle()); // 赤道
    this.earth.add(drawLatitudeCircle(66.5)); // 北极圈
    this.earth.add(drawLongitudeCircle2()); // 国际日期变更线+本初子午线

    // 设置地球自转角度
    this.earth.rotation.y = THREE.MathUtils.degToRad(rotationAngle);
  }

  public setSunPosition(latitude: number, longitude: number): void {
    // 更新太阳位置
    this.sun.position.setFromSphericalCoords(
      1,
      THREE.MathUtils.degToRad(90 - latitude),
      THREE.MathUtils.degToRad(longitude + 90),
    );
    // 更新太阳方向uniform的值
    this.sunDirectionUniform.value.copy(this.sun.position).normalize();
    // 标记材质需要更新
    this.globeMaterial.needsUpdate = true;
  }
}
