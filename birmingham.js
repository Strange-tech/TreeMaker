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

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
  }

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 10, 0);
  controls.update();

  const axesHelper = new THREE.AxesHelper(1000);
  scene.add(axesHelper);

  const plainGeometry = new THREE.PlaneGeometry(4000, 2500, 100, 60);
  plainGeometry.rotateX(-Math.PI / 2);
  const plain = new THREE.Mesh(
    plainGeometry,
    new THREE.MeshPhongMaterial({
      wireframe: true,
      color: "green",
    })
  );
  scene.add(plain);

  // tree object 格式说明
  const treeObj = new CustomizeTree().getTree("国槐");

  const builder = new TreeBuilder(
    scene,
    treeObj,
    "resources/images/Tree_Basecolor.png",
    "resources/images/Guohuai_Leaves.png"
  );

  const raycaster = new THREE.Raycaster();
  let pointer = new THREE.Vector2();
  let c = 0;

  function onPointerDown(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(plain, false);
    console.log(intersects);
    if (intersects.length > 0) {
      const p = intersects[0].point;
      console.log("Done!");
      c++;
      if (c < 50) {
        const tree = builder.build();
        tree.position.set(p.x, p.y, p.z);
        scene.add(tree);
        builder.clear();
        display([p]);
      }
    }
  }
  //   const tree = builder.build();
  //   tree.position.set(-100, 0, -1000);
  //   scene.add(tree);
  //   builder.clear();

  function display(vectors) {
    const geometry = new THREE.SphereGeometry(10);
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
  window.addEventListener("pointerdown", onPointerDown);
}

main();
