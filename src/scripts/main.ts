import { SceneManager } from './scene.ts';
import { Earth } from './earth.ts';
import { drawFlight } from './flight.ts';

const sceneManager = new SceneManager();
const earth = new Earth();
drawFlight(earth.earth);
sceneManager.scene.add(earth.earth);
sceneManager.addAnimationCallback(function (time) {
  //   earth.setSunPosition(0, time * 0.0001 * 360); // 每秒旋转360度
});
