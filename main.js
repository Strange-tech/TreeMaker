"use strict";

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { TreeBuilder } from "./TreeBuilder";

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

  // tree object 格式说明
  const treeObj = {
    name: "Platanus orientalis L.",
    depth: 5,
    disturbRange: 10,
    segment: 5,
    leaves: {
      total: 15000, // 只多不少
      each: 20,
    },
    branches: [
      // root node
      {
        start: new THREE.Vector3(0, 0, 0),
        end: new THREE.Vector3(0, 150, 0),
        radius: 6,
        fork: { min: 0.5, max: 0.9 },
      },
      // middle node
      {
        number: 6,
        length: { min: 50, max: 60 },
        fork: { min: 0.5, max: 0.9 },
      },
      {
        number: 3,
        length: { min: 45, max: 55 },
        fork: { min: 0.5, max: 0.9 },
      },
      {
        number: 3,
        length: { min: 20, max: 30 },
        fork: { min: 0.5, max: 1 },
      },
      {
        number: 3,
        length: { min: 20, max: 30 },
        fork: { min: 0, max: 1 },
      },
      // leaf node
      {
        number: 3,
        length: { min: 5, max: 10 },
      },
    ],
  };

  const builder = new TreeBuilder(
    scene,
    treeObj,
    "resources/images/Tree_Basecolor.png",
    "resources/images/Leaf_Basecolor.png"
  );

  const loader = new PCDLoader();
  loader.load(
    "resources/urban3d/cambridge_block_4 - Cloud.pcd",
    function (points) {
      points.geometry.center();
      points.geometry.rotateX(-Math.PI / 2);
      // scene.add(points);
      const vectors = extract(points.geometry.attributes.position, 200);
      const geometry = new ConvexGeometry(vectors);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        side: THREE.BackSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(15, 15, 15);
      mesh.position.set(0, 200, 0);
      mesh.updateMatrixWorld();
      // scene.add(mesh);

      builder.addConvex(mesh);
      const tree = builder.build();
      scene.add(tree);
      lookAt(tree);
      render();
    }
  );

  // const geometry = new THREE.SphereGeometry(80, 80, 80);
  // const material = new THREE.MeshBasicMaterial({
  //   color: 0x00ff00,
  //   wireframe: true,
  //   side: THREE.BackSide,
  // });
  // const mesh = new THREE.Mesh(geometry, material);
  // mesh.position.set(0, 80, 0);
  // mesh.updateMatrixWorld();
  // scene.add(mesh);
  // console.log(mesh);
  // builder.addConvex(mesh);

  // console.log(builder.getCnt());
  // for (let i = 0; i < 10; i++) {
  // const tree = builder.build();
  // tree.position.set(0, 0, 0);
  // scene.add(tree);
  // builder.clear();
  // }

  // gltf exporter
  // setTimeout(() => {
  //   const fileName = "output.gltf";
  //   new GLTFExporter().parse(group, function (result) {
  //     const myBlob = new Blob([JSON.stringify(result)], {
  //       type: "text/plain",
  //     });
  //     let link = document.createElement("a");
  //     link.href = URL.createObjectURL(myBlob);
  //     link.download = fileName;
  //     link.click();
  //   });
  // }, 2000);

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

  {
    // 参考平面
    // const planeSize = 40;
    // const loader = new THREE.TextureLoader();
    // const texture = loader.load("resources/images/checker.png");
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.magFilter = THREE.NearestFilter;
    // const repeats = planeSize / 2;
    // texture.repeat.set(repeats, repeats);
    // const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    // const planeMat = new THREE.MeshPhongMaterial({
    //   map: texture,
    //   side: THREE.DoubleSide, // 双面材质
    // });
    // const mesh = new THREE.Mesh(planeGeo, planeMat);
    // mesh.rotation.x = Math.PI * -0.5;
    // scene.add(mesh);
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
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
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
