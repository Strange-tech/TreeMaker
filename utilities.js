import * as THREE from "three";

const randomRangeLinear = function (min, max) {
  return Math.random() * (max - min) + min;
};

const disturbedCurveNode = function (start, end, disturb, gravity) {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const d = start.distanceTo(end);
  const l = d * disturb;
  // 不受重力影响
  if (gravity === 0) {
    mid.add(
      new THREE.Vector3(
        Math.random() * 2 * l - l,
        Math.random() * 2 * l - l,
        Math.random() * 2 * l - l
      )
    );
  }
  // 受重力影响，g与枝条长度成正比
  else {
    mid.add(
      new THREE.Vector3(
        Math.random() * 2 * l - l,
        Math.random() * l * gravity,
        Math.random() * 2 * l - l
      )
    );
  }
  return [start, mid, end];
};

export { randomRangeLinear, disturbedCurveNode };
