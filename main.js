"use strict";

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { TreeBuilder } from "./TreeBuilder";
import { CustomizeTree } from "./CustomizeTree";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0xffffff, 1.0);

  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;
  const near = 0.1;
  const far = 5000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 10, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 10, 0);
  controls.update();

  const treeObj = new CustomizeTree().getTree("红枫");
  const builder = new TreeBuilder(treeObj);
  const tree = builder.build();
  scene.add(tree);
  lookAt(tree);
  console.log(tree);
  console.log(builder.getCnt());
  builder.clear();

  function lookAt(obj) {
    // compute the box that contains all the stuff from root and below
    const box = new THREE.Box3().setFromObject(obj);
    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());
    // set the camera to frame the box
    frameArea(boxSize * 0.5, boxSize, boxCenter, camera);
    // update the Trackball controls to handle the new size
    controls.maxDistance = boxSize * 10;
    controls.target.copy(boxCenter);
    controls.update();
  }

  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();
    // move the camera
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    // pick some near and far values for the frustum that will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
    camera.updateProjectionMatrix();
    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
  }

  function extract(positions, num) {
    const array = positions.array;
    const count = positions.count;
    const offset = Math.floor(count / (num - 1));
    const vectors = [];
    for (let i = 0; i < count; i += offset) {
      let j = i * 3;
      vectors.push(new THREE.Vector3(array[j], array[j + 1], array[j + 2]));
    }
    return vectors;
  }

  function display(vectors) {
    const geometry = new THREE.SphereGeometry(0.1);
    const material = new THREE.MeshBasicMaterial({ color: "red" });
    vectors.forEach((vector) => {
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(vector.x, vector.y, vector.z);
      scene.add(sphere);
    });
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  let renderRequested = false;
  function render() {
    renderRequested = false;
    // 图像不随屏幕拉伸改变
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
  }

  function requestRenderIfNotRequested() {
    if (!renderRequested) {
      renderRequested = true;
      requestAnimationFrame(render);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }
  animate();
}

main();
