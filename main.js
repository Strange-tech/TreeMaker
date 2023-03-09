"use strict";

import * as THREE from "three";
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
  MeshBVHVisualizer,
} from "three-mesh-bvh";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
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

  // THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
  // THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
  // THREE.Mesh.prototype.raycast = acceleratedRaycast;

  const treeObj = new CustomizeTree().getTree("法国梧桐");
  const builder = new TreeBuilder(treeObj, false);
  // for (let i = 0; i < 200; i++) {
  // const tree = builder.build();
  // // tree.children[0].geometry.computeBoundsTree();

  // // const helper = new MeshBVHVisualizer(tree.children[0]);
  // // helper.color.set(0xe91e63);
  // // helper.depth = 10;
  // // helper.update();
  // // scene.add(helper);
  // // tree.position.set(i * 100, 0, 0);
  // scene.add(tree);
  // lookAt(tree);
  // console.log(tree);
  // console.log(builder.getCnt());
  // builder.clear();
  // }

  const skeleton = builder.buildSkeleton();
  console.log(skeleton);
  // const position = new THREE.Vector3(0, 0, 0);
  const tree = builder.buildTree(skeleton.children[0]);

  builder.clear();
  // const curves = [];
  // const drawLine = function (skeleton) {
  //   const curve = new THREE.CatmullRomCurve3(skeleton.content);
  //   const points = curve.getPoints(10);
  //   const geometry = new THREE.BufferGeometry().setFromPoints(points);
  //   const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  //   const curveObject = new THREE.Line(geometry, material);
  //   scene.add(curveObject);
  //   curves.push(curveObject);
  //   skeleton.children.forEach((child) => {
  //     drawLine(child);
  //   });
  // };
  // drawLine(skeleton.children[0]);

  // fetch("resources/scene/treeSkeleton/skeleton.json")
  //   .then((response) => response.json())
  //   .then((json) => {
  //     console.log(json);
  //     builder.setModelPrecision(2);
  //     const tree1 = builder.buildTree(json.children[0]);
  //     builder.clear();
  //     builder.setModelPrecision(10);
  //     const tree2 = builder.buildTree(json.children[0]);
  //     builder.clear();
  //     tree1.position.set(0, 0, 0);
  //     tree2.position.set(200, 0, 0);

  //     scene.add(tree1, tree2);
  //   });

  /////////////////////////////////////////////////////////////////////////////////
  // GUI
  const guiobj = {
    save: function () {
      const jsonData = JSON.stringify(skeleton);
      function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
      }
      download(jsonData, `skeleton.json`, "application/json");
    },
  };
  const gui = new GUI();
  gui.add(guiobj, "save");

  // const height = 10;
  // const loader = new PCDLoader();
  // loader.load(
  //   "resources/urban3d/cambridge_block_4 - Cloud.pcd",
  //   function (points) {
  //     points.geometry.center();
  //     points.geometry.rotateX(-Math.PI / 2);
  //     // scene.add(points);
  //     // console.log(points);
  //     points.geometry.computeBoundingBox();

  //     const min_v = points.geometry.boundingBox.min,
  //       max_v = points.geometry.boundingBox.max;
  //     const bottoms = [
  //       new THREE.Vector3(min_v.x, min_v.y - height, min_v.z),
  //       new THREE.Vector3(min_v.x, min_v.y - height, max_v.z),
  //       new THREE.Vector3(max_v.x, min_v.y - height, min_v.z),
  //       new THREE.Vector3(max_v.x, min_v.y - height, max_v.z),
  //     ];

  //     const vectors = extract(points.geometry.attributes.position, 50);
  //     vectors.push(...bottoms);
  //     const geometry = new ConvexGeometry(vectors);
  //     const material = new THREE.MeshBasicMaterial({
  //       color: 0x00ff00,
  //       wireframe: true,
  //       side: THREE.BackSide,
  //     });
  //     const mesh = new THREE.Mesh(geometry, material);
  //     mesh.scale.set(3, 3, 3);
  //     mesh.position.set(0, 50, 0);
  //     mesh.updateMatrixWorld();
  //     scene.add(mesh);

  //     builder.addConvex(mesh);
  //     const tree = builder.build();
  //     scene.add(tree);
  //     console.log(tree);
  //     lookAt(tree);
  //     render();
  //   }
  // );

  // let pointer = new THREE.Vector2();
  // const raycaster = new THREE.Raycaster();
  // // raycaster.params.Line.threshold = 3;
  // function onPointerMove(event) {
  //   pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  //   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // }

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

  function render() {
    // 图像不随屏幕拉伸改变
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    // raycaster.setFromCamera(pointer, camera);
    // const intersects = raycaster.intersectObjects(curves, false);
    // if (intersects.length > 0) {
    //   intersects[0].object.material.color.set("green");
    // }

    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }
  animate();
  // window.addEventListener("mousemove", onPointerMove);
}

main();
