import { SceneManager } from './scene.ts';
import { Earth } from './earth.ts';
import { drawFlight, updateFlightPosition } from './flight.ts';

const sceneManager = new SceneManager();
const earth = new Earth();
drawFlight(earth.earth);
sceneManager.scene.add(earth.earth);
sceneManager.addAnimationCallback(function (time) {
  // 更新航班位置
  updateFlightPosition(earth.earth, time);
  // 更新地球自转
  earth.setSunPosition(0, time * 0.0001 * 360); // 每秒旋转360度
});
