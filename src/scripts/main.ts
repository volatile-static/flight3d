import { SceneManager } from './scene.ts';
import { Earth } from './earth.ts';
import { drawFlight, updateFlightPosition } from './flight.ts';
import { lonToTimeZone, vector3ToLon, getSunLongitudeAtTime } from './utils.ts';

const DEPART_TIME = new Date('2025-08-16T17:00:00+08:00').getTime();
const ARRIVE_TIME = new Date('2025-08-16T17:25:00-05:00').getTime();

const sceneManager = new SceneManager();
const earth = new Earth();
drawFlight(earth.earth);
sceneManager.scene.add(earth.earth);
sceneManager.addAnimationCallback(function (timestamp) {
  const timeScaleFactor = 60 * 60; // 动画加速倍数
  const flightFullTime = ARRIVE_TIME - DEPART_TIME;
  const flightProgress = (timestamp * timeScaleFactor) % flightFullTime;
  const flightProgressRatio = flightProgress / flightFullTime;
  const realtime = DEPART_TIME + flightProgress;

  // 更新地球自转
  earth.setSunPosition(0, getSunLongitudeAtTime(realtime));
  // 更新航班位置
  const flightPos = updateFlightPosition(earth.earth, flightProgressRatio);

  const localTimeZone = lonToTimeZone(vector3ToLon(flightPos));
  const localTimeStr = new Date(realtime).toLocaleString('en-US', {
    timeZone: localTimeZone,
  });

});
